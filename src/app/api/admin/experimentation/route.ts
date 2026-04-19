import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET experimentation analytics
export async function GET() {
  try {
    const totalMembers = await db.member.count();
    const controlMembers = await db.member.count({ where: { isControlGroup: true } });
    const experimentalMembers = totalMembers - controlMembers;

    // Activity comparison: events per group
    const controlMemberIds = (
      await db.member.findMany({
        where: { isControlGroup: true },
        select: { id: true },
      })
    ).map((m) => m.id);

    const experimentalMemberIds = (
      await db.member.findMany({
        where: { isControlGroup: false },
        select: { id: true },
      })
    ).map((m) => m.id);

    const controlEvents = await db.metricEvent.count({
      where: { memberId: { in: controlMemberIds } },
    });
    const experimentalEvents = await db.metricEvent.count({
      where: { memberId: { in: experimentalMemberIds } },
    });

    const controlBadges = await db.achievement.count({
      where: { memberId: { in: controlMemberIds }, status: 'approved' },
    });
    const experimentalBadges = await db.achievement.count({
      where: { memberId: { in: experimentalMemberIds }, status: 'approved' },
    });

    return NextResponse.json({
      totalMembers,
      controlGroup: {
        count: controlMembers,
        percentage: totalMembers > 0 ? Math.round((controlMembers / totalMembers) * 100) : 0,
        totalEvents: controlEvents,
        eventsPerMember: controlMembers > 0 ? Math.round(controlEvents / controlMembers) : 0,
        totalBadges: controlBadges,
      },
      experimentalGroup: {
        count: experimentalMembers,
        percentage: totalMembers > 0 ? Math.round((experimentalMembers / totalMembers) * 100) : 0,
        totalEvents: experimentalEvents,
        eventsPerMember: experimentalMembers > 0 ? Math.round(experimentalEvents / experimentalMembers) : 0,
        totalBadges: experimentalBadges,
      },
    });
  } catch (error) {
    console.error('Error fetching experimentation analytics:', error);
    return NextResponse.json(
      { error: 'فشل في جلب تحليلات التجربة' },
      { status: 500 }
    );
  }
}

// PUT update control group ratio
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { controlRatioPercent } = body;

    if (controlRatioPercent === undefined || controlRatioPercent < 0 || controlRatioPercent > 50) {
      return NextResponse.json(
        { error: 'controlRatioPercent must be between 0 and 50' },
        { status: 400 }
      );
    }

    // Get all members and reassign control group
    const members = await db.member.findMany({ select: { id: true } });
    const targetControlCount = Math.round((members.length * controlRatioPercent) / 100);

    // Shuffle member IDs deterministically and assign first N as control
    const shuffled = members
      .map((m) => ({ id: m.id, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((m) => m.id);

    const controlIds = new Set(shuffled.slice(0, targetControlCount));

    // Update in batch
    await db.member.updateMany({
      where: { id: { in: [...controlIds] } },
      data: { isControlGroup: true },
    });
    await db.member.updateMany({
      where: { id: { notIn: [...controlIds] } },
      data: { isControlGroup: false },
    });

    return NextResponse.json({
      success: true,
      controlGroupSize: targetControlCount,
      totalMembers: members.length,
    });
  } catch (error) {
    console.error('Error updating experimentation config:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث إعدادات التجربة' },
      { status: 500 }
    );
  }
}
