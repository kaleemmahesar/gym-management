import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Expense } from '../../types'
import { seedExpenses } from '../../data/seed'
import { nowISO } from '../../utils/date'
import { uid } from '../../utils/id'

export type ExpensesState = {
  items: Expense[]
}

const initialState: ExpensesState = {
  items: seedExpenses,
}

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    addExpense(
      state,
      action: PayloadAction<Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>>,
    ) {
      const now = nowISO()
      state.items.unshift({
        ...action.payload,
        id: uid('e'),
        createdAt: now,
        updatedAt: now,
      })
    },
    updateExpense(state, action: PayloadAction<{ id: string; patch: Partial<Expense> }>) {
      const idx = state.items.findIndex((e) => e.id === action.payload.id)
      if (idx === -1) return
      state.items[idx] = {
        ...state.items[idx]!,
        ...action.payload.patch,
        updatedAt: nowISO(),
      }
    },
    deleteExpense(state, action: PayloadAction<string>) {
      state.items = state.items.filter((e) => e.id !== action.payload)
    },
  },
})

export const { addExpense, updateExpense, deleteExpense } = expensesSlice.actions
export default expensesSlice.reducer

