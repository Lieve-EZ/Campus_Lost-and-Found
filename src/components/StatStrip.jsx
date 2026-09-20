export default function StatStrip({ total = 0, matches = 0 }) {
  const stats = [[total, 'items on the board'], [matches, 'possible matches flagged'], ['< 1 min', 'to post an item']]
  return <div className="grid grid-cols-3 border-y border-ink/15 py-6">
    {stats.map(([value, label], index) => <div key={label} className={`px-3 ${index > 0 ? 'border-l border-ink/15' : ''}`}><p className="font-display text-xl font-bold sm:text-3xl">{value}</p><p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-muted sm:text-xs">{label}</p></div>)}
  </div>
}
