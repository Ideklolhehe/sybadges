import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all achievements with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get('memberId');
    const status = searchParams.get('status');

    const where: any = {};
    if (memberId) where.memberId = memberId;
    if (status) where.status = status;

    const achievements = await db.achievement.findMany({
      where,
      include: {
        member: true,
        badge: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'فشل في جلب الإنجازات' },
      { status: 500 }
    );
  }
}

// POST create new achievement request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, badgeId, reason, reasonAr, evidence, notes } = body;

    const achievement = await db.achievement.create({
      data: {
        memberId,
        badgeId,
        reason,
        reasonAr,
        evidence,
        notes
      },
      include: {
        badge: true,
        member: true
      }
    });

    return NextResponse.json(achievement, { status: 201 });
  } catch (error) {
    console.error('Error creating achievement:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء طلب الإنجاز' },
      { status: 500 }
    );
  }
}
