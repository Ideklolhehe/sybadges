'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Shield, TrendingUp, Clock, Flame, Star, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MemberStats {
  totalBadges: number
  pendingRequests: number
  level: string
  joinDate: string
}

interface PointsData {
  configName: string
  configNameAr: string
  totalPoints: number
  currentLevel: { name: string; nameAr: string; icon: string; color: string } | null
  nextLevel: { name: string; nameAr: string; threshold: number; pointsNeeded: number } | null
}

interface StreakData {
  currentLength: number
  longestLength: number
  status: string
  streak: { nameAr: string; frequency: string }
}

const mockMemberId = 'MEM001'

export default function MemberHome() {
  const router = useRouter()
  const [stats, setStats] = useState<MemberStats>({
    totalBadges: 0,
    pendingRequests: 0,
    level: 'bronze',
    joinDate: ''
  })
  const [points, setPoints] = useState<PointsData[]>([])
  const [streaks, setStreaks] = useState<StreakData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      // Get member internal ID first
      const membersRes = await fetch('/api/members')
      const members = await membersRes.json()
      const member = members.find((m: { memberId: string }) => m.memberId === mockMemberId)
      if (!member) return

      const [memberRes, pendingRes, pointsRes, streaksRes] = await Promise.all([
        fetch(`/api/members/${member.id}`),
        fetch(`/api/achievements?memberId=${member.id}&status=pending`),
        fetch(`/api/members/${member.id}/points`),
        fetch(`/api/members/${member.id}/streaks`),
      ])

      const data = await memberRes.json()
      const pending = await pendingRes.json()
      const pointsData = await pointsRes.json()
      const streaksData = await streaksRes.json()

      setStats({
        totalBadges: data.totalBadges || 0,
        pendingRequests: pending.length,
        level: data.level || 'bronze',
        joinDate: data.joinDate
      })
      setPoints(pointsData)
      setStreaks(streaksData)
    } catch (error) {
      console.error('Error fetching member stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const levelConfig = {
    bronze: {
      label: 'برونزي',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    },
    silver: {
      label: 'فضي',
      color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400'
    },
    gold: {
      label: 'ذهبي',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    platinum: {
      label: 'بلاتيني',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const currentLevel = levelConfig[stats.level as keyof typeof levelConfig] || levelConfig.bronze
  const xpData = points[0]
  const bestStreak = streaks.reduce((best, s) => (s.currentLength > (best?.currentLength ?? 0) ? s : best), streaks[0])

  const quickActions = [
    {
      title: 'عرض إنجازاتي',
      icon: Award,
      color: 'from-[#2E2973] to-[#1f1b4d]',
      href: '/member/achievements'
    },
    {
      title: 'سلاسلي 🔥',
      icon: Flame,
      color: 'from-orange-500 to-red-500',
      href: '/member/streaks'
    },
    {
      title: 'المتصدرون',
      icon: Trophy,
      color: 'from-purple-500 to-purple-700',
      href: '/member/leaderboards'
    },
    {
      title: 'استكشف الشارات',
      icon: Shield,
      color: 'from-[#E04511] to-[#c43a0e]',
      href: '/member/badges'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Welcome Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          مرحباً بك في بوابة الناشئة
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          تابع تقدمك واستكشف فرص جديدة
        </p>
      </div>

      {/* XP + Level Card (new) */}
      {xpData && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-[#2E2973] via-[#3d36a0] to-[#5548c7] text-white rounded-2xl p-6 mb-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{xpData.currentLevel?.icon || '⭐'}</span>
              <div>
                <p className="text-sm opacity-80">مستواك الحالي</p>
                <p className="text-2xl font-bold">{xpData.currentLevel?.nameAr || 'مبتدئ'}</p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm opacity-80">نقاط الخبرة</p>
              <p className="text-3xl font-extrabold">{Math.round(xpData.totalPoints)} <span className="text-sm font-normal opacity-60">XP</span></p>
            </div>
          </div>

          {/* Progress to next level */}
          {xpData.nextLevel && (
            <div>
              <div className="flex justify-between text-xs mb-2 opacity-80">
                <span>{xpData.currentLevel?.nameAr}</span>
                <span>{xpData.nextLevel.nameAr} ({xpData.nextLevel.threshold} XP)</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(((xpData.totalPoints - (xpData.nextLevel.threshold - xpData.nextLevel.pointsNeeded - xpData.nextLevel.pointsNeeded)) / xpData.nextLevel.threshold) * 100, 100)}%`
                  }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-3 bg-yellow-400 rounded-full"
                />
              </div>
              <p className="text-xs mt-1 opacity-60">{Math.round(xpData.nextLevel.pointsNeeded)} نقطة للمستوى التالي</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#2E2973] to-[#1f1b4d] text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{stats.totalBadges}</span>
          </div>
          <p className="text-sm opacity-80">الشارات المكتسبة</p>
        </div>

        <div className="bg-gradient-to-br from-[#E04511] to-[#c43a0e] text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{stats.pendingRequests}</span>
          </div>
          <p className="text-sm opacity-80">طلبات معلقة</p>
        </div>

        {/* Streak card */}
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <Flame className="w-8 h-8 opacity-80" />
            <span className="text-4xl font-bold">{bestStreak?.currentLength || 0}</span>
          </div>
          <p className="text-sm opacity-80">
            {bestStreak?.streak.nameAr || 'سلسلة النشاط'}
          </p>
        </div>

        <div className={`rounded-2xl p-6 border-2 ${currentLevel.color}`}>
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <p className="text-sm mb-1">مستواك الحالي</p>
          <p className="text-3xl font-bold">{currentLevel.label}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => router.push(action.href)}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-6 text-center hover:shadow-xl transition-all`}
              >
                <Icon className="w-8 h-8 mx-auto mb-3 opacity-90" />
                <p className="font-semibold">{action.title}</p>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          بدأ رحلتك!
        </h3>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300">
              🌟 اكتشف الشارات المتاحة وابدأ في بناء إنجازاتك
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300">
              🔥 حافظ على سلسلة نشاطك اليومي لكسب نقاط إضافية
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300">
              🏆 تنافس مع أقرانك في لوحة المتصدرين
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
