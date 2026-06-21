import { db } from '@/lib/db';

/**
 * Unified event log for audit trail.
 * All gamification events are stored here for observability and debugging.
 */

export type GamificationEventType =
  | 'metric.recorded'
  | 'achievement.unlocked'
  | 'achievement.approved'
  | 'achievement.rejected'
  | 'streak.started'
  | 'streak.extended'
  | 'streak.lost'
  | 'points.changed'
  | 'points.level.changed'
  | 'leaderboard.rank.changed'
  | 'member.created'
  | 'member.updated';

interface RecordEventParams {
  eventType: GamificationEventType;
  payload: Record<string, unknown>;
  memberId?: string;
}

export async function recordEvent({ eventType, payload, memberId }: RecordEventParams) {
  return db.eventStore.create({
    data: {
      eventType,
      payload: JSON.stringify(payload),
      memberId: memberId ?? null,
      processed: true,
    },
  });
}

export async function getEventsByMember(memberId: string, limit = 50) {
  return db.eventStore.findMany({
    where: { memberId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getEventsByType(eventType: string, limit = 50) {
  return db.eventStore.findMany({
    where: { eventType },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getRecentEvents(limit = 100) {
  return db.eventStore.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}
