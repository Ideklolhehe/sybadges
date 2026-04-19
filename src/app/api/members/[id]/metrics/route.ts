import { NextRequest, NextResponse } from 'next/server';
import { getMemberMetrics } from '@/lib/gamification/metrics';

// GET /api/members/[id]/metrics — member's metric totals
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metrics = await getMemberMetrics(params.id);
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching member metrics:', error);
    return NextResponse.json(
      { error: 'فشل في جلب مقاييس العضو' },
      { status: 500 }
    );
  }
}
