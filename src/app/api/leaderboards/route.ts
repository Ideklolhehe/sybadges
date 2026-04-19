import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getActiveLeaderboards } from '@/lib/gamification/leaderboards';

// GET all active leaderboards
export async function GET() {
  try {
    const leaderboards = await getActiveLeaderboards();
    return NextResponse.json(leaderboards);
  } catch (error) {
    console.error('Error fetching leaderboards:', error);
    return NextResponse.json({ error: 'فشل في جلب لوحات المتصدرين' }, { status: 500 });
  }
}

// POST create new leaderboard
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, nameAr, description, descriptionAr,
      type, rankingMethod,
      metricId, pointsConfigId, streakId,
      resetIntervalDays, participantLimit,
      startDate, endDate,
    } = body;

    if (!name || !nameAr || !rankingMethod) {
      return NextResponse.json(
        { error: 'name, nameAr, and rankingMethod are required' },
        { status: 400 }
      );
    }

    const leaderboard = await db.leaderboard.create({
      data: {
        name,
        nameAr,
        description: description ?? '',
        descriptionAr: descriptionAr ?? '',
        type: type ?? 'perpetual',
        rankingMethod,
        metricId: metricId ?? null,
        pointsConfigId: pointsConfigId ?? null,
        streakId: streakId ?? null,
        resetIntervalDays: resetIntervalDays ?? null,
        participantLimit: participantLimit ?? 100,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: 'active',
      },
    });

    return NextResponse.json(leaderboard, { status: 201 });
  } catch (error) {
    console.error('Error creating leaderboard:', error);
    return NextResponse.json({ error: 'فشل في إنشاء لوحة المتصدرين' }, { status: 500 });
  }
}
