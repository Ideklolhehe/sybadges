'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Badge {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  category: string
  categoryAr: string
  level: string
  color: string
}

export default function BadgeCatalog() {
  const [badges, setBadges] = useState<Badge[]>([])
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterCategory, setFilterCategory] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBadges()
  }, [])

  const fetchBadges = async () => {
    try {
      const res = await fetch('/api/badges')
      const data = await res.json()
      setBadges(data)
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredBadges = badges.filter(badge => {
    const levelMatch = filterLevel === 'all' || badge.level === filterLevel
    const categoryMatch = filterCategory === 'all' || badge.category === filterCategory
    return levelMatch && categoryMatch
  })

  const categories = [...new Set(badges.map(b => b.category))]

  const levelConfig = {
    bronze: {
      label: 'برونزي',
      color: 'bg-amber-500',
      borderColor: 'border-amber-500'
    },
    silver: {
      label: 'فضي',
      color: 'bg-gray-400',
      borderColor: 'border-gray-400'
    },
    gold: {
      label: 'ذهبي',
      color: 'bg-yellow-500',
      borderColor: 'border-yellow-500'
    },
    platinum: {
      label: 'بلاتيني',
      color: 'bg-purple-500',
      borderColor: 'border-purple-500'
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg" />
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
          مكتبة الشارات
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          استكشف جميع الشارات المتاحة
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="تصفية حسب المستوى" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل المستويات</SelectItem>
              <SelectItem value="bronze">برونزي</SelectItem>
              <SelectItem value="silver">فضي</SelectItem>
              <SelectItem value="gold">ذهبي</SelectItem>
              <SelectItem value="platinum">بلاتيني</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <SelectValue placeholder="تصفية حسب التصنيف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">كل التصنيفات</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-[#2E2973] to-[#1f1b4d] text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Award className="w-12 h-12 opacity-80" />
            <div>
              <p className="text-sm opacity-80">إجمالي الشارات</p>
              <p className="text-4xl font-bold">{badges.length}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-80">مصنفة في</p>
            <p className="text-2xl font-bold">{categories.length} تصنيفات</p>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBadges.map((badge, index) => {
          const config = levelConfig[badge.level as keyof typeof levelConfig]
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-xl border-2 hover:border-[#2E2973] transition-all"
            >
              <div
                className={`h-48 flex items-center justify-center ${config.color}`}
                style={{ backgroundColor: badge.color }}
              >
                <Award className="w-16 h-16 text-white" />
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                    {badge.nameAr}
                  </h3>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-xs font-semibold text-white ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {badge.descriptionAr}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-xs text-gray-500">
                    {badge.categoryAr}
                  </span>
                  <Button
                    size="sm"
                    className="bg-[#2E2973] hover:bg-[#1f1b4d] text-white"
                  >
                    طلب الشارة
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
        {filteredBadges.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">لا توجد شارات تطابق التصفية</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
