import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Stack, Switch, FormControlLabel, CircularProgress
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Image as ImageIcon, OpenInNew, Link as LinkIcon } from '@mui/icons-material'
import api from '../../utils/api'
import { resizeImageCover } from '../../utils/resizeImage'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

const emptyForm = { id_tautan: null, judul: '', url: '', urutan: 0, is_active: true, target_blank: true, gambar: null }

const TautanPentingList = () => {
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
      const r = await api.get('/admin/tautan-penting')
      setItems(r.data.data || r.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const openCreate = () => { setEditMode(false); setForm(emptyForm); setPreview(null); setOpen(true) }
  const openEdit = (it) => {
    setEditMode(true)
    setForm({ id_tautan: it.id_tautan, judul: it.judul || '', url: it.url || '', urutan: it.urutan ?? 0, is_active: !!it.is_active, target_blank: !!it.target_blank, gambar: null })
    setPreview(it.gambar ? imageUrl(it.gambar) : null)
    setOpen(true)
  }

  const handleSave = async () => {
    if (!form.url.trim()) { alert('URL wajib diisi'); return }
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('judul', form.judul)
      fd.append('url', form.url)
      fd.append('urutan', String(form.urutan || 0))
      fd.append('is_active', form.is_active ? '1' : '0')
      fd.append('target_blank', form.target_blank ? '1' : '0')
      if (form.gambar) fd.append('gambar', form.gambar)

      if (editMode) {
        fd.append('_method', 'PUT')
        await api.post(`/admin/tautan-penting/${form.id_tautan}`, fd)
      } else {
        await api.post('/admin/tautan-penting', fd)
      }
      setOpen(false); fetchItems()
    } catch (e) {
      const errs = e.response?.data?.errors
      alert(errs ? Object.values(errs).flat().join('\n') : (e.response?.data?.message || 'Gagal menyimpan tautan'))
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Hapus tautan ini?')) {
      try { await api.delete(`/admin/tautan-penting/${id}`); fetchItems() }
      catch (e) { alert(e.response?.data?.error || 'Gagal menghapus') }
    }
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    try {
      // Auto-crop to 16:9 card shape (1200×675) and compress before upload
      const processed = await resizeImageCover(file, 1200, 675)
      setForm({ ...form, gambar: processed })
      setPreview(URL.createObjectURL(processed))
    } catch (err) {
      // Resize failed — upload the original file as-is (server accepts large images)
      console.warn('Resize gagal, memakai file asli:', err)
      setForm({ ...form, gambar: file })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Tautan Penting</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Carousel tautan eksternal di beranda</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Tautan</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Gambar</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>URL</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Urutan</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id_tautan} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <Box sx={{ width: 80, height: 45, borderRadius: 1, overflow: 'hidden', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {it.gambar ? <Box component="img" src={imageUrl(it.gambar)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <LinkIcon sx={{ color: 'text.disabled' }} />}
                  </Box>
                </TableCell>
                <TableCell>{it.judul || '-'}</TableCell>
                <TableCell sx={{ maxWidth: 260 }}>
                  <Box component="a" href={it.url} target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, color: 'primary.main', textDecoration: 'none', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                    {it.url} <OpenInNew sx={{ fontSize: 13 }} />
                  </Box>
                </TableCell>
                <TableCell>{it.urutan}</TableCell>
                <TableCell><Chip size="small" label={it.is_active ? 'Aktif' : 'Nonaktif'} color={it.is_active ? 'success' : 'default'} variant={it.is_active ? 'filled' : 'outlined'} /></TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => openEdit(it)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(it.id_tautan)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>Belum ada tautan.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editMode ? 'Edit Tautan' : 'Tambah Tautan'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box>
              <Box sx={{ width: '100%', aspectRatio: '16/9', borderRadius: 2, overflow: 'hidden', bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, border: '1px dashed', borderColor: 'divider' }}>
                {preview ? <Box component="img" src={preview} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon sx={{ color: 'text.disabled', fontSize: 40 }} />}
              </Box>
              <Button component="label" size="small" variant="outlined" startIcon={<ImageIcon />}>
                {preview ? 'Ganti Gambar' : 'Unggah Gambar'}
                <input type="file" accept="image/*" hidden onChange={onFile} />
              </Button>
            </Box>
            <TextField label="Judul (opsional)" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} fullWidth size="small" />
            <TextField label="URL (tautan eksternal)" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} fullWidth size="small" required placeholder="https://..." />
            <TextField label="Urutan" type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: e.target.value })} fullWidth size="small" />
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

export default TautanPentingList
