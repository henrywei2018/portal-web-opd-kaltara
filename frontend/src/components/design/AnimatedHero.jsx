import { useState, useEffect } from 'react'
import { Box, Container, Typography, Button, Stack, Grid, useTheme, useMediaQuery } from '@mui/material'
import { ArrowForward, LocalHospital, HealthAndSafety, Emergency, MedicalServices, Groups, Vaccines } from '@mui/icons-material'
import { motion } from 'framer-motion'
import api from '../../utils/api'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

const STAT_ICONS = { MedicalServices, Groups, Vaccines, Emergency, LocalHospital, HealthAndSafety }
const renderStatIcon = (name) => {
  const IconComp = STAT_ICONS[name] || MedicalServices
  return <IconComp />
}

const AnimatedHero = ({ stats: statsProp }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [currentSlide, setCurrentSlide] = useState(0)
  const [apiSlides, setApiSlides] = useState(null)
  const [statsState, setStatsState] = useState([])

  useEffect(() => {
    api.get('/public/hero')
      .then((r) => { if (Array.isArray(r.data) && r.data.length) setApiSlides(r.data) })
      .catch(() => {})
    if (!statsProp) {
      api.get('/public/statistik').then((r) => setStatsState(r.data || [])).catch(() => {})
    }
  }, [statsProp])

  const heroStats = (statsProp || statsState).filter((s) => s.tampil_hero)

  const fallbackSlides = [
    { title: 'Selamat Datang di Portal Resmi', subtitle: 'Pemerintah Daerah', description: 'Melayani dengan hati, bekerja dengan profesional untuk masyarakat', cta: 'Jelajahi Layanan', ctaLink: '/layanan', secondaryCta: 'Hubungi Kami', secondaryLink: '/kontak', bgColor: theme.palette.primary.main },
    { title: 'Layanan Publik Terpadu', subtitle: 'Akses Informasi Lebih Mudah', description: 'Dapatkan informasi terkini seputar layanan, program, dan kegiatan kami', cta: 'Lihat Berita', ctaLink: '/berita', secondaryCta: 'Lihat Profil', secondaryLink: '/profil', bgColor: theme.palette.secondary.main },
    { title: 'Melayani untuk Semua', subtitle: 'Bersama Mewujudkan Pelayanan Terbaik', description: 'Bergabung bersama kami dalam mewujudkan masyarakat yang maju dan produktif', cta: 'Lihat Data', ctaLink: '/data', secondaryCta: 'Layanan Kami', secondaryLink: '/layanan', bgColor: '#0056B3' }
  ]

  const slides = apiSlides
    ? apiSlides.map((s) => ({
        title: s.judul, subtitle: s.subjudul, description: s.deskripsi,
        cta: s.cta_text, ctaLink: s.cta_link, secondaryCta: s.cta2_text, secondaryLink: s.cta2_link,
        bgType: s.bg_type, bgValue: s.bg_value, overlay: s.overlay, showStats: s.tampil_statistik,
        bgColor: s.bg_type === 'color' ? (s.bg_value || theme.palette.primary.main) : theme.palette.primary.main
      }))
    : fallbackSlides.map((s) => ({ ...s, bgType: 'color', bgValue: s.bgColor, overlay: false, showStats: true }))

  const slide = slides[currentSlide] || slides[0] || {}

  useEffect(() => {
    if (slides.length <= 1) return undefined
    const interval = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 6000)
    return () => clearInterval(interval)
  }, [slides.length])

  // Background style for the current slide
  const heroBg = slide.bgType === 'gradient' && slide.bgValue
    ? { background: slide.bgValue }
    : slide.bgType === 'image' && slide.bgValue
      ? { backgroundImage: `url('${API_ORIGIN}/gambar/${slide.bgValue}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { bgcolor: slide.bgValue || slide.bgColor || theme.palette.primary.main }
  const isImage = slide.bgType === 'image' && slide.bgValue
  const btnColor = slide.bgType === 'color' ? (slide.bgValue || slide.bgColor) : '#0066CC'
  const hasStats = slide.showStats !== false && heroStats.length > 0

  const slideVariants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { x: -100, opacity: 0, transition: { duration: 0.3 } }
  }
  const fadeInUp = { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 } }

  return (
    <Box
      sx={{
        position: 'relative',
        marginTop: { xs: '-64px', md: '-72px' },
        minHeight: { xs: '550px', md: '650px', lg: '700px' },
        color: 'white',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        ...heroBg
      }}
    >
      {/* Dark overlay for image backgrounds */}
      {isImage && slide.overlay !== false && (
        <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(7,34,63,0.55)', pointerEvents: 'none' }} />
      )}

      {/* Background Pattern */}
      <Box
        sx={{
          position: 'absolute', inset: 0, opacity: 0.05, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />


      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, position: 'relative', zIndex: 1, py: { xs: 12, md: 16 } }}>
        <Grid container spacing={4} alignItems="center">
          <Grid size={{ xs: 12, md: hasStats ? 7 : 12, lg: hasStats ? 8 : 12 }}>
            <motion.div key={currentSlide} variants={slideVariants} initial="enter" animate="center" exit="exit">
              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                {slide.subtitle && (
                  <Typography variant="overline" sx={{ mb: 2, opacity: 0.9, letterSpacing: 3, fontSize: { xs: '0.75rem', md: '0.875rem' }, fontWeight: 500, textTransform: 'uppercase' }}>
                    {slide.subtitle}
                  </Typography>
                )}
                <Typography variant="h1" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '2rem', md: '2.75rem', lg: '3.5rem' }, lineHeight: 1.2 }}>
                  {slide.title}
                </Typography>
                {slide.description && (
                  <Typography variant="h6" sx={{ mb: { xs: 3, md: 4 }, opacity: 0.95, maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.7 }}>
                    {slide.description}
                  </Typography>
                )}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
                  {slide.cta && (
                    <Button variant="contained" size="large" endIcon={<ArrowForward />} href={slide.ctaLink || '#'}
                      sx={{ px: 4, py: 1.5, fontSize: '1rem', bgcolor: 'white', color: btnColor, fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)' } }}>
                      {slide.cta}
                    </Button>
                  )}
                  {slide.secondaryCta && (
                    <Button variant="outlined" size="large" endIcon={<ArrowForward />} href={slide.secondaryLink || '#'}
                      sx={{ px: 4, py: 1.5, fontSize: '1rem', borderColor: 'white', color: 'white', fontWeight: 600, '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)', transform: 'translateY(-2px)' } }}>
                      {slide.secondaryCta}
                    </Button>
                  )}
                </Stack>
              </motion.div>
            </motion.div>
          </Grid>

          {/* Right Side - Stats (hidden on mobile or when disabled per slide) */}
          {!isMobile && hasStats && (
            <Grid size={{ md: 5, lg: 4 }}>
              <Stack spacing={2}>
                {heroStats.map((stat, index) => (
                  <motion.div key={stat.id_statistik || index} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + index * 0.1 }}>
                    <Box sx={{ bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', gap: 2, border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)', transform: 'translateX(-4px)' } }}>
                      <Box sx={{ width: 48, height: 48, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{renderStatIcon(stat.icon)}</Box>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{stat.nilai}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>{stat.label}</Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Stack>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <Box sx={{ position: 'absolute', bottom: { xs: 24, md: 32 }, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 2, zIndex: 2 }}>
          {slides.map((_, index) => (
            <Box key={index} onClick={() => setCurrentSlide(index)}
              sx={{ width: currentSlide === index ? 40 : 12, height: 4, bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.4)', borderRadius: 2, cursor: 'pointer', transition: 'all 0.3s ease' }} />
          ))}
        </Box>
      )}

      {/* Wave Bottom */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: { xs: 60, md: 80 }, svg: { width: '100%', height: '100%', display: 'block' } }}>
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '100%' }}>
          <path d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,58.7C960,64,1056,64,1152,58.7C1248,53,1344,43,1392,37.3L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z" fill={theme.palette.background.default} />
        </svg>
      </Box>
    </Box>
  )
}

export default AnimatedHero
