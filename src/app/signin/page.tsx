'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, Users, Mail, Lock, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function SignInPage() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [userType, setUserType] = useState<'admin' | 'member' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (type: 'admin' | 'member') => {
    if (!email || !password) return
    setLoading(true)
    setError(null)

    const result = await signIn(type, email, password)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (type === 'admin') {
      router.push('/admin/dashboard')
    } else {
      router.push('/member')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(46, 41, 115, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(46, 41, 115, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-[#2E2973]/10 rounded-full blur-[120px] pointer-events-none dark:bg-[#2E2973]/20" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-[#E04511]/10 rounded-full blur-[120px] pointer-events-none dark:bg-[#E04511]/20" />

      <div className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-50 flex items-center justify-between px-6">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-gray-900 dark:text-white">عودة</span>
        </button>
        <h1 className="text-xl font-bold text-[#2E2973] dark:text-white">
          تسجيل الدخول
        </h1>
        <ThemeToggle />
      </div>

      <div className="relative z-10 min-h-screen pt-24 pb-12 px-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl mx-auto"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setUserType('admin')}
              className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all ${
                userType === 'admin'
                  ? 'bg-gradient-to-br from-[#2E2973] to-[#1f1b4d] text-white shadow-2xl border-4 border-[#E04511]'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#E04511] hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                  userType === 'admin' ? 'bg-white/20' : 'bg-[#2E2973]/10'
                }`}>
                  <Shield className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">تسجيل دخول الإدارة</h2>
                <p className={`text-sm mb-6 ${userType === 'admin' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                  للمسؤولين والمشرفين فقط
                </p>

                {userType === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full space-y-4"
                  >
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني
                      </label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@sharjah.youth"
                        className="bg-white/90 dark:bg-gray-900/90 border-white/30 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4" />
                        كلمة المرور
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••"
                        className="bg-white/90 dark:bg-gray-900/90 border-white/30 dark:border-gray-600"
                      />
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={() => handleSignIn('admin')}
                  disabled={loading || !email || !password || userType !== 'admin'}
                  className="w-full bg-white text-[#2E2973] hover:bg-gray-100 font-bold py-6 mt-4"
                >
                  {loading && userType === 'admin' ? 'جاري تسجيل الدخول...' : 'دخول لوحة التحكم'}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setUserType('member')}
              className={`relative overflow-hidden rounded-3xl p-8 cursor-pointer transition-all ${
                userType === 'member'
                  ? 'bg-gradient-to-br from-[#E04511] to-[#c43a0e] text-white shadow-2xl border-4 border-[#2E2973]'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-[#2E2973] hover:shadow-xl'
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
                  userType === 'member' ? 'bg-white/20' : 'bg-[#E04511]/10'
                }`}>
                  <Users className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold mb-2">تسجيل دخول المنتسبين</h2>
                <p className={`text-sm mb-6 ${userType === 'member' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                  للناشئة وأعضاء البوابة
                </p>

                {userType === 'member' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="w-full space-y-4"
                  >
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Mail className="w-4 h-4" />
                        البريد الإلكتروني أو رقم العضوية
                      </label>
                      <Input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@sharjah.youth"
                        className="bg-white/90 dark:bg-gray-900/90 border-white/30 dark:border-gray-600"
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium mb-2">
                        <Lock className="w-4 h-4" />
                        كلمة المرور
                      </label>
                      <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="•••••"
                        className="bg-white/90 dark:bg-gray-900/90 border-white/30 dark:border-gray-600"
                      />
                    </div>
                  </motion.div>
                )}

                <Button
                  onClick={() => handleSignIn('member')}
                  disabled={loading || !email || !password || userType !== 'member'}
                  className="w-full bg-white text-[#E04511] hover:bg-gray-100 font-bold py-6 mt-4"
                >
                  {loading && userType === 'member' ? 'جاري تسجيل الدخول...' : 'دخول بوابتي'}
                </Button>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              إذا نسيت كلمة المرور، تواصل مع المسؤول عن طريق النماذج في البوابة
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
