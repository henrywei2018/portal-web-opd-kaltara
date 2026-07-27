import { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { AnimatePresence, motion } from 'framer-motion'
import { gambarUrl } from '../../utils/assetUrl'

// A lightweight image carousel for the berita/artikel photo gallery.
// `images` is an array of stored filenames (resolved via gambarUrl).
const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -120 : 120, opacity: 0 })
}

const ImageGalleryCarousel = ({ images = [], alt = 'Gambar' }) => {
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(0)

  if (!images.length) return null
  const count = images.length

  const paginate = (step) => {
    setDir(step)
    setIndex((prev) => (prev + step + count) % count)
  }

  const goTo = (i) => {
    setDir(i > index ? 1 : -1)
    setIndex(i)
  }

  return (
    <Box>
      {/* Main stage */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 260, sm: 340, md: 440 },
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'grey.900',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={index}
            src={gambarUrl(images[index])}
            alt={`${alt} ${index + 1}`}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </AnimatePresence>

        {count > 1 && (
          <>
            {/* Counter */}
            <Box
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                px: 1.5,
                py: 0.25,
                borderRadius: '12px',
                bgcolor: 'rgba(0,0,0,0.55)',
                color: 'white',
                fontSize: '0.8rem',
                fontWeight: 600,
                zIndex: 2
              }}
            >
              {index + 1} / {count}
            </Box>

            {/* Prev / Next */}
            <IconButton
              aria-label="Gambar sebelumnya"
              onClick={() => paginate(-1)}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.85)',
                color: 'grey.900',
                zIndex: 2,
                '&:hover': { bgcolor: 'white' }
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              aria-label="Gambar berikutnya"
              onClick={() => paginate(1)}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                bgcolor: 'rgba(255,255,255,0.85)',
                color: 'grey.900',
                zIndex: 2,
                '&:hover': { bgcolor: 'white' }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}
      </Box>

      {/* Thumbnails */}
      {count > 1 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            mt: 1.5,
            overflowX: 'auto',
            pb: 0.5,
            '&::-webkit-scrollbar': { height: 6 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'action.disabled', borderRadius: 3 }
          }}
        >
          {images.map((img, i) => (
            <Box
              key={i}
              component="img"
              src={gambarUrl(img)}
              alt={`${alt} thumbnail ${i + 1}`}
              onClick={() => goTo(i)}
              sx={{
                width: 72,
                height: 54,
                flexShrink: 0,
                objectFit: 'cover',
                borderRadius: 1,
                cursor: 'pointer',
                opacity: i === index ? 1 : 0.55,
                border: '2px solid',
                borderColor: i === index ? 'primary.main' : 'transparent',
                transition: 'opacity 0.2s, border-color 0.2s',
                '&:hover': { opacity: 1 }
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default ImageGalleryCarousel
