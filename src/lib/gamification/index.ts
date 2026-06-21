/**
 * Sybadges Gamification Engine
 * Trophy-inspired gamification features tailored for youth achievement tracking.
 *
 * Architecture:
 *   MetricEvent → Metrics Engine → [Achievements, Streaks, Points, Leaderboards]
 *                                     ↓
 *                               EventStore (audit log)
 */

export { recordMetricEvent, getMemberMetrics, getMemberMetricHistory, getAllMetrics } from './metrics';
export { checkMetricAchievements, checkStreakAchievements, checkCompositeAchievements, getAchievementRarity } from './achievements';
export { processStreaks, restoreStreak, getMemberStreaks } from './streaks';
export { processMetricTriggers, processAchievementTriggers, getMemberPoints, getPointsSummary } from './points';
export { updateLeaderboardsForMember, getLeaderboard, getMemberLeaderboards, getActiveLeaderboards } from './leaderboards';
export { recordEvent, getEventsByMember, getEventsByType, getRecentEvents } from './event-store';
