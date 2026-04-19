import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create badges
  const badges = await Promise.all([
    prisma.badge.create({
      data: {
        name: 'Community Service',
        nameAr: 'خدمة المجتمع',
        description: 'Awarded for outstanding community service',
        descriptionAr: 'تمنح لخدمة المجتمع المتميزة',
        category: 'Community',
        categoryAr: 'المجتمع',
        level: 'bronze',
        icon: 'community',
        color: '#2E2973'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Leadership',
        nameAr: 'القيادة',
        description: 'Demonstrated leadership qualities',
        descriptionAr: 'إظهار صفات القيادة',
        category: 'Leadership',
        categoryAr: 'القيادة',
        level: 'bronze',
        icon: 'leadership',
        color: '#2E2973'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Innovation',
        nameAr: 'الابتكار',
        description: 'Creative problem solving',
        descriptionAr: 'حل المشاكل بشكل إبداعي',
        category: 'Innovation',
        categoryAr: 'الابتكار',
        level: 'silver',
        icon: 'innovation',
        color: '#4A5568'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Teamwork',
        nameAr: 'العمل الجماعي',
        description: 'Excellent collaboration skills',
        descriptionAr: 'مهارات تعاون ممتازة',
        category: 'Skills',
        categoryAr: 'المهارات',
        level: 'bronze',
        icon: 'teamwork',
        color: '#2E2973'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Technical Excellence',
        nameAr: 'التميز التقني',
        description: 'Mastery of technical skills',
        descriptionAr: 'إتقان المهارات التقنية',
        category: 'Technical',
        categoryAr: 'تقني',
        level: 'gold',
        icon: 'technical',
        color: '#D69E2E'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Public Speaking',
        nameAr: 'الخطابة العامة',
        description: 'Confident public presentation',
        descriptionAr: 'تقديم عام واثق',
        category: 'Skills',
        categoryAr: 'المهارات',
        level: 'silver',
        icon: 'speaking',
        color: '#4A5568'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Project Management',
        nameAr: 'إدارة المشاريع',
        description: 'Successful project completion',
        descriptionAr: 'إكمال المشروع بنجاح',
        category: 'Leadership',
        categoryAr: 'القيادة',
        level: 'gold',
        icon: 'project',
        color: '#D69E2E'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Mentorship',
        nameAr: 'التوجيه والإرشاد',
        description: 'Helping others grow and succeed',
        descriptionAr: 'مساعدة الآخرين على النجاح',
        category: 'Community',
        categoryAr: 'المجتمع',
        level: 'platinum',
        icon: 'mentorship',
        color: '#805AD5'
      }
    }),
    prisma.badge.create({
      data: {
        name: 'Sustainability Champion',
        nameAr: 'بطل الاستدامة',
        description: 'Promoting environmental awareness',
        descriptionAr: 'تعزيز الوعي البيئي',
        category: 'Community',
        categoryAr: 'المجتمع',
        level: 'gold',
        icon: 'sustainability',
        color: '#D69E2E'
      }
    })
  ])

  console.log(`✅ Created ${badges.length} badges`)

  // Create members
  const members = await Promise.all([
    prisma.member.create({
      data: {
        memberId: 'MEM001',
        name: 'أحمد محمد الشحي',
        email: 'ahmed@example.com',
        phone: '+971501234567',
        dateOfBirth: new Date('2008-05-15'),
        level: 'gold',
        totalBadges: 8
      }
    }),
    prisma.member.create({
      data: {
        memberId: 'MEM002',
        name: 'فاطمة سالم البلوشي',
        email: 'fatima@example.com',
        phone: '+971507654321',
        dateOfBirth: new Date('2009-03-22'),
        level: 'silver',
        totalBadges: 5
      }
    }),
    prisma.member.create({
      data: {
        memberId: 'MEM003',
        name: 'محمد خميس الكعبي',
        email: 'mohammed@example.com',
        phone: '+971559876543',
        dateOfBirth: new Date('2007-11-10'),
        level: 'platinum',
        totalBadges: 12
      }
    })
  ])

  console.log(`✅ Created ${members.length} members`)

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        memberId: members[0].id,
        badgeId: badges[0].id,
        status: 'approved',
        reason: 'Volunteered at community event',
        reasonAr: 'تطوع في فعالية مجتمعية',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    }),
    prisma.achievement.create({
      data: {
        memberId: members[0].id,
        badgeId: badges[1].id,
        status: 'approved',
        reason: 'Led youth team project',
        reasonAr: 'قاد مشروع الفريق الشبابي',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    }),
    prisma.achievement.create({
      data: {
        memberId: members[1].id,
        badgeId: badges[2].id,
        status: 'pending',
        reason: 'Created innovative solution for local problem',
        reasonAr: 'خلق حل مبتكر لمشكلة محلية'
      }
    }),
    prisma.achievement.create({
      data: {
        memberId: members[2].id,
        badgeId: badges[7].id,
        status: 'approved',
        reason: 'Mentored 5 junior members',
        reasonAr: 'وجه وأرشد 5 أعضاء جدد',
        approvedBy: 'admin',
        approvedAt: new Date()
      }
    })
  ])

  console.log(`✅ Created ${achievements.length} achievements`)

  console.log('🎉 Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
