import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'

const STORAGE_KEY = 'campus_lost_found_session'

function readSession() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
  } catch {
    return null
  }
}

export default function AccountPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState(readSession())
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState({})

  useEffect(() => {
    const current = readSession()
    if (!current?.token) {
      navigate('/login', { replace: true })
      return
    }
    setSession(current)

    async function load() {
      try {
        const { data } = await client.get('/me/items', {
          headers: { Authorization: `Bearer ${current.token}` }
        })
        setItems(data.items || [])
      } catch {
        setError('Unable to load your listings.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [navigate])

  function updateDraft(itemId, key, value) {
    setDrafts((current) => ({
      ...current,
      [itemId]: {
        ...(current[itemId] || {}),
        [key]: value,
      }
    }))
  }

  async function saveItem(item) {
    const draft = drafts[item.id] || {}
    const payload = {
      kind: draft.kind ?? item.kind,
      title: draft.title ?? item.title,
      desc: draft.description ?? item.description,
      location: draft.location ?? item.location,
      reporter: draft.reporter ?? item.reporter,
      contact: draft.contact ?? item.contact,
    }

    try {
      await client.patch(`/items/${item.id}`, payload, {
        headers: { Authorization: `Bearer ${session.token}` }
      })
      const { data } = await client.get('/me/items', {
        headers: { Authorization: `Bearer ${session.token}` }
      })
      setItems(data.items || [])
      setDrafts((current) => ({ ...current, [item.id]: {} }))
    } catch (err) {
      setError(err?.response?.data?.detail || 'This item could not be updated.')
    }
  }

  async function removeItem(itemId) {
    try {
      await client.delete(`/items/${itemId}`, {
        headers: { Authorization: `Bearer ${session.token}` }
      })
      setItems((current) => current.filter((item) => item.id !== itemId))
    } catch (err) {
      setError(err?.response?.data?.detail || 'This item could not be removed.')
    }
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY)
    navigate('/login', { replace: true })
  }

  if (!session?.token) return null

  return (
    <main className="mx-auto max-w-6xl px-5 py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="mt-2 font-display text-4xl font-bold">Manage your posted items</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted">{session.user.username}</span>
          <button type="button" onClick={logout} className="button-secondary">Log out</button>
        </div>
      </div>

      {error && <p className="mb-6 rounded-sm border border-lost/30 bg-lost-soft px-3 py-2 text-sm text-lost">{error}</p>}

      {loading ? (
        <p className="text-muted">Loading your listings...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink/20 bg-paper p-8 text-center">
          <p className="font-display text-2xl font-bold">You have no active posts yet.</p>
          <button type="button" onClick={() => navigate('/post')} className="button-primary mt-6">Create a listing</button>
        </div>
      ) : (
        <div className="space-y-6">
          {items.map((item) => {
            const draft = drafts[item.id] || {}
            return (
              <div key={item.id} className="rounded-xl border border-ink/10 bg-paper p-5 shadow-paper">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] ${item.kind === 'lost' ? 'bg-lost-soft text-lost' : 'bg-found-soft text-found'}`}>{item.kind}</span>
                  <button type="button" onClick={() => removeItem(item.id)} className="button-secondary border-lost/30 px-3 py-2 text-xs text-lost hover:bg-lost-soft">Remove</button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Kind
                    <select value={draft.kind ?? item.kind} onChange={(event) => updateDraft(item.id, 'kind', event.target.value)} className="field">
                      <option value="lost">Lost</option>
                      <option value="found">Found</option>
                    </select>
                  </label>

                  <label className="block text-sm font-semibold">
                    Title
                    <input value={draft.title ?? item.title} onChange={(event) => updateDraft(item.id, 'title', event.target.value)} className="field" />
                  </label>

                  <label className="block text-sm font-semibold md:col-span-2">
                    Description
                    <textarea rows="4" value={draft.description ?? item.description} onChange={(event) => updateDraft(item.id, 'description', event.target.value)} className="field resize-y" />
                  </label>

                  <label className="block text-sm font-semibold">
                    Location
                    <input value={draft.location ?? item.location ?? ''} onChange={(event) => updateDraft(item.id, 'location', event.target.value)} className="field" />
                  </label>

                  <label className="block text-sm font-semibold">
                    Reporter
                    <input value={draft.reporter ?? item.reporter ?? ''} onChange={(event) => updateDraft(item.id, 'reporter', event.target.value)} className="field" />
                  </label>

                  <label className="block text-sm font-semibold md:col-span-2">
                    Contact
                    <input value={draft.contact ?? item.contact ?? ''} onChange={(event) => updateDraft(item.id, 'contact', event.target.value)} className="field" />
                  </label>
                </div>

                <div className="mt-5 flex justify-end">
                  <button type="button" onClick={() => saveItem(item)} className="button-primary">Save changes</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
