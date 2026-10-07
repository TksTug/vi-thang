import { useState } from 'react'
import { motion } from 'motion/react'
import { Sparkles, RefreshCw, PlusCircle, CheckCircle, Sunrise, Sun, Moon, ChefHat } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../components/ui'
import { formatVND, formatInputNumber } from '../lib/utils'
import { generateMealSuggestion, type MealPlan } from '../lib/mealAi'
import { useStore } from '../store/useStore'

export function MealPlanner() {
  const addTransaction = useStore((s) => s.addTransaction)

  // Suggested daily budget
  const defaultDaily = 50000

  const [dailyBudget, setDailyBudget] = useState(formatInputNumber(String(defaultDaily)))
  const [mealsCount, setMealsCount] = useState<1 | 2 | 3>(2) // Default: 2 meals (Trưa + Tối)
  const [plan, setPlan] = useState<MealPlan | null>(() => generateMealSuggestion(defaultDaily, 2))
  const [isGenerating, setIsGenerating] = useState(false)

  const numBudget = Number(dailyBudget.replace(/\D/g, '')) || 0

  const handleGenerate = () => {
    if (numBudget < 20000 && mealsCount > 1) {
      toast.error('Ngân sách tối thiểu nên từ 20.000₫ để có gợi ý hợp lý bạn nhé!')
      return
    }

    setIsGenerating(true)
    setTimeout(() => {
      const newPlan = generateMealSuggestion(numBudget, mealsCount)
      setPlan(newPlan)
      setIsGenerating(false)
      toast.success('AI đã lên xong thực đơn hôm nay cho bạn!')
    }, 350)
  }

  const recordAllMeals = () => {
    if (!plan) return
    const today = new Date().toISOString().slice(0, 10)
    let count = 0

    if (plan.breakfast) {
      addTransaction({
        type: 'expense',
        amount: plan.breakfast.price,
        categoryId: 'food',
        date: today,
        note: `Sáng: ${plan.breakfast.name}`,
        method: 'cash',
      })
      count++
    }
    if (plan.lunch) {
      addTransaction({
        type: 'expense',
        amount: plan.lunch.price,
        categoryId: 'food',
        date: today,
        note: `Trưa: ${plan.lunch.name}`,
        method: 'cash',
      })
      count++
    }
    if (plan.dinner) {
      addTransaction({
        type: 'expense',
        amount: plan.dinner.price,
        categoryId: 'food',
        date: today,
        note: `Tối: ${plan.dinner.name}`,
        method: 'cash',
      })
      count++
    }

    toast.success(`Đã tự động ghi ${count} bữa ăn vào sổ chi tiêu hôm nay!`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gợi ý ăn uống AI (Ăn gì hôm nay?)"
        subtitle="Nhập số tiền bạn muốn chi cho 1 ngày, AI sẽ cân đối thực đơn từng bữa vừa vặn túi tiền"
      />

      {/* Control Box */}
      <div className="card p-5 space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Budget Input */}
          <div>
            <span className="label">Ngân sách ăn uống trong ngày</span>
            <div className="relative">
              <input
                inputMode="numeric"
                value={dailyBudget}
                onChange={(e) => setDailyBudget(formatInputNumber(e.target.value))}
                placeholder="VD: 50.000"
                className="input h-14 text-2xl font-extrabold pr-10 text-brand-600 dark:text-brand-400"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₫
              </span>
            </div>
            {/* Quick chips */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[50000, 70000, 80000, 100000, 120000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDailyBudget(formatInputNumber(String(amt)))}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-600 dark:bg-white/5 dark:text-slate-300"
                >
                  {amt / 1000}k/ngày
                </button>
              ))}
            </div>
          </div>

          {/* Meals count selector */}
          <div>
            <span className="label">Bạn ăn mấy bữa hôm nay?</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { count: 1 as const, label: '1 bữa', sub: 'Chỉ trưa/tối' },
                { count: 2 as const, label: '2 bữa', sub: 'Trưa + Tối' },
                { count: 3 as const, label: '3 bữa', sub: 'Sáng + Trưa + Tối' },
              ].map((item) => (
                <button
                  key={item.count}
                  type="button"
                  onClick={() => setMealsCount(item.count)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition ${
                    mealsCount === item.count
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                      : 'border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span className="text-sm font-bold">{item.label}</span>
                  <span className="text-[10px] opacity-75">{item.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="btn-primary h-12 w-full text-base font-bold flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <RefreshCw className="size-5 animate-spin" />
          ) : (
            <Sparkles className="size-5" />
          )}
          <span>{isGenerating ? 'AI đang phối món...' : 'Gợi ý món ăn ngay!'}</span>
        </button>
      </div>

      {/* Suggested Meals Result */}
      {plan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg flex items-center gap-2">
              <ChefHat className="size-5 text-brand-500" /> Thực đơn đề xuất cho bạn
            </h3>
            <span className="text-xs font-semibold text-slate-500">
              Tổng chi: <b className="text-brand-600 dark:text-brand-400 text-sm">{formatVND(plan.totalCost)}</b> / {formatVND(numBudget)}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Breakfast */}
            {plan.breakfast && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-5 border-l-4 border-l-amber-400 relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                    <Sunrise className="size-4" /> Bữa Sáng
                  </div>
                  <span className="rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-[10px] font-bold">
                    {plan.breakfast.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {plan.breakfast.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {plan.breakfast.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Chi phí dự kiến</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatVND(plan.breakfast.price)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Lunch */}
            {plan.lunch && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="card p-5 border-l-4 border-l-orange-500 relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-bold text-sm">
                    <Sun className="size-4" /> Bữa Trưa
                  </div>
                  <span className="rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300 px-2 py-0.5 text-[10px] font-bold">
                    {plan.lunch.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {plan.lunch.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {plan.lunch.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Chi phí dự kiến</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatVND(plan.lunch.price)}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Dinner */}
            {plan.dinner && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card p-5 border-l-4 border-l-indigo-500 relative space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                    <Moon className="size-4" /> Bữa Tối
                  </div>
                  <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 text-[10px] font-bold">
                    {plan.dinner.tag}
                  </span>
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {plan.dinner.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {plan.dinner.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Chi phí dự kiến</span>
                  <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    {formatVND(plan.dinner.price)}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Row */}
          <div className="card p-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-white/5">
            <div className="flex items-center gap-2">
              <CheckCircle className="size-5 text-emerald-500" />
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Bạn còn dư{' '}
                <b className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {formatVND(Math.max(0, numBudget - plan.totalCost))}
                </b>{' '}
                dành cho trà đá / tráng miệng!
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="btn-ghost text-xs h-10 px-3"
              >
                <RefreshCw className="size-3.5" /> Đổi món khác
              </button>
              <button
                type="button"
                onClick={recordAllMeals}
                className="btn-primary text-xs h-10 px-4"
              >
                <PlusCircle className="size-4" /> Ghi nhanh các bữa vào chi tiêu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
