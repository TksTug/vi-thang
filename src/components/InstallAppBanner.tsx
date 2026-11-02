import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Download, X, Share2, PlusSquare } from 'lucide-react'

export function InstallAppBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('hide_install_banner') === 'true')
  const [showIosGuide, setShowIosGuide] = useState(false)

  useEffect(() => {
    // Check if already installed as standalone PWA
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    setIsStandalone(standalone)

    // Detect iOS Safari
    const ua = window.navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(ios)

    // Listen for Android / Chrome install prompt
    const handleBeforeInstall = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  if (isStandalone || dismissed) return null

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true)
      return
    }

    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setDeferredPrompt(null)
      }
    } else {
      setShowIosGuide(true)
    }
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('hide_install_banner', 'true')
  }

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-50 md:bottom-6 md:left-auto md:right-6 md:max-w-sm rounded-2xl bg-slate-900/95 text-white p-3.5 shadow-2xl border border-white/10 backdrop-blur-md flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0">
            <img src="./favicon.svg" alt="App logo" className="size-10 rounded-xl shadow-md shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Cài đặt Ví Tháng về điện thoại</p>
              <p className="text-[11px] text-slate-400 truncate">Dùng nhanh như app thật, không cần mở web</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleInstallClick}
              className="rounded-xl bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 text-xs font-bold shadow-glow flex items-center gap-1 active:scale-95 transition"
            >
              <Download className="size-3.5" /> Cài đặt
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1"
              title="Đóng"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Setup Guide Sheet */}
      {showIosGuide && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 p-6 text-slate-800 dark:text-slate-100 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Download className="size-5 text-brand-500" /> Cài đặt trên iPhone
              </h3>
              <button
                onClick={() => setShowIosGuide(false)}
                className="grid size-8 place-items-center rounded-full bg-slate-100 dark:bg-white/10"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Apple (iOS) cho phép bạn cài trực tiếp ứng dụng này ra màn hình chính mà không cần qua App Store chỉ với 2 bước:
            </p>

            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs">
                <span className="grid size-7 place-items-center rounded-xl bg-brand-50 text-brand-600 font-bold shrink-0">
                  1
                </span>
                <div>
                  Bấm nút <b>Chia sẻ</b> (<Share2 className="inline size-3.5 text-brand-500" />) ở thanh dưới cùng của trình duyệt Safari.
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-xs">
                <span className="grid size-7 place-items-center rounded-xl bg-brand-50 text-brand-600 font-bold shrink-0">
                  2
                </span>
                <div>
                  Cuộn xuống chọn <b>Thêm vào MH chính</b> (<PlusSquare className="inline size-3.5 text-brand-500" />).
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="btn-primary w-full h-11 text-xs font-bold mt-2"
            >
              Đã hiểu
            </button>
          </motion.div>
        </div>
      )}
    </>
  )
}
