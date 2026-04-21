'use client'

import * as React from 'react'
import { useSession, signIn as nextAuthSignIn, signOut as nextAuthSignOut } from 'next-auth/react'

type UserType = 'admin' | 'member' | null

interface AuthContextType {
  isAuthenticated: boolean
  userType: UserType
  userName: string | null
  signIn: (type: UserType, email: string, password: string) => Promise<{ error?: string }>
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const userType = (session?.user as { role?: string } | undefined)?.role === 'admin'
    ? 'admin'
    : (session?.user as { role?: string } | undefined)?.role === 'member'
      ? 'member'
      : null
  const userName = session?.user?.name ?? null

  const signIn = async (type: UserType, email: string, password: string) => {
    const result = await nextAuthSignIn(type ?? 'admin', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      return { error: 'بيانات الدخول غير صحيحة' }
    }

    return {}
  }

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: '/signin' })
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, userName, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
