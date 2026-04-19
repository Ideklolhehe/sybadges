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

const MAX_RETRIES = RETRY_DELAYS_MS.length;

/** Delivery timeout per webhook (5 seconds) */
const DELIVERY_TIMEOUT_MS = 5000;

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
 * Uses Promise.allSettled with per-webhook timeout to avoid blocking.
 */
export async function dispatchWebhookEvent(
  eventType: string,
  payload: Record<string, unknown>
) {
  const webhooks = await db.webhook.findMany({
    where: { isActive: true },
  });

  const deliveryPromises = webhooks.map(async (webhook) => {
    // Check if webhook subscribes to this event type
    let events: string[] = [];
    try {
      events = JSON.parse(webhook.events);
    } catch {
      events = [];
    }

    if (events.length > 0 && !events.includes(eventType)) return;

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

    // Attempt delivery with timeout
    return Promise.race([
      attemptDelivery(delivery.id, webhook.url, payloadStr, signature),
      new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error('Webhook delivery timeout')), DELIVERY_TIMEOUT_MS)
      ),
    ]).catch((err) => {
      console.error(`Webhook delivery ${delivery.id} failed:`, err);
      // Ensure delivery is marked as failed with retry scheduled
      scheduleRetry(delivery.id, 0).catch(() => {});
    });
  });

  await Promise.allSettled(deliveryPromises);
}

/**
 * Schedule a retry for a failed delivery.
 */
async function scheduleRetry(deliveryId: string, currentRetryCount: number) {
  if (currentRetryCount >= MAX_RETRIES) {
    await db.webhookDelivery.update({
      where: { id: deliveryId },
      data: { status: 'failed' },
    });
    return;
  }

  const nextRetryAt = new Date(Date.now() + RETRY_DELAYS_MS[currentRetryCount]);
  await db.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      status: 'failed',
      retryCount: currentRetryCount + 1,
      nextRetryAt,
    },
  });
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
  const delivery = await db.webhookDelivery.findUnique({
    where: { id: deliveryId },
  });

  if (!delivery) return;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Sybadges-Signature': signature,
        'X-Sybadges-Delivery-Id': deliveryId,
      },
      body: payload,
      signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
    });

    if (response.ok) {
      await db.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          status: 'delivered',
          responseCode: response.status,
        },
      });
    } else {
      await db.webhookDelivery.update({
        where: { id: deliveryId },
        data: {
          responseCode: response.status,
        },
      });
      await scheduleRetry(deliveryId, delivery.retryCount);
    }
  } catch {
    await scheduleRetry(deliveryId, delivery.retryCount);
  }
}

/**
 * Retry failed webhook deliveries that are due.
 * Should be called by a cron job every 5 minutes.
 * Returns summary of processed deliveries.
 */
export async function retryFailedDeliveries(options?: { batchSize?: number }) {
  const batchSize = options?.batchSize ?? 100;
  const now = new Date();

  const pendingRetries = await db.webhookDelivery.findMany({
    where: {
      status: 'failed',
      nextRetryAt: { lte: now },
      retryCount: { lt: MAX_RETRIES },
    },
    include: { webhook: true },
    take: batchSize,
    orderBy: { nextRetryAt: 'asc' },
  });

  let successful = 0;
  let failed = 0;

  for (const delivery of pendingRetries) {
    if (!delivery.webhook.isActive) {
      // Skip inactive webhooks, mark as dead letter
      await db.webhookDelivery.update({
        where: { id: delivery.id },
        data: { status: 'dead_letter' },
      });
      failed++;
      continue;
    }

    try {
      const signature = await computeSignature(delivery.payload, delivery.webhook.secret);
      await attemptDelivery(delivery.id, delivery.webhook.url, delivery.payload, signature);

      // Check if delivery succeeded
      const updated = await db.webhookDelivery.findUnique({
        where: { id: delivery.id },
      });
      if (updated?.status === 'delivered') {
        successful++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return {
    processed: pendingRetries.length,
    successful,
    failed,
  };
}
