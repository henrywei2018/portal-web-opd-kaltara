import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Paper, IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Stack, Divider, Grid, Switch, FormControlLabel, CircularProgress,
  InputAdornment
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowUpward, ArrowDownward, Image as ImageIcon, Timer as TimerIcon } from '@mui/icons-material'
import api from '../../utils/api'
import { youtubeId, youtubeThumb } from '../../utils/youtube'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (f) => (!f ? '' : (/^https?:\/\//.test(f) ? f : `${API_ORIGIN}/gambar/${f}`))

// Seconds a slide stays on screen; must match the bounds the API validates.
const DEFAULT_DURASI = 6
const MIN_DURASI = 2
const MAX_DURASI = 60
const clampDurasi = (v) => {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.min(Math.max(Math.round(n), MIN_DURASI), MAX_DURASI) : DEFAULT_DURASI
}

const emptyForm = {
  judul: '', subjudul: '', deskripsi: '', bg_type: 'color', bg_value: '#0066CC', bg_poster: '', bg_autoplay: false, overlay: true,
  durasi: DEFAULT_DURASI,
  cta_text: '', cta_link: '', cta2_text: '', cta2_link: '', tampil_statistik: true, is_active: true, urutan: 0
}

const bgPreview = (form) => {
  if (form.bg_type === 'color') return { background: form.bg_value || '#0066CC' }
  if (form.bg_type === 'gradient') return { background: form.bg_value || 'linear-gradient(135deg,#0066CC,#00A651)' }
  if (form.bg_type === 'image') return { backgroundImage: `url('${imageUrl(form.bg_value)}')`, backgroundSize: 'cover', backgroundPosition: 'center' }
  if (form.bg_type === 'youtube') {
    // Prefer the uploaded poster — that is what visitors actually see first.
    const src = form.bg_poster ? imageUrl(form.bg_poster) : youtubeThumb(form.bg_value)
    return src ? { backgroundImage: `url('${src}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: '#07223F' }
  }
  return {}
}

// ---- Visual gradient editor ----
const GRAD_ANGLES = [
  ['135deg', '↘ Diagonal'], ['90deg', '→ Mendatar'], ['180deg', '↓ Menurun'],
  ['45deg', '↗ Diagonal'], ['270deg', '← Mendatar'], ['0deg', '↑ Menanjak']
]
const GRAD_PRESETS = [
  'linear-gradient(135deg, #0066CC, #00A651)',
  'linear-gradient(135deg, #0066CC, #0B3D7D)',
  'linear-gradient(135deg, #00A651, #007840)',
  'linear-gradient(135deg, #FF6B35, #CC5529)',
  'linear-gradient(135deg, #6dd9cd, #0066CC)',
  'linear-gradient(135deg, #7B2FF7, #F107A3)'
]
const parseGrad = (v) => {
  const m = /linear-gradient\(\s*([^,]+?)\s*,\s*(#[0-9a-fA-F]{3,8})[^,]*,\s*(#[0-9a-fA-F]{3,8})/.exec(v || '')
  return { angle: m?.[1] || '135deg', c1: m?.[2] || '#0066CC', c2: m?.[3] || '#00A651' }
}
const buildGrad = (g) => `linear-gradient(${g.angle}, ${g.c1}, ${g.c2})`

const GradientEditor = ({ value, onChange }) => {
  const g = parseGrad(value)
  const set = (patch) => onChange(buildGrad({ ...g, ...patch }))
  const swatch = { width: 44, height: 38, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Warna 1</Typography>
          <input type="color" value={g.c1} onChange={(e) => set({ c1: e.target.value })} style={swatch} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>Warna 2</Typography>
          <input type="color" value={g.c2} onChange={(e) => set({ c2: e.target.value })} style={swatch} />
        </Box>
        <TextField select size="small" label="Arah" value={g.angle} onChange={(e) => set({ angle: e.target.value })} sx={{ minWidth: 150 }}>
          {GRAD_ANGLES.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
        </TextField>
      </Box>
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>Preset:</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
          {GRAD_PRESETS.map((p, i) => (
            <Box key={i} onClick={() => onChange(p)} title={p}
              sx={{ width: 46, height: 26, borderRadius: 1, cursor: 'pointer', background: p, border: '2px solid', borderColor: value === p ? 'primary.main' : 'divider' }} />
          ))}
        </Box>
      </Box>
      <TextField label="CSS Gradient (lanjutan)" value={value} onChange={(e) => onChange(e.target.value)} fullWidth size="small" />
    </Stack>
  )
}

const HeroList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const fetchAll = async () => {
    try { const r = await api.get('/admin/hero'); setItems(Array.isArray(r.data) ? r.data : []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, urutan: (items.length ? Math.max(...items.map((i) => i.urutan || 0)) : 0) + 1 }); setOpen(true) }
  const openEdit = (it) => { setEditing(it); setForm({ ...emptyForm, ...it, bg_value: it.bg_value || '', bg_poster: it.bg_poster || '', durasi: clampDurasi(it.durasi) }); setOpen(true) }

  // `field` lets the same endpoint fill either the image background or the
  // poster still used by youtube slides.
  const handleUpload = (field = 'bg_value') => async (e) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const fd = new FormData(); fd.append('image', file)
    try {
      const r = await api.post('/admin/hero/upload-image', fd, { headers: { 'Content-Type': undefined } })
      setForm((f) => ({ ...f, [field]: r.data.filename }))
    } catch (err) { console.error(err); alert('Upload gagal') } finally { setUploading(false); e.target.value = '' }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // An emptied duration field must not reach the API as ''
      const payload = { ...form, durasi: clampDurasi(form.durasi) }
      if (editing) await api.put(`/admin/hero/${editing.id_hero}`, payload)
      else await api.post('/admin/hero', payload)
      setOpen(false); fetchAll()
    } catch (e) { console.error('Error saving hero:', e.response?.data || e); alert(e.response?.data?.message || 'Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const handleDelete = async (it) => { if (window.confirm('Hapus slide hero ini?')) { await api.delete(`/admin/hero/${it.id_hero}`); fetchAll() } }

  const move = async (it, dir) => {
    const idx = items.findIndex((x) => x.id_hero === it.id_hero); const target = idx + dir
    if (target < 0 || target >= items.length) return
    const a = items[idx], b = items[target]
    await Promise.all([api.put(`/admin/hero/${a.id_hero}`, { ...a, urutan: b.urutan }), api.put(`/admin/hero/${b.id_hero}`, { ...b, urutan: a.urutan })])
    fetchAll()
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Hero / Slider Beranda</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Kelola slide hero halaman utama — background, judul, dan tombol</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Slide</Button>
      </Box>

      <Stack spacing={2}>
        {items.map((it, idx) => (
          <Paper key={it.id_hero} sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', opacity: it.is_active ? 1 : 0.5 }}>
            <Box sx={{ width: 180, minHeight: 110, color: 'white', p: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', ...bgPreview(it) }}>
              {['image', 'youtube'].includes(it.bg_type) && it.overlay && <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)' }} />}
              <Box sx={{ position: 'relative' }}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.2 }}>{it.judul}</Typography>
              </Box>
            </Box>
            <Box sx={{ flexGrow: 1, p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{it.subjudul}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}>
                  <Chip size="small" label={`BG: ${it.bg_type}`} />
                  <Chip size="small" variant="outlined" icon={<TimerIcon />} label={`${clampDurasi(it.durasi)} detik`} />
                  {it.bg_type === 'youtube' && (
                    <Chip size="small" variant="outlined" color={it.bg_autoplay ? 'warning' : 'default'}
                      label={it.bg_autoplay ? 'Autoplay latar' : 'Klik untuk putar'} />
                  )}
                  {it.cta_text && <Chip size="small" variant="outlined" label={it.cta_text} />}
                  {it.tampil_statistik && <Chip size="small" variant="outlined" label="Statistik" />}
                  {!it.is_active && <Chip size="small" color="default" label="Nonaktif" />}
                </Stack>
              </Box>
              <Box>
                <IconButton size="small" onClick={() => move(it, -1)} disabled={idx === 0}><ArrowUpward fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => move(it, 1)} disabled={idx === items.length - 1}><ArrowDownward fontSize="small" /></IconButton>
                <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(it)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(it)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
        {items.length === 0 && <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3, color: 'text.secondary' }}>Belum ada slide hero.</Paper>}
      </Stack>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Slide Hero' : 'Tambah Slide Hero'}</DialogTitle>
        <Divider />
        <DialogContent>
          {/* Live preview */}
          <Box sx={{ borderRadius: 2, overflow: 'hidden', mb: 2.5, color: 'white', p: 3, minHeight: 140, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', ...bgPreview(form) }}>
            {['image', 'youtube'].includes(form.bg_type) && form.overlay && <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.4)' }} />}
            <Box sx={{ position: 'relative' }}>
              <Typography sx={{ opacity: 0.9, fontSize: '0.7rem', letterSpacing: 2, textTransform: 'uppercase' }}>{form.subjudul || 'Subjudul'}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{form.judul || 'Judul Hero'}</Typography>
            </Box>
          </Box>

          <Grid container spacing={2.5}>
            <Grid size={12}><TextField label="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} fullWidth /></Grid>
            <Grid size={12}><TextField label="Subjudul" value={form.subjudul} onChange={(e) => setForm({ ...form, subjudul: e.target.value })} fullWidth /></Grid>
            <Grid size={12}><TextField label="Deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} fullWidth multiline minRows={2} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Tipe Background" value={form.bg_type} onChange={(e) => {
                const tp = e.target.value
                setForm((f) => {
                  let bv = f.bg_value
                  if (tp === 'color' && !/^#/.test(bv)) bv = '#0066CC'
                  if (tp === 'gradient' && !/gradient/.test(bv || '')) bv = 'linear-gradient(135deg, #0066CC, #00A651)'
                  if ((tp === 'image' || tp === 'youtube') && /^(#|linear-gradient)/.test(bv || '')) bv = ''
                  return { ...f, bg_type: tp, bg_value: bv }
                })
              }} fullWidth>
                <MenuItem value="color">Warna</MenuItem>
                <MenuItem value="gradient">Gradient</MenuItem>
                <MenuItem value="image">Gambar</MenuItem>
                <MenuItem value="youtube">Video YouTube</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 8 }}>
              {form.bg_type === 'color' && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <input type="color" value={/^#/.test(form.bg_value) ? form.bg_value : '#0066CC'} onChange={(e) => setForm({ ...form, bg_value: e.target.value })} style={{ width: 48, height: 40, border: 'none', background: 'none' }} />
                  <TextField label="Warna (hex)" value={form.bg_value} onChange={(e) => setForm({ ...form, bg_value: e.target.value })} fullWidth size="small" placeholder="#0066CC" />
                </Box>
              )}
              {form.bg_type === 'gradient' && (
                <GradientEditor value={form.bg_value} onChange={(v) => setForm({ ...form, bg_value: v })} />
              )}
              {form.bg_type === 'image' && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button component="label" variant="outlined" startIcon={uploading ? <CircularProgress size={14} /> : <ImageIcon />} disabled={uploading}>
                    {form.bg_value ? 'Ganti Gambar' : 'Unggah Gambar'}
                    <input type="file" accept="image/*" hidden onChange={handleUpload('bg_value')} />
                  </Button>
                  {form.bg_value && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{form.bg_value}</Typography>}
                  <FormControlLabel sx={{ ml: 'auto' }} control={<Switch checked={form.overlay} onChange={(e) => setForm({ ...form, overlay: e.target.checked })} />} label="Overlay gelap" />
                </Box>
              )}
              {form.bg_type === 'youtube' && (
                <Stack spacing={1.5}>
                  <TextField
                    label="URL YouTube"
                    value={form.bg_value}
                    onChange={(e) => setForm({ ...form, bg_value: e.target.value })}
                    fullWidth size="small"
                    placeholder="https://www.youtube.com/watch?v=..."
                    error={Boolean(form.bg_value) && !youtubeId(form.bg_value)}
                    helperText={
                      form.bg_value && !youtubeId(form.bg_value)
                        ? 'URL YouTube tidak dikenali.'
                        : 'Video diputar bisu dan berulang. Pakai video pendek tanpa teks penting di tepi — bingkainya dipotong agar memenuhi hero.'
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button component="label" variant="outlined" size="small" startIcon={uploading ? <CircularProgress size={14} /> : <ImageIcon />} disabled={uploading}>
                      {form.bg_poster ? 'Ganti Poster' : 'Unggah Poster'}
                      <input type="file" accept="image/*" hidden onChange={handleUpload('bg_poster')} />
                    </Button>
                    {form.bg_poster && (
                      <>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{form.bg_poster}</Typography>
                        <Button size="small" color="inherit" onClick={() => setForm({ ...form, bg_poster: '' })}>Hapus</Button>
                      </>
                    )}
                    <FormControlLabel sx={{ ml: 'auto' }} control={<Switch checked={form.overlay} onChange={(e) => setForm({ ...form, overlay: e.target.checked })} />} label="Overlay gelap" />
                  </Box>
                  <FormControlLabel
                    control={<Switch checked={!!form.bg_autoplay} onChange={(e) => setForm({ ...form, bg_autoplay: e.target.checked })} />}
                    label="Putar otomatis sebagai latar (tanpa suara)"
                  />
                  <Typography variant="caption" sx={{ color: form.bg_autoplay ? 'warning.main' : 'text.secondary' }}>
                    {form.bg_autoplay
                      ? 'Video berjalan sendiri di latar hero. Bingkainya dipotong agar memenuhi layar, dan player baru dimuat setelah pengunjung menyetujui cookie — sebelum itu hanya poster yang tampil.'
                      : 'Disarankan. Hero menampilkan poster dengan tombol “Putar Video”; player YouTube baru dimuat setelah diklik, sehingga tidak ada permintaan ke YouTube saat halaman dibuka.'}
                  </Typography>
                  <Typography variant="caption" sx={{ color: form.bg_poster ? 'text.secondary' : 'warning.main' }}>
                    {form.bg_poster
                      ? 'Poster inilah yang dilihat pengunjung lebih dulu.'
                      : 'Poster belum diunggah. Tanpa poster, hero memakai thumbnail YouTube (hanya setelah cookie disetujui) atau warna polos.'}
                  </Typography>
                </Stack>
              )}
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Teks Tombol 1" value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Link Tombol 1" value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} fullWidth placeholder="/layanan" /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Teks Tombol 2" value={form.cta2_text} onChange={(e) => setForm({ ...form, cta2_text: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}><TextField label="Link Tombol 2" value={form.cta2_link} onChange={(e) => setForm({ ...form, cta2_link: e.target.value })} fullWidth placeholder="/kontak" /></Grid>

            <Grid size={{ xs: 6, sm: 4 }}><TextField label="Urutan" type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                label="Durasi Tayang"
                type="number"
                value={form.durasi}
                onChange={(e) => setForm({ ...form, durasi: e.target.value === '' ? '' : Number(e.target.value) })}
                onBlur={() => setForm((f) => ({ ...f, durasi: clampDurasi(f.durasi) }))}
                fullWidth
                inputProps={{ min: MIN_DURASI, max: MAX_DURASI, step: 1 }}
                InputProps={{ endAdornment: <InputAdornment position="end">detik</InputAdornment> }}
                helperText={`${MIN_DURASI}–${MAX_DURASI} detik. Hanya berlaku bila slide lebih dari satu.`}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={form.tampil_statistik} onChange={(e) => setForm({ ...form, tampil_statistik: e.target.checked })} />} label="Tampilkan statistik" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Aktif" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default HeroList
