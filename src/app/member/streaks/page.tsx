'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, Snowflake, Calendar } from 'lucide-react'

interface MemberStreakData {
  id: string
  currentLength: number
  longestLength: number
  freezesRemaining: number
  freezesUsed: number
  status: string
  streak: {
    id: string
    name: string
    nameAr: string
    description: string
    descriptionAr: string
    frequency: string
    threshold: number
  }
}

const mockMemberId = 'MEM001'

const frequencyLabels: Record<string, string> = {
  daily: 'يوم',
  weekly: 'أسبوع',
  monthly: 'شهر',
}

export default function MemberStreaks() {
  const [streaks, setStreaks] = useState<MemberStreakData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStreaks = async () => {
      try {
        // First get the member's internal ID
        const membersRes = await fetch('/api/members')
        const members = await membersRes.json()
        const member = members.find((m: { memberId: string }) => m.memberId === mockMemberId)
        if (!member) return

        const res = await fetch(`/api/members/${member.id}/streaks`)
        setStreaks(await res.json())
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStreaks()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
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
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">سلاسلي 🔥</h2>
        <p className="text-gray-600 dark:text-gray-400">حافظ على نشاطك المتواصل واكسب مكافآت</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streaks.map((ms, index) => (
          <motion.div
            key={ms.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className={`rounded-2xl p-6 border-2 transition-all ${ms.status === 'active' ? 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-60'}`}
          >
            {/* Streak flame header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className={`w-8 h-8 ${ms.status === 'active' ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {ms.currentLength}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {frequencyLabels[ms.streak.frequency] || ms.streak.frequency}
                </span>
              </div>
              {ms.status === 'active' ? (
                <span className="text-xs px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-semibold">نشط</span>
              ) : (
                <span className="text-xs px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full font-semibold">منقطع</span>
              )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{ms.streak.nameAr}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{ms.streak.descriptionAr}</p>

            {/* Stats */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  أطول سلسلة
                </span>
                <span className="font-bold text-gray-900 dark:text-white">{ms.longestLength} {frequencyLabels[ms.streak.frequency]}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Snowflake className="w-4 h-4 text-blue-400" />
                  التجميد المتبقي
                </span>
                <div className="flex items-center gap-1">
                  {[...Array(ms.freezesRemaining)].map((_, i) => (
                    <Snowflake key={i} className="w-4 h-4 text-blue-400" />
                  ))}
                  {ms.freezesRemaining === 0 && <span className="text-gray-400 text-xs">لا يوجد</span>}
                </div>
              </div>

              {/* Progress visualization */}
              <div className="mt-4">
                <div className="flex gap-1">
                  {[...Array(Math.min(ms.currentLength, 30))].map((_, i) => (
                    <div
                      key={i}
                      className="h-3 flex-1 rounded-sm bg-gradient-to-t from-orange-400 to-yellow-300"
                      style={{ opacity: 0.4 + (i / Math.min(ms.currentLength, 30)) * 0.6 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {streaks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Flame className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">لم تبدأ أي سلسلة بعد. ابدأ نشاطك اليوم!</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
