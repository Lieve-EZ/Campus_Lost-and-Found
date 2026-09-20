import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { getItems } from '../api/items'
import HowItWorks from '../components/HowItWorks'
import StatStrip from '../components/StatStrip'
import OrbitField from '../components/OrbitField'

export default function Home() {
  const [items, setItems] = useState([])
  useEffect(() => { getItems().then(setItems).catch(() => {}) }, [])
  const matches = items.reduce((total, item) => total + (item.matches?.length || 0), 0)
  const recentItems = [...items].sort((first, second) => new Date(second.created_at || 0) - new Date(first.created_at || 0)).slice(0, 5)
  const formatDate = (value) => value ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value)) : 'Recently posted'
  return <main>
    <section className="hero-section mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-16 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:px-8 lg:pb-24 lg:pt-24">
      <OrbitField />
      <div className="relative z-10"><p className="eyebrow">A community board for campus</p><h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">Find what belongs to <span className="headline-highlight">you.</span></h1><p className="mt-7 max-w-xl text-base leading-7 text-muted sm:text-lg">A shared place for the things we lose, the things we find, and the small moments that bring them back together.</p><div className="mt-9 flex flex-wrap gap-3"><motion.div whileTap={{ scale: .97 }}><Link to="/post" className="button-primary">Report an item <span aria-hidden="true">-&gt;</span></Link></motion.div><motion.div whileTap={{ scale: .97 }}><Link to="/board" className="button-secondary">Browse the board</Link></motion.div></div></div>
      <div className="relative border-l-2 border-sage pl-6 lg:mb-2"><p className="font-display text-2xl font-semibold leading-tight sm:text-3xl">"The fastest way home is often one good description away."</p><p className="mt-4 text-sm text-muted">Built by students, for students.</p></div>
    </section>
    <div className="mx-auto max-w-6xl px-5 lg:px-8"><StatStrip total={items.length} matches={matches} /></div>
    <section className="mx-auto max-w-6xl px-5 py-16 lg:px-8 lg:py-20">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">Recently posted</p><h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Lost things looking for home.</h2></div><Link to="/board" className="text-sm font-bold text-sage underline decoration-sage/40 underline-offset-4 transition hover:text-ink">See the full board <span aria-hidden="true">-&gt;</span></Link></div>
      {recentItems.length > 0 ? <div className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">{recentItems.map((item) => { const isLost = item.kind === 'lost'; return <Link key={item.id} to="/board" state={{ createdId: item.id }} className="group flex min-h-56 flex-col border border-ink/10 bg-paper p-4 shadow-paper transition hover:-translate-y-1 hover:border-sage/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ink focus:ring-offset-2"><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${isLost ? 'bg-lost-soft text-lost' : 'bg-found-soft text-found'}`}>{item.kind}</span><span className="text-xs text-muted">{formatDate(item.created_at)}</span></div>{item.photo_url ? <img src={item.photo_url} alt="" className="mt-4 aspect-[3/2] w-full object-cover" /> : <div className={`mt-4 flex aspect-[3/2] items-center justify-center border border-dashed font-display text-3xl ${isLost ? 'border-lost/25 bg-lost-soft/40 text-lost/40' : 'border-found/25 bg-found-soft/40 text-found/40'}`}>?</div>}<h3 className="mt-4 line-clamp-2 font-display text-lg font-bold leading-tight transition group-hover:text-sage">{item.title}</h3><p className="mt-auto pt-3 text-xs text-muted">{item.location || 'Location not shared'}</p></Link> })}</div> : <div className="mt-9 border border-dashed border-ink/20 bg-paper/60 px-6 py-10 text-center"><p className="font-display text-xl font-bold">No recent posts yet.</p><p className="mt-2 text-sm text-muted">Be the first to add something to the board.</p><Link to="/post" className="mt-5 inline-flex text-sm font-bold text-sage underline underline-offset-4">Post an item</Link></div>}
    </section>
    <HowItWorks />
  </main>
}
