'use client'

import { useState, useEffect } from 'react'
import { Shield, Users, Award, BarChart3, Settings, ChevronRight, ChevronLeft, X, Activity, Flame, Star, Trophy, Webhook } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { useAuth } from '@/contexts/AuthContext'

interface AdminLayoutProps {
  children: React.ReactNode
}

const navItems = [
  {
    href: '/admin/dashboard',
    icon: BarChart3,
    label: 'لوحة التحكم',
    labelEn: 'Dashboard'
  },
  {
    href: '/admin/members',
    icon: Users,
    label: 'إدارة الأعضاء',
    labelEn: 'Members'
  },
  {
    href: '/admin/approvals',
    icon: Award,
    label: 'طلبات الموافقة',
    labelEn: 'Approvals'
  },
  {
    href: '/admin/badges',
    icon: Shield,
    label: 'مكتبة الشارات',
    labelEn: 'Badges'
  },
  {
    href: '/admin/metrics',
    icon: Activity,
    label: 'المقاييس',
    labelEn: 'Metrics'
  },
  {
    href: '/admin/streaks',
    icon: Flame,
    label: 'السلاسل',
    labelEn: 'Streaks'
  },
  {
    href: '/admin/points',
    icon: Star,
    label: 'النقاط والمستويات',
    labelEn: 'Points & Levels'
  },
  {
    href: '/admin/leaderboards',
    icon: Trophy,
    label: 'لوحات المتصدرين',
    labelEn: 'Leaderboards'
  },
  {
    href: '/admin/webhooks',
    icon: Webhook,
    label: 'الويب هوك',
    labelEn: 'Webhooks'
  },
  {
    href: '/admin/settings',
    icon: Settings,
    label: 'الإعدادات',
    labelEn: 'Settings'
  }
]

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, signOut, userType } = useAuth()

  useEffect(() => {
    // Redirect to sign-in if not authenticated or not admin
    if (!isAuthenticated || userType !== 'admin') {
      router.push('/signin')
    }
  }, [isAuthenticated, userType, router])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            {sidebarOpen ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
          <h1 className="text-xl font-bold text-[#2E2973] dark:text-white">
            ناشئة الشارقة
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link
            href="/signin"
            onClick={signOut}
            className="flex items-center gap-2 px-4 py-2 bg-[#E04511] text-white rounded-lg hover:bg-[#c43a0e] transition-colors"
          >
            <X className="w-4 h-4" />
            <span>خروج</span>
          </Link>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 right-0 bottom-0 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
          sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'
        }`}
      >
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#2E2973] text-white shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-xs opacity-75">{item.labelEn}</span>
                </div>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main
        className={`pt-20 transition-all duration-300 ${
          sidebarOpen ? 'mr-64' : 'mr-0'
        }`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
