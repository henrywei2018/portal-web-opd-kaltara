import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

// Update the browser tab favicon to the configured image
const applyFavicon = (favicon) => {
  if (!favicon) return
  const href = /^https?:\/\//.test(favicon) ? favicon : `${ORIGIN}/gambar/${favicon}`
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = href
}

// Update the browser tab title to the configured site name
const applyTitle = (title, subtitle) => {
  if (!title) return
  document.title = subtitle ? `${title} - ${subtitle}` : title
}

const SettingsContext = createContext({ settings: {}, loading: true, refresh: () => {} })

export const useSettings = () => useContext(SettingsContext)

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    return api.get('/public/settings')
      .then((r) => {
        const data = r.data && typeof r.data === 'object' ? r.data : {}
        setSettings(data)
        applyFavicon(data.favicon)
        applyTitle(data.site_title, data.site_subtitle)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return (
    <SettingsContext.Provider value={{ settings, loading, refresh }}>
      {children}
    </SettingsContext.Provider>
  )
}
