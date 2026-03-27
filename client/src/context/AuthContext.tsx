import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

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
}

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: '1',
    label: 'Home',
    line1: '12, Rajpur Road',
    line2: 'Near City Mall',
    city: 'Dehradun',
    state: 'Uttarakhand',
    pincode: '248001',
    isDefault: true,
  },
  {
    id: '2',
    label: 'Office',
    line1: '5th Floor, Tower B, DLF Cyber City',
    line2: 'Sector 24',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122002',
    isDefault: false,
  },
]

const buildDefaultProfile = (mobile: string): UserProfile => ({
  name: 'Arjun Sharma',
  email: 'arjun.sharma@gmail.com',
  mobile,
  gender: 'Male',
  dob: '1992-04-15',
  addresses: DEFAULT_ADDRESSES,
})

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)

  const login = useCallback((mobile: string) => {
    setUserProfile(buildDefaultProfile(mobile))
    setIsLoggedIn(true)
  }, [])

  const logout = useCallback(() => {
    setIsLoggedIn(false)
    setUserProfile(null)
  }, [])

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setUserProfile((prev) => (prev ? { ...prev, ...patch } : prev))
  }, [])

  return (
    <AuthContext.Provider value={{ isLoggedIn, userProfile, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
