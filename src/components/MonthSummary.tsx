import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { motion } from 'motion/react'
import { addMonths, format } from 'date-fns'
import { Award, Coffee, Flame, PiggyBank, TrendingDown, TrendingUp } from 'lucide-react'
import { Modal } from './Modal'
import { CategoryIcon } from '../lib/categories'
import { formatShort, formatVND, monthKeyToDate, monthLabel } from '../lib/utils'
import { spentByCategory, sumBy, useStore } from '../store/useStore'
import { useUI } from '../store/useUI'

export function MonthSummary() {
  const { summaryOpen, setSummaryOpen } = useUI()
  const month = useStore((s) => s.currentMonth)
  const all = useStore((s) => s.transactions)
  const categories = useStore((s) => s.categories)
  const budget = useStore((s) => s.getBudget)(month)

  const txs = all.filter((t) => t.date.startsWith(month))
  const prevKey = format(addMonths(monthKeyToDate(month), -1), 'yyyy-MM')
  const prev = all.filter((t) => t.date.startsWith(prevKey))
  const exp = sumBy(txs, 'expense')
  const inc = sumBy(txs, 'income')
  const prevExp = sumBy(prev, 'expense')
  const saved = inc - exp
  const savingRate = inc ? saved / inc : 0
  const underBudget = budget.total > 0 && exp <= budget.total
  const byCat = Object.entries(spentByCategory(txs)).sort((a, b) => b[1] - a[1])
  const topCat = categories.find((c) => c.id === byCat[0]?.[0])
  const biggest = [...txs].filter((t) => t.type === 'expense').sort((a, b) => b.amount - a.amount)[0]
  const coffee = txs.filter((t) => t.categoryId === 'coffee').length
  const byDay: Record<string, number> = {}
  for (const t of txs) if (t.type === 'expense') byDay[t.date] = (byDay[t.date] ?? 0) + t.amount
  const maxDay = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]

  const good = underBudget || (inc > 0 && savingRate > 0.1)

  useEffect(() => {
    if (summaryOpen && good && txs.length) {
      const t = setTimeout(() => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#6366f1', '#a855f7', '#ec4899', '#22c55e', '#f59e0b'], zIndex: 9999 })
      }, 350)
      return () => clearTimeout(t)
    }
  }, [summaryOpen, good, txs.length])

  const items = [
    topCat && { icon: <CategoryIcon cat={topCat} size="sm" />, label: 'Chi nhiều nhất cho', value: `${topCat.name} · ${formatShort(byCat[0][1])}` },
    biggest && { icon: <Award className="size-4 text-amber-500" />, label: 'Khoản chi lớn nhất', value: `${biggest.note || 'Không ghi chú'} · ${formatShort(biggest.amount)}` },
    maxDay && { icon: <Flame className="size-4 text-orange-500" />, label: 'Ngày "cháy ví" nhất', value: `${format(new Date(maxDay[0]), 'dd/MM')} · ${formatShort(maxDay[1])}` },
    coffee > 0 && { icon: <Coffee className="size-4 text-amber-700" />, label: 'Số lần cà phê / trà sữa', value: `${coffee} lần ☕` },
    prevExp > 0 && {
      icon: exp > prevExp ? <TrendingUp className="size-4 text-rose-500" /> : <TrendingDown className="size-4 text-emerald-500" />,
      label: 'So với tháng trước',
      value: `${exp > prevExp ? 'Chi nhiều hơn' : 'Tiết kiệm hơn'} ${Math.abs(((exp - prevExp) / prevExp) * 100).toFixed(0)}%`,
    },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[]

  return (
    <Modal open={summaryOpen} onClose={() => setSummaryOpen(false)} title={`Tổng kết ${monthLabel(month).toLowerCase()}`}>
      {txs.length === 0 ? (
        <p className="muted py-10 text-center">Chưa có dữ liệu để tổng kết 📭</p>
      ) : (
        <div className="space-y-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className={good ? 'mesh rounded-3xl p-5 text-center text-white' : 'mesh-danger rounded-3xl p-5 text-center text-white'}>
            <div className="text-4xl">{good ? '🎉' : '😅'}</div>
            <p className="mt-2 text-lg font-bold">{good ? 'Tuyệt vời! Bạn chi tiêu rất hợp lý' : 'Tháng này hơi "mạnh tay" rồi'}</p>
            <p className="text-sm text-white/80">
              {budget.total ? (underBudget ? `Còn dư ${formatVND(budget.total - exp)} so với ngân sách` : `Vượt ngân sách ${formatVND(exp - budget.total)}`) : `Tổng chi ${formatVND(exp)}`}
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10"><p className="muted text-[11px]">Thu</p><p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatShort(inc)}</p></div>
            <div className="rounded-2xl bg-rose-50 p-3 dark:bg-rose-500/10"><p className="muted text-[11px]">Chi</p><p className="text-sm font-bold text-rose-600 dark:text-rose-400">{formatShort(exp)}</p></div>
            <div className="rounded-2xl bg-brand-50 p-3 dark:bg-brand-500/10"><p className="muted flex items-center justify-center gap-1 text-[11px]"><PiggyBank className="size-3" />Tiết kiệm</p><p className="text-sm font-bold text-brand-600 dark:text-brand-400">{inc ? `${(savingRate * 100).toFixed(0)}%` : '—'}</p></div>
          </div>

          <div className="space-y-2">
            {items.map((it, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <div className="grid size-8 shrink-0 place-items-center rounded-xl bg-white dark:bg-white/10">{it.icon}</div>
                <div className="min-w-0"><p className="muted text-xs">{it.label}</p><p className="truncate text-sm font-semibold">{it.value}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  )
}
