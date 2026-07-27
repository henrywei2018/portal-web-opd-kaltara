// A stable per-browser visitor id (localStorage) used to count unique visitors.
// Not tied to any personal data — just a random UUID.
export const getVisitorId = () => {
  try {
    let id = localStorage.getItem('visitor_id')
    if (!id) {
      id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem('visitor_id', id)
    }
    return id
  } catch {
    return null
  }
}
