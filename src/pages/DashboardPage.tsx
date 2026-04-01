import { useMemo } from 'react'
import { useAppSelector } from '../app/hooks'
import { daysBetween, todayISO } from '../utils/date'
import { Link } from 'react-router-dom'
import {
  FiActivity,
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiUserCheck,
  FiUserX,
  FiUsers,
  FiZap,
} from 'react-icons/fi'

function StatCard(props: {
  section: string
  label: string
  value: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  tone: 'blue' | 'green' | 'red' | 'amber' | 'purple' | 'slate'
}) {
  const tone =
    props.tone === 'blue'
      ? 'border-sky-500/30 text-sky-300 bg-sky-500/10'
      : props.tone === 'green'
        ? 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10'
        : props.tone === 'red'
          ? 'border-rose-500/30 text-rose-300 bg-rose-500/10'
          : props.tone === 'amber'
            ? 'border-amber-500/30 text-amber-300 bg-amber-500/10'
            : props.tone === 'purple'
              ? 'border-violet-500/30 text-violet-300 bg-violet-500/10'
              : 'border-slate-600 text-slate-300 bg-slate-800/30'

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/65 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-slate-500">{props.section}</div>
          <div className="text-sm font-medium text-slate-300 mt-1">{props.label}</div>
        </div>
        <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border ${tone}`}>
          <props.icon className="text-base" />
        </div>
      </div>
      <div className="mt-3 text-2xl font-bold tracking-tight text-slate-50">{props.value}</div>
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

  const activeRatio = summary.totalMembers
    ? Math.round((summary.activeMembers / summary.totalMembers) * 100)
    : 0

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-indigo-600/25 via-violet-600/10 to-fuchsia-600/20 p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-900">
              <FiZap />
              Gym Performance Snapshot
            </div>
            <div className="mt-3 text-2xl md:text-3xl font-bold tracking-tight">Dashboard</div>
            <div className="text-sm text-slate-300 mt-1">Clean overview of operations and finance</div>
          </div>
          <Link
            to="/members"
            className="rounded-xl bg-white/40 border border-white/20 px-4 py-2 text-sm text-slate-100 hover:bg-white/15 transition"
          >
            <b>Manage members</b>
          </Link>
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Member Metrics</div>
          <div className="text-sm text-slate-400 mt-1">Membership distribution and renewals</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          section="Members"
          label="Total Members"
          value={String(summary.totalMembers)}
          icon={FiUsers}
          tone="blue"
        />
        <StatCard
          section="Members"
          label="Active Members"
          value={String(summary.activeMembers)}
          icon={FiUserCheck}
          tone="green"
          hint={`${activeRatio}% of total`}
        />
        <StatCard
          section="Members"
          label="Expired Members"
          value={String(summary.expiredMembers)}
          icon={FiUserX}
          tone="red"
        />
        <StatCard
          section="Renewal"
          label="Due in 5 days"
          value={String(expiringSoon.length)}
          icon={FiActivity}
          tone={expiringSoon.length > 0 ? 'amber' : 'slate'}
        />
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">Financial Metrics</div>
          <div className="text-sm text-slate-400 mt-1">Total collections, expenses and bottom line</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard
          section="Finance"
          label="Total Earnings"
          value={money(summary.totalEarnings)}
          icon={FiTrendingUp}
          tone="green"
        />
        <StatCard
          section="Finance"
          label="Total Expenses"
          value={money(summary.totalExpenses)}
          icon={FiTrendingDown}
          tone="amber"
        />
        <StatCard
          section="Finance"
          label="Net Profit"
          value={money(summary.netProfit)}
          hint={summary.netProfit >= 0 ? 'Healthy' : 'Needs attention'}
          icon={FiDollarSign}
          tone={summary.netProfit >= 0 ? 'purple' : 'red'}
        />
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 shadow-lg shadow-black/10 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div>
            <div className="font-semibold flex items-center gap-2">
              <FiActivity className="text-amber-300" />
              Expiring soon (0-5 days)
            </div>
            <div className="text-xs text-slate-400">Members to remind on WhatsApp</div>
          </div>
          <Link to="/members" className="text-sm text-indigo-300 hover:text-indigo-200">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400 bg-slate-900/40">
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
                  <tr key={m.id} className="[&>td]:px-4 [&>td]:py-3 hover:bg-slate-900/30 transition">
                    <td className="text-slate-100">{m.name}</td>
                    <td className="text-slate-300">{m.phone}</td>
                    <td className="text-slate-300">{m.endDate}</td>
                    <td>
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 px-2 py-0.5 font-medium">
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
      <div className="h-6 lg:h-10" />
    </div>
  )
}

