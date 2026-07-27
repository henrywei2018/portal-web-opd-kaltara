import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Grid
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, PlayArrow } from '@mui/icons-material'
import api from '../../utils/api'

const emptyItem = { id_video: null, judul: '', link_video: '' }

const youtubeId = (url) => {
  if (!url) return ''
  const m = url.match(/(?:embed\/|youtu\.be\/|[?&]v=)([\w-]{11})/)
  return m ? m[1] : ''
}

const VideoList = () => {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [currentItem, setCurrentItem] = useState(emptyItem)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchVideos() }, [])

  const fetchVideos = async () => {
    try {
      const response = await api.get('/admin/video')
      setVideos(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching video:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true)
      setCurrentItem({ id_video: item.id_video, judul: item.judul || '', link_video: item.link_video || '' })
    } else {
      setEditMode(false)
      setCurrentItem(emptyItem)
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setCurrentItem(emptyItem) }

  const handleSave = async () => {
    if (!currentItem.judul.trim() || !currentItem.link_video.trim()) {
      alert('Judul dan link video wajib diisi')
      return
    }
    setSaving(true)
    try {
      const payload = { judul: currentItem.judul, link_video: currentItem.link_video }
      if (editMode) {
        await api.put(`/admin/video/${currentItem.id_video}`, payload)
      } else {
        await api.post('/admin/video', payload)
      }
      handleCloseDialog()
      fetchVideos()
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Gagal menyimpan video')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus video ini?')) {
      try {
        await api.delete(`/admin/video/${id}`)
        fetchVideos()
      } catch (error) {
        alert(error.response?.data?.error || 'Gagal menghapus video')
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>Manajemen Video</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Tambah Video
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell sx={{ fontWeight: 600 }}>Pratinjau</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((item) => {
              const vid = youtubeId(item.link_video)
              return (
                <TableRow key={item.id_video} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.2s' }}>
                  <TableCell>
                    <Box sx={{ position: 'relative', width: 96, height: 54, borderRadius: 1, overflow: 'hidden', bgcolor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {vid
                        ? <Box component="img" src={`https://img.youtube.com/vi/${vid}/default.jpg`} alt={item.judul} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <PlayArrow sx={{ color: 'rgba(255,255,255,0.6)' }} />}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.judul}</TableCell>
                  <TableCell sx={{ maxWidth: 320 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>{item.link_video}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" size="small" onClick={() => handleDelete(item.id_video)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Video' : 'Tambah Video'}</DialogTitle>
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
                label="Link Video (YouTube)"
                fullWidth
                placeholder="https://www.youtube.com/watch?v=..."
                value={currentItem.link_video}
                onChange={(e) => setCurrentItem({ ...currentItem, link_video: e.target.value })}
                helperText="Tempel URL YouTube; sistem mengubahnya ke format sematan otomatis."
              />
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

export default VideoList
