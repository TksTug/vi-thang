import { useMemo } from 'react'
import { motion } from 'motion/react'
import { BarChart3, TrendingDown, TrendingUp } from 'lucide-react'
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { addMonths, format, getDay, getDaysInMonth } from 'date-fns'
import { EmptyState, MonthSwitcher, PageHeader, ProgressBar } from '../components/ui'
import { CategoryIcon } from '../lib/categories'
import { cn, formatShort, formatVND, monthKeyOf, monthKeyToDate } from '../lib/utils'
import { spentByCategory, sumBy, useStore } from '../store/useStore'
import { PieTip } from './Dashboard'

const axis = { fontSize: 11, fill: '#94a3b8' }

export function Stats() {
  const month = useStore((s) => s.currentMonth)
  const all = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const getBudget = useStore((s) => s.getBudget)
  useStore((s) => s.budgets)

  const base = monthKeyToDate(month)
  const prevKey = format(addMonths(base, -1), 'yyyy-MM')
  const days = getDaysInMonth(base)
  const txs = useMemo(() => all.filter((t) => t.date.startsWith(month)), [all, month])
  const prev = useMemo(() => all.filter((t) => t.date.startsWith(prevKey)), [all, prevKey])
  const budget = getBudget(month)

  const expense = sumBy(txs, 'expense')
  const prevExpense = sumBy(prev, 'expense')
  const diff = prevExpense ? (expense - prevExpense) / prevExpense : 0

  const daily = useMemo(() => {
    const arr = Array.from({ length: days }, (_, i) => ({ day: i + 1, value: 0 }))
    for (const t of txs) if (t.type === 'expense') arr[Number(t.date.slice(8, 10)) - 1].value += t.amount
    return arr
  }, [txs, days])

  const cumulative = useMemo(() => {
    const prevDays = getDaysInMonth(monthKeyToDate(prevKey))
    const p = Array(31).fill(0)
    for (const t of prev) if (t.type === 'expense') p[Number(t.date.slice(8, 10)) - 1] += t.amount
    const isNow = month === monthKeyOf(new Date())
    const today = new Date().getDate()
    let a = 0, b = 0
    return Array.from({ length: days }, (_, i) => {
      a += daily[i].value
      if (i < prevDays) b += p[i]
      return { day: i + 1, current: isNow && i + 1 > today ? null : a, previous: b }
    })
  }, [daily, prev, prevKey, days, month])

  const trend = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const k = format(addMonths(base, i - 5), 'yyyy-MM')
      const list = all.filter((t) => t.date.startsWith(k))
      return { label: format(monthKeyToDate(k), 'MM/yy'), 'Chi': sumBy(list, 'expense'), 'Thu': sumBy(list, 'income') }
    })
  }, [all, base])

  const byCat = Object.entries(spentByCategory(txs))
    .map(([id, value]) => ({ id, value, cat: categories.find((c) => c.id === id) }))
    .sort((a, b) => b.value - a.value)

  const max = Math.max(1, ...daily.map((d) => d.value))
  const offset = (getDay(base) + 6) % 7 // Monday first
  const perDayBudget = budget.total ? budget.total / days : 0

  return (
    <div className="space-y-5">
      <PageHeader title="Thống kê" subtitle="Phân tích thói quen chi tiêu của bạn" right={<MonthSwitcher />} />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Tổng chi" value={formatVND(expense)} />
        <Kpi label="Tổng thu" value={formatVND(sumBy(txs, 'income'))} />
        <Kpi label="Ngày chi nhiều nhất" value={max > 1 ? `Ngày ${daily.findIndex((d) => d.value === max) + 1}` : '—'} sub={max > 1 ? formatShort(max) : undefined} />
        <Kpi
          label="So với tháng trước"
          value={prevExpense ? `${diff > 0 ? '+' : ''}${(diff * 100).toFixed(0)}%` : '—'}
          tone={prevExpense ? (diff > 0 ? 'bad' : 'good') : undefined}
          icon={prevExpense ? (diff > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />) : undefined}
        />
      </div>

      {txs.length === 0 ? (
        <div className="card"><EmptyState icon={<BarChart3 className="size-7" />} title="Chưa có dữ liệu" desc="Thêm giao dịch để xem biểu đồ phân tích" /></div>
      ) : (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <ChartCard title="Chi tiêu theo ngày" className="lg:col-span-2">
              <ResponsiveContainer height={260}>
                <BarChart data={daily} margin={{ left: -10, right: 4, top: 10 }}>
                  <defs>
                    <linearGradient id="bar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#818cf8" />
                      <stop offset="1" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#94a3b833" />
                  <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} interval={days > 15 ? 2 : 0} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={formatShort} width={56} />
                  <Tooltip cursor={{ fill: '#6366f115', radius: 8 }} content={<Tip prefix="Ngày " />} />
                  {perDayBudget > 0 && <ReferenceLine y={perDayBudget} stroke="#f59e0b" strokeDasharray="6 4" label={{ value: 'Hạn mức/ngày', fill: '#f59e0b', fontSize: 11, position: 'insideTopRight' }} />}
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={22}>
                    {daily.map((d) => <Cell key={d.day} fill={perDayBudget && d.value > perDayBudget ? '#f43f5e' : 'url(#bar)'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Tỷ lệ danh mục">
              <div className="relative h-[260px]">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={byCat} dataKey="value" innerRadius="62%" outerRadius="92%" paddingAngle={3} cornerRadius={8} stroke="none">
                      {byCat.map((p) => <Cell key={p.id} fill={p.cat?.color ?? '#64748b'} />)}
                    </Pie>
                    <Tooltip content={<PieTip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
                  <div><p className="muted text-xs">Tổng chi</p><p className="font-extrabold">{formatShort(expense)}</p></div>
                </div>
              </div>
            </ChartCard>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <ChartCard title="Tích luỹ so với tháng trước">
              <ResponsiveContainer height={240}>
                <AreaChart data={cumulative} margin={{ left: -10, right: 4, top: 10 }}>
                  <defs>
                    <linearGradient id="cur" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="1" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#94a3b833" />
                  <XAxis dataKey="day" tick={axis} tickLine={false} axisLine={false} interval={4} />
                  <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={formatShort} width={56} />
                  <Tooltip content={<Tip prefix="Ngày " />} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  {budget.total > 0 && <ReferenceLine y={budget.total} stroke="#f43f5e" strokeDasharray="6 4" />}
                  <Area name="Tháng trước" dataKey="previous" stroke="#94a3b8" strokeDasharray="5 5" fill="none" strokeWidth={2} dot={false} />
                  <Area name="Tháng này" dataKey="current" stroke="#6366f1" fill="url(#cur)" strokeWidth={3} dot={false} connectNulls={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Lịch chi tiêu">
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                  <div key={d} className="muted pb-1 text-[11px] font-semibold">{d}</div>
                ))}
                {Array.from({ length: offset }).map((_, i) => <div key={'e' + i} />)}
                {daily.map((d) => {
                  const intensity = d.value / max
                  return (
                    <motion.div
                      key={d.day}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: d.day * 0.012 }}
                      title={`Ngày ${d.day}: ${formatVND(d.value)}`}
                      className={cn('group relative grid aspect-square place-items-center rounded-xl text-xs font-semibold', d.value ? '' : 'bg-slate-100 text-slate-400 dark:bg-white/5')}
                      style={d.value ? { background: `rgb(99 102 241 / ${0.15 + intensity * 0.85})`, color: intensity > 0.45 ? '#fff' : undefined } : undefined}
                    >
                      {d.day}
                    </motion.div>
                  )
                })}
              </div>
              <div className="muted mt-4 flex items-center justify-end gap-1.5 text-[11px]">
                Ít {[0.15, 0.35, 0.55, 0.75, 1].map((o) => <span key={o} className="size-3 rounded" style={{ background: `rgb(99 102 241 / ${o})` }} />)} Nhiều
              </div>
            </ChartCard>
          </div>
        </>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Xu hướng 6 tháng">
          <ResponsiveContainer height={240}>
            <BarChart data={trend} margin={{ left: -10, right: 4, top: 10 }} barGap={4}>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#94a3b833" />
              <XAxis dataKey="label" tick={axis} tickLine={false} axisLine={false} />
              <YAxis tick={axis} tickLine={false} axisLine={false} tickFormatter={formatShort} width={56} />
              <Tooltip cursor={{ fill: '#6366f110' }} content={<Tip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Thu" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Chi" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {byCat.length > 0 && (
          <ChartCard title="Chi tiết danh mục">
            <div className="space-y-3.5">
              {byCat.map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <CategoryIcon cat={p.cat} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2 text-sm">
                      <span className="truncate font-medium">{p.cat?.name}</span>
                      <span className="shrink-0 font-semibold tabular-nums">
                        {formatVND(p.value)} <span className="muted ml-1 text-xs font-normal">{((p.value / expense) * 100).toFixed(0)}%</span>
                      </span>
                    </div>
                    <ProgressBar className="mt-1.5 h-1.5" value={p.value / byCat[0].value} color={p.cat?.color} />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>
    </div>
  )
}

function ChartCard({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className={cn('card p-5', className)}>
      <h3 className="mb-4 font-bold">{title}</h3>
      {children}
    </motion.div>
  )
}

function Kpi({ label, value, sub, tone, icon }: { label: string; value: string; sub?: string; tone?: 'good' | 'bad'; icon?: React.ReactNode }) {
  return (
    <div className="card p-4">
      <p className="muted text-xs font-medium">{label}</p>
      <p className={cn('mt-1 flex items-center gap-1 truncate text-lg font-bold tabular-nums', tone === 'good' && 'text-emerald-500', tone === 'bad' && 'text-rose-500')}>
        {icon}{value}
      </p>
      {sub && <p className="muted text-xs">{sub}</p>}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Tip({ active, payload, label, prefix = '' }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg dark:border-white/10 dark:bg-slate-800">
      <p className="mb-1 font-semibold">{prefix}{label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.filter((p: any) => p.value != null).map((p: any) => (
        <p key={p.dataKey} className="flex items-center gap-2 tabular-nums">
          <span className="size-2 rounded-full" style={{ background: p.color === 'url(#bar)' || !p.color ? '#6366f1' : p.color }} />
          {p.name !== 'value' && <span className="muted">{p.name}:</span>} {formatVND(p.value)}
        </p>
      ))}
    </div>
  )
}
