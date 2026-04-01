import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Payment } from '../../types'
import { seedPayments } from '../../data/seed'
import { nowISO } from '../../utils/date'
import { uid } from '../../utils/id'

export type PaymentsState = {
  items: Payment[]
}

const initialState: PaymentsState = {
  items: seedPayments,
}

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {
    addPayment(
      state,
      action: PayloadAction<Omit<Payment, 'id' | 'createdAt'>>,
    ) {
      state.items.unshift({
        ...action.payload,
        id: uid('p'),
        createdAt: nowISO(),
      })
    },
    deletePayment(state, action: PayloadAction<string>) {
      state.items = state.items.filter((p) => p.id !== action.payload)
    },
  },
})

export const { addPayment, deletePayment } = paymentsSlice.actions
export default paymentsSlice.reducer

