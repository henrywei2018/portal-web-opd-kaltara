import { useState, useRef } from 'react'
import { Box, IconButton, Paper, Typography, Chip, useTheme } from '@mui/material'
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'

const ServicesCarousel = ({ services, itemsToShow = 3 }) => {
  const theme = useTheme()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState(0)
  const containerRef = useRef(null)

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % services.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + services.length) % services.length)
  }

  const getVisibleItems = () => {
    const items = []
    for (let i = 0; i < itemsToShow; i++) {
      items.push(services[(currentIndex + i) % services.length])
    }
    return items
  }

  const getColorConfig = (color) => {
    const colorMap = {
      primary: {
        main: theme.palette.primary.main,
        light: theme.palette.primary.light,
        bg: theme.palette.primary.light + '20'
      },
      secondary: {
        main: theme.palette.secondary.main,
        light: theme.palette.secondary.light,
        bg: theme.palette.secondary.light + '20'
      },
      info: {
        main: '#2196F3',
        light: '#64B5F6',
        bg: '#E3F2FD'
      },
      success: {
        main: theme.palette.success.main,
        light: theme.palette.success.light,
        bg: '#E8F5E9'
      },
      warning: {
        main: theme.palette.warning.main,
        light: theme.palette.warning.light,
        bg: '#FFF3E0'
      },
      error: {
        main: theme.palette.error.main,
        light: theme.palette.error.light,
        bg: '#FFEBEE'
      }
    }
    return colorMap[color] || colorMap.primary
  }

  // Touch/Drag handlers
  const handleDragStart = (clientX) => {
    setIsDragging(true)
    setDragStart(clientX)
  }

  const handleDragMove = (clientX) => {
    if (!isDragging) return
  }

  const handleDragEnd = (clientX) => {
    if (!isDragging) return
    setIsDragging(false)

    const diff = clientX - dragStart
    // Reduced threshold for easier swipe
    if (Math.abs(diff) > 30) {
      if (diff > 0) {
        handlePrev()
      } else {
        handleNext()
      }
    }
  }

  // Auto-play functionality
  let autoSlideInterval = null
  const startAutoSlide = () => {
    if (autoSlideInterval) clearInterval(autoSlideInterval)
    autoSlideInterval = setInterval(() => {
      if (!isDragging) {
        handleNext()
      }
    }, 5000)
  }

  useState(() => {
    startAutoSlide()
    return () => {
      if (autoSlideInterval) clearInterval(autoSlideInterval)
    }
  }, [currentIndex, isDragging])

  return (
    <Box sx={{ position: 'relative', py: { xs: 3, md: 4 } }}>
      {/* Carousel Container with drag support */}
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          userSelect: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none'
        }}
      >
        {/* Cards Container */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 2, md: 3 },
            minHeight: { xs: 400, md: 440, lg: 460 },
            px: { xs: 2, md: 4 },
            overflow: 'visible'
          }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {getVisibleItems().map((service, index) => {
              const isActive = index === Math.floor(itemsToShow / 2)
              const colors = getColorConfig(service.color)
              const actualIndex = (currentIndex + index) % services.length

              return (
                <motion.div
                  key={`${actualIndex}-${service.title}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.05 : 1,
                    y: 0
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  style={{
                    flex: isActive ? '1.3' : '1',
                    minWidth: isActive ? '340px' : '280px',
                    maxWidth: isActive ? '400px' : '340px',
                    zIndex: isActive ? 2 : 1
                  }}
                  drag
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.1}
                  onDragStart={(e, info) => handleDragStart(info.point.x)}
                  onDragEnd={(e, info) => handleDragEnd(info.point.x)}
                >
                  <Paper
                    component="a"
                    href={service.link}
                    sx={{
                      p: { xs: 2.5, sm: 3, md: 3.5 },
                      borderRadius: 3,
                      height: '100%',
                      minHeight: { xs: '340px', md: '380px', lg: '400px' },
                      maxHeight: { xs: '380px', md: '420px', lg: '440px' },
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      border: 'none',
                      position: 'relative',
                      overflow: 'visible',
                      textDecoration: 'none',
                      bgcolor: isActive ? colors.bg + '40' : 'background.paper',
                      boxShadow: isActive
                        ? `0 12px 40px ${colors.main}30`
                        : theme.shadows[3],
                      transform: isActive ? 'translateY(-12px)' : 'translateY(0)',
                      '&:hover': {
                        bgcolor: colors.bg,
                        boxShadow: `0 16px 48px ${colors.main}40`,
                        transform: isActive ? 'translateY(-16px)' : 'translateY(-8px)',
                        '& .service-icon': {
                          transform: 'scale(1.15) rotate(5deg)',
                          bgcolor: colors.main,
                          color: 'white'
                        }
                      }
                    }}
                  >
                    {/* Badge */}
                    {service.badge && (
                      <Chip
                        label={service.badge}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: { xs: 14, sm: 18 },
                          right: { xs: 14, sm: 18 },
                          bgcolor: colors.main,
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          height: 26,
                          borderRadius: '13px',
                          zIndex: 1
                        }}
                      />
                    )}

                    {/* Icon */}
                    <Box
                      className="service-icon"
                      sx={{
                        width: { xs: 64, sm: 72, md: 80 },
                        height: { xs: 64, sm: 72, md: 80 },
                        bgcolor: isActive ? colors.main : colors.bg,
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 3,
                        color: isActive ? 'white' : colors.main,
                        transition: 'all 0.3s ease',
                        fontSize: { xs: 32, sm: 36, md: 40 },
                        alignSelf: 'center',
                        mt: 1
                      }}
                    >
                      {service.icon}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        color: 'text.primary',
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        textAlign: 'center',
                        px: 1
                      }}
                    >
                      {service.title}
                    </Typography>

                    {/* Description */}
                    <Box sx={{ flexGrow: 1, px: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          lineHeight: 1.6,
                          textAlign: 'center',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 3, md: 4 },
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: { xs: '0.85rem', md: '0.9rem' }
                        }}
                      >
                        {service.description}
                      </Typography>
                    </Box>

                    {/* Link Indicator */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 0.5,
                        color: colors.main,
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mt: 2,
                        mb: 1
                      }}
                    >
                      <Typography component="span" variant="body2" fontWeight={600}>
                        Selengkapnya
                      </Typography>
                      <Box component="span" sx={{ fontSize: '1.2rem' }}>→</Box>
                    </Box>
                  </Paper>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </Box>
      </Box>

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 1.5, md: 2 },
          mt: { xs: 3, md: 4 },
          px: 2
        }}
      >
        <IconButton
          onClick={handlePrev}
          disabled={isDragging}
          sx={{
            width: { xs: 44, md: 48 },
            height: { xs: 44, md: 48 },
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)'
            },
            '&:disabled': {
              bgcolor: 'action.disabled',
              color: 'text.disabled',
              opacity: 0.5
            },
            transition: 'all 0.2s'
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>

        {/* Dots Indicator */}
        <Box sx={{ display: 'flex', gap: { xs: 0.75, md: 1 } }}>
          {services.map((_, index) => (
            <Box
              key={index}
              onClick={() => !isDragging && setCurrentIndex(index)}
              sx={{
                width: currentIndex === index ? { xs: 28, md: 32 } : { xs: 8, md: 10 },
                height: { xs: 8, md: 10 },
                bgcolor: currentIndex === index ? 'primary.main' : 'primary.light',
                borderRadius: currentIndex === index ? '4px' : '5px',
                cursor: isDragging ? 'default' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </Box>

        <IconButton
          onClick={handleNext}
          disabled={isDragging}
          sx={{
            width: { xs: 44, md: 48 },
            height: { xs: 44, md: 48 },
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
              transform: 'scale(1.1)'
            },
            '&:disabled': {
              bgcolor: 'action.disabled',
              color: 'text.disabled',
              opacity: 0.5
            },
            transition: 'all 0.2s'
          }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>

      {/* Instructions */}
      <Box sx={{ textAlign: 'center', mt: { xs: 2, md: 3 }, px: 2 }}>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: { xs: '0.75rem', md: '0.8rem' }
          }}
        >
          Geser card dengan drag/swipe atau gunakan navigasi • Auto-slide setiap 5 detik
        </Typography>
      </Box>
    </Box>
  )
}

export default ServicesCarousel
