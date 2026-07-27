import { useState, useEffect } from 'react'
import { gambarUrl } from '../../utils/assetUrl'
import { Box, Container, Typography, Button, Chip, IconButton, Paper } from '@mui/material'
import { ChevronLeft, ChevronRight, ArrowForward } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate } from '../../utils/formatters'

const NewsCarousel = ({ news = [], autoSlideDuration = 7000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (news.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length)
    }, autoSlideDuration)

    return () => clearInterval(interval)
  }, [news.length, autoSlideDuration])

  if (news.length === 0) {
    return null
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % news.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + news.length) % news.length)
  }

  const handleDotClick = (index) => {
    setCurrentIndex(index)
  }

  const currentNews = news[currentIndex]

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      {/* Carousel */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: { xs: '16/9', md: '16/9' },
          minHeight: { xs: '300px', md: '400px' },
          maxHeight: { xs: '350px', md: '450px' },
          overflow: 'hidden',
          borderRadius: 3
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%'
            }}
          >
            {/* Image */}
            <Box
              component="img"
              src={currentNews.gambar ? gambarUrl(currentNews.gambar) : '/placeholder-news.jpg'}
              alt={currentNews.judul}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />

            {/* Gradient Overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0) 75%)',
                color: 'white',
                p: { xs: 3, md: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                gap: 2
              }}
            >
              {/* Date Badge */}
              <Chip
                label={formatDate(currentNews.tanggal_post)}
                size="small"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  height: 24,
                  alignSelf: 'flex-start',
                  borderRadius: '12px',
                  px: 2
                }}
              />

              {/* Category */}
              {currentNews.kategori && (
                <Chip
                  label={currentNews.kategori.nmkat}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.7rem',
                    height: 20,
                    alignSelf: 'flex-start',
                    borderRadius: '10px',
                    px: 1.5
                  }}
                />
              )}

              {/* Title */}
              <Typography
                component={Link}
                to={`/berita/${currentNews.slug || currentNews.id_berita}`}
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' },
                  lineHeight: 1.3,
                  color: 'white',
                  textDecoration: 'none',
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, md: 3 },
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  '&:hover': {
                    color: 'primary.light'
                  }
                }}
              >
                {currentNews.judul}
              </Typography>

              {/* Excerpt */}
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' },
                  lineHeight: 1.5,
                  display: '-webkit-box',
                  WebkitLineClamp: { xs: 2, md: 3 },
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {currentNews.isi?.replace(/<[^>]*>/g, '').substring(0, 120)}
                {currentNews.isi?.replace(/<[^>]*>/g, '').length > 120 && '...'}
              </Typography>
            </Box>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <Box
          sx={{
            position: 'absolute',
            bottom: { xs: 12, md: 16 },
            left: { xs: 12, md: 16 },
            right: { xs: 12, md: 16 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            zIndex: 2
          }}
        >
          <IconButton
            aria-label="Sebelumnya"
            onClick={handlePrev}
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'primary.main',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s'
            }}
          >
            <ChevronLeft />
          </IconButton>

          {/* Dots Indicator */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            {news.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={{
                  width: currentIndex === index ? 24 : 8,
                  height: 8,
                  bgcolor: currentIndex === index ? 'primary.main' : 'rgba(255,255,255,0.5)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              />
            ))}
          </Box>

          <IconButton
            aria-label="Berikutnya"
            onClick={handleNext}
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              bgcolor: 'rgba(255,255,255,0.15)',
              color: 'white',
              backdropFilter: 'blur(4px)',
              '&:hover': {
                bgcolor: 'primary.main',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s'
            }}
          >
            <ChevronRight />
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default NewsCarousel
