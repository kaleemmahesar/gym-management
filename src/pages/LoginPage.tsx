import { Form, Formik } from 'formik'
import * as Yup from 'yup'
import { useAppDispatch, useAppSelector } from '../app/hooks'
import { login } from '../features/auth/authSlice'
import { toast } from 'react-toastify'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const schema = Yup.object({
  username: Yup.string().email('Enter a valid email').required('Username is required'),
  password: Yup.string().min(4).required('Password is required'),
})

export function LoginPage() {
  const dispatch = useAppDispatch()
  const nav = useNavigate()
  const { isAuthenticated, status, error } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (isAuthenticated) nav('/', { replace: true })
  }, [isAuthenticated, nav])

  useEffect(() => {
    if (error) toast.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950/60 p-6 shadow-xl">
        <div className="mb-6">
          <div className="text-2xl font-semibold">Admin Login</div>
          <div className="text-sm text-slate-400 mt-1">
            Use <span className="font-mono">admin@gym.com</span> /{' '}
            <span className="font-mono">admin123</span>
          </div>
        </div>

        <Formik
          initialValues={{ username: 'admin@gym.com', password: 'admin123' }}
          validationSchema={schema}
          onSubmit={async (values, helpers) => {
            helpers.setSubmitting(true)
            try {
              await dispatch(login(values)).unwrap()
              toast.success('Welcome back!')
              nav('/', { replace: true })
            } finally {
              helpers.setSubmitting(false)
            }
          }}
        >
          {({ values, handleChange, touched, errors, isSubmitting }) => (
            <Form className="space-y-4">
              <div>
                <label className="text-sm text-slate-300">Username</label>
                <input
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="admin@gym.com"
                />
                {touched.username && errors.username ? (
                  <div className="text-xs text-rose-400 mt-1">{errors.username}</div>
                ) : null}
              </div>

              <div>
                <label className="text-sm text-slate-300">Password</label>
                <input
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl bg-slate-900/60 border border-slate-800 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
                {touched.password && errors.password ? (
                  <div className="text-xs text-rose-400 mt-1">{errors.password}</div>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || status === 'loading'}
                className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition px-4 py-2 font-medium"
              >
                {status === 'loading' ? 'Signing in…' : 'Sign in'}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

