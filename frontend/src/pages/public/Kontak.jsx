import { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  IconButton,
  Chip,
  Avatar,
  Snackbar,
  CircularProgress
} from '@mui/material'
import {
  LocationOn,
  Phone,
  Email,
  AccessTime,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Send,
  Map,
  Emergency,
  HealthAndSafety,
  People,
  Assignment,
  CheckCircle
} from '@mui/icons-material'
import GoogleReCaptcha from 'react-google-recaptcha'
import PageHeader from '../../components/ui/PageHeader'
import api from '../../utils/api'
import { announce } from '../../utils/announce'

const REQUIRE_RECAPTCHA = import.meta.env.VITE_REQUIRE_RECAPTCHA !== 'false'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSettings } from '../../contexts/SettingsContext'

const Kontak = () => {
  const { t } = useLanguage()
  const { settings } = useSettings()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [sending, setSending] = useState(false)
  const [snack, setSnack] = useState(null)
  const [recaptchaToken, setRecaptchaToken] = useState(null)

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
      await api.post('/public/kontak', {
        nama: formData.name,
        email: formData.email,
        nomorkontak: formData.phone,
        subjek: formData.subject,
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  // No hardcoded fallback: an agency without an emergency line shows no banner.
  const emergencyNum = (settings.telepon_darurat || '').trim()

  // Contact Information (from site settings, with sensible fallbacks)
  const contactInfo = {
    address: settings.alamat || '',
    phone: settings.telepon || '',
    fax: settings.fax || '',
    email: settings.email || '',
    website: settings.website || ''
  }

  // Working Hours — parsed from the "jam_operasional" setting ("Day: Hours" per
  // line). No hardcoded default: publishing one agency's schedule as another's
  // would be wrong, so an unset value shows nothing rather than a guess.
  const workingHours = (settings.jam_operasional || '')
    .split('\n').map((line) => line.trim()).filter(Boolean)
    .map((line) => {
      const i = line.indexOf(':')
      return i === -1 ? { day: line, hours: '' } : { day: line.slice(0, i).trim(), hours: line.slice(i + 1).trim() }
    })

  // Social Media — built from site settings (only platforms with a URL set)
  const socialDefs = [
    { key: 'facebook', platform: 'Facebook', icon: <Facebook />, color: '#1877F2' },
    { key: 'twitter', platform: 'Twitter', icon: <Twitter />, color: '#1DA1F2' },
    { key: 'instagram', platform: 'Instagram', icon: <Instagram />, color: '#E4405F' },
    { key: 'youtube', platform: 'YouTube', icon: <YouTube />, color: '#FF0000' }
  ]
  const handleFromUrl = (url) => {
    try {
      const seg = new URL(url).pathname.split('/').filter(Boolean).pop()
      return seg ? '@' + seg : ''
    } catch { return '' }
  }
  const socialMedia = socialDefs
    .filter((s) => settings[s.key])
    .map((s) => ({ ...s, url: settings[s.key], handle: handleFromUrl(settings[s.key]) }))

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={t('kontak.title')}
        subtitle={t('kontak.subtitle')}
        breadcrumbs={[
          { label: t('nav.beranda'), href: '/' },
          { label: t('nav.kontak') }
        ]}
        badge={{ label: t('kontak.badge24_7'), color: 'success' }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Emergency Alert — only when a number is configured */}
        {emergencyNum && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 3, md: 4 },
              borderRadius: 3
            }}
            action={
              <Button
                color="inherit"
                href={`tel:${emergencyNum}`}
                startIcon={<Emergency />}
                sx={{ fontWeight: 600 }}
              >
                {t('kontak.callEmergency', { num: emergencyNum })}
              </Button>
            }
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {t('kontak.emergencyAlert', { num: emergencyNum })}
            </Typography>
          </Alert>
        )}

        {/* Contact Information Grid */}
        <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
          {/* Main Office */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                height: '100%',
                borderRadius: 3,
                border: '2px solid',
                borderColor: 'primary.main',
                boxShadow: '0 8px 24px rgba(13, 71, 161, 0.15)'
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('kontak.mainOfficeTitle')}
              </Typography>

              {/* Office Location */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <LocationOn />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('kontak.addressLabel')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                    {contactInfo.address}
                  </Typography>
                </Box>
              </Box>

              {/* Phone */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
                  <Phone />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('kontak.phoneLabel')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {contactInfo.phone}
                  </Typography>
                </Box>
              </Box>

              {/* Fax */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Phone />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('kontak.faxLabel')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {contactInfo.fax}
                  </Typography>
                </Box>
              </Box>

              {/* Email */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                  <Email />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('kontak.emailLabel')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {contactInfo.email}
                  </Typography>
                </Box>
              </Box>

              {/* Website */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <Map />
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {t('kontak.websiteLabel')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {contactInfo.website}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Working Hours */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, height: '100%', borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('kontak.workingHoursTitle')}
              </Typography>

              {workingHours.length > 0 ? (
                <List sx={{ py: 0 }}>
                  {workingHours.map((schedule, index) => (
                    <ListItem
                      key={index}
                      divider={index < workingHours.length - 1}
                      sx={{ px: 0 }}
                    >
                      <ListItemIcon>
                        <AccessTime sx={{ color: 'primary.main' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={schedule.day}
                        secondary={schedule.hours}
                        slotProps={{ primary: { fontWeight: 600 }, secondary: { color: 'text.secondary' } }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('kontak.workingHoursUnset')}
                </Typography>
              )}

              {emergencyNum && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      fontSize: 20
                    }
                  }}
                >
                  <Typography variant="caption">
                    {t('kontak.workingHoursNote', { num: emergencyNum })}
                  </Typography>
                </Alert>
              )}
            </Paper>
          </Grid>
        </Grid>

        {/* Contact Form and Map */}
        <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
          {/* Contact Form */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('kontak.formTitle')}
              </Typography>

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label={t('kontak.formNameLabel')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label={t('kontak.emailLabel')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label={t('kontak.formSubjectLabel')}
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label={t('kontak.formMessageLabel')}
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder={t('kontak.formMessagePlaceholder')}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />

                  {REQUIRE_RECAPTCHA && (
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <GoogleReCaptcha
                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                        onChange={(tok) => setRecaptchaToken(tok)}
                        onExpired={() => setRecaptchaToken(null)}
                        hl="id"
                      />
                    </Box>
                  )}

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={sending}
                    endIcon={sending ? <CircularProgress size={18} color="inherit" /> : <Send />}
                    sx={{ fontWeight: 600, py: 1.5 }}
                  >
                    {t('kontak.formSubmit')}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Grid>

          {/* Map Placeholder */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('kontak.locationTitle')}
              </Typography>

              {/* Map — embedded if configured, otherwise a placeholder with a maps link */}
              <Box
                sx={{
                  flexGrow: 1,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 300,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {settings.map_embed ? (
                  <Box
                    component="iframe"
                    src={settings.map_embed}
                    title={t('kontak.locationTitle')}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    sx={{ border: 0, width: '100%', height: '100%', minHeight: 300, display: 'block' }}
                  />
                ) : (
                  <Box sx={{ textAlign: 'center', p: 3 }}>
                    <Map sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                      {t('kontak.mapPlaceholder')}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<LocationOn />}
                      href={settings.maps_link || 'https://maps.google.com'}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ fontWeight: 600 }}
                    >
                      {t('kontak.openInGoogleMaps')}
                    </Button>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Social Media */}
        {socialMedia.length > 0 && (<>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {t('kontak.socialMediaTitle')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
          {socialMedia.map((social, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: social.color
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: { xs: 56, sm: 64 },
                      height: { xs: 56, sm: 64 },
                      bgcolor: social.color,
                      color: 'white',
                      margin: '0 auto',
                      mb: 2
                    }}
                  >
                    {social.icon}
                  </Avatar>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {social.platform}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    {social.handle}
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ fontWeight: 600, borderColor: social.color, color: social.color }}
                  >
                    {t('kontak.follow')}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        </>)}

      </Container>

      <Snackbar
        open={Boolean(snack)}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snack ? <Alert severity={snack.type} variant="filled" onClose={() => setSnack(null)}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}

export default Kontak