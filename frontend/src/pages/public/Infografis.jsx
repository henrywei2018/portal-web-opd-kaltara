import { useState, useEffect } from 'react'
import { Box, Container, Grid, Typography, Card, CardContent, Button, Chip, Stack } from '@mui/material'
import { ZoomOutMap, Download, CalendarMonth } from '@mui/icons-material'
import api from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import PreviewModal from '../../components/public/PreviewModal'
import { useLanguage } from '../../contexts/LanguageContext'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imgUrl = (name) => (name ? `${API_ORIGIN}/gambar/${name}` : '')

const Infografis = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get('/public/infografis')
      .then((r) => setItems(r.data.data || (Array.isArray(r.data) ? r.data : [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (d) => {
    if (!d) return null
    try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) } catch { return null }
  }

  return (
    <Box>
      <PageHeader
        title={t('page.infografis.title')}
        subtitle={t('page.infografis.subtitle')}
        breadcrumbs={[{ label: t('nav.beranda'), path: '/' }, { label: t('nav.infografis') }]}
      />
      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        {loading ? (
          <LoadingState message={t('loading.infografis')} />
        ) : items.length ? (
          <Grid container spacing={3} alignItems="flex-start">
            {items.map((it) => {
              const src = imgUrl(it.gambar)
              const date = formatDate(it.tanggal)
              return (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={it.id_infografis}>
                  <Card
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: 1,
                      transition: 'all 0.2s',
                      '&:hover': { boxShadow: 6, transform: 'translateY(-4px)' },
                      '&:hover .zoomHint': { opacity: 1 }
                    }}
                  >
                    {/* Poster — click to open the lightbox. Natural aspect (infografis are tall). */}
                    <Box
                      onClick={() => setPreview({ src, title: it.judul })}
                      sx={{ position: 'relative', cursor: 'zoom-in', bgcolor: 'background.default' }}
                    >
                      <Box component="img" src={src} alt={it.judul} loading="lazy" sx={{ width: '100%', display: 'block' }} />
                      <Box
                        className="zoomHint"
                        sx={{
                          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: 'rgba(11, 61, 125, 0.35)', color: 'white', opacity: 0, transition: 'opacity 0.2s'
                        }}
                      >
                        <ZoomOutMap sx={{ fontSize: 40 }} />
                      </Box>
                    </Box>

                    <CardContent sx={{ pb: 2 }}>
                      {it.judul && (
                        <Typography sx={{ fontWeight: 700, fontSize: '0.98rem', mb: date ? 1 : 1.5, lineHeight: 1.35 }}>
                          {it.judul}
                        </Typography>
                      )}
                      {date && (
                        <Chip
                          size="small"
                          icon={<CalendarMonth sx={{ fontSize: 15 }} />}
                          label={date}
                          sx={{ mb: 1.5, bgcolor: 'action.hover', fontWeight: 500 }}
                        />
                      )}
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ZoomOutMap />}
                          onClick={() => setPreview({ src, title: it.judul })}
                          sx={{ fontWeight: 600, flexGrow: 1 }}
                        >
                          {t('infografis.view')}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Download />}
                          component="a"
                          href={src}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ fontWeight: 600 }}
                        >
                          {t('infografis.download')}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
        ) : (
          <Typography sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>{t('empty.infografis')}</Typography>
        )}
      </Container>

      <PreviewModal open={!!preview} onClose={() => setPreview(null)} type="image" src={preview?.src} title={preview?.title} />
    </Box>
  )
}

export default Infografis
