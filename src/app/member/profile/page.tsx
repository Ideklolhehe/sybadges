'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, Shield, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface Member {
  id: string
  memberId: string
  name: string
  email?: string
  phone?: string
  dateOfBirth?: string
  joinDate: string
  photo?: string
  level: string
  totalBadges: number
}

const mockMemberId = 'demo-member-001'

export default function MemberProfile() {
  const [member, setMember] = useState<Member | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchMember()
  }, [])

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/members/${mockMemberId}`)
      const data = await res.json()
      setMember(data)
      setFormData({
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : ''
      })
    } catch (error) {
      console.error('Error fetching member:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/members/${mockMemberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        setMember({ ...member!, ...formData } as Member)
        setEditMode(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const levelConfig = {
    bronze: {
      label: 'برونزي',
      color: 'bg-amber-100 text-amber-700 border-amber-500'
    },
    silver: {
      label: 'فضي',
      color: 'bg-gray-100 text-gray-700 border-gray-400'
    },
    gold: {
      label: 'ذهبي',
      color: 'bg-yellow-100 text-yellow-700 border-yellow-500'
    },
    platinum: {
      label: 'بلاتيني',
      color: 'bg-purple-100 text-purple-700 border-purple-500'
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 animate-pulse">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    )
  }

  const levelInfo = member ? levelConfig[member.level as keyof typeof levelConfig] : levelConfig.bronze

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          ملفي الشخصي
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة معلوماتك الشخصية
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border-2 border-gray-200 dark:border-gray-700">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-4">
            <div className="w-32 h-32 bg-gradient-to-br from-[#2E2973] to-[#1f1b4d] rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl">
              {member?.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-[#E04511] text-white rounded-full shadow-lg hover:bg-[#c43a0e] transition-colors">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {member?.name}
          </h3>
          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${levelInfo.color}`}>
            <Shield className="w-4 h-4" />
            {levelInfo.label}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">الشارات</p>
            <p className="text-3xl font-bold text-[#2E2973] dark:text-white">{member?.totalBadges}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">رقم العضوية</p>
            <p className="text-2xl font-bold text-[#E04511] dark:text-white">{member?.memberId}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <User className="w-4 h-4" />
              الاسم الكامل
            </label>
            {editMode ? (
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-gray-50 dark:bg-gray-700"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-white">{member?.name}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Mail className="w-4 h-4" />
              البريد الإلكتروني
            </label>
            {editMode ? (
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-gray-50 dark:bg-gray-700"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-white">{member?.email || '-'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Phone className="w-4 h-4" />
              رقم الهاتف
            </label>
            {editMode ? (
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="bg-gray-50 dark:bg-gray-700"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-white">{member?.phone || '-'}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              تاريخ الميلاد
            </label>
            {editMode ? (
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="bg-gray-50 dark:bg-gray-700"
              />
            ) : (
              <p className="text-lg text-gray-900 dark:text-white">
                {member?.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString('ar-EG') : '-'}
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              تاريخ الانضمام
            </label>
            <p className="text-lg text-gray-900 dark:text-white">
              {member?.joinDate ? new Date(member.joinDate).toLocaleDateString('ar-EG') : '-'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          {editMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="flex-1"
              >
                إلغاء
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-[#2E2973] hover:bg-[#1f1b4d]"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              className="w-full bg-[#2E2973] hover:bg-[#1f1b4d]"
            >
              تعديل الملف الشخصي
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
