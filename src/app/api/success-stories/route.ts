import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all success stories with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get('isFeatured');

    const where: any = {};
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    const stories = await db.successStory.findMany({
      where,
      include: {
        member: {
          select: {
            id: true,
            name: true,
            level: true,
            totalBadges: true
          }
        }
      },
      orderBy: { isFeatured: 'desc' },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching success stories:', error);
    return NextResponse.json(
      { error: 'فشل في جلب قصص النجاح' },
      { status: 500 }
    );
  }
}

// POST create new success story
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      memberId,
      title,
      titleAr,
      content,
      contentAr,
      image,
      isFeatured
    } = body;

    const story = await db.successStory.create({
      data: {
        memberId,
        title,
        titleAr,
        content,
        contentAr,
        image,
        isFeatured: isFeatured || false
      },
      include: {
        member: true
      }
    });

    return NextResponse.json(story, { status: 201 });
  } catch (error) {
    console.error('Error creating success story:', error);
    return NextResponse.json(
      { error: 'فشل في إنشاء قصة النجاح' },
      { status: 500 }
    );
  }
}
