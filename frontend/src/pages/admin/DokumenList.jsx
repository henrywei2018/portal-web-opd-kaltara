import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Divider, CircularProgress, List, ListItem, ListItemText
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Download as DownloadIcon,
  Category as CategoryIcon, PictureAsPdf, UploadFile
} from '@mui/icons-material'
import api from '../../utils/api'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const fileUrl = (f) => `${API_ORIGIN}/file/${f}`

const formatBytes = (b) => {
  if (!b) return '-'
  const u = ['B', 'KB', 'MB', 'GB']
  let n = b, i = 0
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(i && n < 10 ? 1 : 0)} ${u[i]}`
}
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-')

const emptyForm = { judul: '', deskripsi: '', id_kategori_dokumen: '', nomor: '', tanggal: '', status: 'Publish' }

const DokumenList = () => {
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterKat, setFilterKat] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const [catOpen, setCatOpen] = useState(false)
  const [catEditing, setCatEditing] = useState(null)
  const [catName, setCatName] = useState('')

  const fetchAll = async () => {
    try {
      const [d, c] = await Promise.all([api.get('/admin/dokumen'), api.get('/admin/kategori-dokumen')])
      setDocs(Array.isArray(d.data) ? d.data : [])
      setCategories(Array.isArray(c.data) ? c.data : [])
    } catch (e) { console.error('Error fetching dokumen:', e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setFile(null); setDialogOpen(true) }
  const openEdit = (d) => {
    setEditing(d)
    setForm({
      judul: d.judul || '', deskripsi: d.deskripsi || '', id_kategori_dokumen: d.id_kategori_dokumen || '',
      nomor: d.nomor || '', tanggal: d.tanggal ? d.tanggal.substring(0, 10) : '', status: d.status || 'Publish'
    })
    setFile(null); setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.judul.trim()) return
    if (!editing && !file) { alert('Pilih file PDF terlebih dahulu'); return }
    setSaving(true)
    const fd = new FormData()
    fd.append('judul', form.judul)
    fd.append('status', form.status)
    if (form.deskripsi) fd.append('deskripsi', form.deskripsi)
    if (form.id_kategori_dokumen) fd.append('id_kategori_dokumen', form.id_kategori_dokumen)
    if (form.nomor) fd.append('nomor', form.nomor)
    if (form.tanggal) fd.append('tanggal', form.tanggal)
    if (file) fd.append('file', file)
    try {
      if (editing) {
        fd.append('_method', 'PUT')
        await api.post(`/admin/dokumen/${editing.id_dokumen}`, fd, { headers: { 'Content-Type': undefined } })
      } else {
        await api.post('/admin/dokumen', fd, { headers: { 'Content-Type': undefined } })
      }
      setDialogOpen(false)
      fetchAll()
    } catch (e) {
      console.error('Error saving dokumen:', e.response?.data || e)
      alert(e.response?.data?.message || 'Gagal menyimpan dokumen')
    } finally { setSaving(false) }
  }

  const handleDelete = async (d) => {
    if (window.confirm(`Hapus dokumen "${d.judul}"?`)) { await api.delete(`/admin/dokumen/${d.id_dokumen}`); fetchAll() }
  }

  // --- Category management ---
  const saveCat = async () => {
    if (!catName.trim()) return
    if (catEditing) await api.put(`/admin/kategori-dokumen/${catEditing.id_kategori_dokumen}`, { nama: catName })
    else await api.post('/admin/kategori-dokumen', { nama: catName })
    setCatName(''); setCatEditing(null); fetchAll()
  }
  const deleteCat = async (c) => {
    if (window.confirm(`Hapus kategori "${c.nama}"? Dokumen di dalamnya tidak terhapus (kategori dikosongkan).`)) {
      await api.delete(`/admin/kategori-dokumen/${c.id_kategori_dokumen}`); fetchAll()
    }
  }

  const shownDocs = filterKat ? docs.filter((d) => String(d.id_kategori_dokumen) === String(filterKat)) : docs

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manajemen Dokumen</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Dokumen hukum, PPID, laporan, dan lainnya (PDF)</Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<CategoryIcon />} onClick={() => setCatOpen(true)}>Kelola Kategori</Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Upload Dokumen</Button>
        </Stack>
      </Box>

      {/* Category filter */}
      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Chip label="Semua" color={filterKat === '' ? 'primary' : 'default'} onClick={() => setFilterKat('')} />
        {categories.map((c) => (
          <Chip
            key={c.id_kategori_dokumen}
            label={`${c.nama} (${c.dokumen_count ?? 0})`}
            color={String(filterKat) === String(c.id_kategori_dokumen) ? 'primary' : 'default'}
            onClick={() => setFilterKat(c.id_kategori_dokumen)}
          />
        ))}
      </Stack>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Kategori</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nomor</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Ukuran</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shownDocs.map((d) => (
              <TableRow key={d.id_dokumen} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PictureAsPdf sx={{ color: 'error.main' }} fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{d.judul}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{d.kategori ? <Chip size="small" label={d.kategori.nama} /> : <Typography variant="caption" color="text.secondary">—</Typography>}</TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{d.nomor || '-'}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{formatDate(d.tanggal)}</Typography></TableCell>
                <TableCell><Typography variant="body2" color="text.secondary">{formatBytes(d.ukuran)}</Typography></TableCell>
                <TableCell><Chip size="small" label={d.status} color={d.status === 'Publish' ? 'success' : 'default'} variant={d.status === 'Publish' ? 'filled' : 'outlined'} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Buka / unduh"><IconButton size="small" component="a" href={fileUrl(d.file)} target="_blank" rel="noopener noreferrer"><DownloadIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(d)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(d)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {shownDocs.length === 0 && (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>Belum ada dokumen.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Upload / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Dokumen' : 'Upload Dokumen'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Judul" value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} fullWidth required />
            <TextField select label="Kategori" value={form.id_kategori_dokumen} onChange={(e) => setForm({ ...form, id_kategori_dokumen: e.target.value })} fullWidth>
              <MenuItem value="">(Tanpa kategori)</MenuItem>
              {categories.map((c) => <MenuItem key={c.id_kategori_dokumen} value={c.id_kategori_dokumen}>{c.nama}</MenuItem>)}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField label="Nomor (opsional)" value={form.nomor} onChange={(e) => setForm({ ...form, nomor: e.target.value })} fullWidth />
              <TextField label="Tanggal" type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} />
            </Stack>
            <TextField label="Deskripsi (opsional)" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} fullWidth multiline minRows={2} />
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} fullWidth>
              <MenuItem value="Publish">Publish</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
            </TextField>
            <Button component="label" variant="outlined" startIcon={<UploadFile />} sx={{ justifyContent: 'flex-start' }}>
              {file ? file.name : (editing ? 'Ganti file PDF (opsional)' : 'Pilih file PDF')}
              <input type="file" accept="application/pdf" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </Button>
            {editing && <Typography variant="caption" color="text.secondary">Biarkan kosong untuk mempertahankan file lama: {editing.nama_file}</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Category management dialog */}
      <Dialog open={catOpen} onClose={() => { setCatOpen(false); setCatEditing(null); setCatName('') }} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Kelola Kategori Dokumen</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 2 }}>
            <TextField size="small" label={catEditing ? 'Ubah nama' : 'Kategori baru'} value={catName} onChange={(e) => setCatName(e.target.value)} fullWidth />
            <Button variant="contained" onClick={saveCat}>{catEditing ? 'Update' : 'Tambah'}</Button>
            {catEditing && <Button onClick={() => { setCatEditing(null); setCatName('') }}>Batal</Button>}
          </Stack>
          <List dense>
            {categories.map((c) => (
              <ListItem key={c.id_kategori_dokumen} secondaryAction={
                <>
                  <IconButton size="small" onClick={() => { setCatEditing(c); setCatName(c.nama) }}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => deleteCat(c)}><DeleteIcon fontSize="small" /></IconButton>
                </>
              }>
                <ListItemText primary={c.nama} secondary={`${c.dokumen_count ?? 0} dokumen · /${c.slug}`} />
              </ListItem>
            ))}
            {categories.length === 0 && <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>Belum ada kategori.</Typography>}
          </List>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}><Button onClick={() => { setCatOpen(false); setCatEditing(null); setCatName('') }}>Tutup</Button></DialogActions>
      </Dialog>
    </Box>
  )
}

export default DokumenList
