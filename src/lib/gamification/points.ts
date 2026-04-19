import { db } from '@/lib/db';
import { recordEvent } from './event-store';

/**
 * Points system with triggers, levels, and boosts.
 * Points are awarded via triggers that fire on metric events or achievement completions.
 */

/**
 * Get active boost multiplier for a points config.
 */
async function getActiveBoostMultiplier(pointsConfigId: string): Promise<number> {
  const now = new Date();
  const activeBoosts = await db.pointsBoost.findMany({
    where: {
      pointsConfigId,
      isActive: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
  });

  if (activeBoosts.length === 0) return 1;

  // If multiple boosts are active, use the highest multiplier
  return Math.max(...activeBoosts.map((b) => b.multiplier));
}

/**
 * Award points to a member and recalculate their level.
 */
async function awardPoints(memberId: string, pointsConfigId: string, basePoints: number): Promise<number> {
  const multiplier = await getActiveBoostMultiplier(pointsConfigId);
  const actualPoints = basePoints * multiplier;

  // Upsert member points
  const memberPoints = await db.memberPoints.upsert({
    where: { memberId_pointsConfigId: { memberId, pointsConfigId } },
    update: { totalPoints: { increment: actualPoints } },
    create: { memberId, pointsConfigId, totalPoints: actualPoints },
  });

  // Recalculate level
  const levels = await db.pointsLevel.findMany({
    where: { pointsConfigId },
    orderBy: { order: 'desc' },
  });

  const newLevel = levels.find((l) => memberPoints.totalPoints >= l.threshold);
  const newLevelOrder = newLevel?.order ?? 0;

  if (newLevelOrder !== memberPoints.currentLevel) {
    await db.memberPoints.update({
      where: { id: memberPoints.id },
      data: { currentLevel: newLevelOrder },
    });

    await recordEvent({
      eventType: 'points.level.changed',
      memberId,
      payload: {
        pointsConfigId,
        previousLevel: memberPoints.currentLevel,
        newLevel: newLevelOrder,
        levelName: newLevel?.name,
        totalPoints: memberPoints.totalPoints,
      },
    });
  }

  await recordEvent({
    eventType: 'points.changed',
    memberId,
    payload: {
      pointsConfigId,
      basePoints,
      multiplier,
      actualPoints,
      totalPoints: memberPoints.totalPoints,
    },
  });

  return actualPoints;
}

/**
 * Process points triggers when a metric event is recorded.
 * Called from metrics.ts.
 */
export async function processMetricTriggers(
  memberId: string,
  metricId: string,
  metricValue: number
): Promise<number> {
  let totalPointsAwarded = 0;

  const triggers = await db.pointsTrigger.findMany({
    where: {
      sourceType: 'metric',
      metricId,
      isActive: true,
    },
    include: { pointsConfig: true },
  });

  for (const trigger of triggers) {
    if (!trigger.pointsConfig.isActive) continue;

    const basePoints = trigger.pointsPerUnit * metricValue;
    if (basePoints <= 0) continue;

    const awarded = await awardPoints(memberId, trigger.pointsConfigId, basePoints);
    totalPointsAwarded += awarded;
  }

  return totalPointsAwarded;
}

/**
 * Process points triggers when an achievement is completed.
 * Called from achievements.ts.
 */
export async function processAchievementTriggers(
  memberId: string,
  badgeId: string
): Promise<number> {
  let totalPointsAwarded = 0;

  const triggers = await db.pointsTrigger.findMany({
    where: {
      sourceType: 'achievement',
      badgeId,
      isActive: true,
    },
    include: { pointsConfig: true },
  });

  for (const trigger of triggers) {
    if (!trigger.pointsConfig.isActive) continue;

    const basePoints = trigger.pointsFixed;
    if (basePoints <= 0) continue;

    const awarded = await awardPoints(memberId, trigger.pointsConfigId, basePoints);
    totalPointsAwarded += awarded;
  }

  return totalPointsAwarded;
}

/**
 * Get member's points with level info.
 */
export async function getMemberPoints(memberId: string) {
  const memberPointsList = await db.memberPoints.findMany({
    where: { memberId },
    include: {
      pointsConfig: {
        include: {
          levels: { orderBy: { order: 'asc' } },
        },
      },
    },
  });

  return memberPointsList.map((mp) => {
    const currentLevel = mp.pointsConfig.levels.find((l) => l.order === mp.currentLevel);
    const nextLevel = mp.pointsConfig.levels.find((l) => l.order === mp.currentLevel + 1);

    return {
      pointsConfigId: mp.pointsConfigId,
      configName: mp.pointsConfig.name,
      configNameAr: mp.pointsConfig.nameAr,
      totalPoints: mp.totalPoints,
      currentLevel: currentLevel
        ? { order: currentLevel.order, name: currentLevel.name, nameAr: currentLevel.nameAr, icon: currentLevel.icon, color: currentLevel.color }
        : null,
      nextLevel: nextLevel
        ? { order: nextLevel.order, name: nextLevel.name, nameAr: nextLevel.nameAr, threshold: nextLevel.threshold, pointsNeeded: nextLevel.threshold - mp.totalPoints }
        : null,
    };
  });
}

/**
 * Get points summary across all members.
 */
export async function getPointsSummary() {
  const configs = await db.pointsConfig.findMany({
    where: { isActive: true },
    include: {
      levels: { orderBy: { order: 'asc' } },
      memberPoints: {
        orderBy: { totalPoints: 'desc' },
        take: 10,
        include: { member: true },
      },
      boosts: {
        where: { isActive: true },
      },
    },
  });

  return configs.map((config) => ({
    id: config.id,
    name: config.name,
    nameAr: config.nameAr,
    levels: config.levels,
    topMembers: config.memberPoints.map((mp) => ({
      memberId: mp.memberId,
      memberName: mp.member.name,
      totalPoints: mp.totalPoints,
      currentLevel: mp.currentLevel,
    })),
    activeBoosts: config.boosts.map((b) => ({
      id: b.id,
      name: b.name,
      multiplier: b.multiplier,
      endDate: b.endDate,
    })),
  }));
}
