import client from './client'

export async function getItems({ kind = '', q = '' } = {}) {
  const { data } = await client.get('/items', { params: { ...(kind ? { kind } : {}), ...(q ? { q } : {}) } })
  return data.items || []
}

export async function createItem(payload) {
  const { data } = await client.post('/items', payload)
  return data
}

export async function deleteItem(itemId) {
  const { data } = await client.delete(`/items/${itemId}`)
  return data
}

export async function getUploadUrl(contentType) {
  const { data } = await client.get('/upload-url', { params: { contentType } })
  return data
}

export async function uploadImage(file) {
  const upload = await getUploadUrl(file.type)
  const headers = { 'Content-Type': file.type }
  if (upload.requires_auth || upload.upload_url.startsWith('/')) {
    try {
      const session = JSON.parse(localStorage.getItem('campus_lost_found_session') || 'null')
      if (session?.token) headers.Authorization = `Bearer ${session.token}`
    } catch {
      // Ignore malformed saved sessions.
    }
  }
  const response = await fetch(upload.upload_url, { method: 'PUT', headers, body: file })
  if (!response.ok) throw new Error(`Image upload failed with status ${response.status}`)
  return upload.photo_key
}
