import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all metrics
export async function GET() {
  try {
    const metrics = await db.metric.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { events: true, memberMetricTotals: true },
        },
      },
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { error: 'فشل في جلب المقاييس' },
      { status: 500 }
    );
  }
}

// POST create new metric
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, unit } = body;

    if (!name || !nameAr) {
      return NextResponse.json(
        { error: 'name and nameAr are required / الاسم مطلوب' },
        { status: 400 }
      );
    }

    const metric = await db.metric.create({
      data: {
        name,
        nameAr,
        description: description ?? '',
        descriptionAr: descriptionAr ?? '',
        unit: unit ?? 'count',
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error('Error creating metric:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء المقياس' },
      { status: 500 }
    );
  }
}
