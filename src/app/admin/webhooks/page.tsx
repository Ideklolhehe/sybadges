'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Webhook,
  Plus,
  Trash2,
  TestTube2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

// ── Types ──────────────────────────────────────────────────────

interface WebhookItem {
  id: string
  url: string
  events: string
  isActive: boolean
  hasSecret: boolean
  createdAt: string
  updatedAt: string
  _count: { deliveries: number }
}

interface Delivery {
  id: string
  event: string
  status: string
  responseCode: number | null
  retryCount: number
  nextRetryAt: string | null
  createdAt: string
  payload: string
}

const ALL_EVENT_TYPES = [
  'metric.recorded',
  'achievement.unlocked',
  'achievement.approved',
  'achievement.rejected',
  'streak.started',
  'streak.extended',
  'streak.lost',
  'streak.freeze.consumed',
  'streak.freeze.earned',
  'points.changed',
  'points.level.changed',
  'points.boost.started',
  'points.boost.finished',
  'leaderboard.rank.changed',
  'member.created',
  'member.updated',
]

// ── Status helpers ──────────────────────────────────────────────

const statusConfig: Record<string, { icon: typeof CheckCircle; label: string; labelEn: string; color: string }> = {
  delivered: {
    icon: CheckCircle,
    label: 'تم التسليم',
    labelEn: 'Delivered',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  pending: {
    icon: Clock,
    label: 'قيد الانتظار',
    labelEn: 'Pending',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  failed: {
    icon: XCircle,
    label: 'فشل',
    labelEn: 'Failed',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  dead_letter: {
    icon: AlertTriangle,
    label: 'مؤرشف',
    labelEn: 'Dead Letter',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700/30 dark:text-gray-400',
  },
}

// ── Component ───────────────────────────────────────────────────

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialog, setCreateDialog] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; webhook: WebhookItem | null }>({
    open: false,
    webhook: null,
  })

  // Create form state
  const [newUrl, setNewUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])
  const [createdSecret, setCreatedSecret] = useState<string | null>(null)
  const [showSecret, setShowSecret] = useState(false)

  // Delivery log state per webhook
  const [expandedWebhook, setExpandedWebhook] = useState<string | null>(null)
  const [deliveries, setDeliveries] = useState<Record<string, Delivery[]>>({})
  const [testingWebhook, setTestingWebhook] = useState<string | null>(null)

  const fetchWebhooks = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/webhooks')
      const data = await res.json()
      setWebhooks(data)
    } catch (error) {
      console.error('Error fetching webhooks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWebhooks()
  }, [fetchWebhooks])

  const fetchDeliveries = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/admin/webhooks/${webhookId}/deliveries?limit=10`)
      const data = await res.json()
      setDeliveries((prev) => ({ ...prev, [webhookId]: data }))
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    }
  }

  const handleToggleExpand = (webhookId: string) => {
    if (expandedWebhook === webhookId) {
      setExpandedWebhook(null)
    } else {
      setExpandedWebhook(webhookId)
      if (!deliveries[webhookId]) {
        fetchDeliveries(webhookId)
      }
    }
  }

  const handleCreate = async () => {
    if (!newUrl) return
    try {
      const res = await fetch('/api/admin/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: newUrl, events: selectedEvents }),
      })
      if (res.ok) {
        const created = await res.json()
        setCreatedSecret(created.secret)
        setNewUrl('')
        setSelectedEvents([])
        fetchWebhooks()
      }
    } catch (error) {
      console.error('Error creating webhook:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.webhook) return
    try {
      const res = await fetch(`/api/admin/webhooks/${deleteDialog.webhook.id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setDeleteDialog({ open: false, webhook: null })
        fetchWebhooks()
      }
    } catch (error) {
      console.error('Error deleting webhook:', error)
    }
  }

  const handleToggleActive = async (webhook: WebhookItem) => {
    try {
      await fetch(`/api/admin/webhooks/${webhook.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !webhook.isActive }),
      })
      fetchWebhooks()
    } catch (error) {
      console.error('Error toggling webhook:', error)
    }
  }

  const handleTest = async (webhookId: string) => {
    setTestingWebhook(webhookId)
    try {
      await fetch(`/api/admin/webhooks/${webhookId}/test`, { method: 'POST' })
      // Refresh deliveries for this webhook
      await fetchDeliveries(webhookId)
      if (expandedWebhook !== webhookId) {
        setExpandedWebhook(webhookId)
      }
    } catch (error) {
      console.error('Error testing webhook:', error)
    } finally {
      setTestingWebhook(null)
    }
  }

  const toggleEvent = (event: string) => {
    setSelectedEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  // Parse events JSON string into array
  const parseEvents = (eventsStr: string): string[] => {
    try {
      return JSON.parse(eventsStr)
    } catch {
      return []
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg" />
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
            الويب هوك
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            إدارة اشتراكات الويب هوك ومراقبة عمليات التسليم
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
            Webhook Subscriptions & Delivery Logs
          </p>
        </div>
        <Button
          onClick={() => {
            setCreateDialog(true)
            setCreatedSecret(null)
            setShowSecret(false)
          }}
          className="bg-[#2E2973] hover:bg-[#1f1b4d] text-white"
        >
          <Plus className="w-4 h-4 ml-2" />
          إضافة ويب هوك
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 border-r-4 border-r-[#2E2973]">
          <div className="flex items-center justify-between mb-2">
            <Webhook className="w-6 h-6 text-[#2E2973]" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">{webhooks.length}</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">إجمالي الويب هوك</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Webhooks</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 border-r-4 border-r-green-500">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {webhooks.filter((w) => w.isActive).length}
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">نشط</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-gray-200 dark:border-gray-700 border-r-4 border-r-orange-500">
          <div className="flex items-center justify-between mb-2">
            <RefreshCw className="w-6 h-6 text-orange-500" />
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {webhooks.reduce((sum, w) => sum + w._count.deliveries, 0)}
            </span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">إجمالي التسليمات</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Deliveries</p>
        </div>
      </div>

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.map((webhook, index) => {
          const events = parseEvents(webhook.events)
          const isExpanded = expandedWebhook === webhook.id
          const webhookDeliveries = deliveries[webhook.id] ?? []

          return (
            <motion.div
              key={webhook.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Webhook Header */}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          webhook.isActive ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                      />
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg truncate block max-w-full">
                        {webhook.url}
                      </code>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {events.length === 0 ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          جميع الأحداث / All Events
                        </span>
                      ) : (
                        events.map((event) => (
                          <span
                            key={event}
                            className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          >
                            {event}
                          </span>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {webhook._count.deliveries} تسليم · أُنشئ في{' '}
                      {new Date(webhook.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(webhook)}
                      className={
                        webhook.isActive
                          ? 'border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-400'
                          : 'border-gray-300 text-gray-500'
                      }
                    >
                      {webhook.isActive ? 'نشط' : 'معطل'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(webhook.id)}
                      disabled={testingWebhook === webhook.id || !webhook.isActive}
                    >
                      {testingWebhook === webhook.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <TestTube2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteDialog({ open: true, webhook })}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleExpand(webhook.id)}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Delivery Log (Expandable) */}
              {isExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      سجل التسليمات الأخيرة
                      <span className="text-sm font-normal text-gray-500 mr-2">Recent Deliveries</span>
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fetchDeliveries(webhook.id)}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {webhookDeliveries.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      لا توجد عمليات تسليم بعد
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {webhookDeliveries.map((delivery) => {
                        const config = statusConfig[delivery.status] ?? statusConfig.failed
                        const StatusIcon = config.icon
                        return (
                          <div
                            key={delivery.id}
                            className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                          >
                            <div className={`${config.color} p-2 rounded-lg`}>
                              <StatusIcon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-semibold text-gray-900 dark:text-white">
                                  {delivery.event}
                                </span>
                                {delivery.responseCode && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                    {delivery.responseCode}
                                  </span>
                                )}
                                {delivery.retryCount > 0 && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                    محاولة {delivery.retryCount}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(delivery.createdAt).toLocaleString('ar-EG')}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-3 py-1 rounded-full font-semibold ${config.color}`}
                            >
                              {config.labelEn}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}

        {webhooks.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              لا توجد اشتراكات ويب هوك
            </h3>
            <p className="text-gray-500 mb-4">No webhook subscriptions yet</p>
            <Button
              onClick={() => {
                setCreateDialog(true)
                setCreatedSecret(null)
              }}
              className="bg-[#2E2973] hover:bg-[#1f1b4d] text-white"
            >
              <Plus className="w-4 h-4 ml-2" />
              إنشاء أول ويب هوك
            </Button>
          </div>
        )}
      </div>

      {/* Create Webhook Dialog */}
      <Dialog
        open={createDialog}
        onOpenChange={(open) => {
          setCreateDialog(open)
          if (!open) {
            setCreatedSecret(null)
            setShowSecret(false)
            setNewUrl('')
            setSelectedEvents([])
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {createdSecret ? 'تم إنشاء الويب هوك' : 'إنشاء ويب هوك جديد'}
            </DialogTitle>
            <DialogDescription>
              {createdSecret
                ? 'احفظ المفتاح السري الآن — لن يظهر مرة أخرى'
                : 'أدخل عنوان URL ونقاط النهاية واختر الأحداث المطلوبة'}
            </DialogDescription>
          </DialogHeader>

          {createdSecret ? (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  المفتاح السري (HMAC-SHA256)
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono break-all">
                    {showSecret ? createdSecret : '••••••••••••••••••••••••••••••••'}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(createdSecret)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                  ⚠️ هذا المفتاح لن يظهر مرة أخرى. احفظه الآن.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">عنوان URL</label>
                <Input
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://example.com/webhook"
                  dir="ltr"
                  className="bg-gray-50 dark:bg-gray-800 font-mono"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  الأحداث المشترك بها
                  <span className="text-xs text-gray-500 mr-2">(اتركها فارغة لاستقبال الكل)</span>
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  {ALL_EVENT_TYPES.map((event) => (
                    <label
                      key={event}
                      className="flex items-center gap-2 text-xs cursor-pointer p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded border-gray-300"
                      />
                      <span className="font-mono">{event}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {createdSecret ? (
              <Button onClick={() => setCreateDialog(false)}>
                تم
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateDialog(false)}>
                  إلغاء
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={!newUrl}
                  className="bg-[#2E2973] hover:bg-[#1f1b4d] text-white"
                >
                  إنشاء
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">تأكيد الحذف</DialogTitle>
            <DialogDescription>
              هل أنت متأكد من حذف هذا الويب هوك؟ سيتم حذف جميع سجلات التسليم المرتبطة.
            </DialogDescription>
          </DialogHeader>
          {deleteDialog.webhook && (
            <div className="py-4">
              <code className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded-lg font-mono block">
                {deleteDialog.webhook.url}
              </code>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, webhook: null })}
            >
              إلغاء
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 className="w-4 h-4 ml-2" />
              حذف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
