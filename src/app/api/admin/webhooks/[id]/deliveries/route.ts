import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/admin/webhooks/[id]/deliveries — webhook delivery history
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '50');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = { webhookId: params.id };
    if (status) where.status = status;

    const deliveries = await db.webhookDelivery.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json(deliveries);
  } catch (error) {
    console.error('Error fetching webhook deliveries:', error);
    return NextResponse.json(
      { error: 'فشل في جلب سجل التسليم' },
      { status: 500 }
    );
  }
}
