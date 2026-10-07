import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { Capacitor } from '@capacitor/core'
import { format } from 'date-fns'
import { METHOD_LABEL } from './types'
import { monthLabel } from './utils'
import { spentByCategory, sumBy, useStore } from '../store/useStore'

/** Save a file – browser/Electron download, or Android share sheet when running in Capacitor */
async function saveFile(filename: string, data: Blob) {
  if (Capacitor.isNativePlatform()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    const { Share } = await import('@capacitor/share')
    const base64 = await new Promise<string>((res) => {
      const r = new FileReader()
      r.onloadend = () => res(String(r.result).split(',')[1])
      r.readAsDataURL(data)
    })
    const out = await Filesystem.writeFile({ path: filename, data: base64, directory: Directory.Cache })
    await Share.share({ title: filename, url: out.uri, dialogTitle: 'Lưu / chia sẻ file' })
    return
  }
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function exportMonthExcel(month: string) {
  const s = useStore.getState()
  const txs = s.transactions.filter((t) => t.date.startsWith(month)).sort((a, b) => a.date.localeCompare(b.date))
  if (!txs.length) {
    toast.info('Tháng này chưa có giao dịch để xuất')
    return
  }
  const catName = (id: string) => s.categories.find((c) => c.id === id)?.name ?? id
  const budget = s.getBudget(month)

  const rows = txs.map((t) => ({
    'Ngày': format(new Date(t.date), 'dd/MM/yyyy'),
    'Loại': t.type === 'expense' ? 'Chi' : 'Thu',
    'Danh mục': catName(t.categoryId),
    'Ghi chú': t.note,
    'Phương thức': METHOD_LABEL[t.method],
    'Số tiền': t.type === 'expense' ? -t.amount : t.amount,
  }))
  const ws1 = XLSX.utils.json_to_sheet(rows)
  ws1['!cols'] = [{ wch: 12 }, { wch: 6 }, { wch: 20 }, { wch: 30 }, { wch: 14 }, { wch: 14 }]

  const byCat = spentByCategory(txs)
  const exp = sumBy(txs, 'expense')
  const summary: (string | number)[][] = [
    ['BÁO CÁO CHI TIÊU', monthLabel(month)],
    [],
    ['Tổng thu', sumBy(txs, 'income')],
    ['Tổng chi', exp],
    ['Ngân sách', budget.total || '—'],
    ['Còn lại', budget.total ? budget.total - exp : '—'],
    [],
    ['Danh mục', 'Đã chi', 'Hạn mức', 'Tỷ lệ'],
    ...Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([id, v]) => [catName(id), v, budget.categories[id] ?? '', exp ? `${((v / exp) * 100).toFixed(1)}%` : '']),
  ]
  const ws2 = XLSX.utils.aoa_to_sheet(summary)
  ws2['!cols'] = [{ wch: 22 }, { wch: 16 }, { wch: 14 }, { wch: 10 }]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws2, 'Tổng kết')
  XLSX.utils.book_append_sheet(wb, ws1, 'Giao dịch')
  const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' })
  await saveFile(`chi-tieu-${month}.xlsx`, new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
  toast.success('Đã xuất file Excel')
}

export async function exportBackup() {
  const { transactions, categories, budgets, recurring } = useStore.getState()
  const json = JSON.stringify({ app: 'vi-thang', version: 1, exportedAt: new Date().toISOString(), transactions, categories, budgets, recurring }, null, 2)
  await saveFile(`vi-thang-backup-${format(new Date(), 'yyyyMMdd-HHmm')}.json`, new Blob([json], { type: 'application/json' }))
  toast.success('Đã sao lưu dữ liệu')
}

export function importBackup(file: File) {
  const r = new FileReader()
  r.onload = () => {
    try {
      const data = JSON.parse(String(r.result))
      if (data.app !== 'vi-thang' || !Array.isArray(data.transactions)) throw new Error()
      useStore.getState().importData(data)
      toast.success(`Đã khôi phục ${data.transactions.length} giao dịch`)
    } catch {
      toast.error('File sao lưu không hợp lệ')
    }
  }
  r.readAsText(file)
}
