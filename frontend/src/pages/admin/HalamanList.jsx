import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material'
import api from '../../utils/api'

const HalamanList = () => {
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await api.get('/admin/halaman')
      setPages(Array.isArray(res.data) ? res.data : (res.data.data || []))
    } catch (e) {
      console.error('Error fetching halaman:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Hapus halaman ini? Tindakan ini tidak bisa dibatalkan.')) {
      try {
        await api.delete(`/admin/halaman/${id}`)
        fetchPages()
      } catch (e) {
        console.error('Error deleting halaman:', e)
      }
    }
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manajemen Halaman</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Buat & kelola halaman dinamis dengan page builder
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/halaman/new')}>
          Buat Halaman
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Judul</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Slug (URL)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Blok</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pages.map((item) => (
              <TableRow key={item.id_halaman} sx={{ '&:hover': { bgcolor: 'action.hover' }, transition: 'all 0.2s' }}>
                <TableCell sx={{ fontWeight: 500 }}>{item.judul}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    /{item.slug}
                  </Typography>
                </TableCell>
                <TableCell>{Array.isArray(item.blocks) ? item.blocks.length : 0} blok</TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    color={item.status === 'Publish' ? 'success' : 'default'}
                    variant={item.status === 'Publish' ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Lihat halaman">
                    <IconButton size="small" component="a" href={`/${item.slug}`} target="_blank">
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton color="primary" size="small" onClick={() => navigate(`/admin/halaman/${item.id_halaman}/edit`)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus">
                    <IconButton color="error" size="small" onClick={() => handleDelete(item.id_halaman)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {pages.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                  Belum ada halaman. Klik "Buat Halaman" untuk memulai.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default HalamanList
