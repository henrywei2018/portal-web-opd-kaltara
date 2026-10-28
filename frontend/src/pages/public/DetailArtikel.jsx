import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Container, Typography, Chip, Button } from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import api from '../../utils/api'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import { formatDate } from '../../utils/formatters'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSeo, excerpt } from '../../utils/seo'
import ShareButtons from '../../components/public/ShareButtons'
import ImageGalleryCarousel from '../../components/public/ImageGalleryCarousel'
import { htmlAman } from '../../utils/htmlAman'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

const DetailArtikel = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const [artikel, setArtikel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/public/artikel/${id}`)
      .then((r) => setArtikel(r.data.artikel || null))
      .catch(() => setArtikel(null))
      .finally(() => setLoading(false))
  }, [id])

  useSeo({
    title: artikel?.judul,
    description: excerpt(artikel?.isi),
    keywords: artikel?.keyword,
    image: artikel?.gambar,
    type: 'article'
  })

  if (loading) return <LoadingState message={t('detail.loadingArticle')} fullScreen />

  if (!artikel) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{t('detail.articleNotFound')}</Typography>
        <Button component={Link} to="/artikel" variant="contained" startIcon={<ArrowBack />}>{t('detail.backToArtikel')}</Button>
      </Container>
    )
  }

  return (
    <Box>
      <PageHeader
        title={artikel.judul}
        breadcrumbs={[{ label: t('nav.beranda'), path: '/' }, { label: t('nav.artikel'), path: '/artikel' }, { label: artikel.judul }]}
      />
      <Container maxWidth={false} sx={{ maxWidth: '880px', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          {artikel.kategori && <Chip label={artikel.kategori.nmkat} sx={{ bgcolor: 'primary.light', color: 'primary.dark' }} />}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(artikel.tanggal_post)}</Typography>
        </Box>
        {artikel.gambar && (
          <Box component="img" src={`${API_ORIGIN}/gambar/${artikel.gambar}`} alt={artikel.judul} sx={{ width: '100%', borderRadius: 3, mb: 3, boxShadow: 2 }} />
        )}
        <Box
          sx={{ color: 'text.primary', lineHeight: 1.8, '& p': { mb: 2 }, '& img': { maxWidth: '100%', borderRadius: 2 } }}
          dangerouslySetInnerHTML={{ __html: htmlAman(artikel.isi) }}
        />
        {/* Photo Gallery (carousel) */}
        {(artikel.gambar2 || artikel.gambar3) && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('detail.photoGallery')}
            </Typography>
            <ImageGalleryCarousel
              images={[artikel.gambar, artikel.gambar2, artikel.gambar3].filter(Boolean)}
              alt={artikel.judul}
            />
          </Box>
        )}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 4, flexWrap: 'wrap', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>Bagikan:</Typography>
          <ShareButtons title={artikel.judul} />
        </Box>
        <Button component={Link} to="/artikel" startIcon={<ArrowBack />} sx={{ mt: 3 }}>{t('detail.backToArtikel')}</Button>
      </Container>
    </Box>
  )
}

export default DetailArtikel
