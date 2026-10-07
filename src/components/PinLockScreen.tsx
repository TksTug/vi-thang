import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Lock, Delete, ShieldAlert } from 'lucide-react'
import { useStore } from '../store/useStore'

export function PinLockScreen() {
  const pinCode = useStore((s) => s.pinCode)
  const isLocked = useStore((s) => s.isLocked)
  const unlock = useStore((s) => s.unlock)
  const [enteredPin, setEnteredPin] = useState('')
  const [errorShake, setErrorShake] = useState(false)

  // Reset entered pin when lock state changes
  useEffect(() => {
    setEnteredPin('')
  }, [isLocked])

  if (!pinCode || !isLocked) return null

  const handlePress = (num: string) => {
    if (enteredPin.length < 4) {
      const next = enteredPin + num
      setEnteredPin(next)
      if (next.length === 4) {
        setTimeout(() => {
          const success = unlock(next)
          if (!success) {
            setErrorShake(true)
            setTimeout(() => {
              setErrorShake(false)
              setEnteredPin('')
            }, 500)
          }
        }, 100)
      }
    }
  }

  const handleDelete = () => {
    setEnteredPin((p) => p.slice(0, -1))
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 p-6 text-white select-none">
      <motion.div
        animate={errorShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center max-w-xs w-full text-center"
      >
        <div className="grid size-16 place-items-center rounded-3xl bg-brand-500/20 text-brand-400 mb-4 shadow-glow">
          <Lock className="size-8" />
        </div>
        <h2 className="text-xl font-bold">Nhập mã PIN</h2>
        <p className="text-slate-400 text-xs mt-1 mb-8">
          Ứng dụng đang được khóa để bảo vệ tài chính cá nhân
        </p>

        {/* PIN Dots */}
        <div className="flex gap-4 mb-10">
          {[0, 1, 2, 3].map((idx) => {
            const filled = idx < enteredPin.length
            return (
              <motion.div
                key={idx}
                animate={{ scale: filled ? 1.2 : 1 }}
                className={`size-4 rounded-full border-2 transition-colors ${
                  filled
                    ? 'border-brand-400 bg-brand-400 shadow-glow'
                    : 'border-slate-600 bg-transparent'
                }`}
              />
            )
          })}
        </div>

        {errorShake && (
          <p className="text-rose-400 text-xs font-semibold mb-4 flex items-center gap-1">
            <ShieldAlert className="size-4" /> Mã PIN không chính xác
          </p>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-4 w-full">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handlePress(digit)}
              className="grid aspect-square place-items-center rounded-2xl bg-white/5 text-2xl font-bold backdrop-blur-md transition active:scale-90 hover:bg-white/10"
            >
              {digit}
            </button>
          ))}
          <div />
          <button
            type="button"
            onClick={() => handlePress('0')}
            className="grid aspect-square place-items-center rounded-2xl bg-white/5 text-2xl font-bold backdrop-blur-md transition active:scale-90 hover:bg-white/10"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="grid aspect-square place-items-center rounded-2xl bg-white/5 text-slate-400 backdrop-blur-md transition active:scale-90 hover:bg-white/10 hover:text-white"
          >
            <Delete className="size-6" />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
