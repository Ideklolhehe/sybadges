'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Zap, TrendingUp } from 'lucide-react'

interface PointsConfig {
  id: string
  name: string
  nameAr: string
  description: string
  levels: { id: string; threshold: number; name: string; nameAr: string; icon: string; color: string; order: number }[]
  triggers: { id: string; sourceType: string; pointsPerUnit: number; pointsFixed: number; metric?: { name: string; nameAr: string } | null; badge?: { name: string; nameAr: string } | null }[]
  _count: { memberPoints: number }
}

export default function AdminPoints() {
  const [configs, setConfigs] = useState<PointsConfig[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/points')
      .then((res) => res.json())
      .then(setConfigs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">النقاط والمستويات</h2>
        <p className="text-gray-600 dark:text-gray-400">إدارة أنظمة النقاط والمستويات</p>
      </div>

      {configs.map((config) => (
        <div key={config.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-xl">
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{config.nameAr}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{config.name} · {config._count.memberPoints} عضو</p>
            </div>
          </div>

          {/* Levels */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> المستويات
            </h4>
            <div className="flex flex-wrap gap-3">
              {config.levels.map((level) => (
                <div key={level.id} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2" style={{ borderColor: level.color }}>
                  <span className="text-xl">{level.icon}</span>
                  <div>
                    <p className="text-sm font-bold" style={{ color: level.color }}>{level.nameAr}</p>
                    <p className="text-xs text-gray-500">{level.threshold}+ نقطة</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Triggers */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4" /> المحفزات
            </h4>
            <div className="space-y-2">
              {config.triggers.map((trigger) => (
                <div key={trigger.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-sm">
                  <span className="text-gray-700 dark:text-gray-300">
                    {trigger.sourceType === 'metric' ? trigger.metric?.nameAr : trigger.badge?.nameAr}
                  </span>
                  <span className="font-bold text-[#2E2973] dark:text-blue-400">
                    +{trigger.sourceType === 'metric' ? trigger.pointsPerUnit : trigger.pointsFixed} نقطة
                    {trigger.sourceType === 'metric' ? '/وحدة' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  )
}
