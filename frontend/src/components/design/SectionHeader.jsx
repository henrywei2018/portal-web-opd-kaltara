import { Box, Typography, Button, Stack, useTheme, useMediaQuery } from '@mui/material'
import { ArrowForward } from '@mui/icons-material'

const SectionHeader = ({
  title,
  subtitle,
  buttonText,
  buttonLink,
  alignment = 'left',
  showButton = true,
  withBadge = false,
  badgeText
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const textAlign = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end'
  }

  const getAlignment = () => {
    if (isMobile) return 'flex-start'
    return textAlign[alignment] || textAlign.left
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: alignment === 'center' ? 'center' : 'flex-start',
        gap: { xs: 2, md: 0 },
        mb: { xs: 4, md: 5 },
        textAlign: isMobile ? 'left' : alignment
      }}
    >
      <Box sx={{ flex: 1, alignItems: getAlignment(), display: 'flex', flexDirection: 'column' }}>
        {withBadge && badgeText && (
          <Box
            sx={{
              display: 'inline-block',
              px: 2,
              py: 0.75,
              mb: 2,
              bgcolor: theme.palette.primary.light,
              color: 'white',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 1
            }}
          >
            {badgeText}
          </Box>
        )}

        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: subtitle ? 1.5 : 0,
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: alignment === 'center' ? '700px' : '500px',
              fontSize: { xs: '0.95rem', md: '1rem' },
              lineHeight: 1.7
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {showButton && buttonText && (
        <Button
          variant="outlined"
          endIcon={<ArrowForward />}
          href={buttonLink}
          sx={{
            alignSelf: { xs: isMobile ? 'flex-start' : 'center', md: 'auto' },
            borderRadius: 2,
            px: 3,
            py: 1.25,
            fontWeight: 600,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }
          }}
        >
          {buttonText}
        </Button>
      )}
    </Box>
  )
}

export default SectionHeader
