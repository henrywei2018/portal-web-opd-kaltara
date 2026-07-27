import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material'
import api from '../../utils/api'

const KategoriList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [current, setCurrent] = useState({ idkat: null, nmkat: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchItems() }, [])

  const fetchItems = async () => {
    try {
      const response = await api.get('/admin/kategori')
      setItems(response.data.data || response.data)
    } catch (error) {
      console.error('Error fetching kategori:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (item = null) => {
    if (item) {
      setEditMode(true)
      setCurrent({ idkat: item.idkat, nmkat: item.nmkat || '' })
    } else {
      setEditMode(false)
      setCurrent({ idkat: null, nmkat: '' })
    }
    setOpenDialog(true)
  }

  const handleCloseDialog = () => { setOpenDialog(false); setCurrent({ idkat: null, nmkat: '' }) }

  const handleSave = async () => {
    if (!current.nmkat.trim()) { alert('Nama kategori wajib diisi'); return }
    setSaving(true)
    try {
      if (editMode) {
        await api.put(`/admin/kategori/${current.idkat}`, { nmkat: current.nmkat })
      } else {
        await api.post('/admin/kategori', { nmkat: current.nmkat })
      }
      handleCloseDialog()
      fetchItems()
    } catch (error) {
      alert(error.response?.data?.error || error.response?.data?.message || 'Gagal menyimpan kategori')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      try {
        await api.delete(`/admin/kategori/${id}`)
        fetchItems()
      } catch (error) {
        alert(error.response?.data?.error || 'Gagal menghapus kategori (mungkin sedang dipakai berita)')
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 2, sm: 0 } }}>
        <Box>
          <Typography variant="h5" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, fontWeight: 700 }}>Manajemen Kategori</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Kategori untuk berita & artikel</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Tambah Kategori
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 500 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.paper' }}>
              <TableCell sx={{ fontWeight: 600 }}>Nama Kategori</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.idkat} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.2s' }}>
                <TableCell sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{item.nmkat}</TableCell>
                <TableCell align="right">
                  <IconButton color="primary" size="small" onClick={() => handleOpenDialog(item)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton color="error" size="small" onClick={() => handleDelete(item.idkat)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editMode ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nama Kategori"
            fullWidth
            sx={{ mt: 1 }}
            value={current.nmkat}
            onChange={(e) => setCurrent({ ...current, nmkat: e.target.value })}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default KategoriList
