import { useEffect, useState } from 'react'
import { gambarUrl } from '../../utils/assetUrl'
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
  Grid,
  Box as MuiBox,
  Card,
  CardMedia
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../../utils/api'

const GaleriList = () => {
  const [galeri, setGaleri] = useState([])
  const [kategori, setKategori] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentItem, setCurrentItem] = useState({
    judul: '',
    gambar: null,
    status: 'Publish',
    tanggal: new Date().toISOString().split('T')[0],
    idkat: ''
  })

  useEffect(() => {
    fetchGaleri()
    fetchKategori()
  }, [])

  const fetchGaleri = async () => {
    try {
      const response = await api.get('/admin/galeri')
      setGaleri(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching galeri:', error)
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
        id: item.id_galeri,
        judul: item.judul,
        gambar: null,
        status: item.status,
        tanggal: item.tanggal || new Date().toISOString().split('T')[0],
        idkat: item.idkat || ''
      })
      setImagePreview(item.gambar ? gambarUrl(item.gambar) : null)
    } else {
      setEditMode(false)
      setCurrentItem({
        judul: '',
        gambar: null,
        status: 'Publish',
        tanggal: new Date().toISOString().split('T')[0],
        idkat: ''
      })
      setImagePreview(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentItem({
      judul: '',
      gambar: null,
      status: 'Publish',
      tanggal: new Date().toISOString().split('T')[0],
      idkat: ''
    })
    setImagePreview(null)
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append('judul', currentItem.judul)
      formData.append('status', currentItem.status)
      formData.append('tanggal', currentItem.tanggal)
      if (currentItem.idkat) formData.append('idkat', currentItem.idkat)

      if (currentItem.gambar) {
        formData.append('gambar', currentItem.gambar)
      }

      if (editMode) {
        formData.append('_method', 'PUT') // method spoofing so Laravel parses multipart
        await api.post(`/admin/galeri/${currentItem.id}`, formData)
      } else {
        await api.post('/admin/galeri', formData)
      }

      handleCloseDialog()
      fetchGaleri()
    } catch (error) {
      console.error('Error saving galeri:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus gambar ini?')) {
      try {
        await api.delete(`/admin/galeri/${id}`)
        fetchGaleri()
      } catch (error) {
        console.error('Error deleting galeri:', error)
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setCurrentItem({ ...currentItem, gambar: file })

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>Manajemen Galeri</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Tambah Galeri
        </Button>
      </Box>

      <Grid container spacing={2}>
        {galeri.map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id_galeri}>
            <Card sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
              <CardMedia
                component="img"
                image={gambarUrl(item.gambar)}
                alt={item.judul}
                sx={{ height: 200, objectFit: 'cover' }}
              />
              <MuiBox sx={{ p: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  {item.judul}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Chip
                    label={item.status}
                    size="small"
                    color={item.status === 'Publish' ? 'success' : 'default'}
                  />
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}
                  </Typography>
                </Box>
                {item.kategori && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                    Kategori: {item.kategori.nmkat}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                  <IconButton color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(item.id_galeri)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </MuiBox>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Galeri' : 'Tambah Galeri'}</DialogTitle>
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
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={currentItem.idkat}
                  label="Kategori"
                  onChange={(e) => setCurrentItem({ ...currentItem, idkat: e.target.value })}
                >
                  <MenuItem value="">Tanpa Kategori</MenuItem>
                  {kategori.map((kat) => (
                    <MenuItem key={kat.idkat} value={kat.idkat}>{kat.nmkat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={currentItem.status}
                  label="Status"
                  onChange={(e) => setCurrentItem({ ...currentItem, status: e.target.value })}
                >
                  <MenuItem value="Publish">Publish</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tanggal"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={currentItem.tanggal}
                onChange={(e) => setCurrentItem({ ...currentItem, tanggal: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="outlined" component="label" fullWidth>
                Upload Gambar
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
            {imagePreview && (
              <Grid size={{ xs: 12 }}>
                <MuiBox
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 2 }}
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GaleriList
