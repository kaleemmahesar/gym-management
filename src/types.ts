export type ID = string

export type MembershipType = 'Basic' | 'Premium'
export type MemberStatus = 'Active' | 'Expired'

export type Member = {
  id: ID
  name: string
  dob: string // YYYY-MM-DD
  doj: string // YYYY-MM-DD
  phone: string
  photoDataUrl?: string
  trainer?: string
  membershipType: MembershipType
  membershipFee: number
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  status: MemberStatus
  createdAt: string
  updatedAt: string
}

export type AttendanceStatus = 'Present' | 'Absent'

export type AttendanceEntry = {
  id: ID
  memberId: ID
  date: string // YYYY-MM-DD
  status: AttendanceStatus
  createdAt: string
}

export type Payment = {
  id: ID
  memberId: ID
  amount: number
  date: string // YYYY-MM-DD
  method: 'Cash' | 'Card' | 'Bank Transfer' | 'JazzCash' | 'Other'
  note?: string
  createdAt: string
}

export type Expense = {
  id: ID
  title: string
  amount: number
  date: string // YYYY-MM-DD
  category: 'Rent' | 'Utilities' | 'Equipment' | 'Staff Salaries' | 'Other'
  createdAt: string
  updatedAt: string
}

