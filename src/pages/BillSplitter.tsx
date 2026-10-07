import { useState } from 'react'
import { Plus, Trash2, Copy, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '../components/ui'
import { formatVND, formatInputNumber } from '../lib/utils'
import { useUI } from '../store/useUI'

interface Person {
  id: string
  name: string
  items: { id: string; name: string; amount: number }[]
}

export function BillSplitter() {
  const { openForm } = useUI()
  const [mode, setMode] = useState<'equal' | 'itemized'>('equal')
  const [totalAmount, setTotalAmount] = useState('')
  const [tipPercent, setTipPercent] = useState<number>(0)
  const [memberCount, setMemberCount] = useState<number>(3)

  // Itemized bill mode
  const [people, setPeople] = useState<Person[]>([
    { id: '1', name: 'Tôi', items: [{ id: 'i1', name: 'Món chính', amount: 65000 }] },
    { id: '2', name: 'Bạn A', items: [{ id: 'i2', name: 'Món chính + Nước', amount: 85000 }] },
    { id: '3', name: 'Bạn B', items: [{ id: 'i3', name: 'Combo', amount: 95000 }] },
  ])

  const numTotal = Number(totalAmount.replace(/\D/g, '')) || 0
  const tipAmount = Math.round((numTotal * tipPercent) / 100)
  const finalTotal = numTotal + tipAmount
  const perPersonEqual = memberCount > 0 ? Math.round(finalTotal / memberCount) : 0

  // Itemized calculations
  const subtotalItemized = people.reduce(
    (acc, p) => acc + p.items.reduce((s, it) => s + it.amount, 0),
    0,
  )
  const itemizedTip = Math.round((subtotalItemized * tipPercent) / 100)

  const addPerson = () => {
    const id = Date.now().toString()
    setPeople((prev) => [
      ...prev,
      { id, name: `Người ${prev.length + 1}`, items: [{ id: 'it-' + id, name: 'Món ăn', amount: 50000 }] },
    ])
  }

  const removePerson = (id: string) => {
    if (people.length <= 1) return
    setPeople((prev) => prev.filter((p) => p.id !== id))
  }

  const addItem = (personId: string) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: [...p.items, { id: Date.now().toString(), name: 'Món thêm', amount: 30000 }],
            }
          : p,
      ),
    )
  }

  const removeItem = (personId: string, itemId: string) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: p.items.filter((it) => it.id !== itemId),
            }
          : p,
      ),
    )
  }

  const updateItem = (personId: string, itemId: string, name: string, amount: number) => {
    setPeople((prev) =>
      prev.map((p) =>
        p.id === personId
          ? {
              ...p,
              items: p.items.map((it) => (it.id === itemId ? { ...it, name, amount } : it)),
            }
          : p,
      ),
    )
  }

  const updatePersonName = (personId: string, name: string) => {
    setPeople((prev) => prev.map((p) => (p.id === personId ? { ...p, name } : p)))
  }

  const copyPaymentText = (name: string, amt: number) => {
    const text = `Chào ${name}, tiền ăn uống chia nhóm của bạn là: ${formatVND(amt)}. Vui lòng gửi lại mình nhé! Cảm ơn bạn.`
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép lời nhắn cho ${name}`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chia tiền nhóm (Bill Splitter)"
        subtitle="Chia đều hoặc chia chi tiết từng món cho nhóm bạn, tự tạo mã QR chuyển khoản"
      />

      {/* Tabs */}
      <div className="flex rounded-2xl bg-slate-100 p-1 dark:bg-white/5 max-w-md">
        <button
          onClick={() => setMode('equal')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
            mode === 'equal'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-slate-500'
          }`}
        >
          Chia đều (Equal)
        </button>
        <button
          onClick={() => setMode('itemized')}
          className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
            mode === 'itemized'
              ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white'
              : 'text-slate-500'
          }`}
        >
          Chia theo món (Itemized)
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left config form */}
        <div className="card p-5 space-y-4 lg:col-span-2">
          {mode === 'equal' ? (
            <>
              <div>
                <span className="label">Tổng hóa đơn (Bill)</span>
                <div className="relative">
                  <input
                    inputMode="numeric"
                    placeholder="VD: 450.000"
                    className="input h-14 text-2xl font-bold"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(formatInputNumber(e.target.value))}
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ₫
                  </span>
                </div>
              </div>

              <div>
                <span className="label">Số người cùng chia</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMemberCount((c) => Math.max(2, c - 1))}
                    className="btn-ghost size-12 rounded-2xl text-xl"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="2"
                    value={memberCount}
                    onChange={(e) => setMemberCount(Math.max(1, Number(e.target.value)))}
                    className="input h-12 text-center text-lg font-bold w-28"
                  />
                  <button
                    onClick={() => setMemberCount((c) => c + 1)}
                    className="btn-ghost size-12 rounded-2xl text-xl"
                  >
                    +
                  </button>
                  <span className="text-sm font-semibold text-slate-500">người</span>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="label mb-0">Danh sách thành viên & Món đã gọi</span>
                <button onClick={addPerson} className="btn-primary h-9 text-xs px-3">
                  <Plus className="size-3.5" /> Thêm người
                </button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {people.map((person) => {
                  const personSubtotal = person.items.reduce((s, it) => s + it.amount, 0)
                  return (
                    <div
                      key={person.id}
                      className="rounded-2xl border border-slate-200/80 p-4 dark:border-white/5 space-y-3 bg-slate-50/50 dark:bg-white/2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <input
                          value={person.name}
                          onChange={(e) => updatePersonName(person.id, e.target.value)}
                          className="font-bold bg-transparent text-base focus:bg-white dark:focus:bg-slate-800 rounded-lg px-2 py-1 outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-brand-600 dark:text-brand-400 tabular-nums">
                            {formatVND(personSubtotal)}
                          </span>
                          {people.length > 1 && (
                            <button
                              onClick={() => removePerson(person.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {person.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-2 text-xs">
                            <input
                              value={item.name}
                              onChange={(e) =>
                                updateItem(person.id, item.id, e.target.value, item.amount)
                              }
                              placeholder="Tên món"
                              className="input h-9 flex-1 text-xs"
                            />
                            <div className="relative w-32">
                              <input
                                inputMode="numeric"
                                value={formatInputNumber(String(item.amount))}
                                onChange={(e) => {
                                  const n = Number(e.target.value.replace(/\D/g, '')) || 0
                                  updateItem(person.id, item.id, item.name, n)
                                }}
                                className="input h-9 text-right font-semibold text-xs pr-6"
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">₫</span>
                            </div>
                            {person.items.length > 1 && (
                              <button
                                onClick={() => removeItem(person.id, item.id)}
                                className="text-slate-400 hover:text-rose-500 p-1"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => addItem(person.id)}
                        className="text-xs font-semibold text-brand-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        <Plus className="size-3" /> Thêm món
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Tip / Phí phục vụ */}
          <div>
            <span className="label">Phí dịch vụ / Tip / VAT (%)</span>
            <div className="flex gap-2">
              {[0, 5, 8, 10, 15].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setTipPercent(pct)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold transition ${
                    tipPercent === pct
                      ? 'bg-brand-500 text-white shadow-glow'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right result column */}
        <div className="space-y-4">
          <div className="card p-5 bg-gradient-to-br from-brand-500 to-indigo-600 text-white shadow-glow">
            <p className="text-xs font-medium text-white/80">Kết quả tính toán</p>
            {mode === 'equal' ? (
              <>
                <p className="text-3xl font-extrabold mt-1 tabular-nums">
                  {formatVND(perPersonEqual)}
                </p>
                <p className="text-xs text-white/80 mt-1">mỗi người ({memberCount} người)</p>
                <div className="border-t border-white/20 mt-4 pt-3 text-xs space-y-1 text-white/90">
                  <div className="flex justify-between">
                    <span>Tổng hóa đơn:</span>
                    <span>{formatVND(numTotal)}</span>
                  </div>
                  {tipPercent > 0 && (
                    <div className="flex justify-between">
                      <span>Phí dịch vụ ({tipPercent}%):</span>
                      <span>+{formatVND(tipAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm pt-1">
                    <span>Tổng thanh toán:</span>
                    <span>{formatVND(finalTotal)}</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-3xl font-extrabold mt-1 tabular-nums">
                  {formatVND(subtotalItemized + itemizedTip)}
                </p>
                <p className="text-xs text-white/80 mt-1">
                  tổng cộng cho {people.length} thành viên
                </p>
              </>
            )}

            {/* Quick Record as Expense */}
            <button
              onClick={() => {
                const myShare =
                  mode === 'equal'
                    ? perPersonEqual
                    : Math.round(
                        people[0].items.reduce((s, it) => s + it.amount, 0) * (1 + tipPercent / 100),
                      )
                openForm({
                  type: 'expense',
                })
                toast.info(`Phần của bạn: ${formatVND(myShare)}. Vui lòng điền vào giao dịch.`)
              }}
              className="mt-5 w-full rounded-2xl bg-white text-brand-700 py-3 text-xs font-bold shadow-md transition hover:bg-white/90 flex items-center justify-center gap-1.5"
            >
              <ArrowRight className="size-4" /> Ghi nhận phần của tôi vào chi tiêu
            </button>
          </div>

          {/* Breakdown / Share list */}
          <div className="card p-5 space-y-3">
            <h4 className="text-sm font-bold">Danh sách cần thu</h4>
            <div className="space-y-2">
              {mode === 'equal'
                ? Array.from({ length: memberCount }).map((_, idx) => {
                    const name = idx === 0 ? 'Tôi' : `Bạn ${idx + 1}`
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-xs font-medium"
                      >
                        <span>{name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold tabular-nums">{formatVND(perPersonEqual)}</span>
                          {idx !== 0 && (
                            <button
                              onClick={() => copyPaymentText(name, perPersonEqual)}
                              className="text-slate-400 hover:text-brand-500 p-1"
                              title="Sao chép lời nhắn"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })
                : people.map((p, idx) => {
                    const personSubtotal = p.items.reduce((s, it) => s + it.amount, 0)
                    const shareWithTip = Math.round(personSubtotal * (1 + tipPercent / 100))
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-xs font-medium"
                      >
                        <div>
                          <p className="font-bold">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.items.length} món</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold tabular-nums">{formatVND(shareWithTip)}</span>
                          {idx !== 0 && (
                            <button
                              onClick={() => copyPaymentText(p.name, shareWithTip)}
                              className="text-slate-400 hover:text-brand-500 p-1"
                              title="Sao chép lời nhắn"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
