import { useState, useEffect } from 'react'
import {
  Box, Container, Typography, Button, Grid, Paper, Stack,
  Card, CardContent, TextField, List, ListItem, ListItemText, ListItemIcon,
  Alert, Avatar, Snackbar, CircularProgress
} from '@mui/material'
import {
  ArrowForward, LocationOn, Phone, Email, AccessTime,
  Facebook, Twitter, Instagram, YouTube, Send, Map, Emergency
} from '@mui/icons-material'
import { Link } from 'react-router-dom'
import GoogleReCaptcha from 'react-google-recaptcha'
import api from '../../utils/api'
import DocumentList from './DocumentList'
import PageHeader from '../ui/PageHeader'
import { announce } from '../../utils/announce'
import { htmlAman } from '../../utils/htmlAman'

const REQUIRE_RECAPTCHA = import.meta.env.VITE_REQUIRE_RECAPTCHA !== 'false'

// Derive the API origin (without the /api suffix) for serving uploaded images
const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => {
  if (!src) return ''
  if (/^https?:\/\//.test(src)) return src
  return `${API_ORIGIN}/gambar/${src}`
}

const SectionContainer = ({ children, sx }) => (
  <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, ...sx }}>
    {children}
  </Container>
)

// Build a link target from a string (internal route vs external url)
const linkProps = (link) => {
  if (!link) return {}
  if (/^https?:\/\//.test(link)) {
    return { component: 'a', href: link, target: '_blank', rel: 'noopener noreferrer' }
  }
  return { component: Link, to: link }
}

const HeroBlock = ({ data = {} }) => (
  <Box
    sx={{
      bgcolor: data.bgColor || 'primary.main',
      color: 'white',
      py: { xs: 6, md: 10 },
      textAlign: 'center'
    }}
  >
    <SectionContainer>
      {data.subtitle && (
        <Typography
          variant="overline"
          sx={{ letterSpacing: 3, opacity: 0.9, fontWeight: 500, textTransform: 'uppercase' }}
        >
          {data.subtitle}
        </Typography>
      )}
      {data.title && (
        <Typography
          variant="h1"
          sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2 }}
        >
          {data.title}
        </Typography>
      )}
      {data.description && (
        <Typography
          variant="h6"
          sx={{ opacity: 0.95, maxWidth: 720, mx: 'auto', fontWeight: 400, mb: data.ctaText ? 4 : 0 }}
        >
          {data.description}
        </Typography>
      )}
      {data.ctaText && (
        <Button
          {...linkProps(data.ctaLink || '/')}
          variant="contained"
          size="large"
          endIcon={<ArrowForward />}
          sx={{ bgcolor: 'white', color: data.bgColor || 'primary.main', fontWeight: 700, px: 4, py: 1.5 }}
        >
          {data.ctaText}
        </Button>
      )}
    </SectionContainer>
  </Box>
)

const TextBlock = ({ data = {} }) => (
  <Box sx={{ py: { xs: 4, md: 6 } }}>
    <SectionContainer>
      {data.heading && (
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
          {data.heading}
        </Typography>
      )}
      {data.html && (
        <Box
          sx={{
            color: 'text.secondary',
            lineHeight: 1.8,
            '& p': { mb: 2 },
            '& img': { maxWidth: '100%', borderRadius: 2 },
            '& a': { color: 'primary.main' }
          }}
          dangerouslySetInnerHTML={{ __html: htmlAman(data.html) }}
        />
      )}
    </SectionContainer>
  </Box>
)

const ImageBlock = ({ data = {} }) => (
  <Box sx={{ py: { xs: 3, md: 4 } }}>
    <SectionContainer>
      <Box sx={{ textAlign: 'center' }}>
        {data.src ? (
          <Box
            component="img"
            src={imageUrl(data.src)}
            alt={data.caption || ''}
            sx={{ maxWidth: '100%', borderRadius: 3, boxShadow: 2 }}
          />
        ) : (
          <Box sx={{ py: 6, bgcolor: 'background.paper', borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Belum ada gambar</Typography>
          </Box>
        )}
        {data.caption && (
          <Typography variant="caption" sx={{ display: 'block', mt: 1.5, color: 'text.secondary' }}>
            {data.caption}
          </Typography>
        )}
      </Box>
    </SectionContainer>
  </Box>
)

const GalleryBlock = ({ data = {} }) => {
  const images = data.images || []
  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <SectionContainer>
        {data.heading && (
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            {data.heading}
          </Typography>
        )}
        <Grid container spacing={2}>
          {images.map((img, idx) => (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={idx}>
              <Box
                component="img"
                src={imageUrl(img.src)}
                alt={img.caption || ''}
                sx={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: 2, boxShadow: 1 }}
              />
            </Grid>
          ))}
          {images.length === 0 && (
            <Grid size={12}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Belum ada gambar</Typography>
            </Grid>
          )}
        </Grid>
      </SectionContainer>
    </Box>
  )
}

const CardsBlock = ({ data = {} }) => {
  const items = data.items || []
  return (
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.paper' }}>
      <SectionContainer>
        {data.heading && (
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.5rem', md: '2rem' }, textAlign: 'center' }}>
            {data.heading}
          </Typography>
        )}
        <Grid container spacing={3}>
          {items.map((item, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={idx}>
              <Paper
                {...(item.link ? linkProps(item.link) : {})}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  height: '100%',
                  display: 'block',
                  textDecoration: 'none',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.25s',
                  '&:hover': item.link ? { transform: 'translateY(-4px)', boxShadow: 6 } : {}
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'text.primary' }}>
                  {item.title}
                </Typography>
                {item.description && (
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {item.description}
                  </Typography>
                )}
              </Paper>
            </Grid>
          ))}
          {items.length === 0 && (
            <Grid size={12}>
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>Belum ada kartu</Typography>
            </Grid>
          )}
        </Grid>
      </SectionContainer>
    </Box>
  )
}

const CtaBlock = ({ data = {} }) => (
  <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 6, md: 8 }, textAlign: 'center' }}>
    <SectionContainer>
      {data.title && (
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>
          {data.title}
        </Typography>
      )}
      {data.description && (
        <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4, maxWidth: 700, mx: 'auto' }}>
          {data.description}
        </Typography>
      )}
      {data.buttonText && (
        <Stack direction="row" justifyContent="center">
          <Button
            {...linkProps(data.buttonLink || '/')}
            variant="contained"
            size="large"
            endIcon={<ArrowForward />}
            sx={{ bgcolor: 'white', color: 'primary.main', fontWeight: 700, px: 4, py: 1.5 }}
          >
            {data.buttonText}
          </Button>
        </Stack>
      )}
    </SectionContainer>
  </Box>
)

const DocumentsBlock = ({ data = {} }) => {
  const [docs, setDocs] = useState([])
  useEffect(() => {
    const params = []
    if (data.kategori) params.push(`kategori=${data.kategori}`)
    if (data.limit) params.push(`limit=${data.limit}`)
    api.get(`/public/dokumen${params.length ? '?' + params.join('&') : ''}`)
      .then((r) => setDocs(Array.isArray(r.data) ? r.data : []))
      .catch(() => setDocs([]))
  }, [data.kategori, data.limit])

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <SectionContainer>
        {data.heading && (
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            {data.heading}
          </Typography>
        )}
        <DocumentList documents={docs} showCategory={!data.kategori} />
      </SectionContainer>
    </Box>
  )
}

// Raw HTML block — full-width, renders the author's markup for advanced custom
// layouts (sections, styles, iframes from allowed hosts). Scripts and event
// handlers are stripped: editors hold "halaman" too, so raw script here would
// let them take over admin sessions.
const HtmlBlock = ({ data = {} }) =>
  data.html ? (
    <Box
      className="custom-html-block"
      sx={{ '& img': { maxWidth: '100%' }, '& a': { color: 'primary.main' } }}
      dangerouslySetInnerHTML={{ __html: htmlAman(data.html) }}
    />
  ) : null

// Reusable "Kontak" template block — a self-contained contact page (header,
// emergency alert, office info, working hours, message form, map, social) whose
// data is authored per-page in the Page Builder. This lets any work unit ("unit
// kerja") have its own contact page without touching global site settings.
// A field left empty is simply hidden, so each unit shows only what it configures.
const CONTACT_ROWS = [
  { key: 'address', label: 'Alamat Kantor', icon: <LocationOn />, bg: 'primary.light', fg: 'primary.contrastText' },
  { key: 'phone', label: 'Telepon', icon: <Phone />, bg: 'success.light', fg: 'success.contrastText' },
  { key: 'fax', label: 'Fax', icon: <Phone />, bg: 'info.light', fg: 'info.contrastText' },
  { key: 'email', label: 'Email', icon: <Email />, bg: 'warning.light', fg: 'warning.contrastText' },
  { key: 'website', label: 'Website', icon: <Map />, bg: 'secondary.light', fg: 'secondary.contrastText' }
]

const SOCIAL_DEFS = [
  { key: 'facebook', platform: 'Facebook', icon: <Facebook />, color: '#1877F2' },
  { key: 'twitter', platform: 'Twitter', icon: <Twitter />, color: '#1DA1F2' },
  { key: 'instagram', platform: 'Instagram', icon: <Instagram />, color: '#E4405F' },
  { key: 'youtube', platform: 'YouTube', icon: <YouTube />, color: '#FF0000' }
]

const socialHandle = (url) => {
  try {
    const seg = new URL(url).pathname.split('/').filter(Boolean).pop()
    return seg ? '@' + seg : ''
  } catch { return '' }
}

const ContactBlock = ({ data = {} }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [snack, setSnack] = useState(null)
  const [recaptchaToken, setRecaptchaToken] = useState(null)

  const showForm = data.showForm !== false
  const emergencyNum = (data.emergencyNumber || '').trim()
  const showEmergency = data.showEmergency !== false && Boolean(emergencyNum)

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (REQUIRE_RECAPTCHA && !recaptchaToken) {
      const msg = 'Mohon selesaikan verifikasi reCAPTCHA terlebih dahulu.'
      setSnack({ type: 'error', msg })
      announce(msg, true)
      return
    }
    setSending(true)
    try {
      // Tag the subject with the unit label so admins can tell which unit a
      // message came from (they all land in the same "Pesan" inbox). Kept within
      // the backend's 255-char subject limit.
      const label = (data.unitLabel || '').trim()
      const subjek = (label ? `[${label}] ${formData.subject}` : formData.subject).slice(0, 255)
      await api.post('/public/kontak', {
        nama: formData.name,
        email: formData.email,
        nomorkontak: formData.phone,
        subjek,
        pesan: formData.message,
        recaptcha_token: recaptchaToken || ''
      })
      const okMsg = 'Pesan Anda berhasil terkirim. Terima kasih!'
      setSnack({ type: 'success', msg: okMsg })
      announce(okMsg)
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
      setRecaptchaToken(null)
    } catch (err) {
      const errs = err.response?.data?.errors
      const errMsg = errs ? Object.values(errs).flat().join(' ') : (err.response?.data?.error || err.response?.data?.message || 'Gagal mengirim pesan. Coba lagi.')
      setSnack({ type: 'error', msg: errMsg })
      announce(errMsg, true)
    } finally {
      setSending(false)
    }
  }

  const contactRows = CONTACT_ROWS.filter((r) => (data[r.key] || '').trim())
  const workingHours = Array.isArray(data.workingHours)
    ? data.workingHours.filter((h) => (h?.day || '').trim() || (h?.hours || '').trim())
    : []
  const socialMedia = SOCIAL_DEFS
    .filter((s) => (data[s.key] || '').trim())
    .map((s) => ({ ...s, url: data[s.key], handle: socialHandle(data[s.key]) }))

  const hasMap = Boolean((data.mapEmbed || '').trim() || (data.mapsLink || '').trim())
  const formColMd = showForm && hasMap ? 6 : 12

  return (
    <Box>
      <PageHeader
        title={data.title || 'Hubungi Kami'}
        subtitle={data.subtitle || ''}
        badge={data.badge ? { label: data.badge, color: 'success.main' } : undefined}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Emergency Alert */}
        {showEmergency && (
          <Alert
            severity="error"
            sx={{ mb: { xs: 3, md: 4 }, borderRadius: 3 }}
            action={
              <Button color="inherit" href={`tel:${emergencyNum}`} startIcon={<Emergency />} sx={{ fontWeight: 600 }}>
                {`Hubungi ${emergencyNum}`}
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {data.emergencyText || `Layanan Darurat 24 Jam - Hubungi ${emergencyNum} untuk keadaan gawat darurat`}
            </Typography>
          </Alert>
        )}

        {/* Office info + working hours */}
        {(contactRows.length > 0 || workingHours.length > 0) && (
          <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
            {contactRows.length > 0 && (
              <Grid size={{ xs: 12, md: workingHours.length > 0 ? 6 : 12 }}>
                <Paper
                  sx={{
                    p: { xs: 3, md: 4 }, height: '100%', borderRadius: 3,
                    border: '2px solid', borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(13, 71, 161, 0.15)'
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    {data.officeTitle || 'Kantor'}
                  </Typography>
                  {contactRows.map((row, i) => (
                    <Box key={row.key} sx={{ display: 'flex', alignItems: row.key === 'address' ? 'flex-start' : 'center', gap: 2, mb: i < contactRows.length - 1 ? 3 : 0 }}>
                      <Avatar sx={{ bgcolor: row.bg, color: row.fg }}>{row.icon}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>{row.label}</Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>{data[row.key]}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Paper>
              </Grid>
            )}

            {workingHours.length > 0 && (
              <Grid size={{ xs: 12, md: contactRows.length > 0 ? 6 : 12 }}>
                <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%', borderRadius: 3 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    {data.workingHoursTitle || 'Jam Operasional'}
                  </Typography>
                  <List sx={{ py: 0 }}>
                    {workingHours.map((schedule, index) => (
                      <ListItem key={index} divider={index < workingHours.length - 1} sx={{ px: 0 }}>
                        <ListItemIcon><AccessTime sx={{ color: 'primary.main' }} /></ListItemIcon>
                        <ListItemText
                          primary={schedule.day}
                          secondary={schedule.hours}
                          slotProps={{ primary: { fontWeight: 600 }, secondary: { color: 'text.secondary' } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                  {data.workingHoursNote && (
                    <Alert severity="info" sx={{ mt: 3, borderRadius: 2, '& .MuiAlert-icon': { fontSize: 20 } }}>
                      <Typography variant="caption">{data.workingHoursNote}</Typography>
                    </Alert>
                  )}
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Message form + map */}
        {(showForm || hasMap) && (
          <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
            {showForm && (
              <Grid size={{ xs: 12, md: formColMd }}>
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    {data.formTitle || 'Kirim Pesan'}
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                      <TextField fullWidth label="Nama Lengkap" name="name" value={formData.name} onChange={handleChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      <TextField fullWidth label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      <TextField fullWidth label="Subjek" name="subject" value={formData.subject} onChange={handleChange} required sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      <TextField fullWidth label="Pesan" name="message" multiline rows={6} value={formData.message} onChange={handleChange} required placeholder="Tulis pesan Anda di sini..." sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
                      {REQUIRE_RECAPTCHA && (
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          <GoogleReCaptcha sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY} onChange={(tok) => setRecaptchaToken(tok)} onExpired={() => setRecaptchaToken(null)} hl="id" />
                        </Box>
                      )}
                      <Button type="submit" variant="contained" size="large" disabled={sending} endIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />} sx={{ fontWeight: 600, py: 1.5 }}>
                        Kirim Pesan
                      </Button>
                    </Stack>
                  </form>
                </Paper>
              </Grid>
            )}

            {hasMap && (
              <Grid size={{ xs: 12, md: showForm ? 6 : 12 }}>
                <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    {data.mapTitle || 'Lokasi Kantor'}
                  </Typography>
                  <Box sx={{ flexGrow: 1, bgcolor: 'grey.100', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, position: 'relative', overflow: 'hidden' }}>
                    {(data.mapEmbed || '').trim() ? (
                      <Box component="iframe" src={data.mapEmbed} title={data.mapTitle || 'Lokasi Kantor'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen sx={{ border: 0, width: '100%', height: '100%', minHeight: 300, display: 'block' }} />
                    ) : (
                      <Box sx={{ textAlign: 'center', p: 3 }}>
                        <Map sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                        <Button variant="outlined" startIcon={<LocationOn />} href={data.mapsLink} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600 }}>
                          Buka di Google Maps
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        )}

        {/* Social media */}
        {socialMedia.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
              {data.socialTitle || 'Media Sosial'}
            </Typography>
            <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
              {socialMedia.map((social, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                  <Card sx={{ height: '100%', borderRadius: 3, border: '1px solid', borderColor: 'divider', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4, borderColor: social.color } }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Avatar sx={{ width: { xs: 56, sm: 64 }, height: { xs: 56, sm: 64 }, bgcolor: social.color, color: 'white', margin: '0 auto', mb: 2 }}>
                        {social.icon}
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{social.platform}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>{social.handle}</Typography>
                      <Button fullWidth variant="outlined" href={social.url} target="_blank" rel="noopener noreferrer" sx={{ fontWeight: 600, borderColor: social.color, color: social.color }}>
                        Follow
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>

      <Snackbar open={Boolean(snack)} autoHideDuration={4000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.type} variant="filled" onClose={() => setSnack(null)}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}

const BLOCKS = {
  hero: HeroBlock,
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  cards: CardsBlock,
  cta: CtaBlock,
  dokumen: DocumentsBlock,
  html: HtmlBlock,
  kontak: ContactBlock
}

const BlockRenderer = ({ blocks = [] }) => {
  return (
    <>
      {blocks.map((block, idx) => {
        const Component = BLOCKS[block.type]
        if (!Component) return null
        return <Component key={block.id || idx} data={block.data} />
      })}
    </>
  )
}

export default BlockRenderer
