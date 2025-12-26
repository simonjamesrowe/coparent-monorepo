/**
 * Task 8.1: Zustand store for family context
 * Global state management for user, family, role, and authentication context
 * See: spec.md "State Management" (lines 1142-1179)
 */

import { create } from 'zustand'
import { User, Family, Parent } from '@/types'

export interface FamilyStore {
  // User context
  user: User | null
  setUser: (user: User | null) => void

  // Family context
  family: Family | null
  setFamily: (family: Family | null) => void

  // Parent role context
  role: 'ADMIN_PARENT' | 'CO_PARENT' | null
  setRole: (role: 'ADMIN_PARENT' | 'CO_PARENT' | null) => void

  // Authentication state
  isAuthenticated: boolean
  setIsAuthenticated: (value: boolean) => void

  // Loading states
  isLoading: boolean
  setIsLoading: (value: boolean) => void

  // Clear all context (logout)
  clearContext: () => void

  // Helper to check if user has admin role
  isAdmin: () => boolean
}

export const useFamilyStore = create<FamilyStore>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  family: null,
  setFamily: (family) => set({ family }),

  role: null,
  setRole: (role) => set({ role }),

  isAuthenticated: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),

  isLoading: true,
  setIsLoading: (value) => set({ isLoading: value }),

  clearContext: () => {
    set({
      user: null,
      family: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    })
  },

  isAdmin: () => {
    return get().role === 'ADMIN_PARENT'
  },
}))

/**
 * Hook for accessing user context
 */
export const useUser = () => {
  const user = useFamilyStore((state) => state.user)
  const setUser = useFamilyStore((state) => state.setUser)
  return { user, setUser }
}

/**
 * Hook for accessing family context
 */
export const useFamily = () => {
  const family = useFamilyStore((state) => state.family)
  const setFamily = useFamilyStore((state) => state.setFamily)
  const role = useFamilyStore((state) => state.role)
  const isAuthenticated = useFamilyStore((state) => state.isAuthenticated)
  const isLoading = useFamilyStore((state) => state.isLoading)
  const isAdmin = useFamilyStore((state) => state.isAdmin)

  return {
    family,
    setFamily,
    role,
    isAuthenticated,
    isLoading,
    isAdmin: isAdmin(),
  }
}

/**
 * Hook for accessing authentication state
 */
export const useAuth = () => {
  const isAuthenticated = useFamilyStore((state) => state.isAuthenticated)
  const isLoading = useFamilyStore((state) => state.isLoading)
  const setIsAuthenticated = useFamilyStore((state) => state.setIsAuthenticated)
  const clearContext = useFamilyStore((state) => state.clearContext)

  return {
    isAuthenticated,
    isLoading,
    setIsAuthenticated,
    clearContext,
  }
}
