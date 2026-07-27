import { Box, Paper, Typography, useTheme } from '@mui/material'

const StatCard = ({
  icon,
  value,
  label,
  color = 'primary',
  delay = 0,
  withTrend = false,
  trend = 'up',
  trendValue = ''
}) => {
  const theme = useTheme()

  const colorMap = {
    primary: {
      main: theme.palette.primary.main,
      light: theme.palette.primary.light,
      bg: theme.palette.primary.light + '15'
    },
    secondary: {
      main: theme.palette.secondary.main,
      light: theme.palette.secondary.light,
      bg: theme.palette.secondary.light + '15'
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
    <Paper
      sx={{
        p: { xs: 2.5, sm: 3, md: 3.5 },
        borderRadius: 3,
        textAlign: 'center',
        borderTop: `4px solid ${colors.main}`,
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.paper',
        boxShadow: theme.shadows[2],
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.shadows[6],
          '& .stat-icon': {
            transform: 'scale(1.1) rotate(-5deg)'
          }
        }
      }}
    >
      {/* Icon */}
      <Box
        className="stat-icon"
        sx={{
          width: { xs: 52, sm: 56, md: 64 },
          height: { xs: 52, sm: 56, md: 64 },
          bgcolor: colors.bg,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          color: colors.main,
          transition: 'all 0.3s ease'
        }}
      >
        {icon}
      </Box>

      {/* Value */}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 700,
          color: colors.main,
          mb: 0.5,
          fontSize: { xs: '2rem', sm: '2.25rem', md: '2.5rem' }
        }}
      >
        {value}
      </Typography>

      {/* Label */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: { xs: '0.85rem', sm: '0.875rem' },
          fontWeight: 500,
          mb: withTrend ? 0.5 : 0
        }}
      >
        {label}
      </Typography>

      {/* Trend Indicator */}
      {withTrend && trendValue && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1.5,
            py: 0.5,
            bgcolor: trend === 'up' ? '#E8F5E9' : '#FFEBEE',
            borderRadius: 1,
            mt: 1
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: '1rem',
              color: trend === 'up' ? '#4CAF50' : '#F44336'
            }}
          >
            {trend === 'up' ? '↑' : '↓'}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: trend === 'up' ? '#2E7D32' : '#C62828',
              fontWeight: 600
            }}
          >
            {trendValue}
          </Typography>
        </Box>
      )}
    </Paper>
  )
}

export default StatCard
