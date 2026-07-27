import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Box, IconButton, Typography, Paper, Slide } from '@mui/material'
import { Close, ArrowForward } from '@mui/icons-material'
import api from '../../utils/api'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const DAY_MS = 86400000

// Map of { [id_promosi]: dismissedAtMs } persisted in localStorage.
const getDismissed = () => {
  try { return JSON.parse(localStorage.getItem('promoDismissed') || '{}') || {} } catch { return {} }
}

// A promo stays hidden while still within its re-show window (jeda_hari).
// jeda_hari = 0 → permanent; blank/null → default 3 days.
const isSuppressed = (p, ts) => {
  if (!ts) return false
  const raw = p.jeda_hari
  const days = (raw === null || raw === undefined || raw === '') ? 3 : Number(raw)
  if (days <= 0) return true
  return (Date.now() - ts) < days * DAY_MS
}

// Floating promotion shown as a wide banner that spans the site section width,
// fixed near the bottom. Closable; dismissal is remembered per promo id.
const FloatingPromo = () => {
  const [promo, setPromo] = useState(null)
  const [visible, setVisible] = useState(false)
  const location = useLocation()
  const hidden = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')

  useEffect(() => {
    if (hidden) return
    api.get('/public/promosi')
      .then((r) => {
        const list = Array.isArray(r.data) ? r.data : []
        const dismissed = getDismissed()
        const next = list.find((p) => !isSuppressed(p, dismissed[p.id_promosi]))
        if (next) { setPromo(next); setVisible(true) }
      })
      .catch(() => {})
  }, [hidden])

  const close = () => {
    setVisible(false)
    if (promo) {
      const dismissed = getDismissed()
      dismissed[promo.id_promosi] = Date.now()
      try { localStorage.setItem('promoDismissed', JSON.stringify(dismissed)) } catch { /* ignore */ }
    }
  }

  if (hidden || !promo || !visible) return null

  const hasImage = Boolean(promo.gambar)
  const hasLink = Boolean(promo.url)

  return (
    <Slide direction="up" in={visible} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          left: 0,
          right: 0,
          mx: 'auto',
          bottom: { xs: 12, md: 20 },
          width: 'calc(100% - 24px)',
          maxWidth: 1200,
          zIndex: 1250
        }}
      >
        <Paper
          elevation={10}
          sx={{
            position: 'relative',
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          <IconButton
            size="small"
            onClick={close}
            aria-label="Tutup promosi"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.5)',
              color: '#fff',
              '&:hover': { bgcolor: 'rgba(0,0,0,0.72)' }
            }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Box
            component={hasLink ? 'a' : 'div'}
            href={hasLink ? promo.url : undefined}
            target={hasLink && promo.target_blank ? '_blank' : undefined}
            rel={hasLink && promo.target_blank ? 'noopener noreferrer' : undefined}
            sx={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            {hasImage ? (
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={imageUrl(promo.gambar)}
                  alt={promo.judul || ''}
                  sx={{ width: '100%', display: 'block', maxHeight: { xs: 72, sm: 90, md: 110 }, objectFit: 'cover' }}
                />
                {promo.judul && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'flex-end',
                      p: { xs: 1.5, md: 2.5 },
                      background: 'linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0))'
                    }}
                  >
                    <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: { xs: '1rem', md: '1.25rem' }, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                      {promo.judul}
                    </Typography>
                  </Box>
                )}
              </Box>
            ) : (
              // No image — render a wide gradient bar with the title and a CTA hint
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  px: { xs: 2.5, md: 4 },
                  py: { xs: 1.75, md: 2.25 },
                  pr: { xs: 6, md: 7 },
                  background: 'linear-gradient(135deg, #0066CC, #0B3D7D)',
                  color: '#fff'
                }}
              >
                <Typography sx={{ flexGrow: 1, fontWeight: 700, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                  {promo.judul || 'Informasi'}
                </Typography>
                {hasLink && <ArrowForward sx={{ flexShrink: 0 }} />}
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Slide>
  )
}

export default FloatingPromo
