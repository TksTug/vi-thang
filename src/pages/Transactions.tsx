import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { FileSpreadsheet, Plus, Search, SearchX, X } from 'lucide-react'
import { EmptyState, MonthSwitcher, PageHeader, Segmented } from '../components/ui'
import { GroupedTransactions } from '../components/TransactionList'
import { CategoryIcon } from '../lib/categories'
import { cn, formatVND } from '../lib/utils'
import { sumBy, useMonthTx, useStore } from '../store/useStore'
import { useUI } from '../store/useUI'
import { exportMonthExcel } from '../lib/export'

type Filter = 'all' | 'expense' | 'income'

export function Transactions() {
  const txs = useMonthTx()
  const month = useStore((s) => s.currentMonth)
  const categories = useStore((s) => s.categories)
  const openForm = useUI((s) => s.openForm)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [cat, setCat] = useState<string | null>(null)

  const usedCats = useMemo(() => {
    const ids = new Set(txs.map((t) => t.categoryId))
    return categories.filter((c) => ids.has(c.id) && (filter === 'all' || c.type === filter))
  }, [txs, categories, filter])

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    return txs.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false
      if (cat && t.categoryId !== cat) return false
      if (!s) return true
      const c = categories.find((x) => x.id === t.categoryId)
      return t.note.toLowerCase().includes(s) || c?.name.toLowerCase().includes(s) || String(t.amount).includes(s.replace(/\D/g, '') || '§')
    })
  }, [txs, q, filter, cat, categories])

  const exp = sumBy(filtered, 'expense')
  const inc = sumBy(filtered, 'income')

  return (
    <div>
      <PageHeader
        title="Giao dịch"
        subtitle={`${txs.length} giao dịch trong tháng`}
        right={
          <div className="flex items-center gap-2">
            <button onClick={() => exportMonthExcel(month)} className="btn-ghost h-11 px-3" title="Xuất Excel">
              <FileSpreadsheet className="size-4 text-emerald-600" /> <span className="hidden sm:inline">Xuất Excel</span>
            </button>
            <MonthSwitcher />
          </div>
        }
      />

      <div className="card p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
            <input className="input pl-11" placeholder="Tìm theo ghi chú, danh mục, số tiền..." value={q} onChange={(e) => setQ(e.target.value)} />
            {q && (
              <button onClick={() => setQ('')} className="absolute top-1/2 right-3 grid size-7 -translate-y-1/2 place-items-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10">
                <X className="size-4" />
              </button>
            )}
          </div>
          <Segmented
            className="md:w-80"
            value={filter}
            onChange={(v) => { setFilter(v); setCat(null) }}
            options={[
              { value: 'all', label: 'Tất cả' },
              { value: 'expense', label: 'Chi' },
              { value: 'income', label: 'Thu' },
            ]}
          />
        </div>

        {usedCats.length > 0 && (
          <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {usedCats.map((c) => (
              <button
                key={c.id}
                onClick={() => setCat(cat === c.id ? null : c.id)}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-xs font-semibold transition',
                  cat === c.id ? 'border-transparent text-white' : 'border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/5',
                )}
                style={cat === c.id ? { background: c.color } : undefined}
              >
                <CategoryIcon cat={c} size="sm" className={cn('size-6 rounded-full', cat === c.id && 'bg-white/25! text-white!')} />
                {c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-rose-50 p-3 dark:bg-rose-500/10">
            <p className="text-xs font-medium text-rose-600 dark:text-rose-400">Tổng chi</p>
            <p className="text-lg font-bold text-rose-600 tabular-nums dark:text-rose-400">{formatVND(exp)}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3 dark:bg-emerald-500/10">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Tổng thu</p>
            <p className="text-lg font-bold text-emerald-600 tabular-nums dark:text-emerald-400">{formatVND(inc)}</p>
          </div>
        </div>
      </div>

      <motion.div layout className="card mt-5 p-3">
        {filtered.length === 0 ? (
          txs.length === 0 ? (
            <EmptyState
              icon={<Plus className="size-7" />}
              title="Tháng này chưa có giao dịch"
              action={<button className="btn-primary" onClick={() => openForm()}><Plus className="size-4" /> Thêm giao dịch</button>}
            />
          ) : (
            <EmptyState icon={<SearchX className="size-7" />} title="Không tìm thấy kết quả" desc="Thử từ khoá hoặc bộ lọc khác" />
          )
        ) : (
          <div className="pt-2">
            <GroupedTransactions txs={filtered} />
          </div>
        )}
      </motion.div>
    </div>
  )
}
