import { NextRequest, NextResponse } from 'next/server';
import { getMemberStreaks } from '@/lib/gamification/streaks';

// GET /api/members/[id]/streaks — member's streak state
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const streaks = await getMemberStreaks(params.id);
    return NextResponse.json(streaks);
  } catch (error) {
    console.error('Error fetching member streaks:', error);
    return NextResponse.json(
      { error: 'فشل في جلب سلاسل العضو' },
      { status: 500 }
    );
  }
}
