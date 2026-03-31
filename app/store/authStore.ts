import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { api } from "app/services/api"

interface AuthState {
  authToken: string | undefined
  refreshToken: string | undefined
  userId: number | undefined
  userGroupId: number | undefined
  validated: boolean

  isAuthenticated: boolean
  hasGroup: boolean

  setAuthToken: (value: string | undefined) => void
  setRefreshToken: (value: string | undefined) => void
  setUserId: (value: number | undefined) => void
  setUserGroupId: (value: number | undefined) => void
  setIsValidated: (value: boolean) => void
  distributeAuthToken: () => void
  validateAndRefreshToken: () => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      authToken: undefined,
      refreshToken: undefined,
      userId: undefined,
      userGroupId: undefined,
      validated: false,

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
      setIsValidated: (value) => set({ validated: value }),

      distributeAuthToken: () => {
        const token = get().authToken
        api.setHeader("Authorization", `Bearer ${token}`)
      },

      validateAndRefreshToken: async () => {
        const { authToken, validated, refreshToken: rt } = get()
        if (!authToken || validated) return

        try {
          await api.validateToken(authToken)
          api.setHeader("Authorization", `Bearer ${authToken}`)
          set({ validated: true })
        } catch {
          try {
            const response: any = await api.refreshToken(rt)
            set({
              authToken: response.token,
              refreshToken: response.refreshToken,
              validated: true,
            })
            api.setHeader("Authorization", `Bearer ${response.token}`)
          } catch {
            console.error("Error refreshing token")
            set({ validated: false })
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
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        authToken: state.authToken,
        refreshToken: state.refreshToken,
        userId: state.userId,
        userGroupId: state.userGroupId,
      }),
    },
  ),
)
