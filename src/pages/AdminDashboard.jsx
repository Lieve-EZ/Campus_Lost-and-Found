import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import { uploadImage } from '../api/items'

const STORAGE_KEY = 'campus_lost_found_session'

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ kind: 'lost', title: '', description: '', location: '', reporter: '', contact: '' })
  const [photo, setPhoto] = useState(null)
  const [saving, setSaving] = useState(false)

  const session = useMemo(() => getSession(), [])

  useEffect(() => {
    if (!session?.token || session.user?.role !== 'admin') {
      navigate('/admin-login', { replace: true })
      return
    }

    async function load() {
      try {
        const { data } = await client.get('/admin/items', {
          headers: { Authorization: `Bearer ${session.token}` },
        })
        setItems(data.items || [])
      } catch {
        setError('Unable to load the admin dashboard.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate, session])

  async function createItem(event) {
    event.preventDefault()
    if (!session?.token) return
    setSaving(true)
    setError('')
    try {
      let photoKey
      if (photo) photoKey = await uploadImage(photo)
      await client.post('/admin/items', {
        kind: form.kind,
        title: form.title,
        desc: form.description,
        location: form.location,
        reporter: form.reporter,
        contact: form.contact,
        ...(photoKey ? { photo_key: photoKey } : {}),
      }, { headers: { Authorization: `Bearer ${session.token}` } })
      const { data } = await client.get('/admin/items', {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      setItems(data.items || [])
      setForm({ kind: 'lost', title: '', description: '', location: '', reporter: '', contact: '' })
      setPhoto(null)
    } catch (err) {
      setError(err?.response?.data?.detail || 'The item could not be created.')
    } finally {
      setSaving(false)
    }
  }

  async function deleteItem(id) {
    if (!session?.token) return
    try {
      await client.delete(`/admin/items/${id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      })
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      setError(err?.response?.data?.detail || 'Unable to delete this item.')
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    navigate('/admin-login', { replace: true })
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Manage campus listings</h1>
        </div>
        <button type="button" onClick={logout} className="button-secondary">Log out</button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[420px,1fr]">
        <form onSubmit={createItem} className="rounded-xl border border-ink/10 bg-paper p-6 shadow-paper">
          <h2 className="font-display text-2xl font-bold">Add item</h2>
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {['lost', 'found'].map((kind) => (
                <button
                  key={kind}
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, kind }))}
                  className={`rounded-sm border px-4 py-3 font-semibold capitalize ${form.kind === kind ? (kind === 'lost' ? 'border-lost bg-lost-soft text-lost' : 'border-found bg-found-soft text-found') : 'border-line text-muted'}`}
                >
                  {kind}
                </button>
              ))}
            </div>

            <label className="block text-sm font-semibold">
              Title
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="field" required />
            </label>
            <label className="block text-sm font-semibold">
              Description
              <textarea rows="4" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="field resize-y" required />
            </label>
            <label className="block text-sm font-semibold">
              Location
              <input value={form.location} onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))} className="field" />
            </label>
            <label className="block text-sm font-semibold">
              Reporter
              <input value={form.reporter} onChange={(event) => setForm((current) => ({ ...current, reporter: event.target.value }))} className="field" />
            </label>
            <label className="block text-sm font-semibold">
              Contact
              <input value={form.contact} onChange={(event) => setForm((current) => ({ ...current, contact: event.target.value }))} className="field" />
            </label>
            <label className="block text-sm font-semibold">
              Photo (optional)
              <input type="file" accept="image/*" onChange={(event) => setPhoto(event.target.files?.[0] || null)} className="field mt-2 p-2 text-sm" />
              {photo && <span className="mt-2 block truncate text-xs font-normal text-muted">Selected: {photo.name}</span>}
            </label>
            <button type="submit" disabled={saving} className="button-primary w-full disabled:cursor-wait disabled:opacity-60">
              {saving ? 'Saving...' : 'Add listing'}
            </button>
          </div>
        </form>

        <div className="rounded-xl border border-ink/10 bg-paper p-6 shadow-paper">
          <h2 className="font-display text-2xl font-bold">All listings</h2>
          {error && <p className="mt-4 rounded-sm border border-lost/30 bg-lost-soft px-3 py-2 text-sm text-lost">{error}</p>}
          {loading ? (
            <p className="mt-8 text-muted">Loading items...</p>
          ) : items.length === 0 ? (
            <p className="mt-8 text-muted">No active listings.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-sm border border-line p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${item.kind === 'lost' ? 'bg-lost-soft text-lost' : 'bg-found-soft text-found'}`}>{item.kind}</span>
                      <span className="text-sm text-muted">{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="mt-2 font-semibold">{item.title}</p>
                    <p className="text-sm text-muted">{item.reporter || 'Anonymous'}</p>
                  </div>
                  <button type="button" onClick={() => deleteItem(item.id)} className="button-secondary border-lost/30 text-lost hover:bg-lost-soft">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
