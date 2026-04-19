import { NextRequest, NextResponse } from 'next/server';
import { grantFreezes } from '@/lib/gamification/streaks';

// POST /api/admin/streaks/[id]/grant-freezes — grant freezes to a member's streak
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { memberId, count } = body;

    if (!memberId || !count) {
      return NextResponse.json(
        { error: 'memberId and count are required' },
        { status: 400 }
      );
    }

    const result = await grantFreezes(memberId, params.id, count);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error granting freezes:', error);
    return NextResponse.json(
      { error: 'فشل في منح التجميد' },
      { status: 500 }
    );
  }
}
