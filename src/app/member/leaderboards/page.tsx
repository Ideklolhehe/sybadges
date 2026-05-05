'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

interface LeaderboardSummary {
  id: string
  name: string
  nameAr: string
  rankingMethod: string
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

export default function MemberLeaderboards() {
  const [leaderboards, setLeaderboards] = useState<LeaderboardSummary[]>([])
  const [selectedLb, setSelectedLb] = useState<LeaderboardDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/leaderboards')
      .then((res) => res.json())
      .then((data) => {
        setLeaderboards(data)
        if (data.length > 0) loadLeaderboard(data[0].id)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const loadLeaderboard = async (id: string) => {
    const res = await fetch(`/api/leaderboards/${id}`)
    setSelectedLb(await res.json())
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">لوحة المتصدرين 🏆</h2>
        <p className="text-gray-600 dark:text-gray-400">شاهد ترتيبك بين أقرانك</p>
      </div>

      <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
        {leaderboards.map((lb) => (
          <button
            key={lb.id}
            onClick={() => loadLeaderboard(lb.id)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-semibold transition-all ${selectedLb?.id === lb.id ? 'bg-[#2E2973] text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
          >
            {lb.nameAr}
          </button>
        ))}
      </div>

      {selectedLb && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
          {selectedLb.entries.length >= 3 && (
            <div className="bg-gradient-to-b from-[#2E2973] to-[#1f1b4d] p-8">
              <div className="flex items-end justify-center gap-4 max-w-md mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center flex-1">
                  <div className="bg-white/10 rounded-xl p-4 mb-2">
                    <p className="text-3xl mb-1">🥈</p>
                    <p className="text-white font-semibold text-sm truncate">{selectedLb.entries[1]?.member.name}</p>
                    <p className="text-white/60 text-xs">{Math.round(selectedLb.entries[1]?.score ?? 0)}</p>
                  </div>
                  <div className="h-16 bg-gray-400/30 rounded-t-lg" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center flex-1">
                  <div className="bg-white/20 rounded-xl p-4 mb-2 border border-yellow-400/30">
                    <p className="text-4xl mb-1">🥇</p>
                    <p className="text-white font-bold text-sm truncate">{selectedLb.entries[0]?.member.name}</p>
                    <p className="text-yellow-300 text-xs font-semibold">{Math.round(selectedLb.entries[0]?.score ?? 0)}</p>
                  </div>
                  <div className="h-24 bg-yellow-400/20 rounded-t-lg" />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center flex-1">
                  <div className="bg-white/10 rounded-xl p-4 mb-2">
                    <p className="text-3xl mb-1">🥉</p>
                    <p className="text-white font-semibold text-sm truncate">{selectedLb.entries[2]?.member.name}</p>
                    <p className="text-white/60 text-xs">{Math.round(selectedLb.entries[2]?.score ?? 0)}</p>
                  </div>
                  <div className="h-10 bg-amber-600/30 rounded-t-lg" />
                </motion.div>
              </div>
            </div>
          )}

          <div className="p-4 space-y-2">
            {selectedLb.entries.map((entry, index) => (
              <motion.div
                key={entry.member.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className="w-8 text-center font-bold text-gray-500 dark:text-gray-400">
                    {getRankIcon(entry.rank)}
                  </span>
                  <p className="font-semibold text-gray-900 dark:text-white">{entry.member.name}</p>
                </div>
                <span className="font-bold text-lg text-gray-900 dark:text-white">{Math.round(entry.score)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {leaderboards.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">لا توجد لوحات متصدرين حالياً</p>
        </div>
      )}
    </motion.div>
  )
}
