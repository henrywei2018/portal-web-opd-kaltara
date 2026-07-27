import { Dialog, Box, Typography, IconButton, Button } from '@mui/material'
import { Close, Download, OpenInNew } from '@mui/icons-material'

// Normalize a YouTube URL (watch / youtu.be / embed) to an embeddable form
export const toEmbed = (url) => {
  if (!url) return ''
  if (url.includes('/embed/')) return url
  const m = url.match(/(?:youtu\.be\/|[?&]v=)([\w-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : url
}

const PreviewModal = ({ open, onClose, type, src, title, downloadUrl }) => {
  const isImage = type === 'image'
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      slotProps={{ paper: { sx: { bgcolor: isImage ? 'rgba(15,23,42,0.96)' : 'background.paper', borderRadius: 2, overflow: 'hidden' } } }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.25, color: isImage ? 'white' : 'text.primary', borderBottom: isImage ? 'none' : '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ flexGrow: 1, fontWeight: 600, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title || 'Pratinjau'}
        </Typography>
        {downloadUrl && (
          <Button component="a" href={downloadUrl} target="_blank" rel="noopener noreferrer" size="small" startIcon={<Download />} sx={{ color: 'inherit', textTransform: 'none' }}>
            Unduh
          </Button>
        )}
        {src && !isImage && type !== 'video' && (
          <IconButton component="a" href={src} target="_blank" rel="noopener noreferrer" aria-label="Buka di tab baru" size="small" sx={{ color: 'inherit' }}><OpenInNew fontSize="small" /></IconButton>
        )}
        <IconButton onClick={onClose} aria-label="Tutup pratinjau" size="small" sx={{ color: 'inherit' }}><Close /></IconButton>
      </Box>

      {/* Content */}
      {isImage && (
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
          <Box component="img" src={src} alt={title} sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 1 }} />
        </Box>
      )}
      {type === 'pdf' && (
        <Box component="iframe" src={src} title={title} sx={{ width: '100%', height: '82vh', border: 0, display: 'block' }} />
      )}
      {type === 'video' && (
        <Box sx={{ width: '100%', aspectRatio: '16/9', bgcolor: '#000' }}>
          <Box
            component="iframe"
            src={toEmbed(src)}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            sx={{ width: '100%', height: '100%', border: 0, display: 'block' }}
          />
        </Box>
      )}
    </Dialog>
  )
}

export default PreviewModal
