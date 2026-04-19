import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all badges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');

    const where: any = { isActive: true };
    if (level) where.level = level;
    if (category) where.category = category;

    const badges = await db.badge.findMany({
      where,
      orderBy: { level: 'asc' }
    });

    return NextResponse.json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الشارات' },
      { status: 500 }
    );
  }
}

// POST create new badge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      nameAr,
      description,
      descriptionAr,
      category,
      categoryAr,
      level,
      icon,
      color
    } = body;

    const badge = await db.badge.create({
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        category,
        categoryAr,
        level,
        icon,
        color: color || '#2E2973'
      }
    });

    return NextResponse.json(badge, { status: 201 });
  } catch (error) {
    console.error('Error creating badge:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء الشارة' },
      { status: 500 }
    );
  }
}
