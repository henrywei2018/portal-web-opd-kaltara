import { useEffect, useState } from 'react'
import { fileUrl } from '../../utils/assetUrl'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../../utils/api'

const PengumumanList = () => {
  const [pengumuman, setPengumuman] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState({
    judul: '',
    file: null,
    pengumuman_deskripsi: '',
    pengumuman_author: '',
    pengumuman_tanggal: new Date().toISOString().split('T')[0]
  })
  const [filePreview, setFilePreview] = useState(null)

  useEffect(() => {
    fetchPengumuman()
  }, [])

  const fetchPengumuman = async () => {
    try {
      const response = await api.get('/admin/pengumuman')
      setPengumuman(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching pengumuman:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true)
      setCurrentItem({
        id: item.id_pengumuman,
        judul: item.judul,
        file: null,
        pengumuman_deskripsi: item.pengumuman_deskripsi || '',
        pengumuman_author: item.pengumuman_author || '',
        pengumuman_tanggal: item.pengumuman_tanggal || new Date().toISOString().split('T')[0]
      })
      setFilePreview(null)
    } else {
      setEditMode(false)
      setCurrentItem({
        judul: '',
        file: null,
        pengumuman_deskripsi: '',
        pengumuman_author: '',
        pengumuman_tanggal: new Date().toISOString().split('T')[0]
      })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setCurrentItem({
      judul: '',
      file: null,
      pengumuman_deskripsi: '',
      pengumuman_author: '',
      pengumuman_tanggal: new Date().toISOString().split('T')[0]
    })
    setFilePreview(null)
  }

  const handleSave = async () => {
    try {
      const formData = new FormData()
      formData.append('judul', currentItem.judul)
      formData.append('pengumuman_deskripsi', currentItem.pengumuman_deskripsi)
      formData.append('pengumuman_author', currentItem.pengumuman_author)
      formData.append('pengumuman_tanggal', currentItem.pengumuman_tanggal)

      if (currentItem.file) {
        formData.append('file', currentItem.file)
      }

      if (editMode) {
        formData.append('_method', 'PUT') // method spoofing so Laravel parses multipart
        await api.post(`/admin/pengumuman/${currentItem.id}`, formData)
      } else {
        await api.post('/admin/pengumuman', formData)
      }

      handleCloseDialog()
      fetchPengumuman()
    } catch (error) {
      console.error('Error saving pengumuman:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pengumuman ini?')) {
      try {
        await api.delete(`/admin/pengumuman/${id}`)
        fetchPengumuman()
      } catch (error) {
        console.error('Error deleting pengumuman:', error)
      }
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setCurrentItem({ ...currentItem, file })
    setFilePreview(file ? file.name : null)
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>Manajemen Pengumuman</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Tambah Pengumuman
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Deskripsi</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Author</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>File</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, fontSize: { xs: '0.875rem', sm: '1rem' } }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pengumuman.map((item) => (
              <TableRow
                key={item.id_pengumuman}
                sx={{
                  '&:hover': {
                    bgcolor: 'action.hover'
                  },
                  transition: 'all 0.2s'
                }}
              >
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.judul}</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {item.pengumuman_deskripsi ? (
                    item.pengumuman_deskripsi.length > 50
                      ? item.pengumuman_deskripsi.substring(0, 50) + '...'
                      : item.pengumuman_deskripsi
                  ) : '-'}
                </TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.pengumuman_author || '-'}</TableCell>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  {item.pengumuman_tanggal ? new Date(item.pengumuman_tanggal).toLocaleDateString('id-ID') : '-'}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    href={fileUrl(item.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Lihat File
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDelete(item.id_pengumuman)} size="small">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Pengumuman' : 'Tambah Pengumuman'}</DialogTitle>
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
              <TextField
                label="Deskripsi"
                fullWidth
                multiline
                rows={3}
                value={currentItem.pengumuman_deskripsi}
                onChange={(e) => setCurrentItem({ ...currentItem, pengumuman_deskripsi: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Author"
                fullWidth
                value={currentItem.pengumuman_author}
                onChange={(e) => setCurrentItem({ ...currentItem, pengumuman_author: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Tanggal"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={currentItem.pengumuman_tanggal}
                onChange={(e) => setCurrentItem({ ...currentItem, pengumuman_tanggal: e.target.value })}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="outlined" component="label" fullWidth>
                Upload File (PDF, DOC, XLS, PPT)
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  onChange={handleFileChange}
                />
              </Button>
              {filePreview && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  File: {filePreview}
                </Typography>
              )}
              {editMode && !filePreview && (
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  Upload file baru untuk mengganti yang lama (opsional)
                </Typography>
              )}
            </Grid>
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

export default PengumumanList
