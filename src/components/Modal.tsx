import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'
import { Fragment } from 'react'

export function Modal(props: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <Dialog open={props.open} onClose={props.onClose} as={Fragment}>
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 overflow-y-auto">
          <div className="min-h-full flex items-center justify-center p-4">
            <DialogPanel className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 shadow-2xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3">
                <DialogTitle as="div" className="font-semibold text-slate-50">
                  {props.title}
                </DialogTitle>
                <button
                  onClick={props.onClose}
                  className="rounded-lg px-2 py-1 text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition"
                >
                  ✕
                </button>
              </div>
              <div className="p-4">{props.children}</div>
              {props.footer ? (
                <div className="p-4 border-t border-slate-800 flex items-center justify-end gap-2">
                  {props.footer}
                </div>
              ) : null}
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

