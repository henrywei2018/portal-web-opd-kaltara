import { Link } from 'react-router-dom'
import { gambarUrl } from '../../utils/assetUrl'
import { Box, Card, CardContent, CardMedia, Typography, Chip, Avatar, CardActions, Button, useTheme } from '@mui/material'
import { CalendarToday, Person } from '@mui/icons-material'
import { formatDate } from '../../utils/formatters'

const NewsCard = ({
  id,
  slug,
  title,
  excerpt,
  image,
  category,
  author,
  date,
  readTime = null,
  variant = 'default'
}) => {
  const theme = useTheme()

  const isCompact = variant === 'compact'

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
        boxShadow: theme.shadows[2],
        bgcolor: 'background.paper',
        '&:hover': {
          transform: isCompact ? 'translateX(8px)' : 'translateY(-8px)',
          boxShadow: theme.shadows[6],
          '& .news-image': {
            transform: 'scale(1.05)'
          }
        }
      }}
    >
      {/* Image */}
      {image && (
        <Box
          sx={{
            position: 'relative',
            paddingTop: isCompact ? '40%' : '56.25%',
            overflow: 'hidden',
            bgcolor: 'grey.100'
          }}
        >
          <CardMedia
            className="news-image"
            component="img"
            image={gambarUrl(image)}
            alt={title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease'
            }}
          />
          {/* Category Badge Overlay */}
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: 'rgba(0, 102, 204, 0.9)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 26,
                backdropFilter: 'blur(4px)',
                '&:hover': {
                  bgcolor: 'rgba(0, 102, 204, 1)'
                }
              }}
            />
          )}
        </Box>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: { xs: 2, sm: 2.5 }
        }}
      >
        {/* Meta Info */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
            flexWrap: 'wrap',
            fontSize: '0.8rem'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 24,
                height: 24,
                bgcolor: theme.palette.primary.light,
                fontSize: '0.7rem',
                fontWeight: 600
              }}
            >
              {author?.charAt(0) || 'A'}
            </Avatar>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {author || 'Admin'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarToday sx={{ fontSize: '0.9rem', color: 'text.secondary' }} />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatDate(date)}
            </Typography>
          </Box>
          {readTime && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              · {readTime} min baca
            </Typography>
          )}
        </Box>

        {/* Title */}
        <Typography
          variant={isCompact ? 'h6' : 'h6'}
          sx={{
            fontWeight: 600,
            mb: 1.5,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: isCompact ? 2 : 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            color: 'text.primary',
            fontSize: isCompact ? { xs: '1rem', sm: '1.1rem' } : { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          {title}
        </Typography>

        {/* Excerpt */}
        {excerpt && !isCompact && (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mb: 2,
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              flexGrow: 1
            }}
          >
            {excerpt}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ px: { xs: 2, sm: 2.5 }, pb: { xs: 2, sm: 2.5 }, pt: 0 }}>
        <Button
          size="small"
          component={Link}
          to={`/berita/${slug || id}`}
          sx={{
            fontWeight: 600,
            px: 2,
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'primary.light',
              color: 'primary.contrastText'
            }
          }}
        >
          Baca Selengkapnya →
        </Button>
      </CardActions>
    </Card>
  )
}

export default NewsCard
