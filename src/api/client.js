import axios from 'axios'

const STORAGE_KEY = 'campus_lost_found_session'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' }
})

client.interceptors.request.use((config) => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (saved?.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${saved.token}`
      }
    }
  } catch {
    // Ignore malformed saved sessions.
  }
  return config
})

export default client
