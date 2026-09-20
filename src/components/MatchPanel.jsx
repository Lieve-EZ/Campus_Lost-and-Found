import { motion } from 'framer-motion'

export default function MatchPanel({ match, item }) {
  if (!match || !item) return null
  return <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="mt-5 border-l-2 border-sage bg-sage-soft px-4 py-3">
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-sage">Possible match found</p>
      <span className="text-xs font-bold text-sage">{Math.round(match.score * 100)}% similar</span>
    </div>
    <p className="mt-1 font-display font-semibold text-ink">{item.title}</p>
  </motion.div>
}
