import { useEffect, useState, lazy, Suspense } from 'react'
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../../utils/api'
import { gambarUrl } from '../../utils/assetUrl'

// Lazy-loaded: CKEditor is heavy — keep it out of the chunk public visitors download.
const RichTextEditor = lazy(() => import('../../components/admin/RichTextEditor'))

// Artikel supports up to 3 images (gambar..gambar3) on the backend
const IMAGE_FIELDS = [
  { key: 'gambar', label: 'Gambar Utama' },
  { key: 'gambar2', label: 'Gambar 2' },
  { key: 'gambar3', label: 'Gambar 3' }
]

const emptyItem = {
  id: null,
  judul: '',
  isi: '',
  keyword: '',
  tanggal_post: new Date().toISOString().split('T')[0],
  status_artikel: 'Draft',
  idkat: '',
  gambar: null,
  gambar2: null,
  gambar3: null
}

const ArtikelList = () => {
  const [artikel, setArtikel] = useState([])
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imagePreviews, setImagePreviews] = useState({})
  const [currentItem, setCurrentItem] = useState(emptyItem)

  useEffect(() => {
    fetchArtikel()
    fetchKategori()
  }, [])

  const fetchArtikel = async () => {
    try {
      const response = await api.get('/admin/artikel')
      setArtikel(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching artikel:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchKategori = async () => {
    try {
      const response = await api.get('/public/kategori')
      setKategori(response.data)
    } catch (error) {
      console.error('Error fetching kategori:', error)
    }
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true)
      setCurrentItem({
        id: item.id_artikel,
        judul: item.judul || '',
        isi: item.isi || '',
        keyword: item.keyword || '',
        tanggal_post: (item.tanggal_post || '').split('T')[0] || new Date().toISOString().split('T')[0],
        status_artikel: item.status_artikel || 'Draft',
        idkat: item.idkat || '',
        gambar: null,
        gambar2: null,
        gambar3: null
      })
      // Preview existing images (backend returns a filename per field)
      const previews = {}
      IMAGE_FIELDS.forEach(({ key }) => {
        if (item[key]) previews[key] = gambarUrl(item[key])
      })
      setImagePreviews(previews)
    } else {
      setEditMode(false)
      setCurrentItem(emptyItem)
      setImagePreviews({})
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentItem(emptyItem)
    setImagePreviews({})
  }

  const handleImageChange = (field, e) => {
    const file = e.target.files[0]
    if (!file) return
    setCurrentItem((prev) => ({ ...prev, [field]: file }))

    const reader = new FileReader()
    reader.onloadend = () => setImagePreviews((prev) => ({ ...prev, [field]: reader.result }))
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = (field) => {
    setCurrentItem((prev) => ({ ...prev, [field]: null }))
    setImagePreviews((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const handleSave = async () => {
    if (!currentItem.judul.trim() || !currentItem.isi.trim()) {
      alert('Judul dan isi wajib diisi')
      return
    }
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append('judul', currentItem.judul)
      formData.append('isi', currentItem.isi)
      formData.append('keyword', currentItem.keyword)
      formData.append('tanggal_post', currentItem.tanggal_post)
      formData.append('status_artikel', currentItem.status_artikel)
      if (currentItem.idkat) formData.append('idkat', currentItem.idkat)
      // Only newly-selected files (File objects) are uploaded; existing images
      // are left untouched server-side when their field is omitted.
      IMAGE_FIELDS.forEach(({ key }) => {
        if (currentItem[key] instanceof File) formData.append(key, currentItem[key])
      })

      if (editMode) {
        formData.append('_method', 'PUT') // method spoofing so Laravel parses multipart
        await api.post(`/admin/artikel/${currentItem.id}`, formData)
      } else {
        await api.post('/admin/artikel', formData)
      }

      handleCloseDialog()
      fetchArtikel()
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Gagal menyimpan artikel')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus artikel ini?')) {
      try {
        await api.delete(`/admin/artikel/${id}`)
        fetchArtikel()
      } catch (error) {
        console.error('Error deleting artikel:', error)
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>Manajemen Artikel</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Tambah Artikel
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}></TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Kategori</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tanggal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {artikel.map((item) => (
              <TableRow
                key={item.id_artikel}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <TableCell sx={{ width: 56 }}>
                  {item.gambar && (
                    <Box
                      component="img"
                      src={gambarUrl(item.gambar)}
                      alt=""
                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                    />
                  )}
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.judul}</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.kategori?.nmkat || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status_artikel}
                    size="small"
                    color={item.status_artikel === 'Publish' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{new Date(item.tanggal_post).toLocaleDateString('id-ID')}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id_artikel)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? 'Edit Artikel' : 'Tambah Artikel'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Judul"
                fullWidth
                value={currentItem.judul}
                onChange={(e) => setCurrentItem({ ...currentItem, judul: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary' }}>Isi Artikel</Typography>
              <Suspense fallback={<TextField fullWidth multiline rows={8} disabled value="Memuat editor..." />}>
                <RichTextEditor
                  value={currentItem.isi}
                  onChange={(html) => setCurrentItem({ ...currentItem, isi: html })}
                />
              </Suspense>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Gambar (maksimal 3 — gambar pertama menjadi gambar utama)
              </Typography>
              <Grid container spacing={2}>
                {IMAGE_FIELDS.map(({ key, label }) => (
                  <Grid size={{ xs: 6, sm: 4 }} key={key}>
                    <Box
                      sx={{
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1,
                        textAlign: 'center'
                      }}
                    >
                      {imagePreviews[key] ? (
                        <Box sx={{ position: 'relative' }}>
                          <Box
                            component="img"
                            src={imagePreviews[key]}
                            alt={label}
                            sx={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 1 }}
                          />
                          {currentItem[key] instanceof File && (
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveImage(key)}
                              sx={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                bgcolor: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          )}
                        </Box>
                      ) : (
                        <Box sx={{ height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.disabled' }}>
                          <Typography variant="caption">Kosong</Typography>
                        </Box>
                      )}
                      <Button component="label" size="small" fullWidth sx={{ mt: 0.5, fontSize: '0.7rem' }}>
                        {imagePreviews[key] ? 'Ganti' : label}
                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(key, e)} />
                      </Button>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Keyword"
                fullWidth
                value={currentItem.keyword}
                onChange={(e) => setCurrentItem({ ...currentItem, keyword: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={currentItem.idkat}
                  label="Kategori"
                  onChange={(e) => setCurrentItem({ ...currentItem, idkat: e.target.value })}
                >
                  {kategori.map((kat) => (
                    <MenuItem key={kat.idkat} value={kat.idkat}>{kat.nmkat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tanggal"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={currentItem.tanggal_post}
                onChange={(e) => setCurrentItem({ ...currentItem, tanggal_post: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentItem.status_artikel}
                  label="Status"
                  onChange={(e) => setCurrentItem({ ...currentItem, status_artikel: e.target.value })}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Publish">Publish</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default ArtikelList
