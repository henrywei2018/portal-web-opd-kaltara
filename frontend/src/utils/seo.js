import { useEffect } from 'react'
import { useSettings } from '../contexts/SettingsContext'

// Origin for resolving uploaded images (strip the trailing /api)
const ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

export const resolveImage = (src) => {
  if (!src) return ''
  return /^https?:\/\//.test(src) ? src : `${ORIGIN}/gambar/${src}`
}

// Create-or-update a <meta> tag keyed by an attribute (name= or property=)
export const upsertMeta = (attr, key, content) => {
  const head = document.head
  let el = head.querySelector(`meta[${attr}="${key}"]`)
  if (content == null || content === '') {
    return // leave existing/default in place rather than blanking it
  }
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    head.appendChild(el)
  }
  el.setAttribute('content', content)
}

// Create-or-update a <link rel=...> tag
export const upsertLink = (rel, href) => {
  if (!href) return
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

const stripHtml = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

// Build a clean meta-length description from arbitrary text/HTML
export const excerpt = (text, len = 160) => {
  const s = stripHtml(text)
  return s.length > len ? s.slice(0, len - 1).trimEnd() + '…' : s
}

/**
 * Per-page SEO. Sets document title, meta description/keywords, canonical, and
 * OpenGraph/Twitter tags, filling gaps from site settings. This is client-side
 * (the app is a SPA); it is read by Google (which renders JS). Social-scraper
 * previews would need server-side meta — intentionally out of scope for now.
 */
export const useSeo = ({ title, description, keywords, image, type = 'website', noSuffix = false } = {}) => {
  const { settings } = useSettings()

  useEffect(() => {
    const siteTitle = settings.site_title || 'Portal Resmi'
    const fullTitle = title ? (noSuffix ? title : `${title} - ${siteTitle}`) : siteTitle
    document.title = fullTitle

    const desc = description || settings.seo_meta_description || ''
    const kw = keywords || settings.seo_keywords || ''
    const img = resolveImage(image) || resolveImage(settings.logo)
    const url = window.location.href

    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'keywords', kw)
    upsertLink('canonical', url)

    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:site_name', siteTitle)
    upsertMeta('property', 'og:image', img)

    upsertMeta('name', 'twitter:card', img ? 'summary_large_image' : 'summary')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', img)
  }, [title, description, keywords, image, type, noSuffix, settings])
}
