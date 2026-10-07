import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'motion/react'
import { Banknote, CalendarDays, CreditCard, Smartphone, Sparkles, StickyNote, Trash2, Wand2, Camera } from 'lucide-react'
import { Modal } from './Modal'
import { Segmented } from './ui'
import { CategoryIcon, guessCategory } from '../lib/categories'
import { ReceiptOcrModal } from './ReceiptOcrModal'
import type { PayMethod, TxType } from '../lib/types'
import { cn, formatInputNumber, formatVND, parseAmount, todayISO } from '../lib/utils'
import { spentByCategory, useStore } from '../store/useStore'
import { useUI } from '../store/useUI'

const METHODS: { value: PayMethod; label: string; icon: typeof Banknote }[] = [
  { value: 'cash', label: 'Tiền mặt', icon: Banknote },
  { value: 'card', label: 'Thẻ', icon: CreditCard },
  { value: 'ewallet', label: 'Ví điện tử', icon: Smartphone },
]

const QUICK = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000]

export function TransactionForm() {
  const { form, closeForm } = useUI()
  const categories = useStore((s) => s.categories)
  const add = useStore((s) => s.addTransaction)
  const update = useStore((s) => s.updateTransaction)
  const remove = useStore((s) => s.deleteTransaction)
  const restore = useStore((s) => s.restoreTransaction)

  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('food')
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [method, setMethod] = useState<PayMethod>('cash')
  const [smart, setSmart] = useState('')
  const [ocrOpen, setOcrOpen] = useState(false)

  useEffect(() => {
    if (!form.open) return
    const e = form.edit
    if (e) {
      setType(e.type)
      setAmount(formatInputNumber(String(e.amount)))
      setCategoryId(e.categoryId)
      setDate(e.date)
      setNote(e.note)
      setMethod(e.method)
    } else {
      const t = form.type ?? 'expense'
      setType(t)
      setAmount('')
      setCategoryId(t === 'income' ? 'salary' : 'food')
      setDate(todayISO())
      setNote('')
      setMethod('cash')
    }
    setSmart('')
  }, [form.open, form.edit, form.type])

  const cats = useMemo(() => categories.filter((c) => c.type === type), [categories, type])
  const value = Number(amount.replace(/\D/g, '')) || 0

  const switchType = (t: TxType) => {
    setType(t)
    const first = categories.find((c) => c.type === t)
    if (first) setCategoryId(first.id)
  }

  /** "cafe 35k", "đổ xăng 50k", "lương 15tr" */
  const applySmart = (text: string) => {
    setSmart(text)
    const tokens = text.trim().split(/\s+/)
    let amt: number | null = null
    const rest: string[] = []
    for (const tk of tokens) {
      const p: number | null = amt === null ? parseAmount(tk) : null
      if (p !== null && p > 0) amt = p
      else rest.push(tk)
    }
    if (amt) setAmount(formatInputNumber(String(amt)))
    const label = rest.join(' ')
    const g = guessCategory(label, categories)
    if (g) {
      setType(g.type)
      setCategoryId(g.id)
    }
    setNote(label ? label.charAt(0).toUpperCase() + label.slice(1) : '')
  }

  const submit = () => {
    if (!value) {
      toast.error('Vui lòng nhập số tiền')
      return
    }
    const data = { type, amount: value, categoryId, date, note: note.trim(), method }
    if (form.edit) {
      update(form.edit.id, data)
      toast.success('Đã cập nhật giao dịch')
    } else {
      add(data)
      const cat = categories.find((c) => c.id === categoryId)
      toast.success(`${type === 'expense' ? 'Đã ghi khoản chi' : 'Đã ghi khoản thu'} ${formatVND(value)}`, {
        description: cat?.name,
      })
      if (type === 'expense') checkBudget(categoryId, date.slice(0, 7))
    }
    closeForm()
  }

  const onDelete = () => {
    if (!form.edit) return
    const tx = form.edit
    remove(tx.id)
    closeForm()
    toast('Đã xoá giao dịch', { action: { label: 'Hoàn tác', onClick: () => restore(tx) } })
  }

  return (
    <Modal
      open={form.open}
      onClose={closeForm}
      title={form.edit ? 'Sửa giao dịch' : 'Thêm giao dịch'}
      footer={
        <div className="flex gap-3">
          {form.edit && (
            <button onClick={onDelete} className="btn-danger px-4" title="Xoá">
              <Trash2 className="size-4" />
            </button>
          )}
          <button onClick={submit} className="btn-primary h-12 flex-1 text-[15px]">
            {form.edit ? 'Lưu thay đổi' : 'Lưu giao dịch'}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {!form.edit && (
          <div className="flex gap-2 items-center">
            <div className="relative flex-1">
              <Wand2 className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-brand-500" />
              <input
                className="input border-dashed border-brand-200 bg-brand-50/50 pl-11 dark:border-brand-500/30 dark:bg-brand-500/5"
                placeholder='Nhập nhanh: "cafe 35k", "đổ xăng 50k", "lương 15tr"'
                value={smart}
                onChange={(e) => applySmart(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submit()}
              />
            </div>
            <button
              type="button"
              onClick={() => setOcrOpen(true)}
              className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-600 transition hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400"
              title="Quét hóa đơn (OCR)"
            >
              <Camera className="size-5" />
            </button>
          </div>
        )}

        <Segmented
          value={type}
          onChange={switchType}
          options={[
            { value: 'expense', label: 'Khoản chi' },
            { value: 'income', label: 'Khoản thu' },
          ]}
        />

        <div className="text-center">
          <div className="relative inline-flex items-baseline">
            <input
              inputMode="numeric"
              autoFocus={!!form.edit}
              className={cn(
                'w-full max-w-[16ch] bg-transparent text-center text-4xl font-extrabold tracking-tight outline-none placeholder:text-slate-300 dark:placeholder:text-slate-700',
                type === 'expense' ? 'text-rose-500' : 'text-emerald-500',
              )}
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(formatInputNumber(e.target.value))}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              style={{ width: `${Math.max(2, amount.length + 1)}ch` }}
            />
            <span className="ml-1 text-2xl font-bold text-slate-400">₫</span>
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(formatInputNumber(String(value + q)))}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-600 active:scale-95 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-brand-500/10"
              >
                +{q >= 1_000_000 ? q / 1_000_000 + 'tr' : q / 1000 + 'k'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Danh mục</span>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {cats.map((c) => {
              const active = c.id === categoryId
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-1.5 rounded-2xl p-2 pt-3 text-center transition',
                    active ? 'bg-slate-100 dark:bg-white/10' : 'hover:bg-slate-50 dark:hover:bg-white/5',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="cat-ring"
                      className="absolute inset-0 rounded-2xl ring-2"
                      style={{ ['--tw-ring-color' as string]: c.color }}
                      transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                    />
                  )}
                  <CategoryIcon cat={c} />
                  <span className="line-clamp-1 text-[11px] font-medium">{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="label">Ngày</span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <input type="date" className="input pl-11" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div>
            <span className="label">Ghi chú</span>
            <div className="relative">
              <StickyNote className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-400" />
              <input className="input pl-11" placeholder="Không bắt buộc" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <span className="label">Phương thức</span>
          <div className="grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.value}
                type="button"
                onClick={() => setMethod(m.value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-2xl border px-2 py-3 text-xs font-semibold transition sm:text-sm',
                  method === m.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10',
                )}
              >
                <m.icon className="size-4" />
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {!form.edit && (
          <p className="muted flex items-center justify-center gap-1.5 text-center text-xs">
            <Sparkles className="size-3.5" /> Mẹo: nhấn Enter để lưu nhanh
          </p>
        )}
      </div>

      <ReceiptOcrModal
        open={ocrOpen}
        onClose={() => setOcrOpen(false)}
        onExtracted={(data) => {
          setAmount(formatInputNumber(String(data.amount)))
          if (data.note) setNote(data.note)
          if (data.categoryId) setCategoryId(data.categoryId)
          setType('expense')
        }}
      />
    </Modal>
  )
}

/** Warn when a category passes 80% / 100% of its monthly limit */
function checkBudget(categoryId: string, month: string) {
  const s = useStore.getState()
  const budget = s.getBudget(month)
  const txs = s.transactions.filter((t) => t.date.startsWith(month))
  const cat = s.categories.find((c) => c.id === categoryId)

  const limit = budget.categories[categoryId]
  if (limit && cat) {
    const spent = spentByCategory(txs)[categoryId] ?? 0
    const r = spent / limit
    if (r >= 1) toast.error(`Vượt hạn mức "${cat.name}"!`, { description: `Đã chi ${formatVND(spent)} / ${formatVND(limit)}` })
    else if (r >= 0.8) toast.warning(`"${cat.name}" đã dùng ${Math.round(r * 100)}% hạn mức`, { description: `Còn lại ${formatVND(limit - spent)}` })
  }
  if (budget.total) {
    const spent = txs.reduce((a, t) => (t.type === 'expense' ? a + t.amount : a), 0)
    const r = spent / budget.total
    if (r >= 1) toast.error('Bạn đã vượt tổng ngân sách tháng!', { description: `${formatVND(spent)} / ${formatVND(budget.total)}` })
    else if (r >= 0.9) toast.warning(`Đã dùng ${Math.round(r * 100)}% ngân sách tháng`)
  }
}
