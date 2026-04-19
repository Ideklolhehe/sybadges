import { NextRequest, NextResponse } from 'next/server';
import { retryFailedDeliveries } from '@/lib/gamification/webhooks';
import { db } from '@/lib/db';

/**
 * Validate CRON_SECRET bearer token.
 */
function validateCronAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const expectedSecret = process.env.CRON_SECRET;

  if (!expectedSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  const token = authHeader?.replace('Bearer ', '');
  return token === expectedSecret;
}

/**
 * GET /api/cron/webhook-retries
 * Retries failed webhook deliveries that are due for retry.
 * Secured with CRON_SECRET bearer token (called by GitHub Actions).
 */
export async function GET(request: NextRequest) {
  if (!validateCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lockKey = 'webhook_retry_lock';
  const lockExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  try {
    // Prevent concurrent execution with a simple DB lock
    const existingLock = await db.systemLock.findUnique({
      where: { key: lockKey },
    });

    if (existingLock && existingLock.expiresAt > new Date()) {
      return NextResponse.json({
        message: 'Retry already in progress',
        skipped: true,
      });
    }

    // Acquire lock
    await db.systemLock.upsert({
      where: { key: lockKey },
      update: { expiresAt: lockExpiry },
      create: { key: lockKey, expiresAt: lockExpiry },
    });

    const startTime = Date.now();
    const results = await retryFailedDeliveries({ batchSize: 100 });
    const duration = Date.now() - startTime;

    // Release lock
    await db.systemLock.delete({ where: { key: lockKey } }).catch(() => {});

    return NextResponse.json({
      message: 'Webhook retry completed',
      processed: results.processed,
      successful: results.successful,
      failed: results.failed,
      duration: `${duration}ms`,
    });
  } catch (error) {
    // Ensure lock is released on error
    await db.systemLock.delete({ where: { key: lockKey } }).catch(() => {});

    console.error('Webhook retry cron failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
