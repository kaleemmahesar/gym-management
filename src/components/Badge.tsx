export function Badge(props: { tone: 'green' | 'red' | 'amber' | 'slate'; children: string }) {
  const cls =
    props.tone === 'green'
      ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
      : props.tone === 'red'
        ? 'bg-rose-500/15 text-rose-200 border-rose-500/30'
        : props.tone === 'amber'
          ? 'bg-amber-500/15 text-amber-200 border-amber-500/30'
          : 'bg-slate-500/10 text-slate-200 border-slate-500/20'

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {props.children}
    </span>
  )
}

