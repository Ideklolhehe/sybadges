'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Plus, Snowflake } from 'lucide-react'

interface Streak {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  frequency: string
  threshold: number
  initialFreezes: number
  maxFreezes: number
  metric: { name: string; nameAr: string; unit: string }
  _count: { memberStreaks: number }
}

const frequencyLabels: Record<string, string> = {
  daily: 'يومي',
  weekly: 'أسبوعي',
  monthly: 'شهري',
}

export default function AdminStreaks() {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/streaks')
      .then((res) => res.json())
      .then(setStreaks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">السلاسل</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة سلاسل الإنجازات المتتالية</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streaks.map((streak, index) => (
          <motion.div
            key={streak.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <span className="text-xs px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full font-semibold">
                {frequencyLabels[streak.frequency] || streak.frequency}
              </span>
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{streak.nameAr}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{streak.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">{streak.descriptionAr}</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">المقياس:</span>
                <span className="font-medium text-gray-900 dark:text-white">{streak.metric.nameAr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">الحد الأدنى:</span>
                <span className="font-medium text-gray-900 dark:text-white">{streak.threshold} {streak.metric.unit}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Snowflake className="w-3 h-3" /> التجميد:
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{streak.initialFreezes} (حد أقصى {streak.maxFreezes})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">الأعضاء:</span>
                <span className="font-medium text-[#2E2973] dark:text-blue-400">{streak._count.memberStreaks}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
