import { Card, CardContent, CardActions, Typography, Box, IconButton } from '@mui/material'
import { Link } from 'react-router-dom'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const ServiceCard = ({ icon, title, description, link, color = 'primary' }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.3s ease-in-out',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
          borderColor: `${color}.main`
        }
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Icon */}
        <Box
          sx={{
            width: 56,
            height: 56,
            bgcolor: `${color}.light`,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: `${color}.main`,
            fontSize: '2rem'
          }}
        >
          {icon}
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            color: 'text.primary'
          }}
        >
          {title}
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            lineHeight: 1.6
          }}
        >
          {description}
        </Typography>
      </CardContent>

      {/* Action */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Box
          component={Link}
          to={link}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: `${color}.main`,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.875rem',
            '&:hover': {
              gap: 1.5
            }
          }}
        >
          Selengkapnya
          <ArrowForwardIcon sx={{ fontSize: '1.2rem' }} />
        </Box>
      </CardActions>
    </Card>
  )
}

export default ServiceCard