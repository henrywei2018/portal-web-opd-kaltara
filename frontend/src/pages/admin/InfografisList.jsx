import { useEffect, useState } from 'react'
import { gambarUrl } from '../../utils/assetUrl'
import {
  Box,
  Typography,
  Button,
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

const emptyItem = () => ({
  judul: '',
  gambar: null,
  status: 'Publish',
  tanggal: new Date().toISOString().split('T')[0]
})

const InfografisList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [currentItem, setCurrentItem] = useState(emptyItem())

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const response = await api.get('/admin/infografis')
      setItems(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching infografis:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true)
      setCurrentItem({
        id: item.id_infografis,
        judul: item.judul,
        gambar: null,
        status: item.status,
        tanggal: item.tanggal || new Date().toISOString().split('T')[0]
      })
      setImagePreview(item.gambar ? gambarUrl(item.gambar) : null)
    } else {
      setEditMode(false)
      setCurrentItem(emptyItem())
      setImagePreview(null)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentItem(emptyItem())
    setImagePreview(null)
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append('judul', currentItem.judul)
      formData.append('status', currentItem.status)
      formData.append('tanggal', currentItem.tanggal)
      if (currentItem.gambar) {
        formData.append('gambar', currentItem.gambar)
      }

      if (editMode) {
        formData.append('_method', 'PUT') // method spoofing so Laravel parses multipart
        await api.post(`/admin/infografis/${currentItem.id}`, formData)
      } else {
        await api.post('/admin/infografis', formData)
      }

      handleCloseDialog()
      fetchItems()
    } catch (error) {
      console.error('Error saving infografis:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus infografis ini?')) {
      try {
        await api.delete(`/admin/infografis/${id}`)
        fetchItems()
      } catch (error) {
        console.error('Error deleting infografis:', error)
      }
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    setCurrentItem({ ...currentItem, gambar: file })
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>Manajemen Infografis</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Tambah Infografis
        </Button>
      </Box>

      {items.length === 0 ? (
        <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', color: 'text.secondary' }}>
          Belum ada infografis. Klik "Tambah Infografis" untuk mengunggah.
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id_infografis}>
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
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(item.id_infografis)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </MuiBox>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Infografis' : 'Tambah Infografis'}</DialogTitle>
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
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
            </Grid>
            {imagePreview && (
              <Grid size={{ xs: 12 }}>
                <MuiBox
                  component="img"
                  src={imagePreview}
                  alt="Preview"
                  sx={{ width: '100%', maxHeight: 260, objectFit: 'contain', borderRadius: 2 }}
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

export default InfografisList
