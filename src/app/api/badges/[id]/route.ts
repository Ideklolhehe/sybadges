import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT update badge
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      color,
      isActive
    } = body;

    const badge = await db.badge.update({
      where: { id: params.id },
      data: {
        name,
        nameAr,
        description,
        descriptionAr,
        category,
        categoryAr,
        level,
        icon,
        color,
        isActive
      }
    });

    return NextResponse.json(badge);
  } catch (error) {
    console.error('Error updating badge:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث الشارة' },
      { status: 500 }
    );
  }
}

// DELETE badge
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.badge.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting badge:', error);
    return NextResponse.json(
      { error: 'فشل في حذف الشارة' },
      { status: 500 }
    );
  }
}
