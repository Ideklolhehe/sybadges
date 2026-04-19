import { NextRequest, NextResponse } from 'next/server';
import { getMemberPoints } from '@/lib/gamification/points';

// GET /api/members/[id]/points — member's points and level info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const points = await getMemberPoints(params.id);
    return NextResponse.json(points);
  } catch (error) {
    console.error('Error fetching member points:', error);
    return NextResponse.json(
      { error: 'فشل في جلب نقاط العضو' },
      { status: 500 }
    );
  }
}
