import { drizzle } from "drizzle-orm/mysql2";
import { centers, tracks, members, achievements, badges, successStories } from "./db";
import dotenv from "dotenv";

dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Seeding database...");

  // Seed Centers
  console.log("📍 Seeding centers...");
  for (const center of [
    { nameAr: "مركز ناشئة وسط", nameEn: "Wasit Youth Center", code: "wasit" },
    { nameAr: "مركز ناشئة الذيد", nameEn: "Al Dhaid Youth Center", code: "al-dhaid" },
    { nameAr: "مركز ناشئة مليحة", nameEn: "Mleiha Youth Center", code: "mleiha" },
    { nameAr: "مركز ناشئة المدام", nameEn: "Al Mudam Youth Center", code: "al-mudam" },
    { nameAr: "مركز ناشئة الثميد", nameEn: "Al Thameed Youth Center", code: "al-thameed" },
    { nameAr: "مركز ناشئة دبا الحصن", nameEn: "Dibba Al Hisn Youth Center", code: "dibba-al-hisn" },
    { nameAr: "مركز ناشئة كلباء", nameEn: "Kalba Youth Center", code: "kalba" },
    { nameAr: "مركز ناشئة خورفكان", nameEn: "Khor Fakkan Youth Center", code: "khor-fakkan" },
  ]) {
    await db.insert(centers).values({
      id: crypto.randomUUID(),
      nameAr: center.nameAr,
      nameEn: center.nameEn,
      code: center.code,
      createdAt: new Date(),
    });
  }
  console.log("✅ Centers seeded");

  // Seed Tracks
  console.log("🎯 Seeding tracks...");
  for (const track of [
    { nameAr: "مسار الرياضة", nameEn: "Sports Track", code: "sports", icon: "⚽" },
    { nameAr: "مسار الآداب واللغات", nameEn: "Literature & Languages Track", code: "literature-languages", icon: "📚" },
    { nameAr: "مسار العلوم والتكنولوجيا", nameEn: "Science & Technology Track", code: "science-technology", icon: "🔬" },
    { nameAr: "مسار المهارات الحياتية", nameEn: "Life Skills Track", code: "life-skills", icon: "🎯" },
    { nameAr: "مسار الفنون", nameEn: "Arts Track", code: "arts", icon: "🎨" },
    { nameAr: "مسار المسرح وفنون العرض", nameEn: "Theater & Performing Arts Track", code: "theater-performing-arts", icon: "🎭" },
    { nameAr: "مسار الموسيقى", nameEn: "Music Track", code: "music", icon: "🎵" },
  ]) {
    await db.insert(tracks).values({
      id: crypto.randomUUID(),
      nameAr: track.nameAr,
      nameEn: track.nameEn,
      code: track.code,
      icon: track.icon,
      createdAt: new Date(),
    });
  }
  console.log("✅ Tracks seeded");

  // Seed Badges
  console.log("🏅 Seeding badges...");
  for (const badge of [
    { name: "Community Service", nameAr: "خدمة المجتمع", description: "Awarded for outstanding community service", descriptionAr: "تمنح لخدمة المجتمع المتميزة", category: "Community", categoryAr: "المجتمع", level: "bronze", icon: "heart", color: "#2E2973" },
    { name: "Leadership", nameAr: "القيادة", description: "Demonstrated leadership qualities", descriptionAr: "إظهار صفات القيادة", category: "Leadership", categoryAr: "القيادة", level: "silver", icon: "shield", color: "#4A5568" },
    { name: "Innovation", nameAr: "الابتكار", description: "Creative problem solving", descriptionAr: "حل المشاكل بشكل إبداعي", category: "Innovation", categoryAr: "الابتكار", level: "gold", icon: "sparkles", color: "#E04511" },
    { name: "Teamwork", nameAr: "العمل الجماعي", description: "Excellent collaboration skills", descriptionAr: "مهارات تعاون متميزة", category: "Skills", categoryAr: "المهارات", level: "bronze", icon: "users", color: "#2E2973" },
    { name: "Technical Excellence", nameAr: "التميز التقني", description: "Mastery of technical skills", descriptionAr: "إتقان المهارات التقنية", category: "Technical", categoryAr: "تقني", level: "gold", icon: "cpu", color: "#E04511" },
    { name: "Mentorship", nameAr: "التوجيه والإرشاد", description: "Helping others grow and succeed", descriptionAr: "مساعدة الآخرين على النجاح", category: "Leadership", categoryAr: "القيادة", level: "platinum", icon: "star", color: "#9333EA" },
    { name: "Public Speaking", nameAr: "الخطابة العامة", description: "Confident public presentation", descriptionAr: "تقديم عام واثق", category: "Skills", categoryAr: "المهارات", level: "silver", icon: "mic", color: "#4A5568" },
  ]) {
    await db.insert(badges).values({
      id: crypto.randomUUID(),
      name: badge.name,
      nameAr: badge.nameAr,
      description: badge.description,
      descriptionAr: badge.descriptionAr,
      category: badge.category,
      categoryAr: badge.categoryAr,
      level: badge.level,
      icon: badge.icon,
      color: badge.color,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("✅ Badges seeded");

  // Seed Members
  console.log("👥 Seeding members...");
  for (const member of [
    { memberId: "MEM001", nameAr: "حامد أحمد الحفيتي", nameEn: "Hamed Ahmed Al Hafiti", centerId: "wasit", email: "hamed@example.com", phone: "+9715012345", level: "platinum", totalBadges: 25 },
    { memberId: "MEM002", nameAr: "سعود أحمد الكعبي", nameEn: "Saud Ahmed Al Kaabi", centerId: "al-dhaid", email: "saud@example.com", phone: "+9715056789", level: "gold", totalBadges: 18 },
    { memberId: "MEM003", nameAr: "حامد خالد القاسمي", nameEn: "Hamed Khaled Al Qasimi", centerId: "wasit", email: "hamed.k@example.com", phone: "+9715011123", level: "gold", totalBadges: 15 },
    { memberId: "MEM004", nameAr: "فاطمة سالم البلوشي", nameEn: "Fatima Salem Al Baloushi", centerId: "mleiha", email: "fatima@example.com", phone: "+9715023456", level: "silver", totalBadges: 10 },
    { memberId: "MEM005", nameAr: "محمد خميس الكعبي", nameEn: "Mohammed Khamees Al Kaabi", centerId: "kalba", email: "mohammed@example.com", phone: "+9715098765", level: "gold", totalBadges: 15 },
  ]) {
    await db.insert(members).values({
      id: crypto.randomUUID(),
      memberId: member.memberId,
      nameAr: member.nameAr,
      nameEn: member.nameEn,
      email: member.email,
      phone: member.phone,
      joinDate: new Date(),
      level: member.level,
      totalBadges: member.totalBadges,
      centerId: member.centerId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("✅ Members seeded");

  // Seed Achievements
  console.log("🏆 Seeding achievements...");
  for (const achievement of [
    { memberId: "MEM001", achievementAr: "المركز الأول في مسابقة الشعر الفصيح", achievementEn: "First Place - Classical Poetry Competition", year: 2024, participationType: "individual", centerId: "wasit", trackId: "literature-languages", rankAr: "المركز الأول", rankEn: "First Place", eventNameAr: "مسابقة الشعر الفصيح", eventNameEn: "Classical Poetry Competition", status: "approved" },
    { memberId: "MEM002", achievementAr: "المركز الأول في مسابقة القراءة العربية", achievementEn: "First Place - Arab Reading Challenge", year: 2024, participationType: "individual", centerId: "al-dhaid", trackId: "literature-languages", rankAr: "المركز الأول", rankEn: "First Place", eventNameAr: "مسابقة القراءة العربية", eventNameEn: "Arab Reading Challenge", status: "approved" },
    { memberId: "MEM003", achievementAr: "المركز الأول في مسابقة الابتكار", achievementEn: "First Place - Innovation Competition", year: 2024, participationType: "individual", centerId: "wasit", trackId: "science-technology", rankAr: "المركز الأول", rankEn: "First Place", eventNameAr: "مسابقة الابتكار", eventNameEn: "Innovation Competition", status: "approved" },
    { memberId: "MEM004", achievementAr: "المركز الأول في المهرجان الوطني للعلوم والتكنولوجيا والابتكار", achievementEn: "First Place - National Science Festival", year: 2024, participationType: "individual", centerId: "wasit", trackId: "science-technology", rankAr: "المركز الأول", rankEn: "First Place", eventNameAr: "المهرجان الوطني للعلوم", eventNameEn: "National Science Festival", status: "approved" },
    { memberId: "MEM005", achievementAr: "المركز الثالث في مسابقة ريادة الأعمال", achievementEn: "Third Place - Entrepreneurship Competition", year: 2024, participationType: "individual", centerId: "mleiha", trackId: "leadership", rankAr: "المركز الثالث", rankEn: "Third Place", eventNameAr: "مسابقة ريادة الأعمال", eventNameEn: "Entrepreneurship Competition", status: "approved" },
    { memberId: "MEM001", achievementAr: "المركز الأول في مسابقة الشعر للجميع", achievementEn: "First Place - Poetry for All", year: 2023, participationType: "individual", centerId: "wasit", trackId: "literature-languages", rankAr: "المركز الأول", rankEn: "First Place", eventNameAr: "مسابقة الشعر للجميع", eventNameEn: "Poetry for All", status: "approved" },
  ]) {
    await db.insert(achievements).values({
      id: crypto.randomUUID(),
      status: achievement.status,
      reason: achievement.achievementEn,
      reasonAr: achievement.achievementAr,
      evidence: null,
      approvedBy: "admin",
      approvedAt: new Date(),
      memberId: achievement.memberId,
      badgeId: "bronze",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("✅ Achievements seeded");

  // Seed Success Stories
  console.log("⭐ Seeding success stories...");
  for (const story of [
    { title: "From Bronze to Platinum", titleAr: "من البرونزي إلى البلاتيني", content: "My journey with Sharjah Youth has been incredible. Starting as a bronze member, I worked hard...", contentAr: "رحلتي مع ناشئة الشارقة كانت رائعة. بدأت كعضو برونزي وعملت بجد للحصول على شارات متعددة واكتشفت شغفي بالقيادة وخدمة المجتمع.", category: "Leadership", categoryAr: "القيادة", memberId: "MEM001", isFeatured: true, date: "2025-01-15" },
    { title: "Leadership Excellence", titleAr: "التميز في القيادة", content: "Through badge system, I discovered my passion for leadership and community service...", contentAr: "من خلال نظام الشارات، اكتشفت شغفي بالقيادة وخدمة المجتمع، وقادت فرق شبابية متعددة في مشاريع ناجحة.", category: "Community", categoryAr: "المجتمع", memberId: "MEM002", isFeatured: true, date: "2025-01-10" },
    { title: "Innovation Champion", titleAr: "بطل الابتكار", content: "The technical badges inspired me to create solutions for real community problems...", contentAr: "شارات الابتكار ألهمتني لخلق حلول مبتكرة لمشاكل بيئية حقيقية في مجتمعي.", category: "Innovation", categoryAr: "الابتكار", memberId: "MEM003", isFeatured: false, date: "2025-01-05" },
  ]) {
    await db.insert(successStories).values({
      id: crypto.randomUUID(),
      title: story.title,
      titleAr: story.titleAr,
      content: story.content,
      contentAr: story.contentAr,
      image: null,
      isFeatured: story.isFeatured,
      category: story.category,
      categoryAr: story.categoryAr,
      date: story.date,
      memberId: story.memberId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  console.log("✅ Success Stories seeded");

  console.log("✨ Database seeding completed!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});
