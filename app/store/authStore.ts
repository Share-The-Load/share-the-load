import { create } from "zustand"
import { mmkvStorage } from "app/utils/storage"
import { api } from "app/services/api"

const STORAGE_KEY = "auth-storage"

type PersistedState = {
  authToken?: string
  refreshToken?: string
  userId?: number
  userGroupId?: number
  onboardingComplete: boolean
  onboardingStep: number
  pendingInviteCode?: string
}

function loadPersistedState(): Partial<PersistedState> {
  try {
    const raw = mmkvStorage.getString(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed?.state ?? {}
  } catch {
    return {}
  }
}

function savePersistedState(state: PersistedState) {
  try {
    mmkvStorage.set(STORAGE_KEY, JSON.stringify({ state, version: 0 }))
  } catch {}
}

const persisted = loadPersistedState()

interface AuthState {
  authToken: string | undefined
  refreshToken: string | undefined
  userId: number | undefined
  userGroupId: number | undefined
  onboardingComplete: boolean
  onboardingStep: number
  validated: boolean
  pendingInviteCode: string | undefined

  isAuthenticated: boolean
  hasGroup: boolean

  setAuthToken: (value: string | undefined) => void
  setRefreshToken: (value: string | undefined) => void
  setUserId: (value: number | undefined) => void
  setUserGroupId: (value: number | undefined) => void
  setOnboardingComplete: (value: boolean) => void
  setOnboardingStep: (value: number) => void
  setPendingInviteCode: (value: string | undefined) => void
  distributeAuthToken: () => void
  validateAndRefreshToken: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  authToken: persisted.authToken,
  refreshToken: persisted.refreshToken,
  userId: persisted.userId,
  userGroupId: persisted.userGroupId,
  onboardingComplete: persisted.onboardingComplete ?? true,
  onboardingStep: persisted.onboardingStep ?? 0,
  validated: false,
  pendingInviteCode: persisted.pendingInviteCode,

  get isAuthenticated() {
    return !!get().authToken
  },

  get hasGroup() {
    return !!get().userGroupId
  },

  setAuthToken: (value) => set({ authToken: value }),
  setRefreshToken: (value) => set({ refreshToken: value }),
  setUserId: (value) => set({ userId: value }),
  setUserGroupId: (value) => set({ userGroupId: value }),
  setOnboardingComplete: (value) => set({ onboardingComplete: value }),
  setOnboardingStep: (value) => set({ onboardingStep: value }),
  setPendingInviteCode: (value) => set({ pendingInviteCode: value }),

  distributeAuthToken: () => {
    const token = get().authToken
    api.setHeader("Authorization", `Bearer ${token}`)
  },

  validateAndRefreshToken: async () => {
    const { authToken, refreshToken: rt } = get()
    if (!authToken) return

    try {
      await api.validateToken(authToken)
      api.setHeader("Authorization", `Bearer ${authToken}`)
      set({ validated: true })
    } catch {
      if (!rt) {
        get().logout()
        return
      }
      try {
        const response: any = await api.refreshToken(rt)
        set({
          authToken: response.user.token,
          refreshToken: response.user.refreshToken,
          onboardingComplete: response.user.onboardingComplete ?? true,
          validated: true,
        })
        api.setHeader("Authorization", `Bearer ${response.user.token}`)
      } catch {
        console.error("Error refreshing token")
        get().logout()
      }
    }
  },

  logout: () =>
    set({
      authToken: undefined,
      refreshToken: undefined,
      userId: undefined,
      userGroupId: undefined,
      validated: false,
      onboardingComplete: true,
      onboardingStep: 0,
      pendingInviteCode: undefined,
    }),
}))

// Sync persisted fields to MMKV on every state change
useAuthStore.subscribe((state) => {
  savePersistedState({
    authToken: state.authToken,
    refreshToken: state.refreshToken,
    userId: state.userId,
    userGroupId: state.userGroupId,
    onboardingComplete: state.onboardingComplete,
    onboardingStep: state.onboardingStep,
    pendingInviteCode: state.pendingInviteCode,
  })
})
