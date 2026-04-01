import { useMemo, useState } from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addExpense, deleteExpense, updateExpense } from '../features/expenses/expensesSlice'
import type { Expense } from '../types'
import { Modal } from '../components/Modal'
import { todayISO, isSameMonth } from '../utils/date'

const schema = Yup.object({
  title: Yup.string().min(2).required('Title is required'),
  amount: Yup.number().min(0).required('Amount is required'),
  date: Yup.string().required('Date is required'),
  category: Yup.mixed<Expense['category']>()
    .oneOf(['Rent', 'Utilities', 'Equipment', 'Staff Salaries', 'Other'])
    .required(),
})

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

export function ExpensesPage() {
  const dispatch = useAppDispatch()
  const expenses = useAppSelector((s) => s.expenses.items)

  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Expense | null>(null)
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), monthIndex0: d.getMonth() }
  })

  const monthlyTotal = useMemo(() => {
    return expenses
      .filter((e) => isSameMonth(e.date, month.year, month.monthIndex0))
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses, month])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Expenses</div>
          <div className="text-sm text-slate-400 mt-1">Track gym expenses by category</div>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setOpen(true)
          }}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 text-sm font-medium"
        >
          + Add expense
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="text-xs text-slate-400">Monthly expense total</div>
          <div className="mt-1 text-2xl font-semibold">{money(monthlyTotal)}</div>
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

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th>Amount</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {expenses.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={5}>
                    No expenses yet.
                  </td>
                </tr>
              ) : (
                expenses.map((e) => (
                  <tr key={e.id} className="[&>td]:px-4 [&>td]:py-3">
                    <td className="text-slate-300">{e.date}</td>
                    <td className="text-slate-100 font-medium">{e.title}</td>
                    <td className="text-slate-300">{e.category}</td>
                    <td className="text-slate-300">{money(e.amount)}</td>
                    <td className="text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setEditing(e)
                          setOpen(true)
                        }}
                        className="mr-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-slate-200 hover:bg-slate-900 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Delete this expense?')) {
                            dispatch(deleteExpense(e.id))
                            toast.success('Expense deleted')
                          }
                        }}
                        className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-rose-200 hover:bg-rose-500/15 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false)
          setEditing(null)
        }}
        title={editing ? 'Edit expense' : 'Add expense'}
      >
        <Formik
          enableReinitialize
          initialValues={{
            title: editing?.title ?? '',
            amount: editing?.amount ?? 0,
            date: editing?.date ?? todayISO(),
            category: (editing?.category ?? 'Rent') as Expense['category'],
          }}
          validationSchema={schema}
          onSubmit={(values) => {
            const payload = {
              title: values.title.trim(),
              amount: Number(values.amount),
              date: values.date,
              category: values.category,
            }
            if (editing) {
              dispatch(updateExpense({ id: editing.id, patch: payload }))
              toast.success('Expense updated')
            } else {
              dispatch(addExpense(payload))
              toast.success('Expense added')
            }
            setOpen(false)
            setEditing(null)
          }}
        >
          {({ values, handleChange, errors, touched, submitForm }) => (
            <Form className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Title</label>
                <input
                  name="title"
                  value={values.title}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {touched.title && errors.title ? (
                  <div className="text-xs text-rose-400 mt-1">{errors.title}</div>
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
                  <label className="text-sm text-slate-300">Category</label>
                  <select
                    name="category"
                    value={values.category}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Rent">Rent</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
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
                  {editing ? 'Save changes' : 'Create expense'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

