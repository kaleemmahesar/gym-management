import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useState } from 'react'
import { Dialog, DialogPanel } from '@headlessui/react'
import { FiMenu } from 'react-icons/fi'

export function DashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="h-full min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-[1400px] h-full min-h-screen flex">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <main className="flex-1 p-4 lg:p-8">
          <div className="lg:hidden mb-4 flex items-center justify-between">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 transition inline-flex items-center gap-2"
            >
              <FiMenu />
              Menu
            </button>
            <div className="text-sm text-slate-400">Gym Admin</div>
          </div>
          <Outlet />
        </main>
      </div>

      <Dialog open={mobileOpen} onClose={() => setMobileOpen(false)}>
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

