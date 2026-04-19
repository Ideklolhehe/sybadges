'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Shield, TrendingUp, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MemberStats {
  totalBadges: number
  pendingRequests: number
  level: string
  joinDate: string
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMemberStats()
  }, [])

  const fetchMemberStats = async () => {
    try {
      const res = await fetch(`/api/members/${mockMemberId}`)
      const data = await res.json()
      const achievementsRes = await fetch(`/api/achievements?memberId=${mockMemberId}&status=pending`)
      const pending = await achievementsRes.json()

      setStats({
        totalBadges: data.totalBadges || 0,
        pendingRequests: pending.length,
        level: data.level || 'bronze',
        joinDate: data.joinDate
      })
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

  const quickActions = [
    {
      title: 'عرض إنجازاتي',
      icon: Award,
      color: 'from-[#2E2973] to-[#1f1b4d]',
      href: '/member/achievements'
    },
    {
      title: 'استكشف الشارات',
      icon: Shield,
      color: 'from-[#E04511] to-[#c43a0e]',
      href: '/member/badges'
    },
    {
      title: 'تعديل ملفي',
      icon: TrendingUp,
      color: 'from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600',
      href: '/member/profile'
    },
    {
      title: 'الطلبات المعلقة',
      icon: Clock,
      color: 'from-yellow-500 to-yellow-600',
      href: '/member/achievements'
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

        <div className={`rounded-2xl p-6 border-2 ${currentLevel.color}`}>
          <div className="flex items-center justify-between mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <p className="text-sm mb-1">مستواك الحالي</p>
          <p className="text-3xl font-bold">{currentLevel.label}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">تاريخ الانضمام</p>
          <p className="text-lg font-semibold">
            {stats.joinDate ? new Date(stats.joinDate).toLocaleDateString('ar-EG') : '-'}
          </p>
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
          <Award className="w-5 h-5 text-[#2E2973]" />
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
              🏆 تقدم للحصول على المزيد من الشارات للوصول لمستويات أعلى
            </p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <p className="text-gray-700 dark:text-gray-300">
              ⭐ شارك إنجازاتك وكن مصدر إلهام للآخرين
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
