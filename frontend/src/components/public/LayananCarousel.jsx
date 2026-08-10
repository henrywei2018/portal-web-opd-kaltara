import { useEffect, useRef, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Box, IconButton, Typography, Chip } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import api from '../../utils/api'
// Shared registry: this carousel used to keep its own health-only icon map, so
// a service icon picked in the admin could render differently here.
import { renderIcon } from '../../utils/iconRegistry'
const COLOR_GRAD = {
  primary: 'linear-gradient(135deg,#0066CC,#0B3D7D)',
  secondary: 'linear-gradient(135deg,#00A651,#007840)',
  success: 'linear-gradient(135deg,#00A651,#007840)',
  error: 'linear-gradient(135deg,#DC2626,#B91C1C)',
  info: 'linear-gradient(135deg,#0066CC,#004C99)',
  warning: 'linear-gradient(135deg,#F59E0B,#D97706)'
}
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const ROTATE_MS = 4500

// Coverflow carousel of services (fetched live). Centre card enlarged, auto-rotating.
// Shows the service thumbnail image, or a colored icon card as a fallback.
const LayananCarousel = () => {
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    api.get('/public/layanan')
      .then((r) => setItems(Array.isArray(r.data) ? r.data : []))
      .catch(() => setItems([]))
  }, [])

  const len = items.length

  const start = useCallback(() => {
    clearInterval(timer.current)
    if (len > 1) timer.current = setInterval(() => setIndex((i) => (i + 1) % len), ROTATE_MS)
  }, [len])

  useEffect(() => {
    start()
    return () => clearInterval(timer.current)
  }, [start])

  const go = (dir) => { setIndex((i) => (i + dir + len) % len); start() }

  if (!len) return null

  const card = (item, role) => {
    const isCenter = role === 'center'
    const common = {
      flex: '0 0 auto',
      position: 'relative',
      width: isCenter ? { xs: '80%', sm: '52%', md: '46%' } : { xs: 0, sm: '26%', md: '27%' },
      display: isCenter ? 'block' : { xs: 'none', sm: 'block' },
      aspectRatio: '16 / 9',
      borderRadius: 3,
      overflow: 'hidden',
      bgcolor: 'action.hover',
      boxShadow: isCenter ? 10 : 2,
      transform: isCenter ? 'scale(1)' : 'scale(0.84)',
      opacity: isCenter ? 1 : 0.5,
      transition: 'transform 0.55s ease, opacity 0.55s ease, box-shadow 0.3s ease',
      textDecoration: 'none',
      cursor: 'pointer'
    }

    const inner = (
      <>
        {item.gambar ? (
          <Box component="img" src={imageUrl(item.gambar)} alt={item.judul || ''} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: COLOR_GRAD[item.color] || COLOR_GRAD.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderIcon(item.icon, { sx: { fontSize: { xs: 44, md: 64 }, color: 'rgba(255,255,255,0.92)' } })}
          </Box>
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.78), rgba(0,0,0,0) 58%)' }} />
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, p: { xs: 1.5, md: 2.5 } }}>
          {item.kategori && (
            <Chip size="small" label={item.kategori} sx={{ mb: 0.75, bgcolor: 'rgba(255,255,255,0.92)', color: 'text.primary', fontWeight: 600, height: 22 }} />
          )}
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: isCenter ? { xs: '1rem', md: '1.3rem' } : '0.95rem',
              lineHeight: 1.25,
              textShadow: '0 1px 4px rgba(0,0,0,0.5)',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {item.judul}
          </Typography>
        </Box>
      </>
    )

    if (isCenter) {
      return <Box component={Link} to="/layanan" sx={{ ...common, '&:hover': { boxShadow: 14 } }}>{inner}</Box>
    }
    return <Box onClick={() => go(role === 'left' ? -1 : 1)} sx={{ ...common, '&:hover': { opacity: 0.72 } }}>{inner}</Box>
  }

  const center = items[index]
  const prev = items[(index - 1 + len) % len]
  const next = items[(index + 1) % len]

  return (
    <Box
      sx={{ position: 'relative', px: { xs: 1, md: 6 } }}
      onMouseEnter={() => clearInterval(timer.current)}
      onMouseLeave={start}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 1.5, md: 3 }, py: { xs: 3, md: 5 } }}>
        {len > 1 && card(prev, 'left')}
        {card(center, 'center')}
        {len > 1 && card(next, 'right')}
      </Box>

      {len > 1 && (
        <>
          <IconButton onClick={() => go(-1)} aria-label="Sebelumnya" sx={{ position: 'absolute', left: { xs: -4, md: 4 }, top: '46%', transform: 'translateY(-50%)', bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}>
            <ChevronLeft />
          </IconButton>
          <IconButton onClick={() => go(1)} aria-label="Berikutnya" sx={{ position: 'absolute', right: { xs: -4, md: 4 }, top: '46%', transform: 'translateY(-50%)', bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}>
            <ChevronRight />
          </IconButton>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            {items.map((_, i) => (
              <Box
                key={i}
                onClick={() => { setIndex(i); start() }}
                sx={{ width: i === index ? 22 : 8, height: 8, borderRadius: 4, bgcolor: i === index ? 'primary.main' : 'divider', cursor: 'pointer', transition: 'all 0.3s' }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

export default LayananCarousel
