import { useMemo } from 'react'
import { useAppSelector } from '../app/hooks'
import { daysBetween, todayISO } from '../utils/date'
import { Link } from 'react-router-dom'

function StatCard(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
      <div className="text-xs text-slate-400">{props.label}</div>
      <div className="mt-2 text-2xl font-semibold text-slate-50">{props.value}</div>
      {props.hint ? <div className="mt-1 text-xs text-slate-400">{props.hint}</div> : null}
    </div>
  )
}

function money(n: number): string {
  return n.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })
}

export function DashboardPage() {
  const members = useAppSelector((s) => s.members.items)
  const payments = useAppSelector((s) => s.payments.items)
  const expenses = useAppSelector((s) => s.expenses.items)

  const summary = useMemo(() => {
    const totalMembers = members.length
    const activeMembers = members.filter((m) => m.status === 'Active').length
    const expiredMembers = totalMembers - activeMembers
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalEarnings - totalExpenses
    return { totalMembers, activeMembers, expiredMembers, totalEarnings, totalExpenses, netProfit }
  }, [members, payments, expenses])

  const expiringSoon = useMemo(() => {
    const t = todayISO()
    return members
      .filter((m) => m.status === 'Active')
      .map((m) => ({ m, daysLeft: daysBetween(t, m.endDate) }))
      .filter((x) => x.daysLeft >= 0 && x.daysLeft <= 5)
      .sort((a, b) => a.daysLeft - b.daysLeft)
  }, [members])

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-2xl font-semibold">Dashboard</div>
          <div className="text-sm text-slate-400 mt-1">Overview of members and finances</div>
        </div>
        <Link
          to="/members"
          className="rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
        >
          Manage members
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">
        <StatCard label="Total Members" value={String(summary.totalMembers)} />
        <StatCard label="Active Members" value={String(summary.activeMembers)} />
        <StatCard label="Expired Members" value={String(summary.expiredMembers)} />
        <StatCard label="Total Earnings" value={money(summary.totalEarnings)} />
        <StatCard label="Total Expenses" value={money(summary.totalExpenses)} />
        <StatCard
          label="Net Profit"
          value={money(summary.netProfit)}
          hint={summary.netProfit >= 0 ? 'Positive' : 'Negative'}
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold">Expiring soon (0–5 days)</div>
            <div className="text-xs text-slate-400">Members to remind on WhatsApp</div>
          </div>
          <Link to="/members" className="text-sm text-indigo-300 hover:text-indigo-200">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Member</th>
                <th>Phone</th>
                <th>End date</th>
                <th>Days left</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {expiringSoon.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={4}>
                    No memberships expiring soon.
                  </td>
                </tr>
              ) : (
                expiringSoon.map(({ m, daysLeft }) => (
                  <tr key={m.id} className="[&>td]:px-4 [&>td]:py-3">
                    <td className="text-slate-100">{m.name}</td>
                    <td className="text-slate-300">{m.phone}</td>
                    <td className="text-slate-300">{m.endDate}</td>
                    <td>
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-200 border border-amber-500/30 px-2 py-0.5">
                        {daysLeft}d
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

