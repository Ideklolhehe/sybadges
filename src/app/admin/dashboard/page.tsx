'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Award, Clock, CheckCircle, TrendingUp } from 'lucide-react'

interface Stats {
  totalMembers: number
  totalBadges: number
  pendingApprovals: number
  approvedToday: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalBadges: 0,
    pendingApprovals: 0,
    approvedToday: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [membersRes, achievementsRes] = await Promise.all([
        fetch('/api/members'),
        fetch('/api/achievements?status=pending')
      ])

      const members = await membersRes.json()
      const pending = await achievementsRes.json()

      // Calculate total badges from members
      const totalBadges = members.reduce((sum: number, m: any) => sum + (m.totalBadges || 0), 0)

      setStats({
        totalMembers: members.length,
        totalBadges,
        pendingApprovals: pending.length,
        approvedToday: 0 // Would need proper date filtering
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'إجمالي الأعضاء',
      titleEn: 'Total Members',
      value: stats.totalMembers,
      icon: Users,
      color: '#2E2973',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'الشارات الممنوحة',
      titleEn: 'Badges Awarded',
      value: stats.totalBadges,
      icon: Award,
      color: '#E04511',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      title: 'طلبات معلقة',
      titleEn: 'Pending Requests',
      value: stats.pendingApprovals,
      icon: Clock,
      color: '#F59E0B',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
    },
    {
      title: 'تمت الموافقة اليوم',
      titleEn: 'Approved Today',
      value: stats.approvedToday,
      icon: CheckCircle,
      color: '#10B981',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    }
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          لوحة التحكم
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          نظرة عامة على نشاط البوابة
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.titleEn}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.title}
                </h3>
                <p className="text-3xl font-extrabold" style={{ color: stat.color }}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          إجراءات سريعة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-[#2E2973] text-white rounded-xl hover:bg-[#1f1b4d] transition-colors text-center">
            <Users className="w-6 h-6 mx-auto mb-2" />
            <span>إضافة عضو جديد</span>
          </button>
          <button className="p-4 bg-[#E04511] text-white rounded-xl hover:bg-[#c43a0e] transition-colors text-center">
            <Award className="w-6 h-6 mx-auto mb-2" />
            <span>مراجعة الطلبات</span>
          </button>
          <button className="p-4 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <span>عرض التقرير الكامل</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
