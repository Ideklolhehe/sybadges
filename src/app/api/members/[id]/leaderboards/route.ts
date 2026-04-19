import { NextRequest, NextResponse } from 'next/server';
import { getMemberLeaderboards } from '@/lib/gamification/leaderboards';

// GET /api/members/[id]/leaderboards — member's rank across all leaderboards
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const leaderboards = await getMemberLeaderboards(params.id);
    return NextResponse.json(leaderboards);
  } catch (error) {
    console.error('Error fetching member leaderboards:', error);
    return NextResponse.json(
      { error: 'فشل في جلب لوحات المتصدرين للعضو' },
      { status: 500 }
    );
  }
}
