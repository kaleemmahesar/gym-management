import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { FiMenu } from 'react-icons/fi'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="h-full min-h-screen bg-slate-950 text-slate-100 relative overflow-x-hidden">
      <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
      <div className="mx-auto w-full max-w-[1400px] h-full min-h-screen flex">
        <div className="hidden lg:block lg:fixed lg:top-0 lg:left-0 lg:h-screen lg:w-72 lg:z-20">
          <Sidebar />
        </div>

        <main className="relative z-10 flex-1 p-4 lg:p-8 pb-10 lg:pb-14 lg:ml-72">
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 transition inline-flex items-center gap-2"
            >
              <FiMenu />
              Menu
            </button>
            <div className="text-sm text-slate-400">Gym Admin</div>
          </div>
          <Outlet />
        </main>
      </div>

      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)} className="relative z-50">
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 flex">
            <DialogPanel className="h-full w-80 max-w-[80vw] bg-slate-950 border-r border-slate-800">
              <div onClick={() => setMobileOpen(false)} className="h-full">
                <Sidebar />
              </div>
            </DialogPanel>
            <div className="flex-1" onClick={() => setMobileOpen(false)} />
          </div>
        </div>
      </Dialog>
    </div>
  )
}

