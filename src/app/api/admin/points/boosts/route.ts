import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordEvent } from '@/lib/gamification/event-store';

// GET all boosts
export async function GET() {
  try {
    const boosts = await db.pointsBoost.findMany({
      where: { isActive: true },
      include: { pointsConfig: { select: { name: true, nameAr: true } } },
      orderBy: { startDate: 'desc' },
    });

    return NextResponse.json(boosts);
  } catch (error) {
    console.error('Error fetching boosts:', error);
    return NextResponse.json({ error: 'فشل في جلب المضاعفات' }, { status: 500 });
  }
}

// POST create a new boost
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, multiplier, startDate, endDate, pointsConfigId } = body;

    if (!name || !pointsConfigId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'name, pointsConfigId, startDate, endDate are required' },
        { status: 400 }
      );
    }

    const boost = await db.pointsBoost.create({
      data: {
        name,
        nameAr: nameAr ?? name,
        multiplier: multiplier ?? 2.0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        pointsConfigId,
      },
    });

    await recordEvent({
      eventType: 'points.boost.started',
      payload: {
        boostId: boost.id,
        name: boost.name,
        multiplier: boost.multiplier,
        startDate: boost.startDate,
        endDate: boost.endDate,
      },
    });

    return NextResponse.json(boost, { status: 201 });
  } catch (error) {
    console.error('Error creating boost:', error);
    return NextResponse.json({ error: 'فشل في إنشاء المضاعف' }, { status: 500 });
  }
}
