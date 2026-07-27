import { Box, Typography, Divider, Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { ArrowForward } from '@mui/icons-material'

// Left-aligned section header: title + short underline (matches the News section).
// Optional small "see all" link aligned to the right of the title.
const SectionTitle = ({ title, actionText, actionLink }) => (
  <Box sx={{ mb: { xs: 3, md: 4 } }}>
    <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, mb: 1 }}>
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' }, color: 'text.primary' }}
      >
        {title}
      </Typography>
      {actionText && actionLink && (
        <Button
          component={Link}
          to={actionLink}
          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
        >
          {actionText}
        </Button>
      )}
    </Box>
    <Divider sx={{ borderColor: 'primary.main', borderWidth: 2, width: 80 }} />
  </Box>
)

export default SectionTitle
