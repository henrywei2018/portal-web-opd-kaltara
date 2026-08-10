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
  Chip,
  IconButton,
  Divider,
  Grid,
  Breadcrumbs,
  Stack,
  Button,
} from '@mui/material'
import {
  ArrowBack,
  Share,
  Visibility,
  CalendarToday,
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

                {/* Meta — one quiet line. Author was removed: on an official
                    portal the publisher is the institution, not the staff
                    member who typed it in. */}
                <Stack
                  direction="row"
                  spacing={2}
                  divider={<Divider orientation="vertical" flexItem />}
                  sx={{ flexWrap: 'wrap', rowGap: 1, alignItems: 'center', color: 'text.secondary', mb: 3 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <CalendarToday sx={{ fontSize: 17 }} />
                    <Typography variant="body2">{formatDate(berita.tanggal_post)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <AccessTime sx={{ fontSize: 17 }} />
                    <Typography variant="body2">{t('detail.readingTime', { count: readingTime })}</Typography>
                  </Box>
                  {berita.views > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <Visibility sx={{ fontSize: 17 }} />
                      <Typography variant="body2">
                        {t('detail.viewCount', { count: berita.views.toLocaleString('id-ID') })}
                      </Typography>
                    </Box>
                  )}
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {/* Share and Print */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}>
                    {t('detail.share')}
                  </Typography>
                  <ShareButtons title={berita.judul} />
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton aria-label={t('detail.print')} onClick={handlePrint} size="small" sx={{ color: 'text.secondary' }}>
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
              {/* Article body. Styles live in `sx` rather than an injected
                  <style> block: the old one hardcoded #212121/#0D47A1/#757575,
                  which made the text unreadable in dark mode. */}
              <Box
                className="article-content"
                sx={{
                  color: 'text.primary',
                  fontSize: { xs: '1.0625rem', md: '1.125rem' },
                  lineHeight: 1.85,
                  // Comfortable measure — long lines are the main readability
                  // problem on a wide article column.
                  maxWidth: '68ch',
                  overflowWrap: 'break-word',
                  '& p': { mb: '1.5em' },
                  '& h2': { fontSize: { xs: '1.4rem', md: '1.65rem' }, fontWeight: 700, mt: '1.8em', mb: '0.7em', lineHeight: 1.3 },
                  '& h3': { fontSize: { xs: '1.2rem', md: '1.35rem' }, fontWeight: 700, mt: '1.5em', mb: '0.6em', lineHeight: 1.35 },
                  '& img': { maxWidth: '100%', height: 'auto', borderRadius: 2, my: '1.75em', display: 'block' },
                  '& figure': { m: 0, my: '1.75em' },
                  '& figcaption': { fontSize: '0.85rem', color: 'text.secondary', mt: 1, textAlign: 'center' },
                  '& ul, & ol': { mb: '1.5em', pl: '1.6em' },
                  '& li': { mb: '0.5em' },
                  '& a': { color: 'primary.main', textDecoration: 'underline' },
                  '& blockquote': {
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                    pl: 2.5, ml: 0, my: '1.75em',
                    color: 'text.secondary',
                    fontStyle: 'italic'
                  },
                  '& table': { width: '100%', borderCollapse: 'collapse', my: '1.75em', display: 'block', overflowX: 'auto' },
                  '& th, & td': { border: '1px solid', borderColor: 'divider', p: 1, textAlign: 'left' },
                  '& pre': { bgcolor: 'action.hover', p: 2, borderRadius: 2, overflowX: 'auto' }
                }}
                dangerouslySetInnerHTML={{ __html: berita.isi || '' }}
              />

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

              {/* Tags — after the article, not before it */}
              {berita.keyword && (
                <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 700, letterSpacing: 0.5 }}>
                    {t('detail.tags')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {berita.keyword.split(',').filter((x) => x.trim()).map((tag, index) => (
                      <Chip key={index} label={tag.trim()} size="small" variant="outlined" sx={{ height: 26 }} />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar — sticks while a long article scrolls past */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: 'sticky' }, top: { md: 88 } }}>

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
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default DetailBerita