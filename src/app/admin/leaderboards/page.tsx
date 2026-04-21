'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users } from 'lucide-react'

interface LeaderboardSummary {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  rankingMethod: string
  status: string
  metric?: { name: string; nameAr: string } | null
  pointsConfig?: { name: string; nameAr: string } | null
  streak?: { name: string; nameAr: string } | null
  _count: { entries: number }
}

interface LeaderboardDetail {
  id: string
  name: string
  nameAr: string
  entries: {
    rank: number
    score: number
    member: { id: string; memberId: string; name: string; photo: string | null; level: string }
  }[]
}

export default function AdminLeaderboards() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardSummary[]>([])
  const [selectedLb, setSelectedLb] = useState<LeaderboardDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboards')
      .then((res) => res.json())
      .then(setLeaderboards)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadLeaderboard = async (id: string) => {
    const res = await fetch(`/api/leaderboards/${id}`)
    setSelectedLb(await res.json())
  }

  const rankMethodLabels: Record<string, string> = {
    metric: 'مقياس',
    points: 'نقاط',
    streak: 'سلسلة',
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">لوحات المتصدرين</h2>
        <p className="text-gray-600 dark:text-gray-400">إدارة وعرض لوحات المتصدرين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {leaderboards.map((lb, index) => (
          <motion.div
            key={lb.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => loadLeaderboard(lb.id)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-[#2E2973] hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {rankMethodLabels[lb.rankingMethod] || lb.rankingMethod}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${lb.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {lb.status === 'active' ? 'نشط' : lb.status}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{lb.nameAr}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{lb.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{lb._count.entries} مشارك</span>
            </div>
          </motion.div>
        ))}
      </div>

      {selectedLb && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-[#2E2973]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#2E2973]" />
            {selectedLb.nameAr}
          </h3>

          <div className="space-y-3">
            {selectedLb.entries.map((entry) => (
              <div key={entry.member.id} className={`flex items-center justify-between p-4 rounded-xl ${entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${entry.rank === 1 ? 'bg-yellow-400 text-white' : entry.rank === 2 ? 'bg-gray-300 text-gray-700' : entry.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                    {entry.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{entry.member.name}</p>
                    <p className="text-xs text-gray-500">{entry.member.memberId}</p>
                  </div>
                </div>
                <span className="font-bold text-[#2E2973] dark:text-blue-400 text-lg">{Math.round(entry.score)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function AdminLeaderboards() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardSummary[]>([])
  const [selectedLb, setSelectedLb] = useState<LeaderboardDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboards')
      .then((res) => res.json())
      .then(setLeaderboards)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadLeaderboard = async (id: string) => {
    const res = await fetch(`/api/leaderboards/${id}`)
    setSelectedLb(await res.json())
  }

  const rankMethodLabels: Record<string, string> = {
    metric: 'مقياس',
    points: 'نقاط',
    streak: 'سلسلة',
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">لوحات المتصدرين</h2>
        <p className="text-gray-600 dark:text-gray-400">إدارة وعرض لوحات المتصدرين</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {leaderboards.map((lb, index) => (
          <motion.div
            key={lb.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => loadLeaderboard(lb.id)}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-[#2E2973] hover:shadow-xl transition-all cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-xl">
                <Trophy className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {rankMethodLabels[lb.rankingMethod] || lb.rankingMethod}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${lb.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                  {lb.status === 'active' ? 'نشط' : lb.status}
                </span>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{lb.nameAr}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{lb.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{lb._count.entries} مشارك</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Selected Leaderboard Detail */}
      {selectedLb && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-[#2E2973]">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#2E2973]" />
            {selectedLb.nameAr}
          </h3>

          <div className="space-y-3">
            {selectedLb.entries.map((entry) => (
              <div key={entry.member.id} className={`flex items-center justify-between p-4 rounded-xl ${entry.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-700/50'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${entry.rank === 1 ? 'bg-yellow-400 text-white' : entry.rank === 2 ? 'bg-gray-300 text-gray-700' : entry.rank === 3 ? 'bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                    {entry.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{entry.member.name}</p>
                    <p className="text-xs text-gray-500">{entry.member.memberId}</p>
                  </div>
                </div>
                <span className="font-bold text-[#2E2973] dark:text-blue-400 text-lg">{Math.round(entry.score)}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
