import DOMPurify from 'dompurify'

// Lapis kedua setelah sanitasi di server (App\Support\HtmlAman): melindungi
// data lama yang belum dibersihkan dan hasil terjemahan. Host iframe disamakan
// dengan config/keamanan.php — iframe dari host lain dibuang.
const HOST_IFRAME = [
  'www.youtube.com', 'www.youtube-nocookie.com', 'www.google.com', 'maps.google.com', 'player.vimeo.com',
  'lookerstudio.google.com', 'datastudio.google.com', 'docs.google.com',
]

const hostDiizinkan = (src) => {
  try {
    const u = new URL(src, window.location.origin)
    if (u.protocol !== 'https:') return false
    const h = u.hostname.toLowerCase()
    return HOST_IFRAME.some((izin) => h === izin || h.endsWith(`.${izin}`))
  } catch {
    return false
  }
}

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName === 'iframe' && !hostDiizinkan(node.getAttribute('src') || '')) {
    node.parentNode?.removeChild(node)
  }
})

const KONFIG = {
  ADD_TAGS: ['iframe'],
  ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'loading', 'referrerpolicy', 'sandbox', 'target'],
}

export const htmlAman = (html) => (html ? DOMPurify.sanitize(html, KONFIG) : '')
