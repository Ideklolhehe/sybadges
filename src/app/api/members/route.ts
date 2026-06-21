import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all members
export async function GET() {
  try {
    const members = await db.member.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { achievements: true }
        }
      }
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الأعضاء' },
      { status: 500 }
    );
  }
}

// POST create new member
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, name, email, phone, dateOfBirth, photo } = body;

    const existingMember = await db.member.findUnique({
      where: { memberId }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'رقم العضو موجود بالفعل' },
        { status: 400 }
      );
    }

    const member = await db.member.create({
      data: {
        memberId,
        name,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        photo
      }
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error creating member:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء العضو' },
      { status: 500 }
    );
  }
}
