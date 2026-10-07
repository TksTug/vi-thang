import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { toast } from 'sonner'
import { Check, Database, Download, FileSpreadsheet, Laptop, Moon, Palette, Pencil, Plus, Sun, Trash2, Upload, Wand2, Lock, Bell, Eye, EyeOff } from 'lucide-react'
import { Modal } from '../components/Modal'
import { PageHeader, Segmented } from '../components/ui'
import { COLORS, CategoryIcon, ICONS } from '../lib/categories'
import type { Category, TxType } from '../lib/types'
import { cn } from '../lib/utils'
import { exportBackup, exportMonthExcel, importBackup } from '../lib/export'
import { generateDemo } from '../lib/demo'
import { scheduleDailyReminder } from '../lib/reminder'
import { useStore, type Theme } from '../store/useStore'

export function Settings() {
  const theme = useStore((s) => s.theme)
  const setTheme = useStore((s) => s.setTheme)
  const month = useStore((s) => s.currentMonth)
  const count = useStore((s) => s.transactions.length)
  const resetAll = useStore((s) => s.resetAll)

  // PIN & Security
  const pinCode = useStore((s) => s.pinCode)
  const setPinCode = useStore((s) => s.setPinCode)
  const lockApp = useStore((s) => s.lockApp)
  const privacyMode = useStore((s) => s.privacyMode)
  const togglePrivacyMode = useStore((s) => s.togglePrivacyMode)
  const [pinModal, setPinModal] = useState(false)
  const [newPin, setNewPin] = useState('')

  // Reminder
  const reminderEnabled = useStore((s) => s.reminderEnabled)
  const reminderTime = useStore((s) => s.reminderTime)
  const setReminder = useStore((s) => s.setReminder)

  const fileRef = useRef<HTMLInputElement>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const themes: { v: Theme; label: string; icon: typeof Sun }[] = [
    { v: 'light', label: 'Sáng', icon: Sun },
    { v: 'dark', label: 'Tối', icon: Moon },
    { v: 'system', label: 'Theo hệ thống', icon: Laptop },
  ]

  const handleSavePin = () => {
    if (newPin.length !== 4) {
      toast.error('Mã PIN phải gồm đúng 4 chữ số')
      return
    }
    setPinCode(newPin)
    setPinModal(false)
    setNewPin('')
    toast.success('Đã cài đặt mã PIN bảo vệ')
  }

  const handleRemovePin = () => {
    setPinCode(null)
    setPinModal(false)
    setNewPin('')
    toast.info('Đã hủy bỏ mã PIN')
  }

  const handleToggleReminder = async (enabled: boolean) => {
    setReminder(enabled)
    await scheduleDailyReminder(enabled, reminderTime)
  }

  const handleChangeReminderTime = async (time: string) => {
    setReminder(reminderEnabled, time)
    if (reminderEnabled) {
      await scheduleDailyReminder(true, time)
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Cài đặt" subtitle="Tuỳ chỉnh ứng dụng theo ý bạn" />

      {/* Security Section */}
      <Section icon={<Lock className="size-4" />} title="Bảo mật & Quyền riêng tư">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold">Khóa ứng dụng bằng mã PIN (4 số)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pinCode ? 'Đang bật bảo vệ bằng mã PIN' : 'Chưa thiết lập mã PIN'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {pinCode ? (
                <>
                  <button
                    onClick={lockApp}
                    className="btn-ghost h-9 px-3 text-xs"
                    title="Khóa ngay để thử"
                  >
                    Khóa ngay
                  </button>
                  <button
                    onClick={() => setPinModal(true)}
                    className="btn-ghost h-9 px-3 text-xs"
                  >
                    Đổi PIN
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setPinModal(true)}
                  className="btn-primary h-9 px-3 text-xs"
                >
                  Thiết lập
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
            <div>
              <p className="text-sm font-semibold">Chế độ ẩn số dư (Privacy Mode)</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ẩn các con số nhạy cảm thành ••••••• khi mở app ở nơi đông người
              </p>
            </div>
            <button
              onClick={togglePrivacyMode}
              className={cn(
                'grid size-10 place-items-center rounded-2xl transition',
                privacyMode
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-slate-200 text-slate-600 dark:bg-white/10 dark:text-slate-300',
              )}
              title={privacyMode ? 'Đang ẩn số dư' : 'Đang hiện số dư'}
            >
              {privacyMode ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
            </button>
          </div>
        </div>
      </Section>

      {/* Daily Reminder Section */}
      <Section icon={<Bell className="size-4" />} title="Nhắc nhở chi tiêu hàng ngày">
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/5">
          <div>
            <p className="text-sm font-semibold">Thông báo nhắc nhập chi tiêu</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Gửi thông báo nhắc nhở ghi chép vào mỗi tối
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => handleChangeReminderTime(e.target.value)}
              className="input h-10 w-28 text-center text-xs font-semibold px-2"
            />
            <button
              type="button"
              onClick={() => handleToggleReminder(!reminderEnabled)}
              className={cn(
                'relative h-7 w-12 shrink-0 rounded-full transition-colors',
                reminderEnabled ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 size-5 rounded-full bg-white shadow transition-transform',
                  reminderEnabled ? 'right-1' : 'left-1',
                )}
              />
            </button>
          </div>
        </div>
      </Section>

      <Section icon={<Palette className="size-4" />} title="Giao diện">
        <div className="grid grid-cols-3 gap-3">
          {themes.map((t) => (
            <button key={t.v} onClick={() => setTheme(t.v)}
              className={cn('relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-sm font-semibold transition',
                theme === t.v ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300' : 'border-slate-200 hover:border-slate-300 dark:border-white/10')}>
              {theme === t.v && <Check className="absolute top-2 right-2 size-4" />}
              <t.icon className="size-6" />
              {t.label}
            </button>
          ))}
        </div>
      </Section>

      <CategoriesSection />

      <Section icon={<Database className="size-4" />} title="Dữ liệu" desc={`Tất cả dữ liệu được lưu trên thiết bị này · ${count} giao dịch`}>
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionBtn icon={<FileSpreadsheet className="size-5 text-emerald-600" />} title="Xuất Excel tháng này" desc="Báo cáo tổng kết và chi tiết" onClick={() => exportMonthExcel(month)} />
          <ActionBtn icon={<Download className="size-5 text-brand-500" />} title="Sao lưu dữ liệu" desc="Tải file .json để lưu trữ" onClick={exportBackup} />
          <ActionBtn icon={<Upload className="size-5 text-sky-500" />} title="Khôi phục dữ liệu" desc="Nhập từ file sao lưu" onClick={() => fileRef.current?.click()} />
          <ActionBtn icon={<Wand2 className="size-5 text-fuchsia-500" />} title="Tạo dữ liệu mẫu" desc="Dùng thử với 3 tháng dữ liệu" onClick={() => { generateDemo(); toast.success('Đã tạo dữ liệu mẫu') }} />
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) importBackup(f); e.target.value = '' }} />
        <button className="btn-danger mt-4 w-full" onClick={() => setConfirmReset(true)}><Trash2 className="size-4" /> Xoá toàn bộ dữ liệu</button>
      </Section>

      <p className="muted pb-4 text-center text-xs">Ví Tháng v1.0 · Dữ liệu của bạn không bao giờ rời khỏi thiết bị 🔒</p>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Xoá toàn bộ dữ liệu?">
        <p className="muted text-sm">Hành động này sẽ xoá vĩnh viễn tất cả giao dịch, ngân sách và khoản cố định. Hãy sao lưu trước nếu cần.</p>
        <div className="mt-6 flex gap-3">
          <button className="btn-ghost flex-1" onClick={() => setConfirmReset(false)}>Huỷ</button>
          <button className="btn flex-1 bg-rose-500 text-white hover:bg-rose-600" onClick={() => { resetAll(); setConfirmReset(false); toast.success('Đã xoá dữ liệu') }}>Xoá hết</button>
        </div>
      </Modal>

      {/* PIN Setup Modal */}
      <Modal
        open={pinModal}
        onClose={() => {
          setPinModal(false)
          setNewPin('')
        }}
        title={pinCode ? 'Thay đổi mã PIN' : 'Thiết lập mã PIN'}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Nhập 4 chữ số bí mật để khóa và mở ứng dụng. Hãy ghi nhớ mã PIN này!
          </p>
          <div>
            <span className="label">Mã PIN mới (4 số)</span>
            <input
              type="password"
              maxLength={4}
              inputMode="numeric"
              placeholder="••••"
              value={newPin}
              onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              className="input text-center text-3xl font-extrabold tracking-widest h-14"
            />
          </div>
          <div className="flex gap-3 pt-2">
            {pinCode && (
              <button
                type="button"
                onClick={handleRemovePin}
                className="btn-danger flex-1"
              >
                Hủy mã PIN
              </button>
            )}
            <button
              type="button"
              onClick={handleSavePin}
              className="btn-primary flex-1"
            >
              Lưu mã PIN
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Section({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 font-bold"><span className="grid size-7 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">{icon}</span>{title}</h3>
        {desc && <p className="muted mt-1 text-xs">{desc}</p>}
      </div>
      {children}
    </motion.section>
  )
}

function ActionBtn({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-left transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md dark:border-white/10 dark:hover:border-brand-500/30">
      <div className="grid size-10 place-items-center rounded-xl bg-slate-50 dark:bg-white/5">{icon}</div>
      <div><p className="text-sm font-semibold">{title}</p><p className="muted text-xs">{desc}</p></div>
    </button>
  )
}

function CategoriesSection() {
  const categories = useStore((s) => s.categories)
  const [tab, setTab] = useState<TxType>('expense')
  const [edit, setEdit] = useState<Category | 'new' | null>(null)
  return (
    <Section icon={<Pencil className="size-4" />} title="Danh mục">
      <div className="mb-4 flex items-center gap-3">
        <Segmented className="flex-1 sm:max-w-xs" value={tab} onChange={setTab} options={[{ value: 'expense', label: 'Chi' }, { value: 'income', label: 'Thu' }]} />
        <button className="btn-primary h-10 px-4" onClick={() => setEdit('new')}><Plus className="size-4" /> Thêm</button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {categories.filter((c) => c.type === tab).map((c) => (
          <button key={c.id} onClick={() => setEdit(c)} className="flex flex-col items-center gap-2 rounded-2xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/5">
            <CategoryIcon cat={c} size="lg" />
            <span className="line-clamp-1 text-xs font-medium">{c.name}</span>
          </button>
        ))}
      </div>
      <CategoryEditor value={edit} type={tab} onClose={() => setEdit(null)} />
    </Section>
  )
}

function CategoryEditor({ value, type, onClose }: { value: Category | 'new' | null; type: TxType; onClose: () => void }) {
  const add = useStore((s) => s.addCategory)
  const update = useStore((s) => s.updateCategory)
  const remove = useStore((s) => s.deleteCategory)
  const isNew = value === 'new'
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('Sparkles')
  const [color, setColor] = useState(COLORS[10])
  const [lastValue, setLastValue] = useState<typeof value>(null)

  if (value !== lastValue) {
    setLastValue(value)
    if (value && value !== 'new') { setName(value.name); setIcon(value.icon); setColor(value.color) }
    else if (value === 'new') { setName(''); setIcon('Sparkles'); setColor(COLORS[10]) }
  }

  const save = () => {
    if (!name.trim()) return toast.error('Vui lòng nhập tên danh mục')
    if (isNew) add({ name: name.trim(), icon, color, type })
    else if (value) update(value.id, { name: name.trim(), icon, color })
    toast.success('Đã lưu danh mục')
    onClose()
  }
  const canDelete = value && value !== 'new' && value.id !== 'other' && value.id !== 'other-in'

  return (
    <Modal open={!!value} onClose={onClose} title={isNew ? 'Danh mục mới' : 'Sửa danh mục'}
      footer={<div className="flex gap-3">
        {canDelete && <button className="btn-danger px-4" onClick={() => { remove((value as Category).id); toast('Đã xoá danh mục'); onClose() }}><Trash2 className="size-4" /></button>}
        <button className="btn-primary h-12 flex-1" onClick={save}>Lưu</button>
      </div>}>
      <div className="mb-5 flex justify-center"><CategoryIcon cat={{ id: '', name, icon, color, type }} size="lg" className="size-20 [&_svg]:size-9" /></div>
      <span className="label">Tên</span>
      <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Thú cưng" />
      <span className="label mt-4">Màu sắc</span>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((c) => (
          <button key={c} onClick={() => setColor(c)} className={cn('grid size-8 place-items-center rounded-full transition', color === c && 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900')} style={{ background: c, ['--tw-ring-color' as string]: c }}>
            {color === c && <Check className="size-4 text-white" />}
          </button>
        ))}
      </div>
      <span className="label mt-4">Biểu tượng</span>
      <div className="grid grid-cols-7 gap-2">
        {Object.entries(ICONS).map(([k, I]) => (
          <button key={k} onClick={() => setIcon(k)} className={cn('grid aspect-square place-items-center rounded-xl transition', icon === k ? 'text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-white/5')} style={icon === k ? { background: color } : undefined}>
            <I className="size-5" />
          </button>
        ))}
      </div>
    </Modal>
  )
}
