import { useEffect } from 'react'
import { useSettings } from '../../contexts/SettingsContext'
import { upsertMeta } from '../../utils/seo'

/**
 * Site-wide SEO side-effects that apply to every page: the Google Search Console
 * verification meta tag and the Google Analytics / Tag Manager snippet. Both are
 * driven by the SEO settings module and injected once when configured. Renders
 * nothing. Kept separate from per-page useSeo (title/description) to avoid
 * parent/child effect-ordering conflicts.
 */
const SiteSeo = () => {
  const { settings } = useSettings()

  // Google Search Console verification (meta-tag method)
  useEffect(() => {
    const code = (settings.seo_search_console || '').trim()
    if (code) upsertMeta('name', 'google-site-verification', code)
  }, [settings.seo_search_console])

  // Google Analytics (G-/UA-/AW-) or Google Tag Manager (GTM-)
  useEffect(() => {
    const id = (settings.seo_ga_id || '').trim()
    if (!id || document.getElementById('site-analytics')) return

    if (/^GTM-/i.test(id)) {
      const s = document.createElement('script')
      s.id = 'site-analytics'
      s.text = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${id}');`
      document.head.appendChild(s)
    } else {
      const s = document.createElement('script')
      s.id = 'site-analytics'
      s.async = true
      s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`
      document.head.appendChild(s)
      const init = document.createElement('script')
      init.id = 'site-analytics-init'
      init.text = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`
      document.head.appendChild(init)
    }
  }, [settings.seo_ga_id])

  return null
}

export default SiteSeo
