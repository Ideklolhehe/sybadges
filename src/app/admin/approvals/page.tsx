'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Clock, CheckCircle, XCircle, Filter, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'

interface Achievement {
  id: string
  status: string
  reason: string
  reasonAr: string
  evidence?: string
  createdAt: string
  member: {
    id: string
    name: string
    memberId: string
    photo?: string
  }
  badge: {
    id: string
    name: string
    nameAr: string
    level: string
    color: string
  }
}

export default function ApprovalQueue() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [filter, setFilter] = useState('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)
  const [actionDialog, setActionDialog] = useState<{ open: boolean; action: 'approve' | 'reject' }>({ open: false, action: 'approve' })
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAchievements()
  }, [])

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/achievements')
      const data = await res.json()
      setAchievements(data)
    } catch (error) {
      console.error('Error fetching achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'all') return true
    return achievement.status === filter
  })

  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'معلق',
      labelEn: 'Pending',
      color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    approved: {
      icon: CheckCircle,
      label: 'تمت الموافقة',
      labelEn: 'Approved',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    },
    rejected: {
      icon: XCircle,
      label: 'مرفوض',
      labelEn: 'Rejected',
      color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    }
  }

  const handleAction = async () => {
    if (!selectedAchievement) return

    try {
      const res = await fetch(`/api/achievements/${selectedAchievement.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionDialog.action,
          approvedBy: actionDialog.action === 'approve' ? 'admin' : undefined,
          rejectedBy: actionDialog.action === 'reject' ? 'admin' : undefined,
          notes
        })
      })

      if (res.ok) {
        setAchievements(achievements.map(a =>
          a.id === selectedAchievement.id
            ? { ...a, status: actionDialog.action === 'approve' ? 'approved' : 'rejected' }
            : a
        ))
        setActionDialog({ open: false, action: 'approve' })
        setSelectedAchievement(null)
        setNotes('')
      }
    } catch (error) {
      console.error('Error updating achievement:', error)
    }
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
            طلبات الموافقة
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            مراجعة والموافقة على طلبات الشارات
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-gray-400" />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">الكل</SelectItem>
              <SelectItem value="pending">معلق</SelectItem>
              <SelectItem value="approved">تمت الموافقة</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(statusConfig).map(([key, config]) => {
          const Icon = config.icon
          const count = achievements.filter(a => a.status === key).length
          return (
            <div
              key={key}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 ${
                key === 'pending' ? 'border-r-4 border-r-yellow-500' :
                key === 'approved' ? 'border-r-4 border-r-green-500' :
                'border-r-4 border-r-red-500'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${config.color} p-3 rounded-xl`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-3xl font-bold text-gray-900 dark:text-white">{count}</span>
              </div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{config.label}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{config.labelEn}</p>
            </div>
          )
        })}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAchievements.map((achievement, index) => {
          const config = statusConfig[achievement.status as keyof typeof statusConfig]
          const StatusIcon = config.icon
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  {config.label}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(achievement.createdAt).toLocaleDateString('ar-EG')}
                </span>
              </div>

              {/* Badge Info */}
              <div className="flex items-center gap-4 mb-4">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl"
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

              {/* Member Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2E2973] to-[#1f1b4d] rounded-full flex items-center justify-center text-white font-bold">
                  {achievement.member.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">{achievement.member.name}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {achievement.member.memberId}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">السبب:</p>
                <p className="text-gray-900 dark:text-white">{achievement.reasonAr}</p>
              </div>

              {/* Actions */}
              {achievement.status === 'pending' && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setSelectedAchievement(achievement)
                      setActionDialog({ open: true, action: 'approve' })
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 ml-2" />
                    موافقة
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedAchievement(achievement)
                      setActionDialog({ open: true, action: 'reject' })
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 ml-2" />
                    رفض
                  </Button>
                </div>
              )}
            </motion.div>
          )
        })}
        {filteredAchievements.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            لا توجد طلبات
          </div>
        )}
      </div>

      {/* Action Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {actionDialog.action === 'approve' ? 'تأكيد الموافقة' : 'تأكيد الرفض'}
            </DialogTitle>
            <DialogDescription>
              هل أنت متأكد من {actionDialog.action === 'approve' ? 'الموافقة على' : 'رفض'} هذا الطلب؟
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">ملاحظات (اختياري)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظاتك هنا..."
                className="bg-gray-50 dark:bg-gray-800"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ ...actionDialog, open: false })}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleAction}
              className={actionDialog.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionDialog.action === 'approve' ? 'موافقة' : 'رفض'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
