import type { AttendanceEntry, Expense, Member, Payment } from '../types'
import { nowISO, todayISO } from '../utils/date'

const t = todayISO()

function daysFromToday(deltaDays: number): string {
  const d = new Date()
  d.setDate(d.getDate() + deltaDays)
  return d.toISOString().slice(0, 10)
}

export const seedMembers: Member[] = [
  {
    id: 'm_001',
    name: 'Ali Raza',
    dob: '1997-04-10',
    doj: daysFromToday(-60),
    phone: '03001234567',
    trainer: 'Usman',
    membershipType: 'Premium',
    membershipFee: 12000,
    startDate: daysFromToday(-30),
    endDate: daysFromToday(5),
    status: 'Active',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'm_002',
    name: 'Ayesha Khan',
    dob: '1996-09-18',
    doj: daysFromToday(-20),
    phone: '03112223344',
    trainer: 'Hina',
    membershipType: 'Basic',
    membershipFee: 7000,
    startDate: daysFromToday(-10),
    endDate: daysFromToday(2),
    status: 'Active',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'm_003',
    name: 'Bilal Ahmed',
    dob: '1993-07-21',
    doj: daysFromToday(-120),
    phone: '03335557788',
    membershipType: 'Basic',
    membershipFee: 7000,
    startDate: daysFromToday(-40),
    endDate: daysFromToday(-3),
    status: 'Expired',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
]

export const seedPayments: Payment[] = [
  {
    id: 'p_001',
    memberId: 'm_001',
    amount: 12000,
    date: daysFromToday(-29),
    method: 'JazzCash',
    note: 'Monthly membership',
    createdAt: nowISO(),
  },
  {
    id: 'p_002',
    memberId: 'm_002',
    amount: 7000,
    date: daysFromToday(-9),
    method: 'Cash',
    createdAt: nowISO(),
  },
]

export const seedExpenses: Expense[] = [
  {
    id: 'e_001',
    title: 'Rent',
    amount: 90000,
    date: daysFromToday(-5),
    category: 'Rent',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
  {
    id: 'e_002',
    title: 'Treadmill maintenance',
    amount: 6500,
    date: daysFromToday(-12),
    category: 'Equipment',
    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
]

export const seedAttendance: AttendanceEntry[] = [
  {
    id: 'a_001',
    memberId: 'm_001',
    date: t,
    status: 'Present',
    createdAt: nowISO(),
  },
  {
    id: 'a_002',
    memberId: 'm_002',
    date: t,
    status: 'Absent',
    createdAt: nowISO(),
  },
]

