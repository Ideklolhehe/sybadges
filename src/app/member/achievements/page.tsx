'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Plus, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

interface Badge {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  level: string
  color: string
}

interface Achievement {
  id: string
  status: string
  reason: string
  reasonAr: string
  createdAt: string
  badge: Badge
}

const mockMemberId = 'demo-member-001'

export default function MemberAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [requestDialog, setRequestDialog] = useState(false)
  const [selectedBadge, setSelectedBadge] = useState<string>('')
  const [reason, setReason] = useState('')
  const [evidence, setEvidence] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [achievementsRes, badgesRes] = await Promise.all([
        fetch(`/api/achievements?memberId=${mockMemberId}`),
        fetch('/api/badges')
      ])

      setAchievements(await achievementsRes.json())
      setBadges(await badgesRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitRequest = async () => {
    if (!selectedBadge || !reason) return

    try {
      const res = await fetch('/api/achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          memberId: mockMemberId,
          badgeId: selectedBadge,
          reason: 'Request for badge achievement',
          reasonAr: reason,
          evidence
        })
      })

      if (res.ok) {
        fetchData()
        setRequestDialog(false)
        setSelectedBadge('')
        setReason('')
        setEvidence('')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
    }
  }

  const statusConfig = {
    pending: {
      label: 'قيد المراجعة',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    approved: {
      label: 'تمت الموافقة',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    rejected: {
      label: 'مرفوض',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const levelColors = {
    bronze: 'border-amber-500',
    silver: 'border-gray-400',
    gold: 'border-yellow-500',
    platinum: 'border-purple-500'
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const approvedCount = achievements.filter(a => a.status === 'approved').length
  const pendingCount = achievements.filter(a => a.status === 'pending').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            إنجازاتي
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            تتبع شاراتك وإنجازاتك
          </p>
        </div>
        <Button
          onClick={() => setRequestDialog(true)}
          className="bg-[#2E2973] hover:bg-[#1f1b4d] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          طلب شارة جديدة
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#2E2973] to-[#1f1b4d] text-white rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">الشارات المكتسبة</p>
              <p className="text-4xl font-bold">{approvedCount}</p>
            </div>
            <Award className="w-12 h-12 opacity-80" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#E04511] to-[#c43a0e] text-white rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-80 mb-1">طلبات معلقة</p>
              <p className="text-4xl font-bold">{pendingCount}</p>
            </div>
            <Shield className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.map((achievement, index) => {
          const config = statusConfig[achievement.status as keyof typeof statusConfig]
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 transition-all ${
                achievement.status === 'approved'
                  ? `border-4 ${levelColors[achievement.badge.level as keyof typeof levelColors]}`
                  : 'border-gray-200 dark:border-gray-700'
              } hover:shadow-xl`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                  {config.label}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(achievement.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg"
                  style={{ backgroundColor: achievement.badge.color }}
                >
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                    {achievement.badge.nameAr}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {achievement.badge.name}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {achievement.reasonAr}
                </p>
              </div>
            </motion.div>
          )
        })}
        {achievements.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لم تقم بطلب أي شارات بعد</p>
            <Button
              onClick={() => setRequestDialog(true)}
              className="mt-4 bg-[#2E2973] hover:bg-[#1f1b4d]"
            >
              <Plus className="w-4 h-4 ml-2" />
              طلب أول شارة
            </Button>
          </div>
        )}
      </div>

      {/* Request Dialog */}
      <Dialog open={requestDialog} onOpenChange={setRequestDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">طلب شارة جديدة</DialogTitle>
            <DialogDescription>
              اختر الشارة التي ترغب في الحصول عليها وأضف السبب
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">الشارة *</label>
              <Select value={selectedBadge} onValueChange={setSelectedBadge}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-800">
                  <SelectValue placeholder="اختر الشارة" />
                </SelectTrigger>
                <SelectContent>
                  {badges.map((badge) => (
                    <SelectItem key={badge.id} value={badge.id}>
                      {badge.nameAr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">السبب *</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="اشرح لماذا تستحق هذه الشارة..."
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">رابط الدليل (اختياري)</label>
              <Input
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                placeholder="https://..."
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestDialog(false)}>
              إلغاء
            </Button>
            <Button
              onClick={handleSubmitRequest}
              disabled={!selectedBadge || !reason}
              className="bg-[#2E2973] hover:bg-[#1f1b4d]"
            >
              إرسال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
