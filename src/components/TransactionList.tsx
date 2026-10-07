import { AnimatePresence, motion } from 'motion/react'
import { Repeat } from 'lucide-react'
import { CategoryIcon } from '../lib/categories'
import { METHOD_LABEL, type Transaction } from '../lib/types'
import { cn, dayLabel, formatVND } from '../lib/utils'
import { useStore } from '../store/useStore'
import { useUI } from '../store/useUI'

export function TransactionRow({ tx }: { tx: Transaction }) {
  const cat = useStore((s) => s.categories.find((c) => c.id === tx.categoryId))
  const openForm = useUI((s) => s.openForm)
  const privacyMode = useStore((s) => s.privacyMode)
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      onClick={() => openForm({ edit: tx })}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
    >
      <CategoryIcon cat={cat} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{tx.note || cat?.name || 'Không rõ'}</p>
        <p className="muted flex items-center gap-1.5 truncate text-xs">
          {tx.note ? cat?.name : ''}
          {tx.note && <span className="opacity-40">•</span>}
          {METHOD_LABEL[tx.method]}
          {tx.recurringId && <Repeat className="size-3 text-brand-500" />}
        </p>
      </div>
      <p className={cn('shrink-0 font-bold tabular-nums', tx.type === 'expense' ? 'text-slate-800 dark:text-slate-100' : 'text-emerald-500')}>
        {tx.type === 'expense' ? '−' : '+'}
        {privacyMode ? '••••••' : formatVND(tx.amount)}
      </p>
    </motion.button>
  )
}

export function GroupedTransactions({ txs }: { txs: Transaction[] }) {
  const groups = new Map<string, Transaction[]>()
  const sorted = [...txs].sort((a, b) => (b.date === a.date ? b.createdAt - a.createdAt : b.date.localeCompare(a.date)))
  for (const t of sorted) {
    if (!groups.has(t.date)) groups.set(t.date, [])
    groups.get(t.date)!.push(t)
  }
  return (
    <div className="space-y-5">
      {[...groups.entries()].map(([date, list]) => {
        const exp = list.reduce((a, t) => (t.type === 'expense' ? a + t.amount : a), 0)
        const inc = list.reduce((a, t) => (t.type === 'income' ? a + t.amount : a), 0)
        return (
          <div key={date}>
            <div className="mb-1 flex items-center justify-between px-3">
              <p className="text-sm font-bold">{dayLabel(date)}</p>
              <p className="muted text-xs font-medium tabular-nums">
                {inc > 0 && <span className="mr-2 text-emerald-500">+{formatVND(inc)}</span>}
                {exp > 0 && <span>−{formatVND(exp)}</span>}
              </p>
            </div>
            <AnimatePresence initial={false}>
              {list.map((t) => (
                <TransactionRow key={t.id} tx={t} />
              ))}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
