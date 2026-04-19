import { db } from '@/lib/db';
import { recordEvent } from './event-store';
import { checkStreakAchievements } from './achievements';

/**
 * Streak system with Asia/Dubai timezone awareness.
 * Streaks track consecutive periods (daily/weekly/monthly) of meeting a metric threshold.
 */

const DEFAULT_TIMEZONE = 'Asia/Dubai';

/**
 * Get the start of the current period in the given timezone.
 * Uses Intl.DateTimeFormat for timezone-aware date calculations.
 */
function getCurrentPeriodStart(frequency: string, timezone: string = DEFAULT_TIMEZONE): string {
  const now = new Date();

  // Get the date components in the target timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find((p) => p.type === 'year')!.value);
  const month = parseInt(parts.find((p) => p.type === 'month')!.value);
  const day = parseInt(parts.find((p) => p.type === 'day')!.value);

  switch (frequency) {
    case 'daily':
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    case 'weekly': {
      // Get the Monday of the current week
      const date = new Date(year, month - 1, day);
      const dayOfWeek = date.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(year, month - 1, day + mondayOffset);
      return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    }
    case 'monthly':
      return `${year}-${String(month).padStart(2, '0')}-01`;
    default:
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}

/**
 * Get the previous period start from a given period.
 */
function getPreviousPeriodStart(periodStart: string, frequency: string): string {
  const [year, month, day] = periodStart.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() - 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() - 7);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() - 1);
      break;
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

/**
 * Get total metric value for a member in a specific period.
 */
async function getMetricValueInPeriod(
  memberId: string,
  metricId: string,
  periodStart: string,
  frequency: string,
  timezone: string = DEFAULT_TIMEZONE
): Promise<number> {
  const [year, month, day] = periodStart.split('-').map(Number);
  const start = new Date(year, month - 1, day);
  let end: Date;

  switch (frequency) {
    case 'daily':
      end = new Date(year, month - 1, day + 1);
      break;
    case 'weekly':
      end = new Date(year, month - 1, day + 7);
      break;
    case 'monthly':
      end = new Date(year, month, 1);
      break;
    default:
      end = new Date(year, month - 1, day + 1);
  }

  const events = await db.metricEvent.findMany({
    where: {
      memberId,
      metricId,
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return events.reduce((sum, e) => sum + e.value, 0);
}

/**
 * Process streaks after a metric event.
 * Called by metrics.ts after recording a metric event.
 */
// _eventValue is unused here — streaks aggregate via getMetricValueInPeriod over full periods
export async function processStreaks(
  memberId: string,
  metricId: string,
  _eventValue: number
): Promise<string[]> {
  const updatedStreakIds: string[] = [];

  // Find all active streaks that track this metric
  const streaks = await db.streak.findMany({
    where: {
      metricId,
      isActive: true,
    },
  });

  const member = await db.member.findUnique({ where: { id: memberId } });
  const timezone = member?.timezone ?? DEFAULT_TIMEZONE;

  for (const streak of streaks) {
    const currentPeriod = getCurrentPeriodStart(streak.frequency, timezone);

    // Get or create MemberStreak
    let memberStreak = await db.memberStreak.findUnique({
      where: { memberId_streakId: { memberId, streakId: streak.id } },
    });

    if (!memberStreak) {
      memberStreak = await db.memberStreak.create({
        data: {
          memberId,
          streakId: streak.id,
          currentLength: 0,
          longestLength: 0,
          freezesRemaining: streak.initialFreezes,
          status: 'active',
        },
      });
    }

    // Calculate metric value for current period
    const periodValue = await getMetricValueInPeriod(
      memberId,
      metricId,
      currentPeriod,
      streak.frequency,
      timezone
    );

    // Did they meet the threshold for this period?
    if (periodValue < streak.threshold) continue;

    // Already counted this period?
    if (memberStreak.lastCompletedPeriod === currentPeriod) continue;

    const previousPeriod = getPreviousPeriodStart(currentPeriod, streak.frequency);
    const isConsecutive =
      memberStreak.lastCompletedPeriod === previousPeriod ||
      memberStreak.currentLength === 0;

    if (isConsecutive) {
      // Extend the streak
      const newLength = memberStreak.currentLength + 1;
      const newLongest = Math.max(newLength, memberStreak.longestLength);

      await db.memberStreak.update({
        where: { id: memberStreak.id },
        data: {
          currentLength: newLength,
          longestLength: newLongest,
          lastCompletedPeriod: currentPeriod,
          status: 'active',
        },
      });

      updatedStreakIds.push(streak.id);

      const streakEventType: 'streak.started' | 'streak.extended' = newLength === 1 ? 'streak.started' : 'streak.extended';
      await recordEvent({
        eventType: streakEventType,
        memberId,
        payload: {
          streakId: streak.id,
          streakName: streak.name,
          currentLength: newLength,
          longestLength: newLongest,
          period: currentPeriod,
        },
      });

      // Check if any streak achievements should unlock
      await checkStreakAchievements(memberId, streak.id, newLength);

      // Accrue freezes if applicable
      if (streak.freezeAccrualRate > 0 && streak.freezeAccrualDays > 0) {
        if (newLength % streak.freezeAccrualDays === 0) {
          const newFreezes = Math.min(
            memberStreak.freezesRemaining + streak.freezeAccrualRate,
            streak.maxFreezes
          );
          await db.memberStreak.update({
            where: { id: memberStreak.id },
            data: { freezesRemaining: newFreezes },
          });

          await recordEvent({
            eventType: 'streak.freeze.earned',
            memberId,
            payload: {
              streakId: streak.id,
              freezesRemaining: newFreezes,
            },
          });
        }
      }
    } else if (memberStreak.lastCompletedPeriod !== null) {
      // Gap detected — check if freeze can cover it
      if (memberStreak.freezesRemaining > 0 && memberStreak.status === 'active') {
        // Use a freeze to cover the gap
        await db.memberStreak.update({
          where: { id: memberStreak.id },
          data: {
            currentLength: memberStreak.currentLength + 1,
            longestLength: Math.max(
              memberStreak.currentLength + 1,
              memberStreak.longestLength
            ),
            lastCompletedPeriod: currentPeriod,
            freezesRemaining: memberStreak.freezesRemaining - 1,
            freezesUsed: memberStreak.freezesUsed + 1,
          },
        });

        updatedStreakIds.push(streak.id);

        await recordEvent({
          eventType: 'streak.freeze.consumed',
          memberId,
          payload: {
            streakId: streak.id,
            freezesRemaining: memberStreak.freezesRemaining - 1,
          },
        });
      } else {
        // Streak is broken — record history and reset
        if (memberStreak.currentLength > 0) {
          await db.streakHistory.create({
            data: {
              memberId,
              streakId: streak.id,
              length: memberStreak.currentLength,
              startDate: memberStreak.startedAt,
              endDate: new Date(),
            },
          });

          await recordEvent({
            eventType: 'streak.lost',
            memberId,
            payload: {
              streakId: streak.id,
              lostLength: memberStreak.currentLength,
            },
          });
        }

        // Reset and start fresh from current period
        await db.memberStreak.update({
          where: { id: memberStreak.id },
          data: {
            currentLength: 1,
            lastCompletedPeriod: currentPeriod,
            status: 'active',
            startedAt: new Date(),
            lostAt: null,
            freezesRemaining: streak.initialFreezes,
            freezesUsed: 0,
          },
        });

        updatedStreakIds.push(streak.id);
      }
    }
  }

  return updatedStreakIds;
}

/**
 * Admin: grant freezes to a member's streak.
 */
export async function grantFreezes(memberId: string, streakId: string, count: number) {
  const memberStreak = await db.memberStreak.findUnique({
    where: { memberId_streakId: { memberId, streakId } },
    include: { streak: true },
  });

  if (!memberStreak) throw new Error('Member streak not found');

  const newFreezes = Math.min(memberStreak.freezesRemaining + count, memberStreak.streak.maxFreezes);

  return db.memberStreak.update({
    where: { id: memberStreak.id },
    data: { freezesRemaining: newFreezes },
  });
}

/**
 * Admin: restore a broken streak.
 */
export async function restoreStreak(memberId: string, streakId: string) {
  const memberStreak = await db.memberStreak.findUnique({
    where: { memberId_streakId: { memberId, streakId } },
  });

  if (!memberStreak) throw new Error('Member streak not found');

  // Restore from the most recent history entry
  const lastHistory = await db.streakHistory.findFirst({
    where: { memberId, streakId },
    orderBy: { endDate: 'desc' },
  });

  const restoredLength = lastHistory?.length ?? memberStreak.longestLength;

  return db.memberStreak.update({
    where: { id: memberStreak.id },
    data: {
      currentLength: restoredLength,
      status: 'active',
      lostAt: null,
    },
  });
}

export async function getMemberStreaks(memberId: string) {
  return db.memberStreak.findMany({
    where: { memberId },
    include: { streak: true },
  });
}
