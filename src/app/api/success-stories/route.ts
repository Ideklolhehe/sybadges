import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET all success stories with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isFeatured = searchParams.get('isFeatured');
    const centerId = searchParams.get('centerId');
    const trackId = searchParams.get('trackId');
    const statsOnly = searchParams.get('statsOnly');

    const where: Record<string, unknown> = {};
    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }
    if (centerId) {
      where.centerId = centerId;
    }
    if (trackId) {
      where.trackId = trackId;
    }

    if (statsOnly === 'true') {
      const storyCount = await db.successStory.count({ where });
      const stories = await db.successStory.findMany({
        where,
        select: { member: { select: { totalBadges: true } } },
      });
      const totalBadges = stories.reduce((sum, s) => sum + s.member.totalBadges, 0);
      return NextResponse.json({ storyCount, totalBadges });
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
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
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
      isFeatured,
      category,
      categoryAr,
      centerId,
      centerAr,
      trackId,
      trackAr,
    } = body;

    const story = await db.successStory.create({
      data: {
        memberId,
        title,
        titleAr,
        content,
        contentAr,
        image: image || null,
        isFeatured: isFeatured || false,
        category: category || null,
        categoryAr: categoryAr || null,
        centerId: centerId || null,
        centerAr: centerAr || null,
        trackId: trackId || null,
        trackAr: trackAr || null,
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
