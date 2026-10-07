import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Toaster } from 'sonner'
import { BarChart3, Home, Plus, Receipt, Settings as SettingsIcon, Target, Wand2, Users, Sparkles } from 'lucide-react'
import { Dashboard } from './pages/Dashboard'
import { Transactions } from './pages/Transactions'
import { Stats } from './pages/Stats'
import { Budget } from './pages/Budget'
import { BillSplitter } from './pages/BillSplitter'
import { MealPlanner } from './pages/MealPlanner'
import { Settings } from './pages/Settings'
import { TransactionForm } from './components/TransactionForm'
import { MonthSummary } from './components/MonthSummary'
import { PinLockScreen } from './components/PinLockScreen'
import { Modal } from './components/Modal'
import { useStore } from './store/useStore'
import { useUI, type Page } from './store/useUI'
import { cn, formatInputNumber } from './lib/utils'
import { generateDemo } from './lib/demo'
import { toast } from 'sonner'

const NAV: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'dashboard', label: 'Tổng quan', icon: Home },
  { id: 'transactions', label: 'Giao dịch', icon: Receipt },
  { id: 'stats', label: 'Thống kê', icon: BarChart3 },
  { id: 'budget', label: 'Ngân sách', icon: Target },
  { id: 'meal-ai', label: 'Ăn gì hôm nay', icon: Sparkles },
  { id: 'splitter', label: 'Chia tiền', icon: Users },
  { id: 'settings', label: 'Cài đặt', icon: SettingsIcon },
]

function useThemeClass() {
  const theme = useStore((s) => s.theme)
  const [dark, setDark] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const d = theme === 'dark' || (theme === 'system' && mq.matches)
      document.documentElement.classList.toggle('dark', d)
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', d ? '#0b0d14' : '#f5f6fb')
      setDark(d)
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [theme])
  return dark
}

export default function App() {
  const dark = useThemeClass()
  const { page, setPage, openForm, form } = useUI()
  const month = useStore((s) => s.currentMonth)
  const applyRecurring = useStore((s) => s.applyRecurring)
  const recurringCount = useStore((s) => s.recurring.length)

  useEffect(() => {
    const n = applyRecurring(month)
    if (n) toast.info(`Đã tự động ghi ${n} khoản cố định`)
  }, [month, recurringCount, applyRecurring])

  // Keyboard shortcuts (PC): N = new transaction, 1-5 = switch page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || form.open) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openForm() }
      const idx = Number(e.key) - 1
      if (idx >= 0 && idx < NAV.length) setPage(NAV[idx].id)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [form.open, openForm, setPage])

  useEffect(() => { document.getElementById('main')?.scrollTo({ top: 0 }) }, [page])

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200/70 bg-white/70 p-5 backdrop-blur-xl md:flex dark:border-white/5 dark:bg-slate-950/40">
        <div className="mb-8 flex items-center gap-3 px-2">
          <img src="./favicon.svg" className="size-10 rounded-xl shadow-glow" alt="" />
          <div>
            <p className="text-lg leading-tight font-extrabold">Ví Tháng</p>
            <p className="muted text-xs">Quản lý chi tiêu</p>
          </div>
        </div>
        <button onClick={() => openForm()} className="btn-primary mb-6 h-12 w-full">
          <Plus className="size-5" /> Thêm giao dịch
          <kbd className="ml-auto rounded-md bg-white/20 px-1.5 text-[10px]">N</kbd>
        </button>
        <nav className="space-y-1">
          {NAV.map((n, i) => {
            const active = page === n.id
            return (
              <button key={n.id} onClick={() => setPage(n.id)}
                className={cn('relative flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition',
                  active ? 'text-brand-700 dark:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-white/5 dark:hover:text-slate-200')}>
                {active && <motion.span layoutId="nav-active" className="absolute inset-0 rounded-2xl bg-brand-50 dark:bg-brand-500/15" transition={{ type: 'spring', damping: 30, stiffness: 380 }} />}
                <n.icon className="relative size-5" />
                <span className="relative">{n.label}</span>
                <kbd className="relative ml-auto text-[10px] opacity-40">{i + 1}</kbd>
              </button>
            )
          })}
        </nav>
        <div className="mt-auto rounded-3xl bg-linear-to-br from-brand-50 to-fuchsia-50 p-4 dark:from-brand-500/10 dark:to-fuchsia-500/10">
          <p className="text-sm font-bold">💡 Mẹo nhỏ</p>
          <p className="muted mt-1 text-xs leading-relaxed">Gõ "cafe 35k" trong ô nhập nhanh, app sẽ tự nhận số tiền và danh mục.</p>
        </div>
      </aside>

      {/* Main */}
      <main id="main" className="safe-top flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 pt-5 pb-32 md:px-8 md:pt-8 md:pb-10">
          <AnimatePresence mode="wait">
            <motion.div key={page} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.22 }}>
              {page === 'dashboard' && <Dashboard />}
              {page === 'transactions' && <Transactions />}
              {page === 'stats' && <Stats />}
              {page === 'budget' && <Budget />}
              {page === 'meal-ai' && <MealPlanner />}
              {page === 'splitter' && <BillSplitter />}
              {page === 'settings' && <Settings />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/85 backdrop-blur-xl md:hidden dark:border-white/5 dark:bg-slate-950/80">
        <div className="relative grid h-16 grid-cols-5 items-center">
          {NAV.filter((n) => n.id === 'dashboard' || n.id === 'transactions').map((n) => (
            <MobileTab key={n.id} n={n} />
          ))}
          <div className="flex justify-center">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => openForm()}
              className="-mt-8 grid size-15 place-items-center rounded-full bg-linear-to-br from-brand-500 to-fuchsia-600 text-white shadow-glow ring-4 ring-[var(--bg)]">
              <Plus className="size-7" strokeWidth={2.5} />
            </motion.button>
          </div>
          {NAV.filter((n) => n.id === 'stats' || n.id === 'splitter').map((n) => (
            <MobileTab key={n.id} n={n} />
          ))}
        </div>
      </nav>

      <TransactionForm />
      <MonthSummary />
      <Welcome />
      <PinLockScreen />
      <Toaster position="top-center" richColors theme={dark ? 'dark' : 'light'} toastOptions={{ className: 'font-sans! rounded-2xl!' }} />
    </div>
  )
}

function MobileTab({ n }: { n: (typeof NAV)[number] }) {
  const { page, setPage } = useUI()
  const active = page === n.id
  return (
    <button onClick={() => setPage(n.id)} className={cn('flex flex-col items-center gap-1 text-[10px] font-semibold transition', active ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400')}>
      <div className="relative">
        {active && <motion.span layoutId="mtab" className="absolute -inset-x-3 -inset-y-1 rounded-full bg-brand-50 dark:bg-brand-500/15" />}
        <n.icon className="relative size-5" strokeWidth={active ? 2.5 : 2} />
      </div>
      {n.label}
    </button>
  )
}

function Welcome() {
  const onboarded = useStore((s) => s.onboarded)
  const setOnboarded = useStore((s) => s.setOnboarded)
  const setBudget = useStore((s) => s.setBudget)
  const month = useStore((s) => s.currentMonth)
  const [total, setTotal] = useState('')

  const start = () => {
    const v = Number(total.replace(/\D/g, ''))
    if (v) setBudget(month, { total: v, categories: {} })
    setOnboarded(true)
  }

  return (
    <Modal open={!onboarded} onClose={start}>
      <div className="pt-4 text-center">
        <motion.img src="./favicon.svg" className="mx-auto size-20 rounded-3xl shadow-glow" alt=""
          initial={{ rotate: -12, scale: 0.6 }} animate={{ rotate: 0, scale: 1 }} transition={{ type: 'spring', damping: 12 }} />
        <h2 className="mt-5 text-2xl font-extrabold">Chào mừng đến với Ví Tháng 👋</h2>
        <p className="muted mx-auto mt-2 max-w-sm text-sm">Theo dõi chi tiêu, đặt ngân sách và hiểu rõ dòng tiền của bạn mỗi tháng. Dữ liệu chỉ lưu trên thiết bị này.</p>
      </div>
      <div className="mt-6">
        <span className="label">Ngân sách tháng này của bạn là bao nhiêu?</span>
        <div className="relative">
          <input className="input h-14 pr-10 text-lg font-bold" inputMode="numeric" placeholder="VD: 10.000.000" value={total}
            onChange={(e) => setTotal(formatInputNumber(e.target.value))} onKeyDown={(e) => e.key === 'Enter' && start()} />
          <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400">₫</span>
        </div>
      </div>
      <button className="btn-primary mt-5 h-12 w-full text-[15px]" onClick={start}>Bắt đầu</button>
      <button className="btn-ghost mt-2 h-12 w-full" onClick={() => { generateDemo(); toast.success('Đã tạo dữ liệu mẫu, hãy khám phá nhé!') }}>
        <Wand2 className="size-4" /> Dùng thử với dữ liệu mẫu
      </button>
    </Modal>
  )
}
