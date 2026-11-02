import { useState } from 'react'
import { Cloud, RefreshCw, Copy, Check, LogOut, KeyRound, User } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from './Modal'
import { registerCloudAccount, uploadCloudData, downloadCloudData, type CloudSession } from '../lib/cloudSync'
import { useStore } from '../store/useStore'

export function AuthSyncModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [session, setSession] = useState<CloudSession | null>(() => {
    const saved = localStorage.getItem('vithang_cloud_session')
    return saved ? JSON.parse(saved) : null
  })

  const [mode, setMode] = useState<'create' | 'connect'>('create')
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [copied, setCopied] = useState(false)

  const store = useStore()

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setLoading(true)
    try {
      const payload = {
        transactions: store.transactions,
        categories: store.categories,
        budgets: store.budgets,
        recurring: store.recurring,
      }
      const syncCode = await registerCloudAccount(username.trim(), payload)
      const newSession: CloudSession = {
        accountName: username.trim(),
        syncCode,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
      }
      localStorage.setItem('vithang_cloud_session', JSON.stringify(newSession))
      setSession(newSession)
      toast.success('Đã tạo tài khoản Đám mây thành công!')
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Lỗi khi tạo tài khoản')
    } finally {
      setLoading(false)
    }
  }

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputCode.trim()) return

    setLoading(true)
    try {
      const result = await downloadCloudData(inputCode.trim())
      if (result.data) {
        store.importData(result.data)
      }
      const newSession: CloudSession = {
        accountName: result.username || 'Người dùng',
        syncCode: inputCode.trim(),
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
      }
      localStorage.setItem('vithang_cloud_session', JSON.stringify(newSession))
      setSession(newSession)
      toast.success(`Đã kết nối tài khoản "${result.username}" và cập nhật dữ liệu!`)
      onClose()
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async () => {
    if (!session) return
    setLoading(true)
    try {
      const payload = {
        transactions: store.transactions,
        categories: store.categories,
        budgets: store.budgets,
        recurring: store.recurring,
      }
      await uploadCloudData(session.syncCode, session.accountName, payload)
      const updated = {
        ...session,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
      }
      localStorage.setItem('vithang_cloud_session', JSON.stringify(updated))
      setSession(updated)
      toast.success('Đã đồng bộ dữ liệu mới nhất lên Đám mây!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi đồng bộ lên')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!session) return
    setLoading(true)
    try {
      const result = await downloadCloudData(session.syncCode)
      if (result.data) {
        store.importData(result.data)
      }
      const updated = {
        ...session,
        lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
      }
      localStorage.setItem('vithang_cloud_session', JSON.stringify(updated))
      setSession(updated)
      toast.success('Đã tải và cập nhật dữ liệu từ Đám mây về máy!')
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi tải dữ liệu về')
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (!session) return
    navigator.clipboard.writeText(session.syncCode)
    setCopied(true)
    toast.success('Đã sao chép Mã đồng bộ!')
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = () => {
    localStorage.removeItem('vithang_cloud_session')
    setSession(null)
    toast.info('Đã ngắt kết nối đồng bộ trên thiết bị này')
  }

  return (
    <Modal open={open} onClose={onClose} title="Đồng bộ Đám mây (Cloud Sync)">
      <div className="space-y-5">
        {session ? (
          /* When connected */
          <div className="space-y-4 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <Cloud className="size-8" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Tài khoản đang kết nối</p>
              <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">
                {session.accountName}
              </h3>
              {session.lastSyncedAt && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Đồng bộ lần cuối lúc {session.lastSyncedAt}
                </p>
              )}
            </div>

            {/* Sync Code box */}
            <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-3.5 text-left dark:border-brand-500/30 dark:bg-brand-500/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Mã đồng bộ (Dùng để nhập trên iPhone / Máy khác):
              </span>
              <div className="flex items-center justify-between gap-2 mt-1">
                <code className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 truncate">
                  {session.syncCode}
                </code>
                <button
                  type="button"
                  onClick={copyCode}
                  className="grid size-8 shrink-0 place-items-center rounded-xl bg-white shadow-xs hover:bg-slate-50 dark:bg-white/10"
                  title="Sao chép mã"
                >
                  {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={loading}
                onClick={handleUpload}
                className="btn-primary h-12 text-xs flex items-center justify-center gap-1.5"
              >
                <Cloud className="size-4" /> Đồng bộ Lên đám mây
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleDownload}
                className="btn-ghost h-12 text-xs flex items-center justify-center gap-1.5"
              >
                <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Tải dữ liệu về máy
              </button>
            </div>

            <button
              type="button"
              onClick={handleDisconnect}
              className="btn-danger w-full h-10 text-xs mt-2 flex items-center justify-center gap-1.5"
            >
              <LogOut className="size-3.5" /> Ngắt kết nối trên máy này
            </button>
          </div>
        ) : (
          /* When NOT connected */
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Tạo tài khoản để sao lưu dữ liệu lên đám mây, hoặc nhập Mã đồng bộ để kết nối iPhone và PC với nhau.
            </p>

            {/* Tab switch */}
            <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-white/5">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                  mode === 'create'
                    ? 'bg-white shadow-sm dark:bg-white/10 text-brand-600 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                Tạo tài khoản mới
              </button>
              <button
                type="button"
                onClick={() => setMode('connect')}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                  mode === 'connect'
                    ? 'bg-white shadow-sm dark:bg-white/10 text-brand-600 dark:text-white'
                    : 'text-slate-500'
                }`}
              >
                Đã có Mã đồng bộ
              </button>
            </div>

            {mode === 'create' ? (
              <form onSubmit={handleCreateAccount} className="space-y-3">
                <div>
                  <span className="label">Tên của bạn</span>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      required
                      placeholder="VD: Tuấn, Mai, Huy..."
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="input pl-11 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 p-3 text-[11px] text-emerald-800 dark:text-emerald-300">
                  ✨ Miễn phí 100%, không cần đăng ký phức tạp. App sẽ cấp cho bạn 1 <b>Mã đồng bộ</b> riêng biệt.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 text-sm font-bold mt-2"
                >
                  {loading ? 'Đang tạo đám mây...' : 'Tạo tài khoản & Bắt đầu đồng bộ'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleConnectAccount} className="space-y-3">
                <div>
                  <span className="label">Nhập Mã đồng bộ</span>
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      required
                      placeholder="Dán mã đồng bộ từ thiết bị kia vào đây"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                      className="input pl-11 text-xs font-mono font-semibold"
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400">
                  💡 Mẹo: Mở mục này trên máy đã có dữ liệu, bấm <b>Sao chép mã</b> rồi gửi qua Zalo/iMessage sang máy này để dán vào.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 text-sm font-bold mt-2"
                >
                  {loading ? 'Đang kết nối...' : 'Kết nối & Tải dữ liệu về'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
