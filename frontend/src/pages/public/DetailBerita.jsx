import { useEffect, useState } from 'react'
import { gambarUrl } from '../../utils/assetUrl'
import { useParams, Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Paper,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Grid,
  Breadcrumbs,
  Stack,
  Button,
  Skeleton
} from '@mui/material'
import {
  ArrowBack,
  Share,
  Visibility,
  CalendarToday,
  Person,
  AccessTime,
  Category,
  Print
} from '@mui/icons-material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import api from '../../utils/api'
import { formatDate, calculateReadingTime } from '../../utils/formatters'
import LoadingState from '../../components/ui/LoadingState'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSeo, excerpt } from '../../utils/seo'
import ShareButtons from '../../components/public/ShareButtons'
import ImageGalleryCarousel from '../../components/public/ImageGalleryCarousel'

const DetailBerita = () => {
  const { t } = useLanguage()
  const { id } = useParams()
  const [berita, setBerita] = useState(null)
  const [related, setRelated] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const fetchDetail = async () => {
    try {
      const response = await api.get(`/public/berita/${id}`)
      setBerita(response.data.berita)
      setRelated(response.data.related || [])
    } catch (error) {
      console.error('Error fetching detail:', error)
    } finally {
      setLoading(false)
    }
  }

  useSeo({
    title: berita?.judul,
    description: excerpt(berita?.isi),
    keywords: berita?.keyword,
    image: berita?.gambar,
    type: 'article'
  })

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <LoadingState message={t('detail.loadingArticle')} fullScreen />
  }

  if (!berita) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          {t('detail.articleNotFound')}
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/berita"
          startIcon={<ArrowBack />}
        >
          {t('detail.backToBerita')}
        </Button>
      </Container>
    )
  }

  const readingTime = calculateReadingTime(berita.isi?.replace(/<[^>]*>/g, '') || '')

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <Container maxWidth="lg" sx={{ pt: { xs: 1, sm: 2 }, pb: 1 }}>
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ '& .MuiBreadcrumbs-separator': { fontSize: '0.875rem' } }}
        >
          <Link
            underline="hover"
            to="/"
            sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
          >
            {t('nav.beranda')}
          </Link>
          <Link
            underline="hover"
            to="/berita"
            sx={{ color: 'text.secondary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
          >
            {t('nav.berita')}
          </Link>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
            {berita.judul}
          </Typography>
        </Breadcrumbs>
      </Container>

      <Container maxWidth="lg" sx={{ pb: { xs: 6, md: 8 } }}>
        <Grid container spacing={3}>
          {/* Main Content */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Back Button */}
            <Button
              component={Link}
              to="/berita"
              startIcon={<ArrowBack />}
              sx={{ mb: 2, fontWeight: 600 }}
            >
              {t('detail.backToBerita')}
            </Button>

            {/* Article Header Card */}
            <Paper
              sx={{
                mb: 4,
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
              }}
            >
              {/* Hero Image */}
              {berita.gambar && (
                <CardMedia
                  component="img"
                  image={gambarUrl(berita.gambar)}
                  alt={berita.judul}
                  sx={{
                    width: '100%',
                    height: { xs: 250, md: 400 },
                    objectFit: 'cover'
                  }}
                />
              )}

              {/* Article Meta */}
              <Box sx={{ p: { xs: 3, md: 4 } }}>
                {/* Category Badge */}
                {berita.kategori && (
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      icon={<Category />}
                      label={berita.kategori.nmkat}
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                        fontWeight: 600,
                        borderRadius: 1
                      }}
                    />
                  </Box>
                )}

                {/* Title */}
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.3,
                    fontSize: { xs: '1.75rem', md: '2.25rem' }
                  }}
                >
                  {berita.judul}
                </Typography>

                {/* Author and Meta Information */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: 'secondary.light',
                        color: 'secondary.contrastText',
                        fontWeight: 600
                      }}
                    >
                      {berita.user?.nama?.charAt(0) || 'A'}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {berita.user?.nama || 'Administrator'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {t('detail.author')}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {formatDate(berita.tanggal_post)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('detail.readingTime', { count: readingTime })}
                    </Typography>
                  </Box>
                  {berita.views > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {berita.views.toLocaleString('id-ID')} kali dilihat
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Share and Print Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <ShareButtons title={berita.judul} />
                  <IconButton aria-label="Cetak halaman" onClick={handlePrint} size="small" sx={{ color: 'text.secondary' }}>
                    <Print />
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {/* Article Content */}
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {/* Tags */}
              {berita.keyword && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 600 }}>
                    {t('detail.tags')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {berita.keyword.split(',').map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag.trim()}
                        size="small"
                        sx={{
                          height: 24,
                          fontSize: '0.75rem',
                          bgcolor: 'action.hover',
                          color: 'text.secondary'
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Article Content */}
              <Box
                sx={{
                  fontSize: '1.125rem',
                  lineHeight: 1.8,
                  color: 'text.primary',
                  maxWidth: '100%',
                  overflow: 'hidden'
                }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: `
                      <style>
                        .article-content { font-family: inherit; }
                        .article-content p { margin-bottom: 1.5em; line-height: 1.8; }
                        .article-content h2 { font-size: 1.75rem; font-weight: 600; margin: 2em 0 1em 0; color: #212121; }
                        .article-content h3 { font-size: 1.5rem; font-weight: 600; margin: 1.5em 0 0.75em 0; color: #212121; }
                        .article-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 2em 0; }
                        .article-content ul, .article-content ol { margin-bottom: 1.5em; padding-left: 2em; }
                        .article-content li { margin-bottom: 0.5em; }
                        .article-content blockquote { border-left: 4px solid #0D47A1; padding-left: 1.5em; margin: 1.5em 0; color: #757575; font-style: italic; }
                      </style>
                      <div class="article-content">${berita.isi}</div>
                    `
                  }}
                />
              </Box>

              {/* Photo Gallery (carousel) */}
              {(berita.gambar2 || berita.gambar3 || berita.gambar4 || berita.gambar5) && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t('detail.photoGallery')}
                  </Typography>
                  <ImageGalleryCarousel
                    images={[berita.gambar, berita.gambar2, berita.gambar3, berita.gambar4, berita.gambar5].filter(Boolean)}
                    alt={berita.judul}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* Author Card */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                mb: { xs: 2, sm: 3 },
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                {t('detail.aboutAuthor')}
              </Typography>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    width: { xs: 56, sm: 64 },
                    height: { xs: 56, sm: 64 },
                    bgcolor: 'secondary.light',
                    color: 'secondary.contrastText',
                    margin: '0 auto',
                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                    fontWeight: 700,
                    mb: 2
                  }}
                >
                  {berita.user?.nama?.charAt(0) || 'A'}
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {berita.user?.nama || 'Administrator'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {berita.user?.level === 1 ? 'Administrator' : 'Editor'}
                </Typography>
              </Box>
            </Paper>

            {/* Related Articles */}
            {related.length > 0 && (
              <Paper
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  bgcolor: 'background.paper'
                }}
              >
                <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600 }}>
                  {t('detail.relatedBerita')}
                </Typography>
                <Stack spacing={2}>
                  {related.slice(0, 5).map((item) => (
                    <Card
                      key={item.id_berita}
                      component={Link}
                      to={`/berita/${item.slug || item.id_berita}`}
                      sx={{
                        textDecoration: 'none',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateX(4)'
                        }
                      }}
                    >
                      <CardContent sx={{ p: 0 }}>
                        {item.gambar && (
                          <CardMedia
                            component="img"
                            image={gambarUrl(item.gambar)}
                            alt={item.judul}
                            sx={{
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: 2,
                              mb: 2
                            }}
                          />
                        )}
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            mb: 1,
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            color: 'text.primary'
                          }}
                        >
                          {item.judul}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDate(item.tanggal_post)}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </Paper>
            )}

            {/* Quick Navigation */}
            <Paper
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                bgcolor: 'background.paper'
              }}
            >
              <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 600 }}>
                {t('detail.quickNavigation')}
              </Typography>
              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/berita"
                  startIcon={<Category />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('detail.viewAllBerita')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/galeri"
                  startIcon={<Category />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('detail.photoGallery')}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  component={Link}
                  to="/kontak"
                  startIcon={<Share />}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {t('detail.contactUs')}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DetailBerita