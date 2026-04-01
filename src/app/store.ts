import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import membersReducer from '../features/members/membersSlice'
import attendanceReducer from '../features/attendance/attendanceSlice'
import paymentsReducer from '../features/payments/paymentsSlice'
import expensesReducer from '../features/expenses/expensesSlice'
import uiReducer from '../features/ui/uiSlice'
import { loadJson, saveJson } from '../utils/storage'

const STORAGE_KEY = 'gym_admin_app_v2'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    members: membersReducer,
    attendance: attendanceReducer,
    payments: paymentsReducer,
    expenses: expensesReducer,
    ui: uiReducer,
  },
  preloadedState: loadJson(STORAGE_KEY, undefined),
})

let saveTimer: number | undefined
store.subscribe(() => {
  window.clearTimeout(saveTimer)
  saveTimer = window.setTimeout(() => {
    const state = store.getState()
    saveJson(STORAGE_KEY, {
      auth: state.auth,
      members: state.members,
      attendance: state.attendance,
      payments: state.payments,
      expenses: state.expenses,
      ui: state.ui,
    })
  }, 250)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

