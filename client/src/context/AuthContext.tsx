import { createContext, ReactNode, useCallback, useContext, useState } from 'react'
import api from '../services/api'

export type Address = {
  id: string
  label: string
  line1: string
  line2: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

export type UserProfile = {
  name: string
  email: string
  mobile: string
  gender: string
  dob: string
  addresses: Address[]
}

type AuthContextValue = {
  isLoggedIn: boolean
  userProfile: UserProfile | null
  login: (mobile: string) => void
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
  sendOTP: (phone: string) => Promise<any>
  verifyOTP: (phone: string, otp: string) => Promise<any>
  isLoading: boolean
  error: string | null
}

const buildDefaultProfile = (mobile: string): UserProfile => ({
  name: 'User',
  email: '',
  mobile,
  gender: '',
  dob: '',
  addresses: [],
})

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendOTP = useCallback(async (phone: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Validate phone number format
      if (!phone || phone.length < 10) {
        const error = new Error('Invalid phone number format')
        setError(error.message)
        throw error
      }
      
      const result = await api.sendOTP(phone)
      return result
    } catch (err: any) {
      const message = err.message || 'Failed to send OTP'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyOTP = useCallback(async (phone: string, otp: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await api.verifyOTP(phone, otp)
      
      if (result.accessToken) {
        api.setToken(result.accessToken)
        setUserProfile(buildDefaultProfile(phone))
        setIsLoggedIn(true)
      }
      
      return result
    } catch (err: any) {
      const message = err.message || 'Failed to verify OTP'
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const login = useCallback((mobile: string) => {
    setUserProfile(buildDefaultProfile(mobile))
    setIsLoggedIn(true)
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      // Clear token first to prevent any ongoing requests
      api.clearToken()
      // Then notify server
      await api.logout()
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear local state even if server call fails
    } finally {
      setIsLoggedIn(false)
      setUserProfile(null)
      setError(null)
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userProfile,
        login,
        logout,
        updateProfile,
        sendOTP,
        verifyOTP,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
