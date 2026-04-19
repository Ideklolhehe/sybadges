'use client'

import * as React from 'react'

type UserType = 'admin' | 'member' | null

interface AuthContextType {
  isAuthenticated: boolean
  userType: UserType
  userName: string | null
  signIn: (type: UserType, email: string, password: string) => Promise<void>
  signOut: () => void
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('isAuthenticated') === 'true'
    }
    return false
  })

  const [userType, setUserType] = React.useState<UserType>(() => {
    if (typeof window !== 'undefined') {
      const type = sessionStorage.getItem('userType') as UserType
      return type || null
    }
    return null
  })

  const [userName, setUserName] = React.useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('userName') || null
    }
    return null
  })

  const signIn = async (type: UserType, email: string, password: string) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('isAuthenticated', 'true')
          sessionStorage.setItem('userType', type)
          sessionStorage.setItem('userName', email)
        }
        setIsAuthenticated(true)
        setUserType(type)
        setUserName(email)
        resolve()
      }, 500)
    })
  }

  const signOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('isAuthenticated')
      sessionStorage.removeItem('userType')
      sessionStorage.removeItem('userName')
    }
    setIsAuthenticated(false)
    setUserType(null)
    setUserName(null)
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
