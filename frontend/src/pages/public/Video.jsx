import { useState, useEffect } from 'react'
import { Box, Container, Grid, Typography } from '@mui/material'
import { PlayArrow } from '@mui/icons-material'
import api from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import PreviewModal from '../../components/public/PreviewModal'
import { useLanguage } from '../../contexts/LanguageContext'

const youtubeId = (url) => {
  if (!url) return ''
  const m = url.match(/(?:embed\/|youtu\.be\/|[?&]v=)([\w-]{11})/)
  return m ? m[1] : ''
}
const thumb = (url) => {
  const id = youtubeId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

const Video = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get('/public/video')
      .then((r) => setItems(r.data.data || (Array.isArray(r.data) ? r.data : [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <PageHeader
        title={t('page.video.title')}
        subtitle={t('page.video.subtitle')}
        breadcrumbs={[{ label: t('nav.beranda'), path: '/' }, { label: t('nav.video') }]}
      />
      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        {loading ? (
          <LoadingState message={t('loading.video')} />
        ) : items.length ? (
          <Grid container spacing={3}>
            {items.map((v) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={v.id_video}>
                <Box
                  onClick={() => setPreview({ src: v.link_video, title: v.judul })}
                  sx={{ cursor: 'pointer', borderRadius: 3, overflow: 'hidden', boxShadow: 1, bgcolor: 'background.paper', transition: 'all 0.2s', '&:hover': { boxShadow: 5, transform: 'translateY(-3px)' }, '&:hover .play': { bgcolor: 'error.main', transform: 'translate(-50%, -50%) scale(1.1)' } }}
                >
                  <Box sx={{ position: 'relative', aspectRatio: '16/9', bgcolor: '#000' }}>
                    {thumb(v.link_video) && <Box component="img" src={thumb(v.link_video)} alt={v.judul} sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
                    <Box className="play" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 56, height: 56, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                      <PlayArrow sx={{ color: 'white', fontSize: 32 }} />
                    </Box>
                  </Box>
                  <Typography sx={{ p: 2, fontWeight: 600, fontSize: '0.95rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{v.judul}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>{t('empty.video')}</Typography>
        )}
      </Container>

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} type="video" src={preview?.src} title={preview?.title} />
    </Box>
  )
}

export default Video
