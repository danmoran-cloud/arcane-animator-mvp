'use client'

import { createContext, useContext, useReducer, useCallback, useEffect, type ReactNode } from 'react'

// Types
export type UserTier = 'free' | 'apprentice' | 'master'

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  tier: UserTier
  tokens: number
  createdAt: string
}

export interface TierInfo {
  name: string
  price: number
  monthlyTokens: number
  features: string[]
  exportFormats: string[]
  watermark: boolean
}

export const TIER_INFO: Record<UserTier, TierInfo> = {
  free: {
    name: 'Free Adventurer',
    price: 0,
    monthlyTokens: 3,
    features: [
      '3 exports per month',
      'WebM format only',
      'Watermarked exports',
      'Basic effects library',
    ],
    exportFormats: ['webm'],
    watermark: true,
  },
  apprentice: {
    name: 'Apprentice Cartographer',
    price: 9,
    monthlyTokens: 25,
    features: [
      '25 exports per month',
      'WebM & GIF formats',
      'No watermarks',
      'Full effects library',
      'Priority rendering',
    ],
    exportFormats: ['webm', 'gif'],
    watermark: false,
  },
  master: {
    name: 'Master Cartographer',
    price: 19,
    monthlyTokens: 100,
    features: [
      '100 exports per month',
      'All formats (WebM, GIF, MP4)',
      'No watermarks',
      'Full effects library',
      'Priority rendering',
      '4K export resolution',
      'Commercial license',
    ],
    exportFormats: ['webm', 'gif', 'mp4'],
    watermark: false,
  },
}

export const TOKEN_COSTS = {
  webm: 1,
  gif: 2,
  mp4: 3,
} as const

export type ExportFormat = keyof typeof TOKEN_COSTS

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthModalOpen: boolean
  authModalMode: 'login' | 'signup'
  isUpgradeModalOpen: boolean
  isExportModalOpen: boolean
}

type AuthAction =
  | { type: 'SET_LOADING'; isLoading: boolean }
  | { type: 'SET_USER'; user: User | null }
  | { type: 'UPDATE_TOKENS'; tokens: number }
  | { type: 'OPEN_AUTH_MODAL'; mode: 'login' | 'signup' }
  | { type: 'CLOSE_AUTH_MODAL' }
  | { type: 'OPEN_UPGRADE_MODAL' }
  | { type: 'CLOSE_UPGRADE_MODAL' }
  | { type: 'OPEN_EXPORT_MODAL' }
  | { type: 'CLOSE_EXPORT_MODAL' }
  | { type: 'UPGRADE_TIER'; tier: UserTier }

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalMode: 'login',
  isUpgradeModalOpen: false,
  isExportModalOpen: false,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.isLoading }
    case 'SET_USER':
      return { ...state, user: action.user, isLoading: false }
    case 'UPDATE_TOKENS':
      if (!state.user) return state
      return { ...state, user: { ...state.user, tokens: action.tokens } }
    case 'OPEN_AUTH_MODAL':
      return { ...state, isAuthModalOpen: true, authModalMode: action.mode }
    case 'CLOSE_AUTH_MODAL':
      return { ...state, isAuthModalOpen: false }
    case 'OPEN_UPGRADE_MODAL':
      return { ...state, isUpgradeModalOpen: true }
    case 'CLOSE_UPGRADE_MODAL':
      return { ...state, isUpgradeModalOpen: false }
    case 'OPEN_EXPORT_MODAL':
      return { ...state, isExportModalOpen: true }
    case 'CLOSE_EXPORT_MODAL':
      return { ...state, isExportModalOpen: false }
    case 'UPGRADE_TIER':
      if (!state.user) return state
      const tierInfo = TIER_INFO[action.tier]
      return {
        ...state,
        user: {
          ...state.user,
          tier: action.tier,
          tokens: tierInfo.monthlyTokens,
        },
        isUpgradeModalOpen: false,
      }
    default:
      return state
  }
}

interface AuthContextType {
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<boolean>
  signup: (email: string, password: string, name: string) => Promise<boolean>
  logout: () => void
  openAuthModal: (mode: 'login' | 'signup') => void
  closeAuthModal: () => void
  openUpgradeModal: () => void
  closeUpgradeModal: () => void
  openExportModal: () => void
  closeExportModal: () => void
  upgradeTier: (tier: UserTier) => void
  useToken: (format: ExportFormat) => boolean
  canExport: (format: ExportFormat) => boolean
  getTierInfo: () => TierInfo
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'arcane-animator-user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const user = JSON.parse(stored) as User
        dispatch({ type: 'SET_USER', user })
      } catch {
        dispatch({ type: 'SET_LOADING', isLoading: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', isLoading: false })
    }
  }, [])

  // Save user to localStorage when it changes
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [state.user])

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', isLoading: true })
    
    // Mock login - simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Create mock user
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      tier: 'free',
      tokens: TIER_INFO.free.monthlyTokens,
      createdAt: new Date().toISOString(),
    }
    
    dispatch({ type: 'SET_USER', user })
    dispatch({ type: 'CLOSE_AUTH_MODAL' })
    return true
  }, [])

  const signup = useCallback(async (email: string, _password: string, name: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', isLoading: true })
    
    // Mock signup - simulate API call
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const user: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      tier: 'free',
      tokens: TIER_INFO.free.monthlyTokens,
      createdAt: new Date().toISOString(),
    }
    
    dispatch({ type: 'SET_USER', user })
    dispatch({ type: 'CLOSE_AUTH_MODAL' })
    return true
  }, [])

  const logout = useCallback(() => {
    dispatch({ type: 'SET_USER', user: null })
  }, [])

  const openAuthModal = useCallback((mode: 'login' | 'signup') => {
    dispatch({ type: 'OPEN_AUTH_MODAL', mode })
  }, [])

  const closeAuthModal = useCallback(() => {
    dispatch({ type: 'CLOSE_AUTH_MODAL' })
  }, [])

  const openUpgradeModal = useCallback(() => {
    dispatch({ type: 'OPEN_UPGRADE_MODAL' })
  }, [])

  const closeUpgradeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_UPGRADE_MODAL' })
  }, [])

  const openExportModal = useCallback(() => {
    dispatch({ type: 'OPEN_EXPORT_MODAL' })
  }, [])

  const closeExportModal = useCallback(() => {
    dispatch({ type: 'CLOSE_EXPORT_MODAL' })
  }, [])

  const upgradeTier = useCallback((tier: UserTier) => {
    // In production, this would call Stripe checkout
    dispatch({ type: 'UPGRADE_TIER', tier })
  }, [])

  const useToken = useCallback((format: ExportFormat): boolean => {
    if (!state.user) return false
    const cost = TOKEN_COSTS[format]
    if (state.user.tokens < cost) return false
    dispatch({ type: 'UPDATE_TOKENS', tokens: state.user.tokens - cost })
    return true
  }, [state.user])

  const canExport = useCallback((format: ExportFormat): boolean => {
    if (!state.user) return false
    const tierInfo = TIER_INFO[state.user.tier]
    const hasFormat = tierInfo.exportFormats.includes(format)
    const hasTokens = state.user.tokens >= TOKEN_COSTS[format]
    return hasFormat && hasTokens
  }, [state.user])

  const getTierInfo = useCallback((): TierInfo => {
    return TIER_INFO[state.user?.tier || 'free']
  }, [state.user])

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        signup,
        logout,
        openAuthModal,
        closeAuthModal,
        openUpgradeModal,
        closeUpgradeModal,
        openExportModal,
        closeExportModal,
        upgradeTier,
        useToken,
        canExport,
        getTierInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
