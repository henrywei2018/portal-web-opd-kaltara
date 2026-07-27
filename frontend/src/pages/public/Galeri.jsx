import { useState, useEffect } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { ZoomIn, PhotoLibrary } from '@mui/icons-material'
import api from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import PreviewModal from '../../components/public/PreviewModal'
import { useLanguage } from '../../contexts/LanguageContext'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const Galeri = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get('/public/galeri?per_page=60')
      .then((r) => setItems(r.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <PageHeader
        title={t('page.galeri.title')}
        subtitle={t('page.galeri.subtitle')}
        breadcrumbs={[{ label: t('nav.beranda'), path: '/' }, { label: t('nav.galeri') }]}
      />

      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 0, sm: 3, md: 4 }, py: { xs: 1, sm: 3 }, pb: { xs: 4, md: 6 } }}>
        {loading ? (
          <Box sx={{ px: { xs: 2, sm: 0 } }}><LoadingState message={t('loading.galeri')} /></Box>
        ) : items.length ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(5, 1fr)' },
              gap: { xs: '2px', sm: '8px', md: '12px' }
            }}
          >
            {items.map((g) => (
              <Box
                key={g.id_galeri}
                onClick={() => setPreview({ src: imageUrl(g.gambar), title: g.judul })}
                sx={{
                  position: 'relative',
                  aspectRatio: '1',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  borderRadius: { xs: 0, sm: 2 },
                  bgcolor: 'action.hover',
                  boxShadow: { xs: 0, sm: 1 },
                  '&:hover .galeri-ov': { opacity: 1 },
                  '&:hover .galeri-img': { transform: 'scale(1.06)' }
                }}
              >
                <Box
                  className="galeri-img"
                  component="img"
                  src={imageUrl(g.gambar)}
                  alt={g.judul}
                  loading="lazy"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                />
                <Box
                  className="galeri-ov"
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    bgcolor: 'rgba(0,0,0,0.45)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    p: 1.5,
                    textAlign: 'center'
                  }}
                >
                  <ZoomIn sx={{ fontSize: { xs: 22, sm: 30 }, mb: 0.5 }} />
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, display: { xs: 'none', sm: '-webkit-box' }, WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                  >
                    {g.judul}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 10, color: 'text.secondary' }}>
            <PhotoLibrary sx={{ fontSize: 56, color: 'text.disabled', mb: 1 }} />
            <Typography>{t('empty.galeri')}</Typography>
          </Box>
        )}
      </Container>

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} type="image" src={preview?.src} title={preview?.title} />
    </Box>
  )
}

export default Galeri
