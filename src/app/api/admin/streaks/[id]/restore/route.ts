import { NextRequest, NextResponse } from 'next/server';
import { restoreStreak } from '@/lib/gamification/streaks';

// POST /api/admin/streaks/[id]/restore — restore a broken streak
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: 'memberId is required' },
        { status: 400 }
      );
    }

    const result = await restoreStreak(memberId, params.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error restoring streak:', error);
    return NextResponse.json(
      { error: 'فشل في استعادة السلسلة' },
      { status: 500 }
    );
  }
}
