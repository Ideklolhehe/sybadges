import { db } from '@/lib/db';
import { recordEvent } from './event-store';
import { processAchievementTriggers } from './points';

/**
 * Enhanced achievement system supporting multiple trigger types:
 * - manual: Admin approval workflow (existing behavior)
 * - metric: Auto-unlock when member's metric total reaches threshold
 * - streak: Auto-unlock when streak reaches target length
 * - composite: Auto-unlock when prerequisite badges are all earned
 */

interface TriggerConfig {
  metricId?: string;
  threshold?: number;
  streakId?: string;
  targetLength?: number;
  // composite uses AchievementPrerequisite table
}

function parseTriggerConfig(config: string): TriggerConfig {
  try {
    return JSON.parse(config);
  } catch {
    return {};
  }
}

/**
 * Called after a metric event updates a member's total.
 * Checks all active metric-type badges to see if any should auto-unlock.
 */
export async function checkMetricAchievements(
  memberId: string,
  metricId: string,
  currentTotal: number
): Promise<string[]> {
  const unlockedBadgeIds: string[] = [];

  // Find all metric-trigger badges for this metric
  const badges = await db.badge.findMany({
    where: {
      triggerType: 'metric',
      isActive: true,
      isAutomatic: true,
    },
  });

  for (const badge of badges) {
    const config = parseTriggerConfig(badge.triggerConfig);
    if (config.metricId !== metricId || !config.threshold) continue;
    if (currentTotal < config.threshold) continue;

    // Check if already earned
    const existing = await db.achievement.findFirst({
      where: {
        memberId,
        badgeId: badge.id,
        status: 'approved',
      },
    });
    if (existing) continue;

    // Auto-award the achievement
    await db.achievement.create({
      data: {
        memberId,
        badgeId: badge.id,
        status: 'approved',
        reason: `Auto-awarded: reached ${currentTotal} ${badge.name}`,
        reasonAr: `تم منحها تلقائيًا: وصل إلى ${currentTotal}`,
        approvedBy: 'system',
        approvedAt: new Date(),
      },
    });

    // Update member badge count
    await db.member.update({
      where: { id: memberId },
      data: { totalBadges: { increment: 1 } },
    });

    unlockedBadgeIds.push(badge.id);

    await recordEvent({
      eventType: 'achievement.unlocked',
      memberId,
      payload: {
        badgeId: badge.id,
        badgeName: badge.name,
        triggerType: 'metric',
        metricId,
        threshold: config.threshold,
        currentTotal,
      },
    });

    // Award points for this achievement
    await processAchievementTriggers(memberId, badge.id);

    // Check composite achievements that depend on this badge
    await checkCompositeAchievements(memberId, badge.id);
  }

  return unlockedBadgeIds;
}

/**
 * Called after a streak is extended.
 * Checks if any streak-type badges should auto-unlock.
 */
export async function checkStreakAchievements(
  memberId: string,
  streakId: string,
  currentLength: number
): Promise<string[]> {
  const unlockedBadgeIds: string[] = [];

  const badges = await db.badge.findMany({
    where: {
      triggerType: 'streak',
      isActive: true,
      isAutomatic: true,
    },
  });

  for (const badge of badges) {
    const config = parseTriggerConfig(badge.triggerConfig);
    if (config.streakId !== streakId || !config.targetLength) continue;
    if (currentLength < config.targetLength) continue;

    const existing = await db.achievement.findFirst({
      where: {
        memberId,
        badgeId: badge.id,
        status: 'approved',
      },
    });
    if (existing) continue;

    await db.achievement.create({
      data: {
        memberId,
        badgeId: badge.id,
        status: 'approved',
        reason: `Auto-awarded: ${currentLength}-day streak achieved`,
        reasonAr: `تم منحها تلقائيًا: تم تحقيق سلسلة ${currentLength} يوم`,
        approvedBy: 'system',
        approvedAt: new Date(),
      },
    });

    await db.member.update({
      where: { id: memberId },
      data: { totalBadges: { increment: 1 } },
    });

    unlockedBadgeIds.push(badge.id);

    await recordEvent({
      eventType: 'achievement.unlocked',
      memberId,
      payload: {
        badgeId: badge.id,
        badgeName: badge.name,
        triggerType: 'streak',
        streakId,
        targetLength: config.targetLength,
        currentLength,
      },
    });

    await processAchievementTriggers(memberId, badge.id);
    await checkCompositeAchievements(memberId, badge.id);
  }

  return unlockedBadgeIds;
}

/**
 * Checks if any composite badges should auto-unlock when a sub-badge is earned.
 */
export async function checkCompositeAchievements(
  memberId: string,
  justEarnedBadgeId: string
): Promise<string[]> {
  const unlockedBadgeIds: string[] = [];

  // Find composite badges that list justEarnedBadgeId as a prerequisite
  const prerequisites = await db.achievementPrerequisite.findMany({
    where: { childAchievementId: justEarnedBadgeId },
    include: { parentBadge: true },
  });

  for (const prereq of prerequisites) {
    const parentBadge = prereq.parentBadge;
    if (!parentBadge.isActive || parentBadge.triggerType !== 'composite') continue;

    // Check if already earned
    const existing = await db.achievement.findFirst({
      where: {
        memberId,
        badgeId: parentBadge.id,
        status: 'approved',
      },
    });
    if (existing) continue;

    // Get all prerequisites for this composite badge
    const allPrereqs = await db.achievementPrerequisite.findMany({
      where: { parentAchievementId: parentBadge.id },
    });

    // Check if all prerequisites are met
    let allMet = true;
    for (const req of allPrereqs) {
      const earnedCount = await db.achievement.count({
        where: {
          memberId,
          badgeId: req.childAchievementId,
          status: 'approved',
        },
      });
      if (earnedCount < req.requiredCount) {
        allMet = false;
        break;
      }
    }

    if (!allMet) continue;

    await db.achievement.create({
      data: {
        memberId,
        badgeId: parentBadge.id,
        status: 'approved',
        reason: `Auto-awarded: all prerequisite badges earned`,
        reasonAr: `تم منحها تلقائيًا: تم الحصول على جميع الشارات المطلوبة`,
        approvedBy: 'system',
        approvedAt: new Date(),
      },
    });

    await db.member.update({
      where: { id: memberId },
      data: { totalBadges: { increment: 1 } },
    });

    unlockedBadgeIds.push(parentBadge.id);

    await recordEvent({
      eventType: 'achievement.unlocked',
      memberId,
      payload: {
        badgeId: parentBadge.id,
        badgeName: parentBadge.name,
        triggerType: 'composite',
      },
    });

    await processAchievementTriggers(memberId, parentBadge.id);
  }

  return unlockedBadgeIds;
}

/**
 * Get achievement completion rarity for each badge.
 */
export async function getAchievementRarity() {
  const totalMembers = await db.member.count();
  if (totalMembers === 0) return [];

  const badges = await db.badge.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: {
          achievements: { where: { status: 'approved' } },
        },
      },
    },
  });

  return badges.map((badge) => ({
    badgeId: badge.id,
    name: badge.name,
    nameAr: badge.nameAr,
    earnedCount: badge._count.achievements,
    totalMembers,
    rarityPercent: Math.round((badge._count.achievements / totalMembers) * 100),
  }));
}
