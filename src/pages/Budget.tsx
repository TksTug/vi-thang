import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { CalendarSync, Pencil, Plus, Repeat, Target, Trash2, Wallet } from 'lucide-react'
import { EmptyState, MonthSwitcher, PageHeader, ProgressBar, Segmented } from '../components/ui'
import { Modal } from '../components/Modal'
import { CategoryIcon } from '../lib/categories'
import type { Recurring, TxType } from '../lib/types'
import { cn, formatInputNumber, formatShort, formatVND, monthLabel } from '../lib/utils'
import { spentByCategory, sumBy, useMonthTx, useStore } from '../store/useStore'

const num = (s: string) => Number(s.replace(/\D/g, '')) || 0

export function Budget() {
  const month = useStore((s) => s.currentMonth)
  const categories = useStore((s) => s.categories)
  const getBudget = useStore((s) => s.getBudget)
  const setBudget = useStore((s) => s.setBudget)
  useStore((s) => s.budgets)
  const txs = useMonthTx()
  const budget = getBudget(month)
  const spent = spentByCategory(txs)
  const expense = sumBy(txs, 'expense')
  const allocated = Object.values(budget.categories).reduce((a, b) => a + b, 0)

  const [editing, setEditing] = useState(false)

  const expenseCats = categories.filter((c) => c.type === 'expense')

  return (
    <div className="space-y-5">
      <PageHeader title="Ngân sách" subtitle="Lên kế hoạch chi tiêu cho từng tháng" right={<MonthSwitcher />} />

      <div className="grid gap-5 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-6 lg:col-span-1">
          <div className="flex items-start justify-between">
            <div className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Wallet className="size-6" />
            </div>
            <button className="btn-ghost h-9 px-3 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="size-3.5" /> Chỉnh sửa
            </button>
          </div>
          <p className="muted mt-4 text-sm">Ngân sách {monthLabel(month).toLowerCase()}</p>
          <p className="text-3xl font-extrabold tracking-tight tabular-nums">{budget.total ? formatVND(budget.total) : 'Chưa đặt'}</p>
          {budget.total > 0 && (
            <>
              <ProgressBar className="mt-4 h-3" value={expense / budget.total} />
              <div className="mt-2 flex justify-between text-sm">
                <span className="muted">Đã chi {formatShort(expense)}</span>
                <span className={cn('font-semibold', budget.total - expense < 0 ? 'text-rose-500' : 'text-emerald-500')}>
                  {budget.total - expense < 0 ? 'Vượt ' : 'Còn '}{formatShort(Math.abs(budget.total - expense))}
                </span>
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-sm dark:bg-white/5">
                <div className="flex justify-between"><span className="muted">Đã phân bổ</span><span className="font-semibold tabular-nums">{formatVND(allocated)}</span></div>
                <div className="mt-1 flex justify-between"><span className="muted">Chưa phân bổ</span><span className="font-semibold tabular-nums">{formatVND(Math.max(0, budget.total - allocated))}</span></div>
              </div>
            </>
          )}
          {!budget.total && (
            <button className="btn-primary mt-5 w-full" onClick={() => setEditing(true)}>
              <Target className="size-4" /> Đặt ngân sách ngay
            </button>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="card p-5 lg:col-span-2">
          <h3 className="mb-4 font-bold">Hạn mức theo danh mục</h3>
          <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
            {expenseCats.map((c) => {
              const lim = budget.categories[c.id] ?? 0
              const sp = spent[c.id] ?? 0
              if (!lim && !sp) return null
              const r = lim ? sp / lim : 0
              return (
                <div key={c.id} className="flex items-center gap-3">
                  <CategoryIcon cat={c} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2 text-sm">
                      <span className="truncate font-semibold">{c.name}</span>
                      <span className="shrink-0 text-xs tabular-nums">
                        <b>{formatShort(sp)}</b>
                        <span className="muted"> / {lim ? formatShort(lim) : '∞'}</span>
                      </span>
                    </div>
                    <ProgressBar className="mt-1.5" value={lim ? r : 0} color={c.color} />
                    {lim > 0 && (
                      <p className={cn('mt-1 text-[11px]', r >= 1 ? 'text-rose-500' : r >= 0.8 ? 'text-amber-500' : 'muted')}>
                        {r >= 1 ? `Vượt ${formatShort(sp - lim)}` : `Còn ${formatShort(lim - sp)} · ${Math.round(r * 100)}%`}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {!allocated && !expense && (
            <EmptyState icon={<Target className="size-7" />} title="Chưa có hạn mức" desc="Chia ngân sách cho từng danh mục để kiểm soát tốt hơn" />
          )}
        </motion.div>
      </div>

      <RecurringSection />

      <BudgetEditor open={editing} onClose={() => setEditing(false)} month={month} initial={budget}
        onSave={(b) => { setBudget(month, b); setEditing(false); toast.success('Đã lưu ngân sách') }} />
    </div>
  )
}

function BudgetEditor({ open, onClose, month, initial, onSave }: {
  open: boolean; onClose: () => void; month: string
  initial: { total: number; categories: Record<string, number> }
  onSave: (b: { total: number; categories: Record<string, number> }) => void
}) {
  const categories = useStore((s) => s.categories).filter((c) => c.type === 'expense')
  const [total, setTotal] = useState('')
  const [lims, setLims] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!open) return
    setTotal(initial.total ? formatInputNumber(String(initial.total)) : '')
    setLims(Object.fromEntries(Object.entries(initial.categories).map(([k, v]) => [k, formatInputNumber(String(v))])))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const allocated = Object.values(lims).reduce((a, v) => a + num(v), 0)
  const t = num(total)

  const save = () => {
    const cats: Record<string, number> = {}
    for (const [k, v] of Object.entries(lims)) if (num(v)) cats[k] = num(v)
    onSave({ total: t, categories: cats })
  }

  return (
    <Modal open={open} onClose={onClose} title={`Ngân sách ${monthLabel(month).toLowerCase()}`}
      footer={<button className="btn-primary h-12 w-full" onClick={save}>Lưu ngân sách</button>}>
      <span className="label">Tổng ngân sách tháng</span>
      <div className="relative">
        <input className="input h-14 pr-10 text-xl font-bold" inputMode="numeric" placeholder="VD: 10.000.000" value={total}
          onChange={(e) => setTotal(formatInputNumber(e.target.value))} />
        <span className="absolute top-1/2 right-4 -translate-y-1/2 font-bold text-slate-400">₫</span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {[5, 8, 10, 15, 20].map((m) => (
          <button key={m} onClick={() => setTotal(formatInputNumber(String(m * 1_000_000)))}
            className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5">{m} triệu</button>
        ))}
      </div>

      <div className="mt-6 mb-2 flex items-center justify-between">
        <span className="label mb-0">Hạn mức danh mục</span>
        <span className={cn('text-xs font-semibold', t && allocated > t ? 'text-rose-500' : 'muted')}>
          {formatShort(allocated)} / {t ? formatShort(t) : '—'}
        </span>
      </div>
      {t > 0 && <ProgressBar className="mb-4" value={allocated / t} />}
      <div className="space-y-2">
        {categories.map((c) => (
          <div key={c.id} className="flex items-center gap-3">
            <CategoryIcon cat={c} size="sm" />
            <span className="flex-1 truncate text-sm font-medium">{c.name}</span>
            <input className="input h-10 w-36 text-right text-sm" inputMode="numeric" placeholder="0"
              value={lims[c.id] ?? ''} onChange={(e) => setLims({ ...lims, [c.id]: formatInputNumber(e.target.value) })} />
          </div>
        ))}
      </div>
    </Modal>
  )
}

function RecurringSection() {
  const recurring = useStore((s) => s.recurring)
  const categories = useStore((s) => s.categories)
  const update = useStore((s) => s.updateRecurring)
  const remove = useStore((s) => s.deleteRecurring)
  const [edit, setEdit] = useState<Recurring | null | 'new'>(null)

  const monthlyOut = recurring.filter((r) => r.active && r.type === 'expense').reduce((a, r) => a + r.amount, 0)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 font-bold"><Repeat className="size-4 text-brand-500" /> Khoản cố định hàng tháng</h3>
          <p className="muted text-xs">Tự động ghi vào mỗi tháng · Tổng chi cố định: <b>{formatVND(monthlyOut)}</b></p>
        </div>
        <button className="btn-primary h-10 px-4" onClick={() => setEdit('new')}><Plus className="size-4" /> Thêm</button>
      </div>
      {recurring.length === 0 ? (
        <EmptyState icon={<CalendarSync className="size-7" />} title="Chưa có khoản cố định" desc="VD: tiền nhà, điện nước, Netflix, lương..." />
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {recurring.map((r) => {
            const c = categories.find((x) => x.id === r.categoryId)
            return (
              <div key={r.id} className={cn('flex items-center gap-3 rounded-2xl border border-slate-100 p-3 transition dark:border-white/5', !r.active && 'opacity-50')}>
                <CategoryIcon cat={c} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{r.note || c?.name}</p>
                  <p className="muted text-xs">Ngày {r.day} hàng tháng · <span className={r.type === 'income' ? 'text-emerald-500' : ''}>{r.type === 'income' ? '+' : '−'}{formatVND(r.amount)}</span></p>
                </div>
                <Toggle checked={r.active} onChange={(v) => update(r.id, { active: v })} />
                <button className="grid size-8 place-items-center rounded-xl hover:bg-slate-100 dark:hover:bg-white/10" onClick={() => setEdit(r)}><Pencil className="size-4" /></button>
                <button className="grid size-8 place-items-center rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={() => { remove(r.id); toast('Đã xoá khoản cố định') }}><Trash2 className="size-4" /></button>
              </div>
            )
          })}
        </div>
      )}
      <RecurringEditor value={edit} onClose={() => setEdit(null)} />
    </motion.div>
  )
}

function RecurringEditor({ value, onClose }: { value: Recurring | null | 'new'; onClose: () => void }) {
  const categories = useStore((s) => s.categories)
  const add = useStore((s) => s.addRecurring)
  const update = useStore((s) => s.updateRecurring)
  const apply = useStore((s) => s.applyRecurring)
  const month = useStore((s) => s.currentMonth)
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('housing')
  const [day, setDay] = useState(1)
  const [note, setNote] = useState('')

  useEffect(() => {
    if (!value) return
    if (value === 'new') { setType('expense'); setAmount(''); setCategoryId('housing'); setDay(1); setNote('') }
    else { setType(value.type); setAmount(formatInputNumber(String(value.amount))); setCategoryId(value.categoryId); setDay(value.day); setNote(value.note) }
  }, [value])

  const save = () => {
    if (!num(amount)) return toast.error('Vui lòng nhập số tiền')
    const data = { type, amount: num(amount), categoryId, day, note: note.trim(), active: true }
    if (value === 'new') add(data)
    else if (value) update(value.id, data)
    const n = apply(month)
    toast.success('Đã lưu khoản cố định', { description: n ? `Đã tự động ghi ${n} giao dịch cho tháng này` : undefined })
    onClose()
  }

  const cats = categories.filter((c) => c.type === type)

  return (
    <Modal open={!!value} onClose={onClose} title={value === 'new' ? 'Thêm khoản cố định' : 'Sửa khoản cố định'}
      footer={<button className="btn-primary h-12 w-full" onClick={save}>Lưu</button>}>
      <div className="space-y-4">
        <Segmented value={type} onChange={(t) => { setType(t); setCategoryId(categories.find((c) => c.type === t)?.id ?? '') }}
          options={[{ value: 'expense', label: 'Khoản chi' }, { value: 'income', label: 'Khoản thu' }]} />
        <div>
          <span className="label">Tên khoản</span>
          <input className="input" placeholder="VD: Tiền nhà, Netflix, Lương..." value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Số tiền</span>
            <input className="input font-semibold" inputMode="numeric" placeholder="0" value={amount} onChange={(e) => setAmount(formatInputNumber(e.target.value))} />
          </div>
          <div>
            <span className="label">Ngày trong tháng</span>
            <select className="input" value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {Array.from({ length: 28 }, (_, i) => <option key={i + 1} value={i + 1}>Ngày {i + 1}</option>)}
            </select>
          </div>
        </div>
        <div>
          <span className="label">Danh mục</span>
          <div className="grid grid-cols-4 gap-2">
            {cats.map((c) => (
              <button key={c.id} onClick={() => setCategoryId(c.id)}
                className={cn('flex flex-col items-center gap-1 rounded-2xl p-2 transition', c.id === categoryId ? 'bg-slate-100 ring-2 ring-brand-500 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5')}>
                <CategoryIcon cat={c} size="sm" />
                <span className="line-clamp-1 text-[11px] font-medium">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', checked ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700')}>
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={cn('absolute top-0.5 size-5 rounded-full bg-white shadow', checked ? 'right-0.5' : 'left-0.5')} />
    </button>
  )
}
