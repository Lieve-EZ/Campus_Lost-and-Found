import client from './client'

export async function loginUser({ username, password }) {
  const { data } = await client.post('/auth/login', { username, password })
  return data
}

export async function registerUser(payload) {
  const { data } = await client.post('/auth/register', payload)
  return data
}

export async function loginAdmin({ username, password }) {
  const { data } = await client.post('/auth/admin-login', { username, password })
  return data
}

export async function getCurrentUser(token) {
  const { data } = await client.get('/auth/me', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  return data
}
