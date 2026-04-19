import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all streak definitions
export async function GET() {
  try {
    const streaks = await db.streak.findMany({
      where: { isActive: true },
      include: {
        metric: { select: { name: true, nameAr: true, unit: true } },
        _count: { select: { memberStreaks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(streaks);
  } catch (error) {
    console.error('Error fetching streaks:', error);
    return NextResponse.json({ error: 'فشل في جلب السلاسل' }, { status: 500 });
  }
}

// POST create new streak definition
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name, nameAr, description, descriptionAr,
      frequency, threshold, metricId,
      initialFreezes, freezeAccrualRate, freezeAccrualDays, maxFreezes,
    } = body;

    if (!name || !nameAr || !metricId) {
      return NextResponse.json(
        { error: 'name, nameAr, and metricId are required / الاسم ومعرف المقياس مطلوبان' },
        { status: 400 }
      );
    }

    const streak = await db.streak.create({
      data: {
        name,
        nameAr,
        description: description ?? '',
        descriptionAr: descriptionAr ?? '',
        frequency: frequency ?? 'daily',
        threshold: threshold ?? 1,
        metricId,
        initialFreezes: initialFreezes ?? 0,
        freezeAccrualRate: freezeAccrualRate ?? 0,
        freezeAccrualDays: freezeAccrualDays ?? 7,
        maxFreezes: maxFreezes ?? 10,
      },
      include: { metric: true },
    });

    return NextResponse.json(streak, { status: 201 });
  } catch (error) {
    console.error('Error creating streak:', error);
    return NextResponse.json({ error: 'فشل في إنشاء السلسلة' }, { status: 500 });
  }
}
