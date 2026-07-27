// Build URLs for uploaded assets (images in /gambar, documents in /file).
// Derives the origin from VITE_API_BASE_URL so it works in every environment:
//   dev  → VITE_API_BASE_URL=http://localhost:8000/api → http://localhost:8000/gambar/x
//   prod → VITE_API_BASE_URL=/api (same origin)         → /gambar/x
const ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

const build = (dir, name) => {
  if (!name) return ''
  if (/^https?:\/\//.test(name)) return name
  return `${ORIGIN}/${dir}/${name}`
}

export const gambarUrl = (name) => build('gambar', name)
export const fileUrl = (name) => build('file', name)
