import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Grid, Card, CardActionArea, CardMedia, CardContent, Typography, Chip } from '@mui/material'
import api from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import { formatDate } from '../../utils/formatters'
import { useLanguage } from '../../contexts/LanguageContext'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

const Artikel = () => {
  const { t } = useLanguage()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/artikel?per_page=24')
      .then((r) => setItems(r.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Box>
      <PageHeader
        title={t('page.artikel.title')}
        subtitle={t('page.artikel.subtitle')}
        breadcrumbs={[{ label: t('nav.beranda'), path: '/' }, { label: t('nav.artikel') }]}
      />
      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        {loading ? (
          <LoadingState message={t('loading.artikel')} />
        ) : items.length ? (
          <Grid container spacing={3}>
            {items.map((a) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={a.id_artikel}>
                <Card sx={{ borderRadius: 3, height: '100%', boxShadow: 1, transition: 'all 0.2s', '&:hover': { boxShadow: 5, transform: 'translateY(-3px)' } }}>
                  <CardActionArea component={Link} to={`/artikel/${a.slug || a.id_artikel}`} sx={{ height: '100%', display: 'block' }}>
                    {a.gambar && <CardMedia component="img" height="180" image={`${API_ORIGIN}/gambar/${a.gambar}`} alt={a.judul} />}
                    <CardContent>
                      {a.kategori && <Chip size="small" label={a.kategori.nmkat} sx={{ mb: 1, bgcolor: 'primary.light', color: 'primary.dark' }} />}
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem', mb: 0.5, lineHeight: 1.3 }}>{a.judul}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(a.tanggal_post)}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>{t('empty.artikel')}</Typography>
        )}
      </Container>
    </Box>
  )
}

export default Artikel
