import { db } from './db';

/**
 * Seed the database with demo data for development and testing.
 * Run with: bun run db:seed
 */
async function seed() {
  console.log('🌱 Seeding database...');

  // Seed Badges
  console.log('�� Seeding badges...');
  const badges = [
    { name: 'Community Service', nameAr: 'خدمة المجتمع', description: 'Awarded for outstanding community service', descriptionAr: 'تمنح لخدمة المجتمع المتميزة', category: 'community', categoryAr: 'المجتمع', level: 'bronze', icon: '❤️', color: '#2E2973' },
    { name: 'Leadership', nameAr: 'القيادة', description: 'Demonstrated leadership qualities', descriptionAr: 'إظهار صفات القيادة', category: 'leadership', categoryAr: 'القيادة', level: 'silver', icon: '🛡️', color: '#4A5568' },
    { name: 'Innovation', nameAr: 'الابتكار', description: 'Creative problem solving', descriptionAr: 'حل المشاكل بشكل إبداعي', category: 'innovation', categoryAr: 'الابتكار', level: 'gold', icon: '✨', color: '#E04511' },
    { name: 'Teamwork', nameAr: 'العمل الجماعي', description: 'Excellent collaboration skills', descriptionAr: 'مهارات تعاون متميزة', category: 'skills', categoryAr: 'المهارات', level: 'bronze', icon: '👥', color: '#2E2973' },
    { name: 'Technical Excellence', nameAr: 'التميز التقني', description: 'Mastery of technical skills', descriptionAr: 'إتقان المهارات التقنية', category: 'technical', categoryAr: 'تقني', level: 'gold', icon: '💻', color: '#E04511' },
    { name: 'Mentorship', nameAr: 'التوجيه والإرشاد', description: 'Helping others grow and succeed', descriptionAr: 'مساعدة الآخرين على النجاح', category: 'leadership', categoryAr: 'القيادة', level: 'platinum', icon: '⭐', color: '#9333EA' },
  ];

  const badgeRecords: Record<string, { id: string }> = {};
  for (const badge of badges) {
    const existing = await db.badge.findFirst({ where: { name: badge.name } });
    if (!existing) {
      const record = await db.badge.create({ data: badge });
      badgeRecords[badge.name] = record;
    } else {
      badgeRecords[badge.name] = existing;
    }
  }
  console.log('✅ Badges seeded');

  // Seed Members
  console.log('👥 Seeding members...');
  const memberData = [
    { memberId: 'MEM001', name: 'أحمد محمد الشحي', email: 'ahmed@example.com', level: 'platinum', totalBadges: 25 },
    { memberId: 'MEM002', name: 'فاطمة سالم البلوشي', email: 'fatima@example.com', level: 'gold', totalBadges: 18 },
    { memberId: 'MEM003', name: 'محمد خميس الكعبي', email: 'mohammed@example.com', level: 'gold', totalBadges: 15 },
    { memberId: 'MEM004', name: 'سارة محمد علي', email: 'sara@example.com', level: 'silver', totalBadges: 10 },
    { memberId: 'MEM005', name: 'خالد عبدالله', email: 'khalid@example.com', level: 'platinum', totalBadges: 22 },
  ];

  const memberRecords: Record<string, { id: string }> = {};
  for (const member of memberData) {
    const existing = await db.member.findUnique({ where: { memberId: member.memberId } });
    if (!existing) {
      const record = await db.member.create({ data: member });
      memberRecords[member.memberId] = record;
    } else {
      memberRecords[member.memberId] = existing;
    }
  }
  console.log('✅ Members seeded');

  // Seed Achievements
  console.log('🏆 Seeding achievements...');
  const communityBadge = badgeRecords['Community Service'];
  const leadershipBadge = badgeRecords['Leadership'];
  const innovationBadge = badgeRecords['Innovation'];

  if (communityBadge && memberRecords['MEM001']) {
    const existing = await db.achievement.findFirst({
      where: { memberId: memberRecords['MEM001'].id, badgeId: communityBadge.id }
    });
    if (!existing) {
      await db.achievement.create({
        data: {
          memberId: memberRecords['MEM001'].id,
          badgeId: communityBadge.id,
          reason: 'Outstanding community service contribution',
          reasonAr: 'مساهمة متميزة في خدمة المجتمع',
          status: 'approved',
          approvedAt: new Date(),
        }
      });
    }
  }

  if (leadershipBadge && memberRecords['MEM002']) {
    const existing = await db.achievement.findFirst({
      where: { memberId: memberRecords['MEM002'].id, badgeId: leadershipBadge.id }
    });
    if (!existing) {
      await db.achievement.create({
        data: {
          memberId: memberRecords['MEM002'].id,
          badgeId: leadershipBadge.id,
          reason: 'Led multiple youth projects successfully',
          reasonAr: 'قادت مشاريع شبابية متعددة بنجاح',
          status: 'approved',
          approvedAt: new Date(),
        }
      });
    }
  }

  if (innovationBadge && memberRecords['MEM003']) {
    const existing = await db.achievement.findFirst({
      where: { memberId: memberRecords['MEM003'].id, badgeId: innovationBadge.id }
    });
    if (!existing) {
      await db.achievement.create({
        data: {
          memberId: memberRecords['MEM003'].id,
          badgeId: innovationBadge.id,
          reason: 'Created innovative solution for community problem',
          reasonAr: 'ابتكر حلاً مبتكراً لمشكلة مجتمعية',
          status: 'approved',
          approvedAt: new Date(),
        }
      });
    }
  }
  console.log('✅ Achievements seeded');

  // Seed Success Stories
  console.log('⭐ Seeding success stories...');
  const storiesData = [
    {
      memberId: memberRecords['MEM001']?.id,
      title: 'My Journey in Sharjah Youth',
      titleAr: 'رحلتي في ناشئة الشارقة',
      content: 'My journey with Sharjah Youth has been incredible. Starting as a bronze member, I worked hard to earn multiple badges.',
      contentAr: 'رحلتي مع ناشئة الشارقة كانت رائعة. بدأت كعضو برونزي وعملت بجد للحصول على شارات متعددة واكتشفت شغفي بالقيادة وخدمة المجتمع.',
      category: 'leadership',
      categoryAr: 'القيادة',
      isFeatured: true,
    },
    {
      memberId: memberRecords['MEM002']?.id,
      title: 'Leadership Excellence',
      titleAr: 'التميز في القيادة',
      content: 'Through the badge system, I discovered my passion for leadership and community service.',
      contentAr: 'من خلال نظام الشارات، اكتشفت شغفي بالقيادة وخدمة المجتمع، وقادت فرق شبابية متعددة في مشاريع ناجحة.',
      category: 'community',
      categoryAr: 'المجتمع',
      isFeatured: true,
    },
  ];

  for (const story of storiesData) {
    if (!story.memberId) continue;
    const existing = await db.successStory.findFirst({
      where: { memberId: story.memberId, title: story.title }
    });
    if (!existing) {
      await db.successStory.create({
        data: {
          memberId: story.memberId,
          title: story.title,
          titleAr: story.titleAr,
          content: story.content,
          contentAr: story.contentAr,
          category: story.category,
          categoryAr: story.categoryAr,
          isFeatured: story.isFeatured,
        }
      });
    }
  }
  console.log('✅ Success stories seeded');

  // Seed Admin account
  console.log('🔐 Seeding admin account...');
  const existingAdmin = await db.admin.findFirst({ where: { email: 'admin@sharjah.youth' } });
  if (!existingAdmin) {
    await db.admin.create({
      data: {
        name: 'مسؤول النظام',
        email: 'admin@sharjah.youth',
        password: 'admin123', // change immediately after first login
        role: 'admin',
      }
    });
    console.log('✅ Admin created: admin@sharjah.youth / admin123 (change password immediately!)');
  } else {
    console.log('ℹ️  Admin account already exists');
  }

  console.log('✨ Database seeding completed!');
  process.exit(0);
}

seed().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});
