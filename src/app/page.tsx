
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Award, TrendingUp, Heart, Users, Trophy, Search, Star, Calendar, LayoutDashboard, MapPin } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface SuccessStory {
  id: string
  title: string
  titleAr: string
  content: string
  contentAr: string
  image: string
  isFeatured: boolean
  category: string
  categoryAr: string
  center: string
  centerAr: string
  track: string
  trackAr: string
  date: string
  member: {
    name: string
    level: string
    totalBadges: number
  }
}

const mockStories: SuccessStory[] = [
  {
    id: '1',
    contentAr: 'رحلتي مع ناشئة الشارقة كانت رائعة. بدأت كعضو برونزي وعملت بجد للحصول على شارات متعددة واكتشفت شغفي بالقيادة وخدمة المجتمع.',
    titleAr: "رحلتي في ناشئة الشارقة",


    image: '',
    isFeatured: true,
    category: 'Leadership',
    categoryAr: 'القيادة',
    center: 'ناشئة وسط',
    centerAr: 'Wasit Youth Center',
    track: 'Literature & Languages',
    trackAr: 'الآداب واللغات',
    date: '2025-01-15',
    member: {
      name: 'أحمد محمد الشحي',
      level: 'platinum',
      totalBadges: 25
    }
  },
  {
    id: '2',
    title: 'Leadership Excellence',
    titleAr: 'التميز في القيادة',
    content: 'Through badge system, I discovered my passion for leadership and community service...',
    contentAr: 'من خلال نظام الشارات، اكتشفت شغفي بالقيادة وخدمة المجتمع، وقادت فرق شبابية متعددة في مشاريع ناجحة.',
    image: '',
    isFeatured: true,
    category: 'Community',
    categoryAr: 'المجتمع',
    center: 'ناشئة الذيد',
    centerAr: 'Al Dhaid Youth Center',
    track: 'Life Skills',
    trackAr: 'المهارات الحياتية',
    date: '2025-01-10',
    member: {
      name: 'فاطمة سالم البلوشي',
      level: 'gold',
      totalBadges: 18
    }
  },
  {
    id: '3',
    title: 'Innovation Champion',
    titleAr: 'بطل الابتكار',
    content: 'The technical badges inspired me to create solutions for real community problems...',
    contentAr: 'شارات الابتكار ألهمتني لخلق حلول مبتكرة لمشاكل بيئية حقيقية في مجتمعي.',
    image: '',
    isFeatured: false,
    category: 'Innovation',
    categoryAr: 'الابتكار',
    center: 'ناشئة وسط',
    centerAr: 'Wasit Youth Center',
    track: 'Science & Technology',
    trackAr: 'العلوم والتكنولوجيا',
    date: '2025-01-05',
    member: {
      name: 'محمد خميس الكعبي',
      level: 'gold',
      totalBadges: 15
    }
  },
  {
    id: '4',
    title: 'Community Hero',
    titleAr: 'بطل المجتمع',
    content: 'Volunteered over 200 hours helping elderly and organizing community events...',
    contentAr: 'تطوعت أكثر من 200 ساعة في مساعدة كبار السن ونظمت فعاليات مجتمعية.',
    image: '',
    isFeatured: false,
    category: 'Community',
    categoryAr: 'المجتمع',
    center: 'ناشئة مليحة',
    centerAr: 'Mleiha Youth Center',
    track: 'Life Skills',
    trackAr: 'المهارات الحياتية',
    date: '2025-01-03',
    member: {
      name: 'سارة محمد علي',
      level: 'silver',
      totalBadges: 10
    }
  },
  {
    id: '5',
    title: 'Tech Pioneer',
    titleAr: 'رائد التقنية',
    content: 'Created an app to help members track their achievements and share stories...',
    contentAr: 'أنشأت تطبيقاً لمساعدة الأعضاء على تتبع إنجازاتهم ومشاركة قصص نجاحهم.',
    image: '',
    isFeatured: false,
    category: 'Technical',
    categoryAr: 'تقني',
    center: 'ناشئة كلباء',
    centerAr: 'Kalba Youth Center',
    track: 'Science & Technology',
    trackAr: 'العلوم والتكنولوجيا',
    date: '2024-12-28',
    member: {
      name: 'خالد عبدالله',
      level: 'platinum',
      totalBadges: 22
    }
  },
  {
    id: '6',
    title: 'Arts & Culture Ambassador',
    titleAr: 'سفير الفنون والثقافة',
    content: 'Organized cultural exhibitions and art workshops for youth...',
    contentAr: 'نظمت معارض ثقافية وورش فنية للشباب في جميع أنحاء الإمارة.',
    image: '',
    isFeatured: false,
    category: 'Culture',
    categoryAr: 'ثقافة',
    center: 'ناشئة وسط',
    centerAr: 'Wasit Youth Center',
    track: 'Arts',
    trackAr: 'الفنون',
    date: '2024-12-25',
    member: {
      name: 'مريم أحمد',
      level: 'gold',
      totalBadges: 14
    }
  },
]

const centers = [
  { id: 'all', name: 'جميع المراكز', nameEn: 'All Centers' },
  { id: 'wasit', name: 'ناشئة وسط', nameEn: 'Wasit Youth Center' },
  { id: 'al-dhaid', name: 'ناشئة الذيد', nameEn: 'Al Dhaid Youth Center' },
  { id: 'mleiha', name: 'ناشئة مليحة', nameEn: 'Mleiha Youth Center' },
  { id: 'al-mudam', name: 'ناشئة المدام', nameEn: 'Al Mudam Youth Center' },
  { id: 'al-thameed', name: 'ناشئة الثميد', nameEn: 'Al Thameed Youth Center' },
  { id: 'dibba-al-hisn', name: 'ناشئة دبا الحصن', nameEn: 'Dibba Al Hisn Youth Center' },
  { id: 'kalba', name: 'ناشئة كلباء', nameEn: 'Kalba Youth Center' },
  { id: 'khor-fakkan', name: 'ناشئة خورفكان', nameEn: 'Khor Fakkan Youth Center' },
]

const tracks = [
  { id: 'all', name: 'جميع المسارات', nameEn: 'All Tracks' },
  { id: 'sports', name: 'الرياضة', nameEn: 'Sports' },
  { id: 'literature-languages', name: 'الآداب واللغات', nameEn: 'Literature & Languages' },
  { id: 'science-technology', name: 'العلوم والتكنولوجيا', nameEn: 'Science & Technology' },
  { id: 'life-skills', name: 'المهارات الحياتية', nameEn: 'Life Skills' },
  { id: 'arts', name: 'الفنون', nameEn: 'Arts' },
  { id: 'theater-performing-arts', name: 'المسرح وفنون العرض', nameEn: 'Theater & Performing Arts' },
  { id: 'music', name: 'الموسيقى', nameEn: 'Music' },
]

const levelColors = {
  bronze: 'bg-amber-100 text-amber-700',
  silver: 'bg-gray-100 text-gray-700',
  gold: 'bg-yellow-100 text-yellow-700',
  platinum: 'bg-purple-100 text-purple-700'
}

const levelLabels: Record<string, string> = {
  bronze: 'برونزي',
  silver: 'فضي',
  gold: 'ذهبي',
  platinum: 'بلاتيني'
}

export default function YouthAchievementPortal() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCenter, setFilterCenter] = useState('all')
  const [filterTrack, setFilterTrack] = useState('all')

  const filteredStories = mockStories.filter(story => {
    const matchesSearch = 
      story.titleAr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.member.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCenter = filterCenter === 'all' || story.center === filterCenter
    const matchesTrack = filterTrack === 'all' || story.track === filterTrack
    
    return matchesSearch && matchesCenter && matchesTrack
  })

  const featuredStory = mockStories.find(s => s.isFeatured)

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(46, 41, 115, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46, 41, 115, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Gradient orbs */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#2E2973]/10 rounded-full blur-[120px] pointer-events-none dark:bg-[#2E2973]/20" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#E04511]/10 rounded-full blur-[120px] pointer-events-none dark:bg-[#E04511]/20" />

      {/* Top Navigation */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold text-[#2E2973] dark:text-white">
          قصص النجاح
        </h1>
        <div className="flex items-center gap-3">
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/signin?role=admin')}
            className="flex items-center gap-2 px-4 py-2 bg-[#2E2973] dark:bg-[#E04511] text-white rounded-xl hover:bg-[#1f1b4d] dark:hover:bg-[#c43a0e] transition-all shadow-lg"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="font-medium text-sm">لوحة التحكم</span>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => router.push('/signin?role=member')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 text-[#2E2973] dark:text-white rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#E04511] transition-all shadow-lg"
          >
            <Users className="w-4 h-4" />
            <span className="font-medium text-sm">تسجيل دخول الناشئة</span>
          </motion.button>

          <ThemeToggle />
        </div>
      </div>

      <div className="pt-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 pb-12 px-6 bg-gradient-to-br from-[#2E2973] to-[#1a1645] text-white"
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex-1">
                <Sparkles className="w-12 h-12 mb-4 opacity-80" />
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                  قصص النجاح الملهمة
                </h1>
                <p className="text-lg opacity-90 max-w-2xl">
                  استمتع بقصص أبطالنا الشباب، واكتشف كيف صنعوا الفرق في مجتمعهم، وكن بطلاً للقصة القادمة!
                </p>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[140px]">
                  <Users className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-3xl font-bold">{mockStories.length}</p>
                  <p className="text-sm opacity-80">قصة نجاح</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-center min-w-[140px]">
                  <Trophy className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-3xl font-bold">
                    {mockStories.reduce((sum, s) => sum + s.member.totalBadges, 0)}
                  </p>
                  <p className="text-sm opacity-80">شارة كسبت</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="stories-search"
                  name="stories-search"
                  placeholder="بحث في القصص..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                />
              </div>
              <Select value={filterCenter} onValueChange={setFilterCenter}>
                <SelectTrigger className="w-full md:w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="المركز">المركز</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {centers.map(center => (
                    <SelectItem key={center.id} value={center.id}>{center.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterTrack} onValueChange={setFilterTrack}>
                <SelectTrigger className="w-full md:w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="المسار">المسار</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {tracks.map(track => (
                    <SelectItem key={track.id} value={track.id}>{track.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Featured Story */}
          {featuredStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-12"
            >
              <div className="bg-gradient-to-r from-[#E04511] to-[#c43a0e] text-white rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  <span className="text-sm font-semibold">قصة مميزة</span>
                </div>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="w-6 h-6" />
                      <span className="text-sm opacity-80">قصة الشهر</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      {featuredStory.titleAr}
                    </h2>
                    <p className="text-lg leading-relaxed opacity-95 mb-6">
                      {featuredStory.contentAr}
                    </p>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-2xl font-bold">
                          {featuredStory.member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{featuredStory.member.name}</p>
                          <span className={`text-xs px-2 py-1 rounded-full ${levelColors[featuredStory.member.level as keyof typeof levelColors]} bg-white/20 text-white`}>
                            {levelLabels[featuredStory.member.level]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-80" />
                        <span className="text-sm opacity-80">{new Date(featuredStory.date).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-64 flex flex-col items-center justify-center bg-white/10 rounded-2xl p-6">
                    <p className="text-sm opacity-80 mb-2">الشارات المكتسبة</p>
                    <p className="text-5xl font-bold">{featuredStory.member.totalBadges}</p>
                    <Heart className="w-8 h-8 mt-4 opacity-80" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stories Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-[#2E2973]" />
              جميع القصص
              <span className="text-lg text-gray-500">({filteredStories.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.map((story, index) => (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-[#2E2973] transition-all"
                >
                  <div className="h-40 bg-gradient-to-br from-[#2E2973]/10 to-[#E04511]/10 flex items-center justify-center relative">
                    {story.isFeatured && (
                      <div className="absolute top-3 right-3">
                        <Star className="w-5 h-5 text-[#E04511] fill-[#E04511]" />
                      </div>
                    )}
                    <Heart className="w-12 h-12 text-[#E04511]/50" />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                        {story.titleAr}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${levelColors[story.member.level as keyof typeof levelColors]}`}>
                        {levelLabels[story.member.level]}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed line-clamp-3">
                      {story.contentAr}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#2E2973] to-[#1f1b4d] rounded-full flex items-center justify-center text-white font-bold">
                          {story.member.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-semibold text-sm text-gray-900 dark:text-white">{story.member.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-3 h-3 opacity-60" />
                            <span className="text-xs text-gray-500">{story.centerAr}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="w-3 h-3 opacity-60" />
                            <span className="text-xs text-gray-500">{story.trackAr}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500">الشارات</p>
                        <p className="text-xl font-bold text-[#E04511]">{story.member.totalBadges}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredStories.length === 0 && (
                <div className="col-span-full py-16 text-center">
                  <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-xl text-gray-500">لا توجد قصص تطابق بحثك</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
