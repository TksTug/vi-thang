import { useState, useRef } from 'react'
import { Camera, Upload, Sparkles, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Modal } from './Modal'
import { parseAmount, formatVND } from '../lib/utils'
import { guessCategory } from '../lib/categories'
import { useStore } from '../store/useStore'

export function ReceiptOcrModal({
  open,
  onClose,
  onExtracted,
}: {
  open: boolean
  onClose: () => void
  onExtracted: (data: { amount: number; note: string; categoryId?: string }) => void
}) {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState('')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const categories = useStore((s) => s.categories)

  const processImage = async (file: File) => {
    const previewUrl = URL.createObjectURL(file)
    setImageSrc(previewUrl)
    setLoading(true)
    setProgress('Đang chuẩn bị nhận diện...')

    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('vie+eng')

      setProgress('Đang đọc nội dung hóa đơn...')
      const ret = await worker.recognize(file)
      await worker.terminate()

      const text = ret.data.text
      console.log('OCR text:', text)

      // Regex to search for potential amounts in VND
      // Look for lines containing "Tổng", "Total", "Thanh toán", "Cộng" or large numbers
      const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
      let foundAmount: number | null = null
      let extractedTitle = ''

      // Prioritize total keywords
      const totalKeywords = ['tổng cộng', 'tong cong', 'tổng', 'thanh toán', 'tien mat', 'total', 'grand total', 'số tiền']
      for (const line of lines) {
        const lower = line.toLowerCase()
        if (totalKeywords.some((k) => lower.includes(k))) {
          // Extract numbers from this line
          const matches = line.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)/g)
          if (matches) {
            for (const m of matches) {
              const parsed = parseAmount(m)
              if (parsed && parsed >= 1000) {
                foundAmount = parsed
                break
              }
            }
          }
        }
        if (foundAmount) break
      }

      // Fallback: search for largest reasonable amount in document
      if (!foundAmount) {
        const allNums: number[] = []
        for (const line of lines) {
          const matches = line.match(/(\d{1,3}(?:[.,]\d{3})+|\d+)/g)
          if (matches) {
            for (const m of matches) {
              const p = parseAmount(m)
              if (p && p >= 1000 && p < 100_000_000) {
                allNums.push(p)
              }
            }
          }
        }
        if (allNums.length > 0) {
          foundAmount = Math.max(...allNums)
        }
      }

      // Title/Place guess (first 1-3 lines usually contain store/brand name)
      if (lines.length > 0) {
        extractedTitle = lines.slice(0, 2).join(' - ').replace(/[^a-zA-Z0-9\sÀ-ỹ]/g, '').trim()
        if (extractedTitle.length > 30) extractedTitle = extractedTitle.slice(0, 30)
      }

      const guessedCat = guessCategory(text, categories)

      setLoading(false)
      if (foundAmount) {
        toast.success(`Nhận diện thành công: ${formatVND(foundAmount)}`)
        onExtracted({
          amount: foundAmount,
          note: extractedTitle || 'Hóa đơn quét OCR',
          categoryId: guessedCat?.id,
        })
        onClose()
      } else {
        toast.warning('Không tìm thấy số tiền rõ ràng, vui lòng kiểm tra lại ảnh')
      }
    } catch (err) {
      console.error(err)
      setLoading(false)
      toast.error('Nhận diện thất bại, vui lòng thử lại với ảnh rõ hơn')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImage(file)
  }

  const handleClose = () => {
    if (loading) return
    setImageSrc(null)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-brand-500" />
          <span>Quét hóa đơn thông minh (OCR)</span>
        </div>
      }
    >
      <div className="space-y-4 text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Chụp hoặc tải lên hình ảnh hóa đơn siêu thị, nhà hàng, đổ xăng... App sẽ tự động bóc tách số tiền và danh mục.
        </p>

        {imageSrc ? (
          <div className="relative mx-auto max-h-64 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10">
            <img src={imageSrc} alt="Receipt preview" className="w-full object-contain" />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 text-white backdrop-blur-xs">
                <Loader2 className="size-8 animate-spin text-brand-400 mb-2" />
                <p className="text-sm font-semibold">{progress}</p>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-slate-200 p-8 cursor-pointer transition hover:border-brand-400 hover:bg-brand-50/20 dark:border-white/10 dark:hover:bg-white/5"
          >
            <div className="grid size-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              <Camera className="size-7" />
            </div>
            <div>
              <p className="text-sm font-bold">Chụp ảnh hoặc Tải ảnh hóa đơn</p>
              <p className="text-xs text-slate-400 mt-0.5">Hỗ trợ JPG, PNG</p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleFileChange}
        />

        <div className="flex justify-center gap-2 pt-2">
          <button
            type="button"
            className="btn-ghost text-xs"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="size-3.5" /> Chọn ảnh khác
          </button>
        </div>
      </div>
    </Modal>
  )
}
