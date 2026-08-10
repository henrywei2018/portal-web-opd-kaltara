import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Fade,
  Link
} from '@mui/material'
import {
  Cookie as CookieIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { useLanguage } from '../../contexts/LanguageContext'

const CookieConsent = () => {
  const { t } = useLanguage()
  const [isVisible, setIsVisible] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) {
      setIsVisible(true)
    } else {
      setIsAccepted(true)
    }
  }, [])

  // Third-party embeds (e.g. the hero's YouTube background) hold off until
  // consent is given, so they need to hear about the decision without a reload.
  const announceConsent = () => window.dispatchEvent(new Event('cookie-consent-changed'))

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setIsAccepted(true)
    setIsVisible(false)
    announceConsent()
  }

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setIsVisible(false)
    announceConsent()
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  // Cookie banner is only relevant on the public site, not the admin panel / login
  const hideOnRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')

  if (hideOnRoute || !isVisible || isAccepted) {
    return null
  }

  return (
    <Fade in={isVisible}>
      <Paper
        elevation={8}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          borderRadius: 0,
          bgcolor: 'rgba(13, 71, 161, 0.98)',
          color: 'white',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.15)'
        }}
      >
        <Box
          sx={{
            maxWidth: 'lg',
            mx: 'auto',
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 2, sm: 2.5, md: 3 }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            {/* Icon */}
            <CookieIcon
              sx={{
                fontSize: { xs: 32, sm: 40 },
                color: 'warning.main',
                flexShrink: 0
              }}
            />

            {/* Content */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: '1rem', sm: '1.125rem' },
                  fontWeight: 600,
                  mb: 0.5
                }}
              >
                {t('cookie.title')}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  opacity: 0.9,
                  lineHeight: 1.5
                }}
              >
                {t('cookie.body1')}{' '}
                <Link
                  href="/"
                  sx={{
                    color: 'warning.main',
                    textDecoration: 'underline',
                    fontWeight: 600
                  }}
                >
                  {t('footer.terms')}
                </Link>
                {' '}{t('cookie.and')}{' '}
                <Link
                  href="/"
                  sx={{
                    color: 'warning.main',
                    textDecoration: 'underline',
                    fontWeight: 600
                  }}
                >
                  {t('footer.privacy')}
                </Link>
                {' '}{t('cookie.body2')}
              </Typography>
            </Box>

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, flexShrink: 0, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                variant="contained"
                color="warning"
                size="small"
                onClick={handleAccept}
                sx={{
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                {t('cookie.accept')}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleDecline}
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  fontWeight: 600,
                  px: { xs: 2, sm: 3 },
                  py: 1,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                {t('cookie.decline')}
              </Button>
              <IconButton
                size="small"
                aria-label="Tutup"
                onClick={handleClose}
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  '&:hover': {
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Fade>
  )
}

export default CookieConsent