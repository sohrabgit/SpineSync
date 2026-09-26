import { create } from 'zustand'
import type { ExerciseId } from '@/types/recovery'

/** Which exercise the session sheet shows. Shared so Today and Exercises can both start the guided routine. */
export const useExerciseSheet = create<{ openId: ExerciseId | null; open: (id: ExerciseId) => void; close: () => void }>()((set) => ({
  openId: null,
  open: (id) => set({ openId: id }),
  close: () => set({ openId: null }),
}))
