import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { translations } from '../i18n/translations'

const LanguageContext = createContext({ lang: 'id', setLang: () => {}, t: (k) => k })

export const useLanguage = () => useContext(LanguageContext)

const getInitialLang = () => {
  try {
    const saved = localStorage.getItem('lang')
    if (saved === 'id' || saved === 'en') return saved
  } catch { /* ignore */ }
  return 'id'
}

export const LanguageProvider = ({ children }) => {
  // Persist synchronously at init so api.js's X-Locale header is correct on the
  // very first content fetch (child effects run before provider effects).
  const [lang, setLangState] = useState(() => {
    const initial = getInitialLang()
    try { localStorage.setItem('lang', initial) } catch { /* ignore */ }
    return initial
  })

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch { /* ignore */ }
    document.documentElement.lang = lang
  }, [lang])

  const setLang = useCallback((next) => {
    if ((next !== 'id' && next !== 'en') || next === lang) return
    // Persist first, then reload so every page refetches CMS content with the
    // new X-Locale header (static chrome + dynamic content stay consistent).
    try { localStorage.setItem('lang', next) } catch { /* ignore */ }
    setLangState(next)
    window.location.reload()
  }, [lang])

  // Translate a key; optional params interpolate {placeholders}, e.g. t('x', { count: 5 })
  const t = useCallback(
    (key, params) => {
      const dict = translations[lang] || translations.id
      let str = dict[key] ?? translations.id[key] ?? key
      if (params && typeof str === 'string') {
        for (const p in params) {
          str = str.replace(new RegExp(`\\{${p}\\}`, 'g'), params[p])
        }
      }
      return str
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
