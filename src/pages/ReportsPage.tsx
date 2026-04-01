import { useMemo, useState } from 'react'
import { useAppSelector } from '../app/hooks'
import { isSameMonth } from '../utils/date'

function money(n: number): string {
  return n.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })
}

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

function Stat(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-xs text-slate-400">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold">{props.value}</div>
      {props.hint ? <div className="mt-1 text-xs text-slate-400">{props.hint}</div> : null}
    </div>
  )
}

export function ReportsPage() {
  const payments = useAppSelector((s) => s.payments.items)
  const expenses = useAppSelector((s) => s.expenses.items)
  const attendance = useAppSelector((s) => s.attendance.entries)

  const [month, setMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), monthIndex0: d.getMonth() }
  })

  const report = useMemo(() => {
    const earnings = payments
      .filter((p) => isSameMonth(p.date, month.year, month.monthIndex0))
      .reduce((s, p) => s + p.amount, 0)
    const spend = expenses
      .filter((e) => isSameMonth(e.date, month.year, month.monthIndex0))
      .reduce((s, e) => s + e.amount, 0)
    const profit = earnings - spend

    let present = 0
    let absent = 0
    for (const a of attendance) {
      if (!isSameMonth(a.date, month.year, month.monthIndex0)) continue
      if (a.status === 'Present') present++
      if (a.status === 'Absent') absent++
    }

    return { earnings, spend, profit, present, absent }
  }, [payments, expenses, attendance, month])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Reports</div>
          <div className="text-sm text-slate-400 mt-1">Monthly financial and attendance summary</div>
        </div>
        <select
          value={`${month.year}-${month.monthIndex0}`}
          onChange={(e) => {
            const [y, m] = e.target.value.split('-').map(Number)
            setMonth({ year: y!, monthIndex0: m! })
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Monthly Earnings" value={money(report.earnings)} />
        <Stat label="Monthly Expenses" value={money(report.spend)} />
        <Stat
          label="Profit / Loss"
          value={money(report.profit)}
          hint={report.profit >= 0 ? 'Profit' : 'Loss'}
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="font-semibold">Attendance summary</div>
        <div className="text-sm text-slate-400 mt-1">
          Total marked entries for the selected month
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Present marks</div>
            <div className="mt-2 text-2xl font-semibold text-emerald-200">{report.present}</div>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="text-xs text-slate-400">Absent marks</div>
            <div className="mt-2 text-2xl font-semibold text-rose-200">{report.absent}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="font-semibold">Notes</div>
        <ul className="mt-2 text-sm text-slate-400 list-disc pl-5 space-y-1">
          <li>Earnings are calculated from recorded payments.</li>
          <li>Expenses are calculated from recorded expense entries.</li>
          <li>Attendance summary counts only marked entries (not auto-inferred absences).</li>
        </ul>
      </div>
    </div>
  )
}

