import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parse } from 'date-fns'
import { vi } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8)

/** 1250000 -> "1.250.000 ₫" */
export function formatVND(n: number, withSymbol = true) {
  const s = Math.round(n).toLocaleString('vi-VN')
  return withSymbol ? `${s} ₫` : s
}

/** 1250000 -> "1,25tr" ; 35000 -> "35k" */
export function formatShort(n: number) {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000_000) return `${sign}${+(abs / 1_000_000_000).toFixed(2)} tỷ`
  if (abs >= 1_000_000) return `${sign}${+(abs / 1_000_000).toFixed(2)}tr`.replace('.', ',')
  if (abs >= 1_000) return `${sign}${+(abs / 1_000).toFixed(1)}k`.replace('.', ',')
  return `${sign}${abs}`
}

/** Parse "35k", "1.5tr", "1tr2", "250.000", "2m" -> number */
export function parseAmount(raw: string): number | null {
  const s = raw.trim().toLowerCase().replace(/\s/g, '').replace(/₫|đ|vnd/g, '')
  if (!s) return null
  // 1tr2 -> 1.2tr ; 1tr250 -> 1.25tr
  let m = s.match(/^(\d+)(tr|m|cu|củ)(\d{1,3})$/)
  if (m) return Number(m[1]) * 1_000_000 + Number(m[3].padEnd(3, '0')) * 1_000
  m = s.match(/^(\d+)(k|ng|nghìn|ngàn)(\d{1,3})$/)
  if (m) return Number(m[1]) * 1_000 + Number(m[3].padEnd(3, '0'))
  m = s.match(/^(\d+(?:[.,]\d+)?)(k|ng|nghìn|ngàn|tr|triệu|m|cu|củ|ty|tỷ|b)?$/)
  if (m) {
    const unit = m[2]
    let numStr = m[1]
    // "250.000" / "1,000,000" => thousands separators when no unit & group of 3
    if (!unit && /^\d{1,3}([.,]\d{3})+$/.test(numStr)) numStr = numStr.replace(/[.,]/g, '')
    const num = Number(numStr.replace(',', '.'))
    if (Number.isNaN(num)) return null
    const mult =
      unit === 'k' || unit === 'ng' || unit === 'nghìn' || unit === 'ngàn'
        ? 1_000
        : unit === 'tr' || unit === 'triệu' || unit === 'm' || unit === 'cu' || unit === 'củ'
          ? 1_000_000
          : unit === 'ty' || unit === 'tỷ' || unit === 'b'
            ? 1_000_000_000
            : 1
    return Math.round(num * mult)
  }
  return null
}

export const monthKeyOf = (d: Date) => format(d, 'yyyy-MM')
export const monthKeyToDate = (k: string) => parse(k + '-01', 'yyyy-MM-dd', new Date())
export const todayISO = () => format(new Date(), 'yyyy-MM-dd')

export function monthLabel(k: string) {
  const s = format(monthKeyToDate(k), "'Tháng' M, yyyy", { locale: vi })
  return s
}

export function dayLabel(iso: string) {
  const d = parse(iso, 'yyyy-MM-dd', new Date())
  const t = todayISO()
  if (iso === t) return 'Hôm nay'
  const y = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
  if (iso === y) return 'Hôm qua'
  const s = format(d, 'EEEE, dd/MM', { locale: vi })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/** Format number with dots while typing: "1250000" -> "1.250.000" */
export function formatInputNumber(v: string) {
  const digits = v.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('vi-VN')
}
