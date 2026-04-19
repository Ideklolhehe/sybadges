import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ─── METRICS ──────────────────────────────────────────────────
  const metrics = await Promise.all([
    prisma.metric.create({
      data: {
        name: 'workshops_attended',
        nameAr: 'ورش العمل',
        description: 'Number of workshops attended',
        descriptionAr: 'عدد ورش العمل التي حضرها العضو',
        unit: 'count',
      },
    }),
    prisma.metric.create({
      data: {
        name: 'volunteer_hours',
        nameAr: 'ساعات التطوع',
        description: 'Hours spent volunteering',
        descriptionAr: 'ساعات التطوع في المجتمع',
        unit: 'hours',
      },
    }),
    prisma.metric.create({
      data: {
        name: 'books_read',
        nameAr: 'الكتب المقروءة',
        description: 'Number of books read',
        descriptionAr: 'عدد الكتب التي قرأها العضو',
        unit: 'count',
      },
    }),
    prisma.metric.create({
      data: {
        name: 'projects_completed',
        nameAr: 'المشاريع المكتملة',
        description: 'Number of projects completed',
        descriptionAr: 'عدد المشاريع المنجزة',
        unit: 'count',
      },
    }),
    prisma.metric.create({
      data: {
        name: 'community_service_days',
        nameAr: 'أيام خدمة المجتمع',
        description: 'Days spent in community service',
        descriptionAr: 'أيام خدمة المجتمع',
        unit: 'days',
      },
    }),
    prisma.metric.create({
      data: {
        name: 'daily_activity',
        nameAr: 'النشاط اليومي',
        description: 'Daily check-in / activity completion',
        descriptionAr: 'تسجيل الحضور اليومي',
        unit: 'count',
      },
    }),
  ])
  console.log(`✅ Created ${metrics.length} metrics`)

  // ─── BADGES (existing + metric-triggered) ──────────────────────
  const badges = await Promise.all([
    // Manual badges (original)
    prisma.badge.create({
      data: {
        name: 'Community Service', nameAr: 'خدمة المجتمع',
        description: 'Awarded for outstanding community service', descriptionAr: 'تمنح لخدمة المجتمع المتميزة',
        category: 'Community', categoryAr: 'المجتمع', level: 'bronze', icon: 'community', color: '#2E2973',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Leadership', nameAr: 'القيادة',
        description: 'Demonstrated leadership qualities', descriptionAr: 'إظهار صفات القيادة',
        category: 'Leadership', categoryAr: 'القيادة', level: 'bronze', icon: 'leadership', color: '#2E2973',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Innovation', nameAr: 'الابتكار',
        description: 'Creative problem solving', descriptionAr: 'حل المشاكل بشكل إبداعي',
        category: 'Innovation', categoryAr: 'الابتكار', level: 'silver', icon: 'innovation', color: '#4A5568',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Teamwork', nameAr: 'العمل الجماعي',
        description: 'Excellent collaboration skills', descriptionAr: 'مهارات تعاون ممتازة',
        category: 'Skills', categoryAr: 'المهارات', level: 'bronze', icon: 'teamwork', color: '#2E2973',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Technical Excellence', nameAr: 'التميز التقني',
        description: 'Mastery of technical skills', descriptionAr: 'إتقان المهارات التقنية',
        category: 'Technical', categoryAr: 'تقني', level: 'gold', icon: 'technical', color: '#D69E2E',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Public Speaking', nameAr: 'الخطابة العامة',
        description: 'Confident public presentation', descriptionAr: 'تقديم عام واثق',
        category: 'Skills', categoryAr: 'المهارات', level: 'silver', icon: 'speaking', color: '#4A5568',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Project Management', nameAr: 'إدارة المشاريع',
        description: 'Successful project completion', descriptionAr: 'إكمال المشروع بنجاح',
        category: 'Leadership', categoryAr: 'القيادة', level: 'gold', icon: 'project', color: '#D69E2E',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Mentorship', nameAr: 'التوجيه والإرشاد',
        description: 'Helping others grow and succeed', descriptionAr: 'مساعدة الآخرين على النجاح',
        category: 'Community', categoryAr: 'المجتمع', level: 'platinum', icon: 'mentorship', color: '#805AD5',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Sustainability Champion', nameAr: 'بطل الاستدامة',
        description: 'Promoting environmental awareness', descriptionAr: 'تعزيز الوعي البيئي',
        category: 'Community', categoryAr: 'المجتمع', level: 'gold', icon: 'sustainability', color: '#D69E2E',
        triggerType: 'manual', isAutomatic: false,
      },
    }),
  ])

  // Metric-triggered auto-award badges
  const autoBadges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Workshop Explorer', nameAr: 'مستكشف الورش',
        description: 'Attended 5 workshops', descriptionAr: 'حضر 5 ورش عمل',
        category: 'Skills', categoryAr: 'المهارات', level: 'bronze', icon: 'workshop', color: '#2E2973',
        triggerType: 'metric', isAutomatic: true,
        triggerConfig: JSON.stringify({ metricId: metrics[0].id, threshold: 5 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Workshop Master', nameAr: 'خبير الورش',
        description: 'Attended 20 workshops', descriptionAr: 'حضر 20 ورشة عمل',
        category: 'Skills', categoryAr: 'المهارات', level: 'gold', icon: 'workshop', color: '#D69E2E',
        triggerType: 'metric', isAutomatic: true,
        triggerConfig: JSON.stringify({ metricId: metrics[0].id, threshold: 20 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Volunteer Star', nameAr: 'نجم التطوع',
        description: 'Volunteered 10+ hours', descriptionAr: 'تطوع لأكثر من 10 ساعات',
        category: 'Community', categoryAr: 'المجتمع', level: 'bronze', icon: 'volunteer', color: '#2E2973',
        triggerType: 'metric', isAutomatic: true,
        triggerConfig: JSON.stringify({ metricId: metrics[1].id, threshold: 10 }),
      },
    }),
    prisma.badge.create({
      data: {
        name: 'Bookworm', nameAr: 'دودة الكتب',
        description: 'Read 10 books', descriptionAr: 'قرأ 10 كتب',
        category: 'Skills', categoryAr: 'المهارات', level: 'silver', icon: 'book', color: '#4A5568',
        triggerType: 'metric', isAutomatic: true,
        triggerConfig: JSON.stringify({ metricId: metrics[2].id, threshold: 10 }),
      },
    }),
  ])

  console.log(`✅ Created ${badges.length + autoBadges.length} badges (${badges.length} manual + ${autoBadges.length} auto)`)

  // ─── MEMBERS ──────────────────────────────────────────────────
  const members = await Promise.all([
    prisma.member.create({
      data: {
        memberId: 'MEM001', name: 'أحمد محمد الشحي',
        email: 'ahmed@example.com', phone: '+971501234567',
        dateOfBirth: new Date('2008-05-15'), level: 'gold', totalBadges: 8, timezone: 'Asia/Dubai',
      },
    }),
    prisma.member.create({
      data: {
        memberId: 'MEM002', name: 'فاطمة سالم البلوشي',
        email: 'fatima@example.com', phone: '+971507654321',
        dateOfBirth: new Date('2009-03-22'), level: 'silver', totalBadges: 5, timezone: 'Asia/Dubai',
      },
    }),
    prisma.member.create({
      data: {
        memberId: 'MEM003', name: 'محمد خميس الكعبي',
        email: 'mohammed@example.com', phone: '+971559876543',
        dateOfBirth: new Date('2007-11-10'), level: 'platinum', totalBadges: 12, timezone: 'Asia/Dubai',
      },
    }),
  ])
  console.log(`✅ Created ${members.length} members`)

  // ─── ACHIEVEMENTS ─────────────────────────────────────────────
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        memberId: members[0].id, badgeId: badges[0].id, status: 'approved',
        reason: 'Volunteered at community event', reasonAr: 'تطوع في فعالية مجتمعية',
        approvedBy: 'admin', approvedAt: new Date(),
      },
    }),
    prisma.achievement.create({
      data: {
        memberId: members[0].id, badgeId: badges[1].id, status: 'approved',
        reason: 'Led youth team project', reasonAr: 'قاد مشروع الفريق الشبابي',
        approvedBy: 'admin', approvedAt: new Date(),
      },
    }),
    prisma.achievement.create({
      data: {
        memberId: members[1].id, badgeId: badges[2].id, status: 'pending',
        reason: 'Created innovative solution for local problem', reasonAr: 'خلق حل مبتكر لمشكلة محلية',
      },
    }),
    prisma.achievement.create({
      data: {
        memberId: members[2].id, badgeId: badges[7].id, status: 'approved',
        reason: 'Mentored 5 junior members', reasonAr: 'وجه وأرشد 5 أعضاء جدد',
        approvedBy: 'admin', approvedAt: new Date(),
      },
    }),
  ])
  console.log(`✅ Created ${achievements.length} achievements`)

  // ─── SYNTHETIC METRIC EVENTS (6 months) ─────────────────────
  const now = new Date()
  const sixMonthsAgo = new Date(now)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  let eventCount = 0
  for (const member of members) {
    for (const metric of metrics) {
      // Generate random events over 6 months
      const numEvents = Math.floor(Math.random() * 30) + 5
      for (let i = 0; i < numEvents; i++) {
        const eventDate = new Date(
          sixMonthsAgo.getTime() + Math.random() * (now.getTime() - sixMonthsAgo.getTime())
        )
        const value = metric.unit === 'hours' ? Math.round(Math.random() * 4 + 1) : 1

        await prisma.metricEvent.create({
          data: {
            memberId: member.id,
            metricId: metric.id,
            value,
            attributes: JSON.stringify({ source: 'seed' }),
            createdAt: eventDate,
          },
        })
        eventCount++
      }

      // Aggregate totals
      const total = await prisma.metricEvent.aggregate({
        where: { memberId: member.id, metricId: metric.id },
        _sum: { value: true },
      })

      await prisma.memberMetricTotal.create({
        data: {
          memberId: member.id,
          metricId: metric.id,
          totalValue: total._sum.value ?? 0,
        },
      })
    }
  }
  console.log(`✅ Created ${eventCount} metric events with aggregated totals`)

  // ─── STREAKS ──────────────────────────────────────────────────
  const streaks = await Promise.all([
    prisma.streak.create({
      data: {
        name: 'Daily Activity Streak', nameAr: 'سلسلة النشاط اليومي',
        description: 'Complete at least one activity each day', descriptionAr: 'أكمل نشاطًا واحدًا على الأقل كل يوم',
        frequency: 'daily', threshold: 1, metricId: metrics[5].id,
        initialFreezes: 2, freezeAccrualRate: 1, freezeAccrualDays: 7, maxFreezes: 5,
      },
    }),
    prisma.streak.create({
      data: {
        name: 'Weekly Workshop Streak', nameAr: 'سلسلة الورش الأسبوعية',
        description: 'Attend at least one workshop each week', descriptionAr: 'حضور ورشة عمل واحدة على الأقل كل أسبوع',
        frequency: 'weekly', threshold: 1, metricId: metrics[0].id,
        initialFreezes: 1, maxFreezes: 3,
      },
    }),
    prisma.streak.create({
      data: {
        name: 'Monthly Reading Streak', nameAr: 'سلسلة القراءة الشهرية',
        description: 'Read at least one book each month', descriptionAr: 'قراءة كتاب واحد على الأقل كل شهر',
        frequency: 'monthly', threshold: 1, metricId: metrics[2].id,
        initialFreezes: 1, maxFreezes: 2,
      },
    }),
  ])

  // Seed member streaks
  for (const member of members) {
    for (const streak of streaks) {
      const length = Math.floor(Math.random() * 14) + 1
      await prisma.memberStreak.create({
        data: {
          memberId: member.id,
          streakId: streak.id,
          currentLength: length,
          longestLength: length + Math.floor(Math.random() * 5),
          freezesRemaining: streak.initialFreezes,
          status: 'active',
        },
      })
    }
  }
  console.log(`✅ Created ${streaks.length} streaks with member data`)

  // ─── POINTS CONFIG ────────────────────────────────────────────
  const xpConfig = await prisma.pointsConfig.create({
    data: {
      name: 'XP',
      nameAr: 'نقاط الخبرة',
      description: 'Experience points earned from activities',
      descriptionAr: 'نقاط الخبرة المكتسبة من الأنشطة',
      levels: {
        create: [
          { threshold: 0, name: 'Beginner', nameAr: 'مبتدئ', icon: '🌱', color: '#10B981', order: 0 },
          { threshold: 100, name: 'Explorer', nameAr: 'مستكشف', icon: '🔍', color: '#3B82F6', order: 1 },
          { threshold: 300, name: 'Achiever', nameAr: 'منجز', icon: '⭐', color: '#F59E0B', order: 2 },
          { threshold: 600, name: 'Champion', nameAr: 'بطل', icon: '🏆', color: '#EF4444', order: 3 },
          { threshold: 1000, name: 'Legend', nameAr: 'أسطورة', icon: '👑', color: '#8B5CF6', order: 4 },
        ],
      },
      triggers: {
        create: [
          { sourceType: 'metric', metricId: metrics[0].id, pointsPerUnit: 10 }, // 10 XP per workshop
          { sourceType: 'metric', metricId: metrics[1].id, pointsPerUnit: 5 },  // 5 XP per volunteer hour
          { sourceType: 'metric', metricId: metrics[2].id, pointsPerUnit: 15 }, // 15 XP per book
          { sourceType: 'metric', metricId: metrics[3].id, pointsPerUnit: 25 }, // 25 XP per project
          { sourceType: 'metric', metricId: metrics[4].id, pointsPerUnit: 8 },  // 8 XP per service day
          { sourceType: 'metric', metricId: metrics[5].id, pointsPerUnit: 2 },  // 2 XP per daily activity
        ],
      },
    },
  })

  // Seed member points from existing metric totals
  for (const member of members) {
    const totals = await prisma.memberMetricTotal.findMany({
      where: { memberId: member.id },
    })

    let totalXP = 0
    for (const total of totals) {
      const trigger = await prisma.pointsTrigger.findFirst({
        where: { pointsConfigId: xpConfig.id, metricId: total.metricId },
      })
      if (trigger) {
        totalXP += total.totalValue * trigger.pointsPerUnit
      }
    }

    const levels = [
      { threshold: 0, order: 0 },
      { threshold: 100, order: 1 },
      { threshold: 300, order: 2 },
      { threshold: 600, order: 3 },
      { threshold: 1000, order: 4 },
    ]
    const currentLevel = [...levels].reverse().find((l) => totalXP >= l.threshold)?.order ?? 0

    await prisma.memberPoints.create({
      data: {
        memberId: member.id,
        pointsConfigId: xpConfig.id,
        totalPoints: totalXP,
        currentLevel,
      },
    })
  }
  console.log(`✅ Created XP points config with ${5} levels and ${6} triggers`)

  // ─── LEADERBOARDS ─────────────────────────────────────────────
  const leaderboard = await prisma.leaderboard.create({
    data: {
      name: 'Top Achievers', nameAr: 'المتصدرون',
      description: 'Overall XP leaderboard', descriptionAr: 'لوحة المتصدرين العامة',
      type: 'perpetual', rankingMethod: 'points',
      pointsConfigId: xpConfig.id, participantLimit: 100, status: 'active',
    },
  })

  // Seed leaderboard entries from member points
  const memberPointsList = await prisma.memberPoints.findMany({
    where: { pointsConfigId: xpConfig.id },
    orderBy: { totalPoints: 'desc' },
  })

  for (let i = 0; i < memberPointsList.length; i++) {
    await prisma.leaderboardEntry.create({
      data: {
        leaderboardId: leaderboard.id,
        memberId: memberPointsList[i].memberId,
        score: memberPointsList[i].totalPoints,
        rank: i + 1,
        runNumber: 1,
      },
    })
  }

  // Workshop leaderboard (metric-based)
  const workshopLb = await prisma.leaderboard.create({
    data: {
      name: 'Workshop Champions', nameAr: 'أبطال الورش',
      description: 'Most workshops attended', descriptionAr: 'أكثر حضوراً للورش',
      type: 'perpetual', rankingMethod: 'metric',
      metricId: metrics[0].id, participantLimit: 100, status: 'active',
    },
  })

  const workshopTotals = await prisma.memberMetricTotal.findMany({
    where: { metricId: metrics[0].id },
    orderBy: { totalValue: 'desc' },
  })

  for (let i = 0; i < workshopTotals.length; i++) {
    await prisma.leaderboardEntry.create({
      data: {
        leaderboardId: workshopLb.id,
        memberId: workshopTotals[i].memberId,
        score: workshopTotals[i].totalValue,
        rank: i + 1,
        runNumber: 1,
      },
    })
  }

  console.log(`✅ Created 2 leaderboards with entries`)

  // ─── NOTIFICATION TEMPLATES ───────────────────────────────────
  await Promise.all([
    prisma.notificationTemplate.create({
      data: {
        type: 'achievement_completed',
        subject: 'Congratulations! You earned a new badge 🎉',
        subjectAr: 'تهانينا! لقد حصلت على شارة جديدة 🎉',
        body: '<h2>{{memberName}}, you earned the {{badgeName}} badge!</h2><p>Keep up the great work.</p>',
        bodyAr: '<h2>{{memberName}}، لقد حصلت على شارة {{badgeNameAr}}!</h2><p>استمر في العمل الرائع.</p>',
        channel: 'in_app',
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        type: 'streak_reminder',
        subject: "Don't lose your streak! 🔥",
        subjectAr: 'لا تفقد سلسلتك! 🔥',
        body: '<p>{{memberName}}, your {{streakName}} streak is at {{currentLength}} days. Keep it going!</p>',
        bodyAr: '<p>{{memberName}}، سلسلتك في {{streakNameAr}} وصلت إلى {{currentLength}} يوم. استمر!</p>',
        channel: 'in_app',
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        type: 'recap',
        subject: 'Your Weekly Progress Summary 📊',
        subjectAr: 'ملخص تقدمك الأسبوعي 📊',
        body: '<h2>This week you earned {{pointsEarned}} XP and completed {{activitiesCount}} activities.</h2>',
        bodyAr: '<h2>هذا الأسبوع حصلت على {{pointsEarned}} نقطة وأكملت {{activitiesCount}} نشاط.</h2>',
        channel: 'in_app',
      },
    }),
    prisma.notificationTemplate.create({
      data: {
        type: 'reactivation',
        subject: 'We miss you! Come back and earn more badges 💪',
        subjectAr: 'نفتقدك! عد واكسب المزيد من الشارات 💪',
        body: '<p>{{memberName}}, your friends at the youth center have been active. Come back and earn badges!</p>',
        bodyAr: '<p>{{memberName}}، أصدقاؤك في مركز الشباب كانوا نشطين. عد واكسب شارات!</p>',
        channel: 'in_app',
      },
    }),
  ])
  console.log(`✅ Created 4 notification templates`)

  console.log('🎉 Database seeded successfully with full gamification data!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
