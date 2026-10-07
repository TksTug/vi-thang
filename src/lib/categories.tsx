import {
  UtensilsCrossed, Coffee, Car, ShoppingBag, Home, Zap, HeartPulse, GraduationCap,
  Gamepad2, Gift, Smartphone, Shirt, Plane, PawPrint, Baby, Dumbbell, Receipt,
  Wallet, Briefcase, TrendingUp, PiggyBank, HandCoins, Sparkles, Film, Fuel, Wifi,
  CircleEllipsis, type LucideIcon,
} from 'lucide-react'
import type { Category } from './types'
import { cn } from './utils'

export const ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed, Coffee, Car, ShoppingBag, Home, Zap, HeartPulse, GraduationCap,
  Gamepad2, Gift, Smartphone, Shirt, Plane, PawPrint, Baby, Dumbbell, Receipt,
  Wallet, Briefcase, TrendingUp, PiggyBank, HandCoins, Sparkles, Film, Fuel, Wifi,
  CircleEllipsis,
}

export const COLORS = [
  '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
  '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  '#64748b',
]

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Ăn uống', icon: 'UtensilsCrossed', color: '#f97316', type: 'expense',
    keywords: ['ăn', 'an', 'cơm', 'com', 'phở', 'pho', 'bún', 'bun', 'trưa', 'tối', 'sáng', 'lẩu', 'bánh', 'đồ ăn', 'grabfood', 'shopeefood'] },
  { id: 'coffee', name: 'Cà phê & Đồ uống', icon: 'Coffee', color: '#a16207', type: 'expense',
    keywords: ['cafe', 'cà phê', 'ca phe', 'coffee', 'trà sữa', 'tra sua', 'nước', 'bia', 'highland', 'starbucks', 'phúc long'] },
  { id: 'transport', name: 'Di chuyển', icon: 'Car', color: '#3b82f6', type: 'expense',
    keywords: ['xăng', 'xang', 'grab', 'taxi', 'be', 'xe', 'gửi xe', 'gui xe', 'bus', 'vé'] },
  { id: 'shopping', name: 'Mua sắm', icon: 'ShoppingBag', color: '#ec4899', type: 'expense',
    keywords: ['shopee', 'lazada', 'tiki', 'mua', 'quần', 'áo', 'giày', 'siêu thị', 'sieu thi'] },
  { id: 'housing', name: 'Nhà cửa', icon: 'Home', color: '#8b5cf6', type: 'expense',
    keywords: ['nhà', 'nha', 'thuê', 'thue', 'tiền nhà', 'phòng'] },
  { id: 'bills', name: 'Hóa đơn', icon: 'Zap', color: '#eab308', type: 'expense',
    keywords: ['điện', 'dien', 'nước', 'internet', 'wifi', 'mạng', 'gas', '4g', 'netflix', 'spotify', 'youtube'] },
  { id: 'health', name: 'Sức khỏe', icon: 'HeartPulse', color: '#f43f5e', type: 'expense',
    keywords: ['thuốc', 'thuoc', 'khám', 'bệnh viện', 'gym', 'bảo hiểm'] },
  { id: 'education', name: 'Học tập', icon: 'GraduationCap', color: '#0ea5e9', type: 'expense',
    keywords: ['sách', 'sach', 'học', 'hoc', 'khóa học', 'course'] },
  { id: 'entertain', name: 'Giải trí', icon: 'Gamepad2', color: '#10b981', type: 'expense',
    keywords: ['phim', 'game', 'xem', 'karaoke', 'du lịch', 'chơi'] },
  { id: 'gift', name: 'Quà tặng', icon: 'Gift', color: '#d946ef', type: 'expense',
    keywords: ['quà', 'qua', 'sinh nhật', 'cưới', 'mừng', 'hiếu'] },
  { id: 'other', name: 'Khác', icon: 'CircleEllipsis', color: '#64748b', type: 'expense' },

  { id: 'salary', name: 'Lương', icon: 'Briefcase', color: '#22c55e', type: 'income',
    keywords: ['lương', 'luong', 'salary'] },
  { id: 'bonus', name: 'Thưởng', icon: 'Sparkles', color: '#f59e0b', type: 'income',
    keywords: ['thưởng', 'thuong', 'bonus'] },
  { id: 'invest', name: 'Đầu tư', icon: 'TrendingUp', color: '#06b6d4', type: 'income',
    keywords: ['lãi', 'cổ tức', 'đầu tư', 'chứng khoán'] },
  { id: 'side', name: 'Thu nhập phụ', icon: 'HandCoins', color: '#14b8a6', type: 'income',
    keywords: ['freelance', 'bán', 'làm thêm'] },
  { id: 'other-in', name: 'Thu khác', icon: 'Wallet', color: '#64748b', type: 'income' },
]

export function CategoryIcon({
  cat, size = 'md', className,
}: { cat?: Category; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const Icon = (cat && ICONS[cat.icon]) || CircleEllipsis
  const color = cat?.color ?? '#64748b'
  const box = size === 'sm' ? 'size-8 rounded-xl' : size === 'lg' ? 'size-14 rounded-2xl' : 'size-11 rounded-2xl'
  const ic = size === 'sm' ? 'size-4' : size === 'lg' ? 'size-7' : 'size-5'
  return (
    <div
      className={cn('grid shrink-0 place-items-center', box, className)}
      style={{ background: `${color}1f`, color }}
    >
      <Icon className={ic} strokeWidth={2.2} />
    </div>
  )
}

/** Guess category from free text such as "cafe 35k" */
export function guessCategory(text: string, cats: Category[]): Category | undefined {
  const t = text.toLowerCase()
  let best: { c: Category; len: number } | undefined
  for (const c of cats) {
    for (const k of [c.name.toLowerCase(), ...(c.keywords ?? [])]) {
      if (k && t.includes(k) && (!best || k.length > best.len)) best = { c, len: k.length }
    }
  }
  return best?.c
}
