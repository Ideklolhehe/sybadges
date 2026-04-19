import { NextRequest, NextResponse } from 'next/server';
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
 * POST /api/cron/webhook-cleanup
 * Archives failed deliveries that have exceeded max retries (older than 7 days).
 * Secured with CRON_SECRET bearer token (called by GitHub Actions daily).
 */
export async function POST(request: NextRequest) {
  if (!validateCronAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const cutoffDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const archived = await db.webhookDelivery.updateMany({
      where: {
        status: 'failed',
        retryCount: { gte: 5 },
        createdAt: { lt: cutoffDate },
      },
      data: {
        status: 'dead_letter',
      },
    });

    return NextResponse.json({
      message: 'Dead letter cleanup completed',
      archived: archived.count,
    });
  } catch (error) {
    console.error('Cleanup cron failed:', error);
    return NextResponse.json(
      { error: 'Cleanup failed' },
      { status: 500 }
    );
  }
}
