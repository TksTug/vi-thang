import { addMonths, format, getDaysInMonth } from 'date-fns'
import type { PayMethod, Transaction } from './types'
import { uid } from './utils'
import { useStore } from '../store/useStore'

const SAMPLES: [string, string, number, number][] = [
  // categoryId, note, min, max (thousand VND)
  ['food', 'Cơm trưa', 35, 60],
  ['food', 'Phở bò', 45, 65],
  ['food', 'Bún chả', 40, 55],
  ['food', 'Đi chợ', 150, 400],
  ['food', 'Lẩu với bạn', 200, 450],
  ['coffee', 'Cà phê sáng', 25, 55],
  ['coffee', 'Trà sữa', 35, 60],
  ['transport', 'Đổ xăng', 60, 100],
  ['transport', 'Grab', 30, 120],
  ['shopping', 'Shopee', 120, 600],
  ['shopping', 'Siêu thị', 200, 700],
  ['entertain', 'Xem phim', 90, 200],
  ['health', 'Thuốc', 50, 250],
  ['education', 'Mua sách', 80, 250],
  ['gift', 'Quà sinh nhật', 200, 500],
]

const rnd = (a: number, b: number) => Math.round((a + Math.random() * (b - a)) / 5) * 5 * 1000
const methods: PayMethod[] = ['cash', 'card', 'ewallet']

export function generateDemo() {
  const now = new Date()
  const txs: Transaction[] = []
  const budgets: Record<string, { total: number; categories: Record<string, number> }> = {}

  for (let m = -2; m <= 0; m++) {
    const d = addMonths(now, m)
    const key = format(d, 'yyyy-MM')
    const last = m === 0 ? now.getDate() : getDaysInMonth(d)
    const mk = (day: number) => format(new Date(d.getFullYear(), d.getMonth(), day), 'yyyy-MM-dd')

    txs.push(
      { id: uid(), type: 'income', amount: 18_000_000, categoryId: 'salary', date: mk(Math.min(5, last)), note: 'Lương tháng', method: 'card', createdAt: Date.now() },
      { id: uid(), type: 'expense', amount: 4_500_000, categoryId: 'housing', date: mk(1), note: 'Tiền nhà', method: 'card', createdAt: Date.now() },
    )
    if (last >= 10) txs.push({ id: uid(), type: 'expense', amount: rnd(600, 900), categoryId: 'bills', date: mk(10), note: 'Tiền điện nước', method: 'ewallet', createdAt: Date.now() })
    if (last >= 15) txs.push({ id: uid(), type: 'expense', amount: 260_000, categoryId: 'bills', date: mk(15), note: 'Netflix + Internet', method: 'card', createdAt: Date.now() })
    if (Math.random() > 0.4 && last >= 20) txs.push({ id: uid(), type: 'income', amount: rnd(1500, 4000), categoryId: 'side', date: mk(20), note: 'Freelance', method: 'card', createdAt: Date.now() })

    for (let day = 1; day <= last; day++) {
      const n = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) {
        const weighted = Math.random() < 0.55 ? SAMPLES.slice(0, 7) : SAMPLES
        const [cat, note, a, b] = weighted[Math.floor(Math.random() * weighted.length)]
        txs.push({ id: uid(), type: 'expense', amount: rnd(a, b), categoryId: cat, date: mk(day), note, method: methods[Math.floor(Math.random() * 3)], createdAt: Date.now() + i })
      }
    }
    budgets[key] = {
      total: 13_000_000,
      categories: { food: 3_500_000, coffee: 800_000, transport: 1_000_000, shopping: 1_500_000, housing: 4_500_000, bills: 1_200_000, entertain: 500_000 },
    }
  }

  const s = useStore.getState()
  useStore.setState({
    transactions: [...txs, ...s.transactions],
    budgets: { ...budgets, ...s.budgets },
    onboarded: true,
  })
}
