import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format, getDaysInMonth } from 'date-fns'
import type { Category, MonthBudget, Recurring, Transaction } from '../lib/types'
import { DEFAULT_CATEGORIES } from '../lib/categories'
import { monthKeyOf, monthKeyToDate, uid } from '../lib/utils'

export type Theme = 'light' | 'dark' | 'system'

interface State {
  transactions: Transaction[]
  categories: Category[]
  budgets: Record<string, MonthBudget>
  recurring: Recurring[]
  theme: Theme
  currentMonth: string
  onboarded: boolean

  // Security & PIN Lock
  pinCode: string | null
  isLocked: boolean
  privacyMode: boolean
  setPinCode: (pin: string | null) => void
  unlock: (pin: string) => boolean
  lockApp: () => void
  togglePrivacyMode: () => void

  // Daily Reminder
  reminderEnabled: boolean
  reminderTime: string // HH:mm
  setReminder: (enabled: boolean, time?: string) => void

  setMonth: (k: string) => void
  setTheme: (t: Theme) => void
  setOnboarded: (v: boolean) => void

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => Transaction
  updateTransaction: (id: string, t: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  restoreTransaction: (t: Transaction) => void

  addCategory: (c: Omit<Category, 'id'>) => void
  updateCategory: (id: string, c: Partial<Category>) => void
  deleteCategory: (id: string) => void

  setBudget: (month: string, b: MonthBudget) => void
  getBudget: (month: string) => MonthBudget

  addRecurring: (r: Omit<Recurring, 'id'>) => void
  updateRecurring: (id: string, r: Partial<Recurring>) => void
  deleteRecurring: (id: string) => void
  applyRecurring: (month: string) => number

  importData: (data: Partial<State>) => void
  resetAll: () => void
}

const initial = {
  transactions: [] as Transaction[],
  categories: DEFAULT_CATEGORIES,
  budgets: {} as Record<string, MonthBudget>,
  recurring: [] as Recurring[],
  theme: 'system' as Theme,
  currentMonth: monthKeyOf(new Date()),
  onboarded: false,
  pinCode: null as string | null,
  isLocked: false,
  privacyMode: false,
  reminderEnabled: false,
  reminderTime: '21:00',
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      ...initial,

      setPinCode: (pin) => set({ pinCode: pin, isLocked: false }),
      unlock: (pin) => {
        const { pinCode } = get()
        if (!pinCode || pinCode === pin) {
          set({ isLocked: false })
          return true
        }
        return false
      },
      lockApp: () => {
        const { pinCode } = get()
        if (pinCode) set({ isLocked: true })
      },
      togglePrivacyMode: () => set((s) => ({ privacyMode: !s.privacyMode })),

      setReminder: (enabled, time) =>
        set((s) => ({
          reminderEnabled: enabled,
          reminderTime: time ?? s.reminderTime,
        })),

      setMonth: (k) => set({ currentMonth: k }),
      setTheme: (theme) => set({ theme }),
      setOnboarded: (onboarded) => set({ onboarded }),

      addTransaction: (t) => {
        const tx: Transaction = { ...t, id: uid(), createdAt: Date.now() }
        set((s) => ({ transactions: [tx, ...s.transactions] }))
        return tx
      },
      updateTransaction: (id, t) =>
        set((s) => ({ transactions: s.transactions.map((x) => (x.id === id ? { ...x, ...t } : x)) })),
      deleteTransaction: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),
      restoreTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),

      addCategory: (c) => set((s) => ({ categories: [...s.categories, { ...c, id: uid() }] })),
      updateCategory: (id, c) =>
        set((s) => ({ categories: s.categories.map((x) => (x.id === id ? { ...x, ...c } : x)) })),
      deleteCategory: (id) =>
        set((s) => {
          const cat = s.categories.find((c) => c.id === id)
          const fallback = cat?.type === 'income' ? 'other-in' : 'other'
          return {
            categories: s.categories.filter((c) => c.id !== id),
            transactions: s.transactions.map((t) => (t.categoryId === id ? { ...t, categoryId: fallback } : t)),
          }
        }),

      setBudget: (month, b) => set((s) => ({ budgets: { ...s.budgets, [month]: b } })),
      getBudget: (month) => {
        const { budgets } = get()
        if (budgets[month]) return budgets[month]
        // fall back to most recent previous month budget
        const prev = Object.keys(budgets).filter((k) => k < month).sort().pop()
        return prev ? budgets[prev] : { total: 0, categories: {} }
      },

      addRecurring: (r) => set((s) => ({ recurring: [...s.recurring, { ...r, id: uid() }] })),
      updateRecurring: (id, r) =>
        set((s) => ({ recurring: s.recurring.map((x) => (x.id === id ? { ...x, ...r } : x)) })),
      deleteRecurring: (id) => set((s) => ({ recurring: s.recurring.filter((x) => x.id !== id) })),
      applyRecurring: (month) => {
        const { recurring, transactions } = get()
        const now = monthKeyOf(new Date())
        if (month > now) return 0
        const base = monthKeyToDate(month)
        const days = getDaysInMonth(base)
        const today = new Date().getDate()
        const toAdd: Transaction[] = []
        for (const r of recurring) {
          if (!r.active) continue
          const day = Math.min(r.day, days)
          if (month === now && day > today) continue
          const exists = transactions.some((t) => t.recurringId === r.id && t.date.startsWith(month))
          if (exists) continue
          toAdd.push({
            id: uid(),
            type: r.type,
            amount: r.amount,
            categoryId: r.categoryId,
            date: format(new Date(base.getFullYear(), base.getMonth(), day), 'yyyy-MM-dd'),
            note: r.note,
            method: 'card',
            recurringId: r.id,
            createdAt: Date.now(),
          })
        }
        if (toAdd.length) set((s) => ({ transactions: [...toAdd, ...s.transactions] }))
        return toAdd.length
      },

      importData: (data) =>
        set((s) => ({
          transactions: data.transactions ?? s.transactions,
          categories: data.categories ?? s.categories,
          budgets: data.budgets ?? s.budgets,
          recurring: data.recurring ?? s.recurring,
        })),
      resetAll: () => set({ ...initial, currentMonth: monthKeyOf(new Date()), onboarded: true }),
    }),
    {
      name: 'vi-thang-data',
      version: 1,
      partialize: (s) => ({
        transactions: s.transactions,
        categories: s.categories,
        budgets: s.budgets,
        recurring: s.recurring,
        theme: s.theme,
        onboarded: s.onboarded,
        pinCode: s.pinCode,
        privacyMode: s.privacyMode,
        reminderEnabled: s.reminderEnabled,
        reminderTime: s.reminderTime,
      }),
    },
  ),
)

/* ---------- Derived selectors ---------- */

export function useMonthTx(month?: string) {
  const transactions = useStore((s) => s.transactions)
  const current = useStore((s) => s.currentMonth)
  const m = month ?? current
  return transactions.filter((t) => t.date.startsWith(m))
}

export function sumBy(txs: Transaction[], type: 'expense' | 'income') {
  return txs.reduce((a, t) => (t.type === type ? a + t.amount : a), 0)
}

export function spentByCategory(txs: Transaction[]) {
  const map: Record<string, number> = {}
  for (const t of txs) if (t.type === 'expense') map[t.categoryId] = (map[t.categoryId] ?? 0) + t.amount
  return map
}
