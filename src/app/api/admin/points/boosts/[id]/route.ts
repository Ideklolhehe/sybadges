import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordEvent } from '@/lib/gamification/event-store';

// POST /api/admin/points/boosts/[id] — archive a boost
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boost = await db.pointsBoost.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await recordEvent({
      eventType: 'points.boost.finished',
      payload: { boostId: boost.id, name: boost.name },
    });

    return NextResponse.json(boost);
  } catch (error) {
    console.error('Error archiving boost:', error);
    return NextResponse.json({ error: 'فشل في أرشفة المضاعف' }, { status: 500 });
  }
}
