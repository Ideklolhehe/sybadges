import { db } from '@/lib/db';

/**
 * Leaderboard engine supporting metric-based, points-based, and streak-based rankings.
 */

async function getScoreForMember(
  memberId: string,
  leaderboard: { rankingMethod: string; metricId: string | null; pointsConfigId: string | null; streakId: string | null }
): Promise<number> {
  switch (leaderboard.rankingMethod) {
    case 'metric': {
      if (!leaderboard.metricId) return 0;
      const total = await db.memberMetricTotal.findUnique({
        where: { memberId_metricId: { memberId, metricId: leaderboard.metricId } },
      });
      return total?.totalValue ?? 0;
    }
    case 'points': {
      if (!leaderboard.pointsConfigId) return 0;
      const mp = await db.memberPoints.findUnique({
        where: { memberId_pointsConfigId: { memberId, pointsConfigId: leaderboard.pointsConfigId } },
      });
      return mp?.totalPoints ?? 0;
    }
    case 'streak': {
      if (!leaderboard.streakId) return 0;
      const ms = await db.memberStreak.findUnique({
        where: { memberId_streakId: { memberId, streakId: leaderboard.streakId } },
      });
      return ms?.currentLength ?? 0;
    }
    default:
      return 0;
  }
}

/**
 * Update all active leaderboards that a member participates in.
 */
export async function updateLeaderboardsForMember(memberId: string): Promise<string[]> {
  const updatedLeaderboardIds: string[] = [];

  const leaderboards = await db.leaderboard.findMany({
    where: { status: 'active', isActive: true },
  });

  for (const lb of leaderboards) {
    const score = await getScoreForMember(memberId, lb);

    const existingEntry = await db.leaderboardEntry.findUnique({
      where: { leaderboardId_memberId: { leaderboardId: lb.id, memberId } },
    });

    if (existingEntry) {
      await db.leaderboardEntry.update({
        where: { id: existingEntry.id },
        data: { score },
      });
    } else {
      const entryCount = await db.leaderboardEntry.count({
        where: { leaderboardId: lb.id },
      });

      if (entryCount < lb.participantLimit) {
        await db.leaderboardEntry.create({
          data: { leaderboardId: lb.id, memberId, score },
        });
      }
    }

    await recalculateRanks(lb.id);
    updatedLeaderboardIds.push(lb.id);
  }

  return updatedLeaderboardIds;
}

async function recalculateRanks(leaderboardId: string) {
  const entries = await db.leaderboardEntry.findMany({
    where: { leaderboardId },
    orderBy: { score: 'desc' },
  });

  const updates = entries
    .map((entry, i) => ({ entry, newRank: i + 1 }))
    .filter(({ entry, newRank }) => entry.rank !== newRank)
    .map(({ entry, newRank }) =>
      db.leaderboardEntry.update({
        where: { id: entry.id },
        data: { rank: newRank },
      })
    );

  if (updates.length > 0) {
    await db.$transaction(updates);
  }
}

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
    where: { leaderboardId },
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
      score: e.score,
      member: e.member,
    })),
  };
}

export async function getMemberLeaderboards(memberId: string) {
  const entries = await db.leaderboardEntry.findMany({
    where: { memberId },
    include: { leaderboard: true },
    orderBy: { rank: 'asc' },
  });

  return entries.map((e) => ({
    leaderboardId: e.leaderboardId,
    leaderboardName: e.leaderboard.name,
    leaderboardNameAr: e.leaderboard.nameAr,
    rank: e.rank,
    score: e.score,
    rankingMethod: e.leaderboard.rankingMethod,
  }));
}

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
