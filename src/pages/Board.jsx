import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useItems } from '../hooks/useItems'
import ItemCard from '../components/ItemCard'
import SearchBar from '../components/SearchBar'
import Tabs from '../components/Tabs'
import StatStrip from '../components/StatStrip'
import { deleteItem } from '../api/items'

const STORAGE_KEY = 'campus_lost_found_session'

export default function Board() {
  const location = useLocation()
  const [selectedItem, setSelectedItem] = useState(null)
  const { items, kind, setKind, query, setQuery, loading, error, refresh } = useItems()
  const [session, setSession] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
  })
  const matchCount = items.reduce((total, item) => total + (item.matches?.length || 0), 0)

  const myPosts = useMemo(() => {
    if (!session?.user) return []
    return items.filter((item) => item.created_by === session.user.id || item.reporter === session.user.username)
  }, [items, session])

  useEffect(() => {
    const createdId = location.state?.createdId
    if (!createdId || loading) return
    const target = document.getElementById(`item-${createdId}`)
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [location.state, loading, items])
  useEffect(() => {
    if (!selectedItem) return
    const closeOnEscape = (event) => { if (event.key === 'Escape') setSelectedItem(null) }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [selectedItem])

  async function handleDelete(itemId) {
    try {
      await deleteItem(itemId)
      refresh()
    } catch {
      // no-op
    }
  }

  return <main className="cork-texture min-h-[calc(100vh-73px)]"><div className="mx-auto max-w-6xl px-5 py-12 lg:px-8 lg:py-16">
    <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="eyebrow">The campus board</p><h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">What are we looking for?</h1></div><div className="w-full md:max-w-sm"><SearchBar value={query} onChange={setQuery} /></div></div>
    <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><Tabs value={kind} onChange={setKind} /><p className="text-sm text-muted">{loading ? 'Checking the board...' : `${items.length} ${items.length === 1 ? 'post' : 'posts'} nearby`}</p></div>
    <div className="mt-8"><StatStrip total={items.length} matches={matchCount} /></div>
    {session?.user && myPosts.length > 0 && <div className="mt-8 rounded-xl border border-ink/10 bg-paper p-5 shadow-paper"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl font-bold">My posts</h2><span className="text-sm text-muted">{myPosts.length} active</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{myPosts.map((item) => <div key={item.id} className="flex items-center justify-between gap-3 rounded-sm border border-line p-3"><div><p className="font-semibold">{item.title}</p><p className="text-xs text-muted">{item.kind} • {new Date(item.created_at).toLocaleDateString()}</p></div><button type="button" onClick={() => handleDelete(item.id)} className="button-secondary border-lost/30 px-3 py-2 text-xs text-lost hover:bg-lost-soft">Delete</button></div>)}</div></div>}
    {error && <div className="mt-8 flex items-center justify-between gap-4 border border-lost/30 bg-lost-soft p-4 text-sm text-lost"><span>{error}</span><button onClick={refresh} className="font-bold underline">Try again</button></div>}
    {loading && <div className="py-20 text-center font-display text-xl text-muted">Pinning up the latest posts...</div>}
    {!loading && !error && !items.length && <div className="border border-dashed border-ink/25 bg-paper/70 px-6 py-20 text-center"><p className="font-display text-2xl font-bold">The board is quiet.</p><p className="mt-2 text-muted">Be the first to post something today.</p></div>}
    {!loading && items.length > 0 && <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: .04 } } }} className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">{items.map((item) => <motion.div id={`item-${item.id}`} key={item.id} variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}><ItemCard item={item} matchedItem={items.find((candidate) => candidate.id === item.matches?.[0]?.item_id)} onSelect={setSelectedItem} /></motion.div>)}</motion.div>}
  </div>{selectedItem && <div role="presentation" onClick={() => setSelectedItem(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/55 p-5"><motion.div role="dialog" aria-modal="true" aria-labelledby="item-detail-title" initial={{ opacity: 0, y: 18, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} onClick={(event) => event.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-paper p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between gap-4"><div><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${selectedItem.kind === 'lost' ? 'bg-lost-soft text-lost' : 'bg-found-soft text-found'}`}>{selectedItem.kind}</span><h2 id="item-detail-title" className="mt-4 font-display text-3xl font-bold leading-tight">{selectedItem.title}</h2></div><button type="button" aria-label="Close item details" onClick={() => setSelectedItem(null)} className="text-2xl leading-none text-muted transition hover:text-ink">&times;</button></div>{selectedItem.photo_url && <img src={selectedItem.photo_url} alt="" className="mt-6 aspect-[4/3] w-full object-cover" />}<p className="mt-6 whitespace-pre-wrap text-sm leading-7 text-ink">{selectedItem.description || selectedItem.desc || 'No description provided.'}</p><dl className="mt-6 grid gap-4 border-t border-ink/10 pt-5 text-sm"><div><dt className="font-bold text-muted">Location</dt><dd className="mt-1">{selectedItem.location || 'Location not shared'}</dd></div><div><dt className="font-bold text-muted">Posted by</dt><dd className="mt-1">{selectedItem.reporter || 'Anonymous'}</dd></div>{selectedItem.contact && <div><dt className="font-bold text-muted">Contact</dt><dd className="mt-1 break-words">{selectedItem.contact}</dd></div>}<div><dt className="font-bold text-muted">Posted</dt><dd className="mt-1">{new Intl.DateTimeFormat('en', { month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(selectedItem.created_at))}</dd></div></dl></motion.div></div>}</main>
}
