import { db } from '@/lib/db';
import { recordEvent } from './event-store';
import { processMetricTriggers as processPointsTriggers } from './points';
import { processStreaks } from './streaks';
import { checkMetricAchievements } from './achievements';
import { updateLeaderboardsForMember } from './leaderboards';

/**
 * Core metric event recording — the foundation of all gamification.
 * When a metric event is recorded:
 * 1. Create the MetricEvent row
 * 2. Update MemberMetricTotal (aggregate)
 * 3. Log to EventStore
 * 4. Trigger downstream: achievements, streaks, points, leaderboards
 */

interface RecordMetricEventInput {
  memberId: string;
  metricId: string;
  value?: number;
  attributes?: Record<string, unknown>;
  idempotencyKey?: string;
}

interface MetricEventResult {
  event: { id: string; value: number; createdAt: Date };
  total: { totalValue: number };
  sideEffects: {
    achievementsUnlocked: string[];
    streaksUpdated: string[];
    pointsAwarded: number;
    leaderboardsUpdated: string[];
  };
}

export async function recordMetricEvent(input: RecordMetricEventInput): Promise<MetricEventResult> {
  const { memberId, metricId, value = 1, attributes = {}, idempotencyKey } = input;

  // Idempotency check
  if (idempotencyKey) {
    const existing = await db.metricEvent.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      const total = await db.memberMetricTotal.findUnique({
        where: { memberId_metricId: { memberId, metricId } },
      });
      return {
        event: { id: existing.id, value: existing.value, createdAt: existing.createdAt },
        total: { totalValue: total?.totalValue ?? 0 },
        sideEffects: { achievementsUnlocked: [], streaksUpdated: [], pointsAwarded: 0, leaderboardsUpdated: [] },
      };
    }
  }

  // 1. Create the event
  const event = await db.metricEvent.create({
    data: {
      memberId,
      metricId,
      value,
      attributes: JSON.stringify(attributes),
      idempotencyKey: idempotencyKey ?? null,
    },
  });

  // 2. Upsert MemberMetricTotal
  const total = await db.memberMetricTotal.upsert({
    where: { memberId_metricId: { memberId, metricId } },
    update: { totalValue: { increment: value } },
    create: { memberId, metricId, totalValue: value },
  });

  // 3. Log to event store
  await recordEvent({
    eventType: 'metric.recorded',
    memberId,
    payload: { metricId, value, totalValue: total.totalValue, eventId: event.id },
  });

  // 4. Process downstream side effects
  const sideEffects = {
    achievementsUnlocked: [] as string[],
    streaksUpdated: [] as string[],
    pointsAwarded: 0,
    leaderboardsUpdated: [] as string[],
  };

  try {
    // Check metric-based achievements
    const unlocked = await checkMetricAchievements(memberId, metricId, total.totalValue);
    sideEffects.achievementsUnlocked = unlocked;

    // Process streaks for this metric
    const streakResults = await processStreaks(memberId, metricId, value);
    sideEffects.streaksUpdated = streakResults;

    // Award points via metric triggers
    const points = await processPointsTriggers(memberId, metricId, value);
    sideEffects.pointsAwarded = points;

    // Update relevant leaderboards
    const lbUpdated = await updateLeaderboardsForMember(memberId);
    sideEffects.leaderboardsUpdated = lbUpdated;
  } catch (error) {
    console.error('Error processing side effects for metric event:', error);
  }

  return {
    event: { id: event.id, value: event.value, createdAt: event.createdAt },
    total: { totalValue: total.totalValue },
    sideEffects,
  };
}

export async function getMemberMetrics(memberId: string) {
  return db.memberMetricTotal.findMany({
    where: { memberId },
    include: { metric: true },
    orderBy: { metric: { name: 'asc' } },
  });
}

export async function getMemberMetricHistory(memberId: string, metricId: string, limit = 50) {
  return db.metricEvent.findMany({
    where: { memberId, metricId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function getAllMetrics() {
  return db.metric.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  });
}
