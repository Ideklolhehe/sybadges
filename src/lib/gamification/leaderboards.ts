import { db } from '@/lib/db';

/**
 * Leaderboard engine supporting metric-based, points-based, and streak-based rankings.
 * Supports both perpetual (never reset) and repeating (periodic reset) leaderboards.
 */

/**
 * Get the score for a member on a specific leaderboard.
 */
async function getScoreForMember(
  memberId: string,
  leaderboard: { rankingMethod: string; metricId: string | null; pointsConfigId: string | null; streakId: string | null }
): Promise<number> {
  switch (leaderboard.rankingMethod) {
    case 'metric': {
      if (!leaderboard.metricId) return 0;
      const total = await db.memberMetricTotal.findUnique({
        where: {
          memberId_metricId: {
            memberId,
            metricId: leaderboard.metricId,
          },
        },
      });
      return total?.totalValue ?? 0;
    }
    case 'points': {
      if (!leaderboard.pointsConfigId) return 0;
      const mp = await db.memberPoints.findUnique({
        where: {
          memberId_pointsConfigId: {
            memberId,
            pointsConfigId: leaderboard.pointsConfigId,
          },
        },
      });
      return mp?.totalPoints ?? 0;
    }
    case 'streak': {
      if (!leaderboard.streakId) return 0;
      const ms = await db.memberStreak.findUnique({
        where: {
          memberId_streakId: {
            memberId,
            streakId: leaderboard.streakId,
          },
        },
      });
      return ms?.currentLength ?? 0;
    }
    default:
      return 0;
  }
}

/**
 * Update all active leaderboards that a member participates in.
 * Called after metric events, achievement unlocks, streak updates, or points changes.
 */
export async function updateLeaderboardsForMember(memberId: string): Promise<string[]> {
  const updatedLeaderboardIds: string[] = [];

  const leaderboards = await db.leaderboard.findMany({
    where: {
      status: 'active',
      isActive: true,
    },
  });

  for (const lb of leaderboards) {
    const score = await getScoreForMember(memberId, lb);

    // Upsert the member's entry
    const existingEntry = await db.leaderboardEntry.findUnique({
      where: {
        leaderboardId_memberId_runNumber: {
          leaderboardId: lb.id,
          memberId,
          runNumber: lb.currentRun,
        },
      },
    });

    if (existingEntry) {
      await db.leaderboardEntry.update({
        where: { id: existingEntry.id },
        data: { score, previousRank: existingEntry.rank },
      });
    } else {
      // Only add if within participant limit
      const entryCount = await db.leaderboardEntry.count({
        where: { leaderboardId: lb.id, runNumber: lb.currentRun },
      });

      if (entryCount < lb.participantLimit) {
        await db.leaderboardEntry.create({
          data: {
            leaderboardId: lb.id,
            memberId,
            runNumber: lb.currentRun,
            score,
          },
        });
      }
    }

    // Recalculate ranks for this leaderboard
    await recalculateRanks(lb.id, lb.currentRun);
    updatedLeaderboardIds.push(lb.id);
  }

  return updatedLeaderboardIds;
}

/**
 * Recalculate ranks for a leaderboard run.
 */
async function recalculateRanks(leaderboardId: string, runNumber: number) {
  const entries = await db.leaderboardEntry.findMany({
    where: { leaderboardId, runNumber },
    orderBy: { score: 'desc' },
  });

  for (let i = 0; i < entries.length; i++) {
    const newRank = i + 1;
    if (entries[i].rank !== newRank) {
      await db.leaderboardEntry.update({
        where: { id: entries[i].id },
        data: { rank: newRank },
      });
    }
  }
}

/**
 * Get a leaderboard with its entries and member info.
 */
export async function getLeaderboard(leaderboardId: string, limit = 100) {
  const leaderboard = await db.leaderboard.findUnique({
    where: { id: leaderboardId },
    include: {
      metric: true,
      pointsConfig: true,
      streak: true,
    },
  });

  if (!leaderboard) return null;

  const entries = await db.leaderboardEntry.findMany({
    where: {
      leaderboardId,
      runNumber: leaderboard.currentRun,
    },
    orderBy: { rank: 'asc' },
    take: limit,
    include: {
      member: {
        select: {
          id: true,
          memberId: true,
          name: true,
          photo: true,
          level: true,
        },
      },
    },
  });

  return {
    ...leaderboard,
    entries: entries.map((e) => ({
      rank: e.rank,
      previousRank: e.previousRank,
      rankChange: e.previousRank ? e.previousRank - e.rank : null,
      score: e.score,
      member: e.member,
    })),
  };
}

/**
 * Get a member's rank across all leaderboards.
 */
export async function getMemberLeaderboards(memberId: string) {
  const entries = await db.leaderboardEntry.findMany({
    where: { memberId },
    include: {
      leaderboard: true,
    },
    orderBy: { rank: 'asc' },
  });

  return entries.map((e) => ({
    leaderboardId: e.leaderboardId,
    leaderboardName: e.leaderboard.name,
    leaderboardNameAr: e.leaderboard.nameAr,
    rank: e.rank,
    previousRank: e.previousRank,
    rankChange: e.previousRank ? e.previousRank - e.rank : null,
    score: e.score,
    type: e.leaderboard.type,
    rankingMethod: e.leaderboard.rankingMethod,
  }));
}

/**
 * Get all active leaderboards.
 */
export async function getActiveLeaderboards() {
  return db.leaderboard.findMany({
    where: {
      isActive: true,
      status: { in: ['active', 'scheduled'] },
    },
    orderBy: { createdAt: 'desc' },
    include: {
      metric: { select: { name: true, nameAr: true } },
      pointsConfig: { select: { name: true, nameAr: true } },
      streak: { select: { name: true, nameAr: true } },
      _count: { select: { entries: true } },
    },
  });
}
