import { useCallback, useEffect, useState } from 'react'
import { getItems } from '../api/items'

export function useItems() {
  const [items, setItems] = useState([])
  const [kind, setKind] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadItems = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await getItems({ kind, q: query }))
    } catch {
      setError('The board could not be loaded. Check the API connection and try again.')
    } finally {
      setLoading(false)
    }
  }, [kind, query])

  useEffect(() => { loadItems() }, [loadItems])

  return { items, kind, setKind, query, setQuery, loading, error, refresh: loadItems }
}
