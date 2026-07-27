import { Link } from 'react-router-dom'
import { Box, Paper, Typography, Chip, useTheme } from '@mui/material'

const ServiceCard = ({
  icon,
  title,
  description,
  link,
  color = 'primary',
  badge = null,
  delay = 0
}) => {
  const theme = useTheme()

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

  const colors = colorMap[color] || colorMap.primary

  return (
    <Box
      component={Link}
      to={link}
      sx={{
        textDecoration: 'none',
        display: 'block',
        height: '100%'
      }}
    >
      <Paper
        sx={{
          p: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          height: '100%',
          transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
          border: '1px solid',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            bgcolor: colors.main,
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            transition: 'transform 0.3s ease'
          },
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: theme.shadows[8],
            borderColor: colors.main,
            '&::before': {
              transform: 'scaleX(1)'
            },
            '& .service-icon': {
              transform: 'scale(1.1) rotate(5deg)',
              bgcolor: colors.light
            },
            '& .service-arrow': {
              transform: 'translateX(4px)',
              color: colors.main
            }
          }
        }}
      >
        {/* Badge */}
        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              position: 'absolute',
              top: { xs: 14, sm: 18 },
              right: { xs: 14, sm: 18 },
              bgcolor: colors.main,
              color: 'white',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              borderRadius: '12px'
            }}
          />
        )}

        {/* Icon */}
        <Box
          className="service-icon"
          sx={{
            width: { xs: 56, sm: 64 },
            height: { xs: 56, sm: 64 },
            bgcolor: colors.bg,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
            color: colors.main,
            transition: 'all 0.3s ease',
            fontSize: { xs: 28, sm: 32 }
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            color: 'text.primary',
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 2.5,
            lineHeight: 1.6,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: { xs: '0.875rem', md: '0.95rem' }
          }}
        >
          {description}
        </Typography>

        {/* Link Text with Arrow */}
        <Box
          className="service-arrow"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            color: colors.main,
            fontWeight: 600,
            fontSize: '0.875rem',
            transition: 'all 0.2s ease'
          }}
        >
          <Typography component="span" variant="body2" fontWeight={600}>
            Selengkapnya
          </Typography>
          <Box component="span" sx={{ fontSize: '1.2rem' }}>→</Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default ServiceCard
