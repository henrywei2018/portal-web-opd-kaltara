import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, TextField, Grid, Paper, Divider, CircularProgress,
  Snackbar, Alert, Stack, Link
} from '@mui/material'
import { Save as SaveIcon, TravelExplore, Insights, Verified, OpenInNew } from '@mui/icons-material'
import api from '../../utils/api'
import { useSettings } from '../../contexts/SettingsContext'

const ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')

const FIELDS = [
  {
    section: 'Metadata Default', icon: <TravelExplore fontSize="small" />, items: [
      { key: 'seo_meta_description', label: 'Deskripsi Meta Default', multiline: true, help: 'Dipakai pada halaman yang belum punya deskripsi sendiri. Idealnya 150–160 karakter.' },
      { key: 'seo_keywords', label: 'Kata Kunci Default', help: 'Dipisah koma. Mis. "dinkes, kesehatan, kalimantan utara".' }
    ]
  },
  {
    section: 'Google Analytics', icon: <Insights fontSize="small" />, items: [
      { key: 'seo_ga_id', label: 'ID Google Analytics / Tag Manager', help: 'Mis. G-XXXXXXX (GA4), GTM-XXXXXX (Tag Manager), atau UA-XXXXXXX. Kosongkan untuk menonaktifkan.' }
    ]
  },
  {
    section: 'Verifikasi Search Console', icon: <Verified fontSize="small" />, items: [
      { key: 'seo_search_console', label: 'Kode Verifikasi Google', help: 'Nilai "content" dari meta tag google-site-verification (hanya kodenya, tanpa tag HTML).' }
    ]
  }
]

const SeoPage = () => {
  const { refresh } = useSettings()
  const [form, setForm] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState(null)

  useEffect(() => {
    api.get('/admin/seo')
      .then((r) => setForm(r.data || {}))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const setVal = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.put('/admin/seo', form)
      setSnack({ type: 'success', msg: 'Pengaturan SEO tersimpan' })
      refresh() // apply analytics/verification/meta defaults immediately
    } catch (err) {
      setSnack({ type: 'error', msg: err.response?.data?.message || 'Gagal menyimpan' })
    } finally { setSaving(false) }
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>SEO</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Metadata, analytics, verifikasi mesin pencari, sitemap</Typography>
        </Box>
        <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={saving}>
          Simpan
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            {FIELDS.map((group, gi) => (
              <Box key={group.section} sx={{ mb: gi < FIELDS.length - 1 ? 3 : 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {group.icon} {group.section}
                </Typography>
                <Grid container spacing={2}>
                  {group.items.map((it) => (
                    <Grid size={{ xs: 12 }} key={it.key}>
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

        {/* Info panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>File Mesin Pencari</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Sitemap dibuat otomatis dari konten yang dipublikasikan (berita, artikel, halaman) dan halaman utama.
            </Typography>
            <Stack spacing={1}>
              <Link href={`${ORIGIN}/sitemap.xml`} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                Lihat sitemap.xml <OpenInNew sx={{ fontSize: 15 }} />
              </Link>
              <Link href={`${ORIGIN}/robots.txt`} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                Lihat robots.txt <OpenInNew sx={{ fontSize: 15 }} />
              </Link>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="caption">
                Meta per-halaman diterapkan di sisi browser sehingga optimal untuk Google. Untuk pratinjau tautan di media sosial (WhatsApp/Facebook), diperlukan render sisi-server (tahap lanjutan).
              </Typography>
            </Alert>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.type} variant="filled" onClose={() => setSnack(null)}>{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}

export default SeoPage
