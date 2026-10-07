export type TxType = 'expense' | 'income'
export type PayMethod = 'cash' | 'card' | 'ewallet'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TxType
  keywords?: string[]
}

export interface Transaction {
  id: string
  type: TxType
  amount: number
  categoryId: string
  /** yyyy-MM-dd */
  date: string
  note: string
  method: PayMethod
  recurringId?: string
  createdAt: number
}

export interface Recurring {
  id: string
  type: TxType
  amount: number
  categoryId: string
  /** day of month 1..28 */
  day: number
  note: string
  active: boolean
}

export interface MonthBudget {
  total: number
  categories: Record<string, number>
}

export const METHOD_LABEL: Record<PayMethod, string> = {
  cash: 'Tiền mặt',
  card: 'Thẻ ngân hàng',
  ewallet: 'Ví điện tử',
}
