import { create } from 'zustand'

/** Open state of the movement-break sheet, shared by the Work mode card and the app-wide bar. */
export const useBreakSheet = create<{ open: boolean; show: () => void; hide: () => void }>()((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}))
