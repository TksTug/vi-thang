import { motion } from 'motion/react'
import { ArrowDownRight, ArrowUpRight, CalendarClock, Flame, PiggyBank, Plus, Receipt, Settings, Target, Trophy, Sparkles } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { getDaysInMonth } from 'date-fns'
import { AnimatedNumber, EmptyState, MonthSwitcher, ProgressBar } from '../components/ui'
import { GroupedTransactions } from '../components/TransactionList'
import { CategoryIcon } from '../lib/categories'
import { cn, formatShort, formatVND, monthKeyOf, monthKeyToDate } from '../lib/utils'
import { spentByCategory, sumBy, useMonthTx, useStore } from '../store/useStore'
import { useUI } from '../store/useUI'

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } }),
}

export function Dashboard() {
  const month = useStore((s) => s.currentMonth)
  const categories = useStore((s) => s.categories)
  const getBudget = useStore((s) => s.getBudget)
  useStore((s) => s.budgets) // re-render on budget change
  const txs = useMonthTx()
  const { openForm, setPage, setSummaryOpen } = useUI()

  const budget = getBudget(month)
  const expense = sumBy(txs, 'expense')
  const income = sumBy(txs, 'income')
  const remaining = budget.total - expense
  const ratio = budget.total ? expense / budget.total : 0
  const over = budget.total > 0 && remaining < 0

  const date = monthKeyToDate(month)
  const days = getDaysInMonth(date)
  const isNow = month === monthKeyOf(new Date())
  const isPast = month < monthKeyOf(new Date())
  const today = new Date().getDate()
  const daysLeft = isNow ? days - today + 1 : isPast ? 0 : days
  const elapsed = isNow ? today : isPast ? days : 0
  const perDay = daysLeft > 0 && budget.total ? Math.max(0, remaining) / daysLeft : 0
  const avgDay = elapsed ? expense / elapsed : 0

  const byCat = spentByCategory(txs)
  const pie = Object.entries(byCat)
    .map(([id, value]) => ({ id, value, cat: categories.find((c) => c.id === id) }))
    .sort((a, b) => b.value - a.value)
  const top = pie[0]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex w-full items-start justify-between sm:w-auto">
          <div>
            <p className="muted text-sm">{greeting()} 👋</p>
            <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Tổng quan</h1>
          </div>
          <button onClick={() => setPage('settings')} className="grid size-10 place-items-center rounded-2xl bg-white shadow-soft md:hidden dark:bg-white/5" aria-label="Cài đặt">
            <Settings className="size-5" />
          </button>
        </div>
        <MonthSwitcher />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Hero balance card */}
        <motion.div
          custom={0} variants={fadeUp} initial="hidden" animate="show"
          className={cn('relative overflow-hidden rounded-[28px] p-6 text-white shadow-glow lg:col-span-3', over ? 'mesh-danger' : 'mesh')}
        >
          <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 size-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white/80">{budget.total ? (over ? 'Đã vượt ngân sách' : 'Ngân sách còn lại') : 'Tổng đã chi tháng này'}</p>
              <button
                onClick={() => setPage('budget')}
                className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur transition hover:bg-white/25"
              >
                <Target className="size-3.5" /> {budget.total ? formatShort(budget.total) : 'Đặt ngân sách'}
              </button>
            </div>
            <AnimatedNumber
              value={budget.total ? Math.abs(remaining) : expense}
              className="mt-2 block text-4xl font-extrabold tracking-tight md:text-5xl"
            />
            {budget.total > 0 && (
              <div className="mt-5">
                <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    className="h-full rounded-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, ratio * 100)}%` }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-xs text-white/80">
                  <span>Đã dùng {Math.round(ratio * 100)}%</span>
                  {daysLeft > 0 && <span>Còn {daysLeft} ngày</span>}
                </div>
              </div>
            )}
            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/12 p-3 backdrop-blur-md" style={{ background: 'rgb(255 255 255 / .12)' }}>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="grid size-5 place-items-center rounded-full bg-white/20"><ArrowUpRight className="size-3" /></span>
                  Đã chi
                </div>
                <p className="mt-1 text-lg font-bold tabular-nums">{formatVND(expense)}</p>
              </div>
              <div className="rounded-2xl p-3 backdrop-blur-md" style={{ background: 'rgb(255 255 255 / .12)' }}>
                <div className="flex items-center gap-1.5 text-xs text-white/80">
                  <span className="grid size-5 place-items-center rounded-full bg-white/20"><ArrowDownRight className="size-3" /></span>
                  Thu nhập
                </div>
                <p className="mt-1 text-lg font-bold tabular-nums">{formatVND(income)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3 lg:col-span-2 lg:grid-cols-1 lg:gap-4">
          <StatCard i={1} icon={<CalendarClock className="size-5" />} color="#6366f1"
            label="Nên chi mỗi ngày" value={budget.total && daysLeft ? formatVND(perDay) : '—'}
            hint={budget.total ? (daysLeft ? `để không vượt ngân sách` : 'Tháng đã kết thúc') : 'Hãy đặt ngân sách'} />
          <StatCard i={2} icon={<Flame className="size-5" />} color="#f97316"
            label="Trung bình mỗi ngày" value={formatVND(avgDay)} hint={`${txs.filter((t) => t.type === 'expense').length} khoản chi`} />
          <div className="grid grid-cols-2 gap-3 col-span-2 lg:col-span-1">
            <motion.button
              custom={3} variants={fadeUp} initial="hidden" animate="show"
              onClick={() => setSummaryOpen(true)}
              className="card flex items-center gap-3 p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
                <Trophy className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs truncate">Tổng kết tháng</p>
                <p className="muted text-[10px] truncate">Báo cáo & Pháo hoa</p>
              </div>
            </motion.button>

            <motion.button
              custom={4} variants={fadeUp} initial="hidden" animate="show"
              onClick={() => setPage('meal-ai')}
              className="card flex items-center gap-3 p-3.5 text-left transition hover:-translate-y-0.5 hover:shadow-lg bg-linear-to-br from-brand-50/50 to-purple-50/50 dark:from-brand-500/5 dark:to-purple-500/5"
            >
              <div className="grid size-10 place-items-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                <Sparkles className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-xs truncate text-brand-700 dark:text-brand-300">Ăn gì hôm nay? 🍲</p>
                <p className="muted text-[10px] truncate">AI gợi ý theo ví tiền</p>
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Category breakdown */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="show" className="card p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-bold">Chi theo danh mục</h3>
            <button onClick={() => setPage('stats')} className="text-xs font-semibold text-brand-500 hover:underline">Chi tiết</button>
          </div>
          {pie.length === 0 ? (
            <EmptyState icon={<PiggyBank className="size-7" />} title="Chưa có khoản chi" desc="Các khoản chi sẽ được thống kê tại đây" />
          ) : (
            <>
              <div className="relative mx-auto h-52 max-w-[240px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="value" innerRadius="70%" outerRadius="100%" paddingAngle={3} cornerRadius={8} stroke="none">
                      {pie.map((p) => <Cell key={p.id} fill={p.cat?.color ?? '#64748b'} />)}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="muted text-xs">Nhiều nhất</p>
                    <p className="text-sm font-bold">{top?.cat?.name}</p>
                    <p className="text-xs font-semibold text-brand-500">{Math.round((top.value / expense) * 100)}%</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {pie.slice(0, 5).map((p) => {
                  const limit = budget.categories[p.id]
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <CategoryIcon cat={p.cat} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="truncate font-medium">{p.cat?.name}</span>
                          <span className="font-semibold tabular-nums">{formatShort(p.value)}{limit ? <span className="muted font-normal"> / {formatShort(limit)}</span> : null}</span>
                        </div>
                        <ProgressBar className="mt-1.5 h-1.5" value={limit ? p.value / limit : p.value / expense} color={p.cat?.color} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </motion.div>

        {/* Recent transactions */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="show" className="card p-3 lg:col-span-3">
          <div className="mb-1 flex items-center justify-between px-3 pt-2">
            <h3 className="font-bold">Giao dịch gần đây</h3>
            <button onClick={() => setPage('transactions')} className="text-xs font-semibold text-brand-500 hover:underline">Xem tất cả</button>
          </div>
          {txs.length === 0 ? (
            <EmptyState
              icon={<Receipt className="size-7" />}
              title="Chưa có giao dịch nào"
              desc="Bắt đầu ghi lại khoản chi đầu tiên của tháng này nhé!"
              action={<button className="btn-primary" onClick={() => openForm()}><Plus className="size-4" /> Thêm giao dịch</button>}
            />
          ) : (
            <div className="pt-2">
              <GroupedTransactions txs={[...txs].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt).slice(0, 8)} />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

function StatCard({ i, icon, color, label, value, hint }: { i: number; icon: React.ReactNode; color: string; label: string; value: string; hint?: string }) {
  return (
    <motion.div custom={i} variants={fadeUp} initial="hidden" animate="show" className="card flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:gap-4">
      <div className="grid size-11 shrink-0 place-items-center rounded-2xl" style={{ background: `${color}1a`, color }}>{icon}</div>
      <div className="min-w-0">
        <p className="muted text-xs font-medium">{label}</p>
        <p className="truncate text-lg font-bold tabular-nums">{value}</p>
        {hint && <p className="muted truncate text-[11px]">{hint}</p>}
      </div>
    </motion.div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function PieTip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-slate-800">
      <p className="font-semibold">{p.cat?.name ?? p.name}</p>
      <p className="tabular-nums">{formatVND(p.value)}</p>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 11) return 'Chào buổi sáng'
  if (h < 14) return 'Chào buổi trưa'
  if (h < 18) return 'Chào buổi chiều'
  return 'Chào buổi tối'
}
