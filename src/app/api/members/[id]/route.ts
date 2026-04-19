import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET single member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const member = await db.member.findUnique({
      where: { id: params.id },
      include: {
        achievements: {
          include: { badge: true },
          orderBy: { createdAt: 'desc' }
        },
        photos: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!member) {
      return NextResponse.json(
        { error: 'العضو غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات العضو' },
      { status: 500 }
    );
  }
}

// PUT update member
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { name, email, phone, dateOfBirth, photo, level } = body;

    const member = await db.member.update({
      where: { id: params.id },
      data: {
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        photo,
        level
      }
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث بيانات العضو' },
      { status: 500 }
    );
  }
}

// DELETE member
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.member.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting member:', error);
    return NextResponse.json(
      { error: 'فشل في حذف العضو' },
      { status: 500 }
    );
  }
}
