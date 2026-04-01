import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AttendanceEntry, AttendanceStatus } from '../../types'
import { seedAttendance } from '../../data/seed'
import { nowISO } from '../../utils/date'
import { uid } from '../../utils/id'

export type AttendanceState = {
  entries: AttendanceEntry[]
}

const initialState: AttendanceState = {
  entries: seedAttendance,
}

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    markAttendance(
      state,
      action: PayloadAction<{ memberId: string; date: string; status: AttendanceStatus }>,
    ) {
      const { memberId, date, status } = action.payload
      const existing = state.entries.find((e) => e.memberId === memberId && e.date === date)
      if (existing) {
        existing.status = status
        return
      }
      state.entries.unshift({
        id: uid('a'),
        memberId,
        date,
        status,
        createdAt: nowISO(),
      })
    },
    deleteAttendanceEntry(state, action: PayloadAction<string>) {
      state.entries = state.entries.filter((e) => e.id !== action.payload)
    },
  },
})

export const { markAttendance, deleteAttendanceEntry } = attendanceSlice.actions
export default attendanceSlice.reducer

