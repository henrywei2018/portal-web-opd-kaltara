import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Divider, Grid, Switch, FormControlLabel
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowUpward, ArrowDownward, Image as ImageIcon } from '@mui/icons-material'
import { CircularProgress } from '@mui/material'
import api from '../../utils/api'
import { resizeImageCover } from '../../utils/resizeImage'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const ICON_OPTIONS = ['DocumentScanner', 'VerifiedUser', 'Emergency', 'HealthAndSafety', 'Vaccines', 'Science', 'FamilyRestroom', 'PregnantWoman', 'Person', 'LocalHospital', 'MedicalServices', 'Healing', 'Biotech', 'MonitorHeart', 'Bloodtype']
const COLOR_OPTIONS = ['primary', 'secondary', 'success', 'error', 'info', 'warning']

const emptyForm = {
  judul: '', icon: 'LocalHospital', color: 'primary', gambar: '', kategori: '', deskripsi: '',
  persyaratan: [''], prosedur: [''], waktu: '', biaya: '', masa_berlaku: '',
  kontak_telepon: '', kontak_email: '', kontak_lokasi: '', darurat: false, status: 'Publish', urutan: 0
}

// Editor for an array of strings (persyaratan / prosedur)
const ListEditor = ({ label, items, onChange }) => (
  <Box>
    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>{label}</Typography>
    <Stack spacing={1}>
      {items.map((val, i) => (
        <Box key={i} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', width: 18 }}>{i + 1}.</Typography>
          <TextField size="small" fullWidth value={val} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a) }} />
          <IconButton size="small" onClick={() => onChange(items.filter((_, idx) => idx !== i))} disabled={items.length === 1}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      ))}
    </Stack>
    <Button size="small" startIcon={<AddIcon />} onClick={() => onChange([...items, ''])} sx={{ mt: 1 }}>Tambah baris</Button>
  </Box>
)

const LayananList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)

  const onThumb = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      let toUpload = file
      try { toUpload = await resizeImageCover(file, 800, 450) } catch { /* fall back to original */ }
      const fd = new FormData()
      fd.append('image', toUpload)
      const r = await api.post('/admin/layanan/upload-image', fd)
      setForm((f) => ({ ...f, gambar: r.data.filename }))
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah gambar')
    } finally { setUploadingImg(false) }
  }

  const fetchAll = async () => {
    try {
      const r = await api.get('/admin/layanan')
      setItems(Array.isArray(r.data) ? r.data : [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm, urutan: (items.length ? Math.max(...items.map((i) => i.urutan || 0)) : 0) + 1 })
    setOpen(true)
  }
  const openEdit = (it) => {
    setEditing(it)
    setForm({
      judul: it.judul || '', icon: it.icon || 'LocalHospital', color: it.color || 'primary', gambar: it.gambar || '', kategori: it.kategori || '',
      deskripsi: it.deskripsi || '', persyaratan: it.persyaratan?.length ? it.persyaratan : [''], prosedur: it.prosedur?.length ? it.prosedur : [''],
      waktu: it.waktu || '', biaya: it.biaya || '', masa_berlaku: it.masa_berlaku || '',
      kontak_telepon: it.kontak_telepon || '', kontak_email: it.kontak_email || '', kontak_lokasi: it.kontak_lokasi || '',
      darurat: !!it.darurat, status: it.status || 'Publish', urutan: it.urutan || 0
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.judul.trim()) return
    setSaving(true)
    const payload = {
      ...form,
      persyaratan: form.persyaratan.filter((x) => x.trim()),
      prosedur: form.prosedur.filter((x) => x.trim())
    }
    try {
      if (editing) await api.put(`/admin/layanan/${editing.id_layanan}`, payload)
      else await api.post('/admin/layanan', payload)
      setOpen(false)
      fetchAll()
    } catch (e) {
      console.error('Error saving layanan:', e.response?.data || e)
      alert(e.response?.data?.message || 'Gagal menyimpan layanan')
    } finally { setSaving(false) }
  }

  const handleDelete = async (it) => {
    if (window.confirm(`Hapus layanan "${it.judul}"?`)) { await api.delete(`/admin/layanan/${it.id_layanan}`); fetchAll() }
  }

  const move = async (it, dir) => {
    const sorted = [...items]
    const idx = sorted.findIndex((x) => x.id_layanan === it.id_layanan)
    const target = idx + dir
    if (target < 0 || target >= sorted.length) return
    const a = sorted[idx], b = sorted[target]
    await Promise.all([
      api.put(`/admin/layanan/${a.id_layanan}`, { ...a, urutan: b.urutan }),
      api.put(`/admin/layanan/${b.id_layanan}`, { ...b, urutan: a.urutan })
    ])
    fetchAll()
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manajemen Layanan</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Layanan & informasi (persyaratan, prosedur, biaya, kontak)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Layanan</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Urutan</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kategori</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={it.id_layanan} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <IconButton size="small" onClick={() => move(it, -1)} disabled={idx === 0}><ArrowUpward fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => move(it, 1)} disabled={idx === items.length - 1}><ArrowDownward fontSize="small" /></IconButton>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{it.judul}</Typography>
                  {it.darurat ? <Chip size="small" label="Darurat" color="error" sx={{ mt: 0.5 }} /> : null}
                </TableCell>
                <TableCell>{it.kategori ? <Chip size="small" label={it.kategori} /> : '—'}</TableCell>
                <TableCell><Chip size="small" label={it.status} color={it.status === 'Publish' ? 'success' : 'default'} variant={it.status === 'Publish' ? 'filled' : 'outlined'} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(it)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(it)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Belum ada layanan.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <Box sx={{ width: 200, aspectRatio: '16/9', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {form.gambar ? <Box component="img" src={imageUrl(form.gambar)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon sx={{ color: 'text.disabled', fontSize: 36 }} />}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>Thumbnail Layanan</Typography>
                  <Button component="label" variant="outlined" size="small" disabled={uploadingImg} startIcon={uploadingImg ? <CircularProgress size={14} /> : <ImageIcon />}>
                    {form.gambar ? 'Ganti Gambar' : 'Unggah Gambar'}
                    <input type="file" accept="image/*" hidden onChange={onThumb} />
                  </Button>
                  {form.gambar && <Button size="small" color="error" sx={{ ml: 1 }} onClick={() => setForm((f) => ({ ...f, gambar: '' }))}>Hapus</Button>}
                  <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary', maxWidth: 280 }}>
                    Gambar deskriptif layanan (otomatis dipangkas 16:9). Tampil di carousel beranda.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={12}><TextField label="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} fullWidth required /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kategori" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField select label="Ikon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} fullWidth>
                {ICON_OPTIONS.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField select label="Warna" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} fullWidth>
                {COLOR_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={12}><TextField label="Deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} fullWidth multiline minRows={2} /></Grid>

            <Grid size={{ xs: 12, md: 6 }}><ListEditor label="Persyaratan" items={form.persyaratan} onChange={(v) => setForm({ ...form, persyaratan: v })} /></Grid>
            <Grid size={{ xs: 12, md: 6 }}><ListEditor label="Prosedur" items={form.prosedur} onChange={(v) => setForm({ ...form, prosedur: v })} /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Waktu Proses" value={form.waktu} onChange={(e) => setForm({ ...form, waktu: e.target.value })} fullWidth placeholder="14 Hari Kerja" /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Biaya" value={form.biaya} onChange={(e) => setForm({ ...form, biaya: e.target.value })} fullWidth placeholder="Gratis / Rp ..." /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Masa Berlaku" value={form.masa_berlaku} onChange={(e) => setForm({ ...form, masa_berlaku: e.target.value })} fullWidth /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kontak Telepon" value={form.kontak_telepon} onChange={(e) => setForm({ ...form, kontak_telepon: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Kontak Email" value={form.kontak_email} onChange={(e) => setForm({ ...form, kontak_email: e.target.value })} fullWidth /></Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Lokasi" value={form.kontak_lokasi} onChange={(e) => setForm({ ...form, kontak_lokasi: e.target.value })} fullWidth /></Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
                <MenuItem value="Publish">Publish</MenuItem>
                <MenuItem value="Draft">Draft</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}><TextField label="Urutan" type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={form.darurat} onChange={(e) => setForm({ ...form, darurat: e.target.checked })} />} label="Layanan Darurat" />
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

export default LayananList
