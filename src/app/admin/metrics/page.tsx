'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Plus, Activity } from 'lucide-react'

interface Metric {
  id: string
  name: string
  nameAr: string
  description: string
  descriptionAr: string
  unit: string
  isActive: boolean
  _count: { events: number; memberMetricTotals: number }
}

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', nameAr: '', description: '', descriptionAr: '', unit: 'count' })

  useEffect(() => { fetchMetrics() }, [])

  const fetchMetrics = async () => {
    try {
      const res = await fetch('/api/metrics')
      setMetrics(await res.json())
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createMetric = async () => {
    try {
      await fetch('/api/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setShowCreate(false)
      setForm({ name: '', nameAr: '', description: '', descriptionAr: '', unit: 'count' })
      fetchMetrics()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">المقاييس</h2>
          <p className="text-gray-600 dark:text-gray-400">إدارة المقاييس والأنشطة القابلة للتتبع</p>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-[#2E2973] text-white rounded-xl hover:bg-[#1f1b4d] transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة مقياس
        </button>
      </div>

      {showCreate && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-[#2E2973] mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">مقياس جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name (English)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <input placeholder="الاسم (عربي)" value={form.nameAr} onChange={(e) => setForm({ ...form, nameAr: e.target.value })} className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="rtl" />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <input placeholder="الوصف" value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white" dir="rtl" />
            <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="count">Count</option>
              <option value="hours">Hours</option>
              <option value="days">Days</option>
              <option value="points">Points</option>
            </select>
            <button onClick={createMetric} className="px-6 py-3 bg-[#2E2973] text-white rounded-xl hover:bg-[#1f1b4d] transition-colors font-semibold">إنشاء</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {metrics.map((metric, index) => (
          <motion.div
            key={metric.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
                <BarChart3 className="w-6 h-6 text-[#2E2973]" />
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                {metric.unit}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{metric.nameAr}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{metric.name}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <Activity className="w-4 h-4" />
                <span>{metric._count.events} حدث</span>
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                {metric._count.memberMetricTotals} عضو
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
