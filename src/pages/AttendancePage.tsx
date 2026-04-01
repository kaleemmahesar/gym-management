import { useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { markAttendance } from '../features/attendance/attendanceSlice'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { todayISO, isSameMonth } from '../utils/date'
import { toast } from 'react-toastify'
import type { AttendanceStatus, Member } from '../types'

function monthOptions(): { label: string; year: number; monthIndex0: number }[] {
  const d = new Date()
  const opts: { label: string; year: number; monthIndex0: number }[] = []
  for (let i = 0; i < 12; i++) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1)
    opts.push({
      label: x.toLocaleString(undefined, { month: 'long', year: 'numeric' }),
      year: x.getFullYear(),
      monthIndex0: x.getMonth(),
    })
  }
  return opts
}

export function AttendancePage() {
  const dispatch = useAppDispatch()
  const members = useAppSelector((s) => s.members.items).filter((m) => m.status === 'Active')
  const entries = useAppSelector((s) => s.attendance.entries)

  const [date, setDate] = useState(todayISO())
  const [reportMonth, setReportMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), monthIndex0: d.getMonth() }
  })
  const [historyMember, setHistoryMember] = useState<Member | null>(null)

  const todaysMap = useMemo(() => {
    const m = new Map<string, AttendanceStatus>()
    entries.filter((e) => e.date === date).forEach((e) => m.set(e.memberId, e.status))
    return m
  }, [entries, date])

  const dailyCounts = useMemo(() => {
    let present = 0
    let absent = 0
    for (const m of members) {
      const s = todaysMap.get(m.id)
      if (s === 'Present') present++
      else if (s === 'Absent') absent++
    }
    return { present, absent, total: members.length }
  }, [members, todaysMap])

  const monthlyCounts = useMemo(() => {
    const { year, monthIndex0 } = reportMonth
    const byMember = new Map<string, { present: number; absent: number }>()
    for (const m of members) byMember.set(m.id, { present: 0, absent: 0 })
    for (const e of entries) {
      if (!isSameMonth(e.date, year, monthIndex0)) continue
      const bucket = byMember.get(e.memberId)
      if (!bucket) continue
      if (e.status === 'Present') bucket.present++
      if (e.status === 'Absent') bucket.absent++
    }
    return byMember
  }, [entries, members, reportMonth])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Attendance</div>
          <div className="text-sm text-slate-400 mt-1">Mark daily attendance and view reports</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-slate-400">Date</div>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs text-slate-400">Total Active Members</div>
          <div className="mt-2 text-2xl font-semibold">{dailyCounts.total}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs text-slate-400">Present</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-200">{dailyCounts.present}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="text-xs text-slate-400">Absent</div>
          <div className="mt-2 text-2xl font-semibold text-rose-200">{dailyCounts.absent}</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="font-semibold">Mark attendance</div>
          <div className="text-xs text-slate-400">{date}</div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Member</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={3}>
                    No active members.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const s = todaysMap.get(m.id)
                  return (
                    <tr key={m.id} className="[&>td]:px-4 [&>td]:py-3">
                      <td className="text-slate-100 font-medium">{m.name}</td>
                      <td>
                        {s ? (
                          <Badge tone={s === 'Present' ? 'green' : 'red'}>{s}</Badge>
                        ) : (
                          <Badge tone="slate">Not marked</Badge>
                        )}
                      </td>
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            dispatch(markAttendance({ memberId: m.id, date, status: 'Present' }))
                            toast.success('Marked present')
                          }}
                          className="mr-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-200 hover:bg-emerald-500/15 transition"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => {
                            dispatch(markAttendance({ memberId: m.id, date, status: 'Absent' }))
                            toast.info('Marked absent')
                          }}
                          className="mr-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/15 transition"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => setHistoryMember(m)}
                          className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-slate-200 hover:bg-slate-900 transition"
                        >
                          History
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-semibold">Monthly report</div>
            <div className="text-xs text-slate-400">Attendance counts per member</div>
          </div>
          <select
            value={`${reportMonth.year}-${reportMonth.monthIndex0}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split('-').map(Number)
              setReportMonth({ year: y!, monthIndex0: m! })
            }}
            className="rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
          >
            {monthOptions().map((o) => (
              <option key={`${o.year}-${o.monthIndex0}`} value={`${o.year}-${o.monthIndex0}`}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Member</th>
                <th>Present</th>
                <th>Absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={3}>
                    No active members.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const c = monthlyCounts.get(m.id) ?? { present: 0, absent: 0 }
                  return (
                    <tr key={m.id} className="[&>td]:px-4 [&>td]:py-3">
                      <td className="text-slate-100">{m.name}</td>
                      <td className="text-emerald-200">{c.present}</td>
                      <td className="text-rose-200">{c.absent}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!historyMember}
        onClose={() => setHistoryMember(null)}
        title={historyMember ? `Attendance history — ${historyMember.name}` : 'Attendance history'}
      >
        <div className="space-y-3">
          <div className="text-sm text-slate-400">
            Showing latest entries (most recent first).
          </div>
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="text-slate-400">
                <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {historyMember ? (
                  entries
                    .filter((e) => e.memberId === historyMember.id)
                    .slice(0, 30)
                    .map((e) => (
                      <tr key={e.id} className="[&>td]:px-3 [&>td]:py-2">
                        <td className="text-slate-300">{e.date}</td>
                        <td>
                          <Badge tone={e.status === 'Present' ? 'green' : 'red'}>{e.status}</Badge>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td className="px-3 py-3 text-slate-400" colSpan={2}>
                      No member selected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  )
}

