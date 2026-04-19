import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST approve/reject achievement
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, approvedBy, rejectedBy, notes } = body;

    const updateData: any = {
      status,
      notes
    };

    if (status === 'approved') {
      updateData.approvedBy = approvedBy;
      updateData.approvedAt = new Date();
      
      // Update member total badges
      const achievement = await db.achievement.findUnique({
        where: { id: params.id },
        include: { member: true }
      });

      if (achievement) {
        await db.member.update({
          where: { id: achievement.memberId },
          data: { totalBadges: achievement.member.totalBadges + 1 }
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

    return NextResponse.json(achievement);
  } catch (error) {
    console.error('Error updating achievement:', error);
    return NextResponse.json(
      { error: 'فشل في تحديث حالة الإنجاز' },
      { status: 500 }
    );
  }
}
