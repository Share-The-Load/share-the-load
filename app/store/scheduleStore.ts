import { create } from "zustand"

interface ScheduleStore {
  isScheduling: boolean
  openScheduler: () => void
  closeScheduler: () => void
  onScheduleComplete: (() => void) | null
  setOnScheduleComplete: (cb: (() => void) | null) => void
}

export const useScheduleStore = create<ScheduleStore>((set) => ({
  isScheduling: false,
  openScheduler: () => set({ isScheduling: true }),
  closeScheduler: () => set({ isScheduling: false }),
  onScheduleComplete: null,
  setOnScheduleComplete: (cb) => set({ onScheduleComplete: cb }),
}))
