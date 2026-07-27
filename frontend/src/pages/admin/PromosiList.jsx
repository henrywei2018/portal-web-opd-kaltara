import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Stack, Switch, FormControlLabel, CircularProgress, Alert
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Image as ImageIcon, OpenInNew, Campaign } from '@mui/icons-material'
import api from '../../utils/api'
import { resizeImageCover } from '../../utils/resizeImage'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const emptyForm = { id_promosi: null, judul: '', url: '', is_active: true, target_blank: true, jeda_hari: 3, gambar: null }

const PromosiList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const r = await api.get('/admin/promosi')
      setItems(r.data.data || r.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openCreate = () => { setEditMode(false); setForm(emptyForm); setPreview(null); setOpen(true) }
  const openEdit = (it) => {
    setEditMode(true)
    setForm({ id_promosi: it.id_promosi, judul: it.judul || '', url: it.url || '', is_active: !!it.is_active, target_blank: !!it.target_blank, jeda_hari: it.jeda_hari ?? 3, gambar: null })
    setPreview(it.gambar ? imageUrl(it.gambar) : null)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.gambar && !preview) { alert('Gambar promosi wajib diunggah'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('judul', form.judul)
      fd.append('url', form.url)
      fd.append('is_active', form.is_active ? '1' : '0')
      fd.append('target_blank', form.target_blank ? '1' : '0')
      fd.append('jeda_hari', String(form.jeda_hari ?? 3))
      if (form.gambar) fd.append('gambar', form.gambar)

      if (editMode) {
        fd.append('_method', 'PUT')
        await api.post(`/admin/promosi/${form.id_promosi}`, fd)
      } else {
        await api.post('/admin/promosi', fd)
      }
      setOpen(false); fetchItems()
    } catch (e) {
      const errs = e.response?.data?.errors
      alert(errs ? Object.values(errs).flat().join('\n') : (e.response?.data?.message || 'Gagal menyimpan promosi'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Hapus promosi ini?')) {
      try { await api.delete(`/admin/promosi/${id}`); fetchItems() }
      catch (e) { alert(e.response?.data?.error || 'Gagal menghapus') }
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    try {
      // Auto-crop to banner shape (1200×300) and compress before upload
      const processed = await resizeImageCover(file, 1200, 300)
      setForm({ ...form, gambar: processed })
      setPreview(URL.createObjectURL(processed))
    } catch (err) {
      // Resize failed (e.g., huge/unsupported in canvas) — upload the original as-is
      console.warn('Resize gagal, memakai file asli:', err)
      setForm({ ...form, gambar: file })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Promosi (Floating Ads)</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Banner mengambang di pojok kanan bawah situs (mis. survei)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Promosi</Button>
      </Box>

      {items.filter((i) => i.is_active).length > 1 && (
        <Alert severity="info" sx={{ mb: 2 }}>Beberapa promosi aktif — yang ditampilkan ke pengunjung adalah yang terbaru.</Alert>
      )}

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Gambar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id_promosi} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <Box sx={{ width: 120, height: 40, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {it.gambar ? <Box component="img" src={imageUrl(it.gambar)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Campaign sx={{ color: 'text.disabled' }} />}
                  </Box>
                </TableCell>
                <TableCell>{it.judul || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 240 }}>
                  {it.url ? (
                    <Box component="a" href={it.url} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                      {it.url} <OpenInNew sx={{ fontSize: 13 }} />
                    </Box>
                  ) : '-'}
                </TableCell>
                <TableCell><Chip size="small" label={it.is_active ? 'Aktif' : 'Nonaktif'} color={it.is_active ? 'success' : 'default'} variant={it.is_active ? 'filled' : 'outlined'} /></TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => openEdit(it)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(it.id_promosi)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>Belum ada promosi.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editMode ? 'Edit Promosi' : 'Tambah Promosi'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Box sx={{ width: '100%', aspectRatio: '16/4', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, border: '1px dashed', borderColor: 'divider' }}>
                {preview ? <Box component="img" src={preview} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon sx={{ color: 'text.disabled', fontSize: 40 }} />}
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Button component="label" size="small" variant="outlined" startIcon={<ImageIcon />}>
                  {preview ? 'Ganti Gambar' : 'Unggah Gambar Banner'}
                  <input type="file" accept="image/*" hidden onChange={onFile} />
                </Button>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                  Disarankan gambar lebar (mis. 1200 × 200 px) untuk tampilan banner.
                </Typography>
              </Box>
            </Box>
            <TextField label="Judul (opsional)" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} fullWidth size="small" />
            <TextField label="URL tujuan (opsional)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} fullWidth size="small" placeholder="https://... (mis. tautan survei)" />
            <TextField
              label="Tampilkan lagi setelah (hari)"
              type="number"
              value={form.jeda_hari}
              onChange={(e) => setForm({ ...form, jeda_hari: e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10) || 0) })}
              fullWidth
              size="small"
              inputProps={{ min: 0, max: 365 }}
              helperText="Setelah pengunjung menutup banner, banner muncul lagi setelah sekian hari. 0 = jangan tampilkan lagi (permanen)."
            />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Aktif" />
              <FormControlLabel control={<Switch checked={form.target_blank} onChange={(e) => setForm({ ...form, target_blank: e.target.checked })} />} label="Buka di tab baru" />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default PromosiList
