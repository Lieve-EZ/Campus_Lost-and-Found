import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createItem, uploadImage } from '../api/items'

const STORAGE_KEY = 'campus_lost_found_session'
const initial = { kind: 'lost', title: '', description: '', location: '', reporter: '', contact: '' }

export default function PostItem() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initial)
  const [photo, setPhoto] = useState(null)
  const [status, setStatus] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInput = useRef(null)
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  useEffect(() => {
    const saved = (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
      } catch {
        return null
      }
    })()
    if (!saved?.token) {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setStatus('')
    try {
      let photoKey
      if (photo) {
        photoKey = await uploadImage(photo)
      }
      const created = await createItem({
        kind: form.kind,
        title: form.title,
        desc: form.description,
        location: form.location,
        reporter: form.reporter,
        contact: form.contact,
        ...(photoKey ? { photo_key: photoKey } : {})
      })
      navigate('/board', { state: { createdId: created.id } })
    } catch (err) {
      if (err?.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEY)
        navigate('/login', { replace: true })
        return
      }
      setStatus('We could not post that yet. Please check your connection and try again.')
      setSubmitting(false)
    }
  }

  return <main className="mx-auto max-w-3xl px-5 py-12 lg:px-8 lg:py-20"><motion.div initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .2 }}><p className="eyebrow">Add to the board</p><h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Tell us what happened.</h1><p className="mt-4 max-w-xl leading-7 text-muted">A few specific details give your item a better chance of finding its way home.</p>
    <form onSubmit={handleSubmit} className="mt-10 border border-ink/15 bg-paper p-5 shadow-paper sm:p-8">
      <fieldset><legend className="font-display text-lg font-bold">What kind of post is this?</legend><div className="mt-4 grid grid-cols-2 gap-3">{['lost', 'found'].map((kind) => <button type="button" key={kind} onClick={() => setForm((current) => ({ ...current, kind }))} className={`border px-4 py-3 text-left font-semibold capitalize transition ${form.kind === kind ? (kind === 'lost' ? 'border-lost bg-lost-soft text-lost' : 'border-found bg-found-soft text-found') : 'border-line text-muted hover:border-ink/30'}`}>{kind}<span className="mt-1 block text-xs font-normal opacity-80">{kind === 'lost' ? 'Something is missing' : 'Something is safe with you'}</span></button>)}</div></fieldset>
      <div className="mt-8 grid gap-6 sm:grid-cols-2"><label className="sm:col-span-2 text-sm font-semibold">Item title<input required value={form.title} onChange={update('title')} className="field" placeholder="Blue water bottle" /></label><label className="sm:col-span-2 text-sm font-semibold">Description<textarea required rows="4" value={form.description} onChange={update('description')} className="field resize-y" placeholder="Any marks, stickers, or details that make it recognisable?" /></label><label className="text-sm font-semibold">Last seen / found at<input value={form.location} onChange={update('location')} className="field" placeholder="Library, 2nd floor" /></label><label className="text-sm font-semibold">Your name<input value={form.reporter} onChange={update('reporter')} className="field" placeholder="Aarav" /></label><label className="text-sm font-semibold">Contact (optional)<input value={form.contact} onChange={update('contact')} className="field" placeholder="Email or phone" /></label><label className="text-sm font-semibold">Photo (optional)<input ref={fileInput} type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} className="sr-only" /><button type="button" onClick={() => fileInput.current?.click()} className="field text-left text-muted">{photo ? photo.name : 'Choose an image'}</button></label></div>
      {status && <p className="mt-6 border border-lost/30 bg-lost-soft p-3 text-sm text-lost">{status}</p>}<div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><button type="button" onClick={() => navigate(-1)} className="button-secondary">Cancel</button><motion.button whileTap={{ scale: .97 }} disabled={submitting} className="button-primary disabled:cursor-wait disabled:opacity-60">{submitting ? 'Posting...' : 'Pin it to the board ->'}</motion.button></div>
    </form></motion.div></main>
}
