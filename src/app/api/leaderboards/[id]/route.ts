import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard } from '@/lib/gamification/leaderboards';

// GET /api/leaderboards/[id] — leaderboard with entries and member info
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '100');

    const leaderboard = await getLeaderboard(params.id, limit);

    if (!leaderboard) {
      return NextResponse.json(
        { error: 'لوحة المتصدرين غير موجودة' },
        { status: 404 }
      );
    }

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'فشل في جلب لوحة المتصدرين' },
      { status: 500 }
    );
  }
}
