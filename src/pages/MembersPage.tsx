import { useMemo, useState } from 'react'
import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { toast } from 'react-toastify'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { addMember, deleteMember, updateMember } from '../features/members/membersSlice'
import type { Member, MembershipType } from '../types'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { calcAge, daysBetween, todayISO } from '../utils/date'

type MemberFormValues = {
  name: string
  dob: string
  doj: string
  phone: string
  photoDataUrl?: string
  trainer?: string
  membershipType: MembershipType
  membershipFee: number
  startDate: string
  endDate: string
}

const schema = Yup.object({
  name: Yup.string().min(2).required('Name is required'),
  dob: Yup.string().required('DOB is required'),
  doj: Yup.string().required('DOJ is required'),
  phone: Yup.string()
    .matches(/^03\d{9}$/, 'Phone must be in Pakistani format (03XXXXXXXXX)')
    .required('Phone is required'),
  trainer: Yup.string().optional(),
  membershipType: Yup.mixed<MembershipType>().oneOf(['Basic', 'Premium']).required(),
  membershipFee: Yup.number().min(0).required('Fee is required'),
  startDate: Yup.string().required('Start date is required'),
  endDate: Yup.string().required('End date is required'),
})

async function fileToDataUrl(file: File): Promise<string> {
  const maxBytes = 1_000_000
  if (file.size > maxBytes) throw new Error('Photo too large (max 1MB)')
  return await new Promise((resolve, reject) => {
    const fr = new FileReader()
    fr.onerror = () => reject(new Error('Failed to read file'))
    fr.onload = () => resolve(String(fr.result))
    fr.readAsDataURL(file)
  })
}

function whatsappUrl(phone: string, text: string): string {
  const p = phone.replace(/\D/g, '')
  const withCountry = p.length === 11 && p.startsWith('0') ? `92${p.slice(1)}` : p
  return `https://wa.me/${withCountry}?text=${encodeURIComponent(text)}`
}

export function MembersPage() {
  const dispatch = useAppDispatch()
  const members = useAppSelector((s) => s.members.items)

  const [q, setQ] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Expired'>('All')
  const [editing, setEditing] = useState<Member | null>(null)
  const [open, setOpen] = useState(false)

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return members
      .filter((m) => (statusFilter === 'All' ? true : m.status === statusFilter))
      .filter((m) => {
        if (!query) return true
        return m.name.toLowerCase().includes(query) || m.phone.includes(query)
      })
  }, [members, q, statusFilter])

  const t = todayISO()

  const initialValues: MemberFormValues = editing
    ? {
        name: editing.name,
        dob: editing.dob,
        doj: editing.doj,
        phone: editing.phone,
        photoDataUrl: editing.photoDataUrl,
        trainer: editing.trainer ?? '',
        membershipType: editing.membershipType,
        membershipFee: editing.membershipFee,
        startDate: editing.startDate,
        endDate: editing.endDate,
      }
    : {
        name: '',
        dob: '2000-01-01',
        doj: t,
        phone: '',
        photoDataUrl: undefined,
        trainer: '',
        membershipType: 'Basic',
        membershipFee: 1500,
        startDate: t,
        endDate: t,
      }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-2xl font-semibold">Members</div>
          <div className="text-sm text-slate-400 mt-1">Add, edit, search and track expiry</div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or phone…"
            className="w-full sm:w-72 rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
          >
            <option value="All">All</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
          <button
            onClick={() => {
              setEditing(null)
              setOpen(true)
            }}
            className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 text-sm font-medium"
          >
            + Add member
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-slate-400">
              <tr className="[&>th]:px-4 [&>th]:py-3 text-left">
                <th>Member</th>
                <th>Phone</th>
                <th>Membership</th>
                <th>Period</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-400" colSpan={6}>
                    No members found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const daysLeft = daysBetween(t, m.endDate)
                  const expiring = m.status === 'Active' && daysLeft >= 0 && daysLeft <= 5
                  return (
                    <tr
                      key={m.id}
                      className={[
                        '[&>td]:px-4 [&>td]:py-3',
                        expiring ? 'bg-amber-500/5' : '',
                      ].join(' ')}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                            {m.photoDataUrl ? (
                              <img
                                src={m.photoDataUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="text-xs text-slate-500">No photo</div>
                            )}
                          </div>
                          <div>
                            <div className="text-slate-100 font-medium">{m.name}</div>
                            <div className="text-xs text-slate-400">
                              DOB {m.dob} • Age {calcAge(m.dob)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-slate-300">{m.phone}</td>
                      <td className="text-slate-300">
                        <div className="flex flex-col">
                          <span>
                            {m.membershipType} • {m.membershipFee.toLocaleString('en-PK')} PKR
                          </span>
                          {m.trainer ? (
                            <span className="text-xs text-slate-400">Trainer: {m.trainer}</span>
                          ) : (
                            <span className="text-xs text-slate-500">No trainer</span>
                          )}
                        </div>
                      </td>
                      <td className="text-slate-300">
                        <div className="flex flex-col">
                          <span>
                            {m.startDate} → {m.endDate}
                          </span>
                          {expiring ? (
                            <span className="text-xs text-amber-200">Expiring in {daysLeft} day(s)</span>
                          ) : null}
                        </div>
                      </td>
                      <td>
                        <Badge tone={m.status === 'Active' ? 'green' : 'red'}>{m.status}</Badge>
                      </td>
                      <td className="text-right whitespace-nowrap">
                        {expiring ? (
                          <button
                            onClick={() => {
                              toast.info('Simulating WhatsApp reminder…')
                              window.open(
                                whatsappUrl(
                                  m.phone,
                                  `Hi ${m.name}, your gym membership expires on ${m.endDate}. Reply to renew.`,
                                ),
                                '_blank',
                              )
                            }}
                            className="mr-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-amber-200 hover:bg-amber-500/15 transition"
                          >
                            WhatsApp
                          </button>
                        ) : null}
                        <button
                          onClick={() => {
                            setEditing(m)
                            setOpen(true)
                          }}
                          className="mr-2 rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-slate-200 hover:bg-slate-900 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete ${m.name}?`)) {
                              dispatch(deleteMember(m.id))
                              toast.success('Member deleted')
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
          setEditing(null)
        }}
        title={editing ? 'Edit member' : 'Add member'}
        footer={null}
      >
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={schema}
          onSubmit={(values) => {
            if (values.endDate < values.startDate) {
              toast.error('End date must be after start date')
              return
            }

            const payload = {
              name: values.name.trim(),
              dob: values.dob,
              doj: values.doj,
              phone: values.phone,
              photoDataUrl: values.photoDataUrl,
              trainer: values.trainer?.trim() ? values.trainer.trim() : undefined,
              membershipType: values.membershipType,
              membershipFee: Number(values.membershipFee),
              startDate: values.startDate,
              endDate: values.endDate,
            }

            if (editing) {
              dispatch(updateMember({ id: editing.id, patch: payload }))
              toast.success('Member updated')
            } else {
              dispatch(addMember(payload))
              toast.success('Member added')
            }
            setOpen(false)
            setEditing(null)
          }}
        >
          {({ values, handleChange, setFieldValue, touched, errors, submitForm }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-300">Name</label>
                  <input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {touched.name && errors.name ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.name}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">Phone</label>
                  <input
                    name="phone"
                    value={values.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {touched.phone && errors.phone ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.phone}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">DOB</label>
                  <input
                    name="dob"
                    type="date"
                    value={values.dob}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                  <div className="text-xs text-slate-400 mt-1">Age: {calcAge(values.dob)}</div>
                  {touched.dob && errors.dob ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.dob}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">Date of Joining (DOJ)</label>
                  <input
                    name="doj"
                    type="date"
                    value={values.doj}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                  {touched.doj && errors.doj ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.doj}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">Trainer (optional)</label>
                  <input
                    name="trainer"
                    value={values.trainer}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-300">Membership Type</label>
                  <select
                    name="membershipType"
                    value={values.membershipType}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  >
                    <option value="Basic">Basic</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-300">Membership Fee</label>
                  <input
                    name="membershipFee"
                    type="number"
                    value={values.membershipFee}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                  {touched.membershipFee && errors.membershipFee ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.membershipFee}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">Start Date</label>
                  <input
                    name="startDate"
                    type="date"
                    value={values.startDate}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                  {touched.startDate && errors.startDate ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.startDate}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm text-slate-300">End Date</label>
                  <input
                    name="endDate"
                    type="date"
                    value={values.endDate}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 text-sm outline-none"
                  />
                  {touched.endDate && errors.endDate ? (
                    <div className="text-xs text-rose-400 mt-1">{errors.endDate}</div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center">
                    {values.photoDataUrl ? (
                      <img src={values.photoDataUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="text-xs text-slate-500">Photo</div>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-slate-300">Photo upload</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.currentTarget.files?.[0]
                        if (!file) return
                        try {
                          const url = await fileToDataUrl(file)
                          await setFieldValue('photoDataUrl', url)
                          toast.success('Photo added')
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : 'Failed to add photo')
                        }
                      }}
                      className="mt-1 block text-sm text-slate-300 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-slate-100 hover:file:bg-slate-700"
                    />
                  </div>
                </div>

                {values.photoDataUrl ? (
                  <button
                    type="button"
                    onClick={() => setFieldValue('photoDataUrl', undefined)}
                    className="md:ml-auto rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
                  >
                    Remove photo
                  </button>
                ) : null}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    setEditing(null)
                  }}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={submitForm}
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-500 transition px-4 py-2 text-sm font-medium"
                >
                  {editing ? 'Save changes' : 'Create member'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  )
}

