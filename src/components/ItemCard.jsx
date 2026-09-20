import { motion } from 'framer-motion'
import MatchPanel from './MatchPanel'

function formatDate(value) {
  if (!value) return 'Recently posted'
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value))
}

export default function ItemCard({ item, matchedItem, onSelect }) {
  const isLost = item.kind === 'lost'
  const match = item.matches?.[0]
  return <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .35 }} role="button" tabIndex="0" onClick={() => onSelect(item)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect(item) } }} className={`flex cursor-pointer flex-col bg-paper p-5 shadow-paper transition hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2 ${isLost ? 'border border-dashed border-lost/55' : 'border border-ink/15'}`}>
    <div className="flex items-center justify-between gap-3">
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${isLost ? 'bg-lost-soft text-lost' : 'bg-found-soft text-found'}`}>{item.kind}</span>
      <span className="text-xs text-muted">{formatDate(item.created_at)}</span>
    </div>
    <h3 className="mt-5 font-display text-xl font-bold leading-tight">{item.title}</h3>
    {item.photo_url && <img src={item.photo_url} alt="" className="mt-4 aspect-[4/3] w-full object-cover" />}
    <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{item.description || item.desc || 'No description provided.'}</p>
    <div className="mt-auto space-y-2 pt-6 text-sm">
      <p className="flex gap-2 text-ink"><span className="w-5 text-center text-muted">@</span>{item.location || 'Location not shared'}</p>
      <p className="flex gap-2 text-muted"><span className="w-5 text-center">by</span>{item.reporter || 'Anonymous'}</p>
    </div>
    <MatchPanel match={match} item={matchedItem} />
  </motion.article>
}
