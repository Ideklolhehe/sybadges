import { NextRequest, NextResponse } from 'next/server';
import { recordMetricEvent } from '@/lib/gamification/metrics';

// POST /api/events — Main event ingestion endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, metricId, value, attributes, idempotencyKey } = body;

    if (!memberId || !metricId) {
      return NextResponse.json(
        { error: 'memberId and metricId are required / معرف العضو ومعرف المقياس مطلوبان' },
        { status: 400 }
      );
    }

    const result = await recordMetricEvent({
      memberId,
      metricId,
      value: value ?? 1,
      attributes: attributes ?? {},
      idempotencyKey,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error recording event:', error);
    return NextResponse.json(
      { error: 'فشل في تسجيل الحدث' },
      { status: 500 }
    );
  }
}
