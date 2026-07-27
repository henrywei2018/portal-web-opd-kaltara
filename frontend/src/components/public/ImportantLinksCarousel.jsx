import { useEffect, useRef, useState, useCallback } from 'react'
import { Box, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight, Link as LinkIcon } from '@mui/icons-material'
import api from '../../utils/api'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const ROTATE_MS = 4500

// Coverflow-style carousel: 3 items, the centre one enlarged, auto-rotating.
// Cards show the image full (no footer); the centre card is a link, side cards
// rotate to the centre on click.
const ImportantLinksCarousel = () => {
  const [items, setItems] = useState([])
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    api.get('/public/tautan-penting')
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
    const inner = item.gambar
      ? <Box component="img" src={imageUrl(item.gambar)} alt={item.judul || ''} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      : <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LinkIcon sx={{ fontSize: 40, color: 'text.disabled' }} /></Box>

    const common = {
      flex: '0 0 auto',
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
      textDecoration: 'none'
    }

    if (isCenter) {
      return (
        <Box
          component="a"
          href={item.url || '#'}
          target={item.target_blank ? '_blank' : undefined}
          rel={item.target_blank ? 'noopener noreferrer' : undefined}
          sx={{ ...common, cursor: 'pointer', '&:hover': { boxShadow: 14 } }}
        >
          {inner}
        </Box>
      )
    }
    return (
      <Box
        onClick={() => go(role === 'left' ? -1 : 1)}
        sx={{ ...common, cursor: 'pointer', '&:hover': { opacity: 0.75 } }}
      >
        {inner}
      </Box>
    )
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
          <IconButton
            onClick={() => go(-1)}
            aria-label="Sebelumnya"
            sx={{ position: 'absolute', left: { xs: -4, md: 4 }, top: '50%', transform: 'translateY(-50%)', bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            onClick={() => go(1)}
            aria-label="Berikutnya"
            sx={{ position: 'absolute', right: { xs: -4, md: 4 }, top: '50%', transform: 'translateY(-50%)', bgcolor: 'background.paper', boxShadow: 3, '&:hover': { bgcolor: 'background.paper', color: 'primary.main' } }}
          >
            <ChevronRight />
          </IconButton>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
            {items.map((_, i) => (
              <Box
                key={i}
                onClick={() => { setIndex(i); start() }}
                sx={{
                  width: i === index ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: i === index ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}

export default ImportantLinksCarousel
