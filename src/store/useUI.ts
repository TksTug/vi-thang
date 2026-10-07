import { create } from 'zustand'
import type { Transaction, TxType } from '../lib/types'

export type Page = 'dashboard' | 'transactions' | 'stats' | 'budget' | 'splitter' | 'meal-ai' | 'settings'

interface UIState {
  page: Page
  setPage: (p: Page) => void
  form: { open: boolean; edit?: Transaction; type?: TxType }
  openForm: (opts?: { edit?: Transaction; type?: TxType }) => void
  closeForm: () => void
  summaryOpen: boolean
  setSummaryOpen: (v: boolean) => void
}

export const useUI = create<UIState>()((set) => ({
  page: 'dashboard',
  setPage: (page) => set({ page }),
  form: { open: false },
  openForm: (opts) => set({ form: { open: true, ...opts } }),
  closeForm: () => set((s) => ({ form: { ...s.form, open: false } })),
  summaryOpen: false,
  setSummaryOpen: (summaryOpen) => set({ summaryOpen }),
}))
