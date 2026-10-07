import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { addMonths, format } from 'date-fns'
import { cn, formatVND, monthKeyOf, monthKeyToDate, monthLabel } from '../lib/utils'
import { useStore } from '../store/useStore'

export function AnimatedNumber({ value, className, symbol = true }: { value: number; className?: string; symbol?: boolean }) {
  const privacyMode = useStore((s) => s.privacyMode)
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) => formatVND(v, symbol))
  useEffect(() => {
    const c = animate(mv, value, { duration: 0.9, ease: [0.16, 1, 0.3, 1] })
    return () => c.stop()
  }, [value, mv])

  if (privacyMode) {
    return <span className={cn('tabular-nums tracking-widest', className)}>•••••••</span>
  }

  return <motion.span className={cn('tabular-nums', className)}>{text}</motion.span>
}

export function ProgressBar({ value, color, className }: { value: number; color?: string; className?: string }) {
  const pct = Math.min(100, Math.max(0, value * 100))
  const auto = value >= 1 ? '#f43f5e' : value >= 0.8 ? '#f59e0b' : (color ?? '#6366f1')
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5', className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: auto }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  )
}

export function MonthSwitcher({ className }: { className?: string }) {
  const month = useStore((s) => s.currentMonth)
  const setMonth = useStore((s) => s.setMonth)
  const go = (n: number) => setMonth(format(addMonths(monthKeyToDate(month), n), 'yyyy-MM'))
  const isNow = month === monthKeyOf(new Date())
  return (
    <div className={cn('flex items-center gap-1 rounded-2xl bg-white p-1 shadow-soft dark:bg-white/5', className)}>
      <button onClick={() => go(-1)} className="grid size-9 place-items-center rounded-xl transition hover:bg-slate-100 dark:hover:bg-white/10">
        <ChevronLeft className="size-4" />
      </button>
      <button
        onClick={() => setMonth(monthKeyOf(new Date()))}
        className="min-w-32 px-2 text-center text-sm font-semibold"
        title="Về tháng hiện tại"
      >
        {monthLabel(month)}
        {!isNow && <span className="ml-1 text-brand-500">•</span>}
      </button>
      <button onClick={() => go(1)} className="grid size-9 place-items-center rounded-xl transition hover:bg-slate-100 dark:hover:bg-white/10">
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}

export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-3xl bg-brand-50 text-brand-500 dark:bg-brand-500/10">{icon}</div>
      <p className="font-semibold">{title}</p>
      {desc && <p className="muted mt-1 max-w-xs text-sm">{desc}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h1>
        {subtitle && <p className="muted mt-1 text-sm">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Segmented<T extends string>({
  value, onChange, options, className,
}: { value: T; onChange: (v: T) => void; options: { value: T; label: React.ReactNode }[]; className?: string }) {
  return (
    <div className={cn('relative flex rounded-2xl bg-slate-100 p-1 dark:bg-white/5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'relative z-10 flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
            value === o.value ? 'text-slate-900 dark:text-white' : 'text-slate-500',
          )}
        >
          {value === o.value && (
            <motion.span
              layoutId={`seg-${options.map((x) => x.value).join('')}`}
              className="absolute inset-0 -z-10 rounded-xl bg-white shadow-sm dark:bg-white/10"
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            />
          )}
          {o.label}
        </button>
      ))}
    </div>
  )
}
