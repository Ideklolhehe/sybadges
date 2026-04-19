import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single metric
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const metric = await db.metric.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { events: true, memberMetricTotals: true } },
      },
    });

    if (!metric) {
      return NextResponse.json({ error: 'المقياس غير موجود' }, { status: 404 });
    }

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error fetching metric:', error);
    return NextResponse.json({ error: 'فشل في جلب المقياس' }, { status: 500 });
  }
}

// PUT update metric
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, nameAr, description, descriptionAr, unit, isActive } = body;

    const metric = await db.metric.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameAr !== undefined && { nameAr }),
        ...(description !== undefined && { description }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(unit !== undefined && { unit }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(metric);
  } catch (error) {
    console.error('Error updating metric:', error);
    return NextResponse.json({ error: 'فشل في تحديث المقياس' }, { status: 500 });
  }
}

// DELETE metric
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.metric.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json({ error: 'فشل في حذف المقياس' }, { status: 500 });
  }
}
