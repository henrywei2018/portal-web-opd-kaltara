import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Stack,
  Divider,
  Chip,
  Button
} from '@mui/material'
import {
  ArrowForward,
  Newspaper,
  Announcement,
  PhotoLibrary,
  VideoLibrary,
  Phone,
  LocationOn,
  Email,
  LocalHospital,
  Vaccines,
  Emergency,
  TrendingUp,
  Groups,
  MedicalServices,
  HealthAndSafety,
  CalendarToday,
  AccessTime,
  PlayArrow
} from '@mui/icons-material'
import api from '../../utils/api'
import { formatDate } from '../../utils/formatters'
import LoadingState from '../../components/ui/LoadingState'
import PreviewModal from '../../components/public/PreviewModal'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSeo } from '../../utils/seo'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const mediaImg = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))
const ytId = (url) => {
  if (!url) return ''
  const m = url.match(/(?:embed\/|youtu\.be\/|[?&]v=)([\w-]{11})/)
  return m ? m[1] : ''
}
const ytThumb = (url) => {
  const id = ytId(url)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

// Design Components
import AnimatedHero from '../../components/design/AnimatedHero'
import SectionHeader from '../../components/design/SectionHeader'
import SectionTitle from '../../components/design/SectionTitle'
import ServiceCard from '../../components/design/ServiceCard'
import StatCard from '../../components/design/StatCard'
import NewsCard from '../../components/design/NewsCard'
import ServicesCarousel from '../../components/design/ServicesCarousel'
import NewsSection from '../../components/design/NewsSection'
import ImportantLinksCarousel from '../../components/public/ImportantLinksCarousel'
import LayananCarousel from '../../components/public/LayananCarousel'
import VisitorStats from '../../components/public/VisitorStats'

const STAT_ICONS = { MedicalServices, Groups, Vaccines, Emergency, LocalHospital, HealthAndSafety }
const renderStatIcon = (name) => {
  const IconComp = STAT_ICONS[name] || MedicalServices
  return <IconComp />
}

// Session-level cache so returning to Home renders instantly (then refreshes in background)
const EMPTY_HOME = { latestNews: [], featured: [], announcements: [], galleryImages: [], videos: [], articles: [], infografis: [], stats: [] }
let homeCache = EMPTY_HOME

const Home = () => {
  const { t } = useLanguage()
  const [latestNews, setLatestNews] = useState(homeCache.latestNews)
  const [featured, setFeatured] = useState(homeCache.featured)
  const [announcements, setAnnouncements] = useState(homeCache.announcements)
  const [galleryImages, setGalleryImages] = useState(homeCache.galleryImages)
  const [videos, setVideos] = useState(homeCache.videos)
  const [articles, setArticles] = useState(homeCache.articles)
  const [infografis, setInfografis] = useState(homeCache.infografis)
  const [stats, setStats] = useState(homeCache.stats)
  const [preview, setPreview] = useState(null)

  // Home uses the site-default title/description (client-side nav back to home)
  useSeo({})

  // Fetch all homepage data in parallel and cache it. The page renders
  // immediately (hero + sections); content fills in as data arrives, and a
  // return visit shows the cached data instantly while refreshing in the background.
  useEffect(() => {
    let active = true
    const grab = (url) => api.get(url).then((r) => r.data).catch(() => null)
    const load = async () => {
      const [berita, pinned, peng, gal, vid, art, info, stat] = await Promise.all([
        grab('/public/berita?limit=10'),
        grab('/public/berita?pinned=1&limit=6'),
        grab('/public/pengumuman'),
        grab('/public/galeri?limit=8'),
        grab('/public/video'),
        grab('/public/artikel?limit=5'),
        grab('/public/infografis'),
        grab('/public/statistik')
      ])
      if (!active) return
      const next = {
        latestNews: berita?.data || [],
        featured: pinned?.data || [],
        announcements: Array.isArray(peng) ? peng : (peng?.data || []),
        galleryImages: gal?.data || [],
        videos: vid?.data || (Array.isArray(vid) ? vid : []),
        articles: art?.data || [],
        infografis: Array.isArray(info) ? info : (info?.data || []),
        stats: Array.isArray(stat) ? stat : (stat?.data || [])
      }
      homeCache = next
      setLatestNews(next.latestNews)
      setFeatured(next.featured)
      setAnnouncements(next.announcements)
      setGalleryImages(next.galleryImages)
      setVideos(next.videos)
      setArticles(next.articles)
      setInfografis(next.infografis)
      setStats(next.stats)
    }
    load()
    return () => { active = false }
  }, [])

  // services are loaded live by <LayananCarousel /> from /public/layanan

  // Combined media thumbnails (photos + videos) for the homepage gallery grid
  const photoItems = galleryImages.map((g) => ({
    key: `g${g.id_galeri}`, type: 'image', thumb: mediaImg(g.gambar), src: mediaImg(g.gambar), title: g.judul
  }))
  const videoItems = videos
    .map((v) => ({ key: `v${v.id_video}`, type: 'video', thumb: ytThumb(v.link_video), src: v.link_video, title: v.judul }))
    .filter((v) => v.thumb)
  const media = []
  for (let i = 0; i < Math.max(photoItems.length, videoItems.length); i++) {
    if (photoItems[i]) media.push(photoItems[i])
    if (videoItems[i]) media.push(videoItems[i])
  }
  const mediaTop = media.slice(0, 8)

  return (
    <Box>
      {/* Animated Hero Section */}
      <AnimatedHero stats={stats} />

      {/* News Section — moved directly after the hero */}
      <NewsSection
        latestNews={latestNews}
        featured={featured}
        articles={articles}
        announcements={announcements}
        infografis={infografis}
      />

      {/* Important External Links carousel */}
      <Box sx={{ bgcolor: 'background.paper', py: { xs: 6, md: 8 } }}>
        <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 } }}>
          <SectionTitle title={t('home.sec.links.title')} />

          <ImportantLinksCarousel />
        </Container>
      </Box>

      {/* Services Section */}
      <Box sx={{ py: { xs: 6, md: 8 } }}>
        <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 } }}>
          <SectionTitle title={t('home.sec.services.title')} actionText={t('home.sec.services.button')} actionLink="/layanan" />

          <LayananCarousel />
        </Container>
      </Box>

      {/* Gallery & Video preview — tightly packed media grid inside a rounded container */}
      {mediaTop.length > 0 && (
        <Box sx={{ py: { xs: 6, md: 8 } }}>
          <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 } }}>
            <SectionTitle title={t('home.sec.gallery.title')} actionText={t('home.sec.gallery.button')} actionLink="/galeri" />

            <Box
              sx={{
                borderRadius: { xs: 3, md: 5 },
                overflow: 'hidden',
                boxShadow: 4,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' },
                gap: 0,
                bgcolor: 'background.paper'
              }}
            >
              {mediaTop.map((item) => (
                <Box
                  key={item.key}
                  onClick={() => setPreview(item)}
                  sx={{
                    position: 'relative',
                    aspectRatio: '1',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    bgcolor: 'action.hover',
                    '&:hover .m-img': { transform: 'scale(1.06)' },
                    '&:hover .m-ov': { opacity: 1 }
                  }}
                >
                  <Box
                    className="m-img"
                    component="img"
                    src={item.thumb}
                    alt={item.title}
                    loading="lazy"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
                  />
                  {item.type === 'video' && (
                    <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                      <Box sx={{ width: 46, height: 46, borderRadius: '50%', bgcolor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PlayArrow sx={{ color: '#fff', fontSize: 28 }} />
                      </Box>
                    </Box>
                  )}
                  <Box
                    className="m-ov"
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0,0,0,0.5)',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      display: 'flex',
                      alignItems: 'flex-end',
                      p: { xs: 1, sm: 1.5 }
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>
      )}

      {/* Visitor statistics */}
      <VisitorStats />

      {/* Media lightbox (photo / video) */}
      <PreviewModal
        open={!!preview}
        onClose={() => setPreview(null)}
        type={preview?.type === 'video' ? 'video' : 'image'}
        src={preview?.src}
        title={preview?.title}
      />
    </Box>
  )
}

export default Home
