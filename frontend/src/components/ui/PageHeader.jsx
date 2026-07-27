import { Box, Typography, Breadcrumbs, Link, Chip } from '@mui/material'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import { useSeo } from '../../utils/seo'

const PageHeader = ({ title, subtitle, breadcrumbs, badge }) => {
  // Give every page that renders a PageHeader a unique document title + description.
  // Detail pages (berita/artikel) call useSeo themselves with richer data; because
  // their effect runs after this child's, their values win.
  useSeo({ title, description: subtitle })

  return (
    <Box
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: { xs: 4, md: 6 },
        mb: 4
      }}
    >
      <Box sx={{ maxWidth: 'lg', mx: 'auto', px: { xs: 2, sm: 3 } }}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            sx={{ mb: 2, '& .MuiBreadcrumbs-separator': { color: 'rgba(255,255,255,0.7)' } }}
          >
            {breadcrumbs.map((crumb, index) => (
              <Link
                key={index}
                component={crumb.href ? 'a' : 'span'}
                href={crumb.href}
                underline="hover"
                sx={{
                  color: index === breadcrumbs.length - 1 ? 'white' : 'rgba(255,255,255,0.7)',
                  fontWeight: index === breadcrumbs.length - 1 ? 600 : 400,
                  textDecoration: 'none',
                  pointerEvents: index === breadcrumbs.length - 1 ? 'none' : 'auto'
                }}
              >
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>
        )}

        {/* Title Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: subtitle ? 1 : 0,
              flex: 1,
              color: 'white'
            }}
          >
            {title}
          </Typography>

          {badge && (
            <Chip
              label={badge.label}
              sx={{
                bgcolor: badge.color || 'secondary.main',
                color: 'white',
                fontWeight: 600,
                height: 32
              }}
            />
          )}
        </Box>

        {/* Subtitle */}
        {subtitle && (
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 400,
              maxWidth: '800px'
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default PageHeader