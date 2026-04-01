import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Member } from '../../types'
import { seedMembers } from '../../data/seed'
import { nowISO, todayISO, daysBetween } from '../../utils/date'
import { uid } from '../../utils/id'

export type MembersState = {
  items: Member[]
}

function computeStatus(endDate: string): Member['status'] {
  const diff = daysBetween(todayISO(), endDate)
  return diff < 0 ? 'Expired' : 'Active'
}

function normalize(m: Member): Member {
  return { ...m, status: computeStatus(m.endDate) }
}

const initialState: MembersState = {
  items: seedMembers.map(normalize),
}

const membersSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    refreshStatuses(state) {
      state.items = state.items.map((m) => normalize({ ...m, updatedAt: nowISO() }))
    },
    addMember(
      state,
      action: PayloadAction<Omit<Member, 'id' | 'status' | 'createdAt' | 'updatedAt'>>,
    ) {
      const now = nowISO()
      const m: Member = normalize({
        ...action.payload,
        id: uid('m'),
        status: 'Active',
        createdAt: now,
        updatedAt: now,
      })
      state.items.unshift(m)
    },
    updateMember(state, action: PayloadAction<{ id: string; patch: Partial<Member> }>) {
      const idx = state.items.findIndex((m) => m.id === action.payload.id)
      if (idx === -1) return
      const current = state.items[idx]!
      const updated: Member = normalize({
        ...current,
        ...action.payload.patch,
        updatedAt: nowISO(),
      })
      state.items[idx] = updated
    },
    deleteMember(state, action: PayloadAction<string>) {
      state.items = state.items.filter((m) => m.id !== action.payload)
    },
  },
})

export const { addMember, updateMember, deleteMember, refreshStatuses } = membersSlice.actions
export default membersSlice.reducer

