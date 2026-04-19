import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recordEvent } from '@/lib/gamification/event-store';

// POST approve/reject achievement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, approvedBy, rejectedBy, notes } = body;

    const updateData: Record<string, unknown> = {
      status,
      notes
    };

    if (status === 'approved') {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      
      // Update member total badges
      const existingAchievement = await db.achievement.findUnique({
        where: { id: params.id },
        include: { member: true }
      });

      if (existingAchievement) {
        await db.member.update({
          where: { id: existingAchievement.memberId },
          data: { totalBadges: existingAchievement.member.totalBadges + 1 }
        });
      }
    } else if (status === 'rejected') {
      updateData.rejectedBy = rejectedBy;
      updateData.rejectedAt = new Date();
    }

    const achievement = await db.achievement.update({
      where: { id: params.id },
      data: updateData,
      include: {
        member: true,
        badge: true
      }
    });

    // Record approval/rejection event (triggers webhook dispatch)
    if (status === 'approved') {
      await recordEvent({
        eventType: 'achievement.approved',
        memberId: achievement.memberId,
        payload: {
          achievementId: achievement.id,
          badgeId: achievement.badgeId,
          badgeName: achievement.badge.name,
          approvedBy: approvedBy ?? 'admin',
        },
      });
    } else if (status === 'rejected') {
      await recordEvent({
        eventType: 'achievement.rejected',
        memberId: achievement.memberId,
        payload: {
          achievementId: achievement.id,
          badgeId: achievement.badgeId,
          badgeName: achievement.badge.name,
          rejectedBy: rejectedBy ?? 'admin',
        },
      });
    }

    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث حالة الإنجاز' },
      { status: 500 }
    );
  }
}
