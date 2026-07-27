import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, TextField, Grid, Paper, Divider, CircularProgress, Snackbar, Alert, Stack
} from '@mui/material'
import { Save as SaveIcon, Image as ImageIcon, Public, Phone, Email, Place } from '@mui/icons-material'
import api from '../../utils/api'
import { useSettings } from '../../contexts/SettingsContext'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const FIELDS = [
  { section: 'Identitas Situs', items: [
    { key: 'site_title', label: 'Judul Situs' },
    { key: 'site_subtitle', label: 'Subjudul / Tagline' }
  ] },
  { section: 'Kontak', icon: <Phone fontSize="small" />, items: [
    { key: 'email', label: 'Email', icon: <Email fontSize="small" /> },
    { key: 'telepon', label: 'Telepon', icon: <Phone fontSize="small" /> },
    { key: 'telepon_darurat', label: 'Telepon Darurat (PSC)', help: 'Nomor pada alert darurat halaman Kontak. Default: 119.' },
    { key: 'fax', label: 'Fax' },
    { key: 'website', label: 'Website' },
    { key: 'alamat', label: 'Alamat', multiline: true }
  ] },
  { section: 'Lokasi & Jam Operasional', icon: <Place fontSize="small" />, items: [
    { key: 'jam_operasional', label: 'Jam Operasional', multiline: true, help: 'Satu baris per hari, format "Hari: Jam". Mis. "Senin - Kamis: 08.00 - 16.00 WITA".' },
    { key: 'maps_link', label: 'Link Google Maps (tombol "Buka di Google Maps")' },
    { key: 'map_embed', label: 'Embed Peta (URL src dari Google Maps → Bagikan → Sematkan peta)', multiline: true, help: 'Tempel hanya nilai src dari iframe embed Google Maps (https://www.google.com/maps/embed?...).' }
  ] },
  { section: 'Media Sosial', icon: <Public fontSize="small" />, items: [
    { key: 'facebook', label: 'Facebook (URL)' },
    { key: 'instagram', label: 'Instagram (URL)', help: 'Dipakai tombol "Ikuti" pada section Instagram di beranda.' },
    { key: 'twitter', label: 'Twitter / X (URL)' },
    { key: 'youtube', label: 'YouTube (URL)' }
  ] }
]

const SettingsPage = () => {
  const { refresh } = useSettings()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [snack, setSnack] = useState(null)

  useEffect(() => {
    api.get('/admin/settings')
      .then((r) => setForm(r.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setVal = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  // Upload an image and store it under the given setting key ('logo' or 'favicon')
  const doUpload = async (e, key) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(key)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('key', key)
      const r = await api.post('/admin/settings/upload-logo', fd)
      setForm((f) => ({ ...f, [key]: r.data.filename }))
      setSnack({ type: 'success', msg: key === 'favicon' ? 'Favicon diperbarui' : 'Logo diperbarui' })
      refresh()
    } catch (err) {
      setSnack({ type: 'error', msg: err.response?.data?.message || 'Gagal mengunggah' })
    } finally { setUploading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/settings', form)
      setSnack({ type: 'success', msg: 'Pengaturan tersimpan' })
      refresh()
    } catch (err) {
      setSnack({ type: 'error', msg: err.response?.data?.message || 'Gagal menyimpan' })
    } finally { setSaving(false) }
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Pengaturan Situs</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Logo, judul situs, kontak, dan media sosial</Typography>
        </Box>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={saving}>
          Simpan
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Logo & Favicon */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Logo Header</Typography>
            <Box sx={{ width: '100%', aspectRatio: '1', maxWidth: 200, mx: 'auto', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              {form.logo ? <Box component="img" src={imageUrl(form.logo)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon sx={{ color: 'text.disabled', fontSize: 44 }} />}
            </Box>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button component="label" variant="outlined" size="small" disabled={uploading === 'logo'} startIcon={uploading === 'logo' ? <CircularProgress size={14} /> : <ImageIcon />}>
                {form.logo ? 'Ganti Logo' : 'Unggah Logo'}
                <input type="file" accept="image/*" hidden onChange={(e) => doUpload(e, 'logo')} />
              </Button>
              {form.logo && <Button size="small" color="error" onClick={() => setVal('logo', '')}>Hapus</Button>}
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
              PNG transparan disarankan. Kosongkan untuk memakai inisial judul.
            </Typography>

            <Divider sx={{ my: 2.5 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Favicon</Typography>
            <Box sx={{ width: 64, height: 64, mx: 'auto', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              {form.favicon ? <Box component="img" src={imageUrl(form.favicon)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon sx={{ color: 'text.disabled', fontSize: 28 }} />}
            </Box>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button component="label" variant="outlined" size="small" disabled={uploading === 'favicon'} startIcon={uploading === 'favicon' ? <CircularProgress size={14} /> : <ImageIcon />}>
                {form.favicon ? 'Ganti Favicon' : 'Unggah Favicon'}
                <input type="file" accept="image/png,image/x-icon,image/svg+xml,image/*" hidden onChange={(e) => doUpload(e, 'favicon')} />
              </Button>
              {form.favicon && <Button size="small" color="error" onClick={() => setVal('favicon', '')}>Hapus</Button>}
            </Stack>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary', textAlign: 'center' }}>
              Ikon tab browser. PNG/ICO bujur sangkar (mis. 64×64) disarankan.
            </Typography>
          </Paper>
        </Grid>

        {/* Text fields */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {FIELDS.map((group, gi) => (
              <Box key={group.section} sx={{ mb: gi < FIELDS.length - 1 ? 3 : 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem' }}>
                  {group.section}
                </Typography>
                <Grid container spacing={2}>
                  {group.items.map((it) => (
                    <Grid size={{ xs: 12, sm: it.multiline ? 12 : 6 }} key={it.key}>
                      <TextField
                        label={it.label}
                        value={form[it.key] || ''}
                        onChange={(e) => setVal(it.key, e.target.value)}
                        fullWidth
                        size="small"
                        multiline={it.multiline}
                        minRows={it.multiline ? 2 : undefined}
                        helperText={it.help}
                      />
                    </Grid>
                  ))}
                </Grid>
                {gi < FIELDS.length - 1 && <Divider sx={{ mt: 3 }} />}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.type} variant="filled" onClose={() => setSnack(null)}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}

export default SettingsPage
