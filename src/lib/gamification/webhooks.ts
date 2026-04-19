import { db } from '@/lib/db';

/**
 * Webhook dispatch system with HMAC-SHA256 signature verification
 * and exponential backoff retry logic.
 */

/** Retry delays in ms: 1 minute, 5 minutes, 30 minutes, 2 hours, 12 hours */
const RETRY_DELAYS_MS = [
  1 * 60 * 1000,      // 1 minute
  5 * 60 * 1000,      // 5 minutes
  30 * 60 * 1000,     // 30 minutes
  2 * 60 * 60 * 1000, // 2 hours
  12 * 60 * 60 * 1000, // 12 hours
] as const;

/**
 * Compute HMAC-SHA256 signature for a payload.
 * Uses Web Crypto API (available in Node.js 18+ and Edge Runtime).
 */
async function computeSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(payload);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, data);
  const hashArray = Array.from(new Uint8Array(signature));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Dispatch an event to all matching webhooks.
 */
export async function dispatchWebhookEvent(
  eventType: string,
  payload: Record<string, unknown>
) {
  const webhooks = await db.webhook.findMany({
    where: { isActive: true },
  });

  for (const webhook of webhooks) {
    // Check if webhook subscribes to this event type
    let events: string[] = [];
    try {
      events = JSON.parse(webhook.events);
    } catch {
      events = [];
    }

    if (events.length > 0 && !events.includes(eventType)) continue;

    const payloadStr = JSON.stringify({
      event: eventType,
      timestamp: new Date().toISOString(),
      data: payload,
    });

    const signature = await computeSignature(payloadStr, webhook.secret);

    // Create delivery record
    const delivery = await db.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event: eventType,
        payload: payloadStr,
        status: 'pending',
      },
    });

    // Attempt delivery (fire-and-forget, with retry scheduling)
    attemptDelivery(delivery.id, webhook.url, payloadStr, signature).catch((err) =>
      console.error(`Webhook delivery ${delivery.id} failed:`, err)
    );
  }
}

/**
 * Attempt to deliver a webhook payload. Schedules retries on failure.
 */
async function attemptDelivery(
  deliveryId: string,
  url: string,
  payload: string,
  signature: string
) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sybadges-Signature': signature,
        'X-Sybadges-Delivery-Id': deliveryId,
      },
      body: payload,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    await db.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: response.ok ? 'delivered' : 'failed',
        responseCode: response.status,
      },
    });
  } catch {
    // Schedule retry with exponential backoff
    const delivery = await db.webhookDelivery.findUnique({
      where: { id: deliveryId },
    });

    if (!delivery) return;

    const retryDelaysMs = RETRY_DELAYS_MS;
    const nextRetryIndex = delivery.retryCount;

    if (nextRetryIndex < retryDelaysMs.length) {
      const nextRetryAt = new Date(Date.now() + retryDelaysMs[nextRetryIndex]);
      await db.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'failed',
          retryCount: delivery.retryCount + 1,
          nextRetryAt,
        },
      });
    } else {
      // Max retries exhausted
      await db.webhookDelivery.update({
        where: { id: deliveryId },
        data: { status: 'failed' },
      });
    }
  }
}

/**
 * Retry failed webhook deliveries that are due.
 * Should be called by a cron job every 5 minutes.
 */
export async function retryFailedDeliveries() {
  const now = new Date();
  const pendingRetries = await db.webhookDelivery.findMany({
    where: {
      status: 'failed',
      nextRetryAt: { lte: now },
    },
    include: { webhook: true },
  });

  for (const delivery of pendingRetries) {
    const signature = await computeSignature(delivery.payload, delivery.webhook.secret);
    await attemptDelivery(delivery.id, delivery.webhook.url, delivery.payload, signature);
  }
}
