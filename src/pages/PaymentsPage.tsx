import { useMemo, useState } from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addPayment, deletePayment } from '../features/payments/paymentsSlice'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { todayISO } from '../utils/date'
import { toast } from 'react-toastify'
import type { Payment } from '../types'

const schema = Yup.object({
  memberId: Yup.string().required('Member is required'),
  amount: Yup.number().min(0).required('Amount is required'),
  date: Yup.string().required('Date is required'),
  method: Yup.mixed<Payment['method']>()
    .oneOf(['Cash', 'Card', 'Bank Transfer', 'JazzCash', 'Other'])
    .required(),
  note: Yup.string().optional(),
})

function inRange(iso: string, start: string, end: string): boolean {
  return iso >= start && iso <= end
}

function money(n: number): string {
  return n.toLocaleString('en-PK', { style: 'currency', currency: 'PKR' })
}

export function PaymentsPage() {
  const dispatch = useAppDispatch()
  const members = useAppSelector((s) => s.members.items)
  const payments = useAppSelector((s) => s.payments.items)

  const [open, setOpen] = useState(false)
  const [prefillMemberId, setPrefillMemberId] = useState<string | null>(null)

  const statusByMember = useMemo(() => {
    const map = new Map<
      string,
      { due: number; paid: number; state: 'Paid' | 'Unpaid' | 'Partial' }
    >()
    for (const m of members) {
      const relevant = payments.filter((p) => p.memberId === m.id && inRange(p.date, m.startDate, m.endDate))
      const paid = relevant.reduce((s, p) => s + p.amount, 0)
      const due = m.membershipFee
      const state = paid <= 0 ? 'Unpaid' : paid + 0.001 >= due ? 'Paid' : 'Partial'
      map.set(m.id, { due, paid, state })
    }
    return map
  }, [members, payments])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Payments</div>
          <div className="text-sm text-slate-400 mt-1">Record payments and track paid/unpaid</div>
        </div>
        <button
          onClick={() => {
            setPrefillMemberId(null)
            setOpen(true)
          }}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 text-sm font-medium"
        >
          + Record payment
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 font-semibold">Member payment status</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Member</th>
                <th>Due</th>
                <th>Paid (within period)</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {members.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={5}>
                    No members.
                  </td>
                </tr>
              ) : (
                members.map((m) => {
                  const s = statusByMember.get(m.id) ?? { due: m.membershipFee, paid: 0, state: 'Unpaid' as const }
                  const tone = s.state === 'Paid' ? 'green' : s.state === 'Partial' ? 'amber' : 'red'
                  return (
                    <tr key={m.id} className="[&>td]:px-4 [&>td]:py-3">
                      <td className="text-slate-100 font-medium">{m.name}</td>
                      <td className="text-slate-300">{money(s.due)}</td>
                      <td className="text-slate-300">{money(s.paid)}</td>
                      <td>
                        <Badge tone={tone}>{s.state}</Badge>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            setPrefillMemberId(m.id)
                            setOpen(true)
                          }}
                          className="rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-slate-200 hover:bg-slate-900 transition"
                        >
                          Add payment
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
        <div className="px-4 py-3 border-b border-slate-800 font-semibold">Payment history</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Date</th>
                <th>Member</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Note</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {payments.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={6}>
                    No payments recorded.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const m = members.find((x) => x.id === p.memberId)
                  return (
                    <tr key={p.id} className="[&>td]:px-4 [&>td]:py-3">
                      <td className="text-slate-300">{p.date}</td>
                      <td className="text-slate-100">{m?.name ?? p.memberId}</td>
                      <td className="text-slate-300">{money(p.amount)}</td>
                      <td className="text-slate-300">{p.method}</td>
                      <td className="text-slate-400">{p.note ?? '-'}</td>
                      <td className="text-right">
                        <button
                          onClick={() => {
                            if (confirm('Delete this payment record?')) {
                              dispatch(deletePayment(p.id))
                              toast.success('Payment deleted')
                            }
                          }}
                          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/15 transition"
                        >
                          Delete
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

      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setPrefillMemberId(null)
        }}
        title="Record payment"
      >
        <Formik
          enableReinitialize
          initialValues={{
            memberId: prefillMemberId ?? (members[0]?.id ?? ''),
            amount:
              (prefillMemberId
                ? members.find((m) => m.id === prefillMemberId)?.membershipFee
                : members[0]?.membershipFee) ?? 0,
            date: todayISO(),
            method: 'Cash' as Payment['method'],
            note: '',
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            dispatch(
              addPayment({
                memberId: values.memberId,
                amount: Number(values.amount),
                date: values.date,
                method: values.method,
                note: values.note?.trim() ? values.note.trim() : undefined,
              }),
            )
            toast.success('Payment recorded')
            setOpen(false)
            setPrefillMemberId(null)
          }}
        >
          {({ values, handleChange, errors, touched, submitForm }) => (
            <Form className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Member</label>
                <select
                  name="memberId"
                  value={values.memberId}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                {touched.memberId && errors.memberId ? (
                  <div className="text-xs text-rose-400 mt-1">{errors.memberId}</div>
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Amount</label>
                  <input
                    name="amount"
                    type="number"
                    value={values.amount}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                  {touched.amount && errors.amount ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.amount}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">Date</label>
                  <input
                    name="date"
                    type="date"
                    value={values.date}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Method</label>
                  <select
                    name="method"
                    value={values.method}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-300">Note (optional)</label>
                <input
                  name="note"
                  value={values.note}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  placeholder="e.g. renewal, pending balance..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 text-sm font-medium"
                >
                  Save payment
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

