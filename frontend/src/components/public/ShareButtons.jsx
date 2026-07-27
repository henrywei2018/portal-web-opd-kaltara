import { useState } from 'react'
import { IconButton, Tooltip, Snackbar, Alert } from '@mui/material'
import { Facebook, Twitter, WhatsApp, Telegram, LinkedIn, ContentCopy, Share as ShareIcon } from '@mui/icons-material'

/**
 * Reusable social-share buttons. Opens each platform's share dialog with the
 * current page URL (works with the slug URLs + server-side OG, so link previews
 * render correctly). Also offers "copy link" and, where supported (mobile), the
 * native share sheet. Renders as a fragment of IconButtons so it slots into an
 * existing flex row.
 *
 * Props:
 *  - url:   URL to share (default: current page)
 *  - title: text used by Twitter/WhatsApp/Telegram/native share
 *  - size:  IconButton size ('small' | 'medium')
 *  - showCopy / showNative: toggle the copy + native-share buttons
 */
const ShareButtons = ({ url, title = '', size = 'small', showCopy = true, showNative = true }) => {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
  const enc = encodeURIComponent

  const targets = [
    { key: 'facebook', label: 'Facebook', icon: <Facebook />, color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` },
    { key: 'twitter', label: 'X (Twitter)', icon: <Twitter />, color: '#1DA1F2', href: `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(title)}` },
    { key: 'whatsapp', label: 'WhatsApp', icon: <WhatsApp />, color: '#25D366', href: `https://api.whatsapp.com/send?text=${enc(title ? `${title} ${shareUrl}` : shareUrl)}` },
    { key: 'telegram', label: 'Telegram', icon: <Telegram />, color: '#229ED9', href: `https://t.me/share/url?url=${enc(shareUrl)}&text=${enc(title)}` },
    { key: 'linkedin', label: 'LinkedIn', icon: <LinkedIn />, color: '#0077B5', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` }
  ]

  const openShare = (href) => window.open(href, '_blank', 'width=600,height=460,noopener,noreferrer')

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
    } catch { /* clipboard blocked — ignore */ }
  }

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url: shareUrl })
    } catch { /* user cancelled — ignore */ }
  }

  const canNative = showNative && typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  return (
    <>
      {targets.map((s) => (
        <Tooltip key={s.key} title={`Bagikan ke ${s.label}`}>
          <IconButton aria-label={`Bagikan ke ${s.label}`} onClick={() => openShare(s.href)} size={size} sx={{ color: s.color }}>
            {s.icon}
          </IconButton>
        </Tooltip>
      ))}
      {showCopy && (
        <Tooltip title="Salin tautan">
          <IconButton aria-label="Salin tautan" onClick={copyLink} size={size} sx={{ color: 'text.secondary' }}>
            <ContentCopy />
          </IconButton>
        </Tooltip>
      )}
      {canNative && (
        <Tooltip title="Bagikan…">
          <IconButton aria-label="Bagikan lainnya" onClick={nativeShare} size={size} sx={{ color: 'text.secondary' }}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      )}
      <Snackbar
        open={copied}
        autoHideDuration={2500}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopied(false)}>Tautan disalin</Alert>
      </Snackbar>
    </>
  )
}

export default ShareButtons
