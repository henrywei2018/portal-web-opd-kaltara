import { useEffect, useState } from 'react'
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, Stack
} from '@mui/material'
import {
  Delete as DeleteIcon, MarkEmailRead, MarkEmailUnread, Reply, Email, Phone, CalendarToday, Circle
} from '@mui/icons-material'
import api from '../../utils/api'

const fmt = (d) => {
  if (!d) return '—'
  try { return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) } catch { return d }
}

const PesanList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchAll = async () => {
    try {
      const r = await api.get('/admin/pesan')
      setItems(Array.isArray(r.data) ? r.data : [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const open = async (msg) => {
    setSelected(msg)
    if (!msg.is_read) {
      try {
        await api.post(`/admin/pesan/${msg.id_komentar}/read`)
        setItems((list) => list.map((m) => (m.id_komentar === msg.id_komentar ? { ...m, is_read: true } : m)))
        window.dispatchEvent(new Event('pesan-updated'))
      } catch { /* ignore */ }
    }
  }

  const toggleRead = async (msg, e) => {
    e?.stopPropagation()
    const url = msg.is_read ? 'unread' : 'read'
    try {
      await api.post(`/admin/pesan/${msg.id_komentar}/${url}`)
      setItems((list) => list.map((m) => (m.id_komentar === msg.id_komentar ? { ...m, is_read: !msg.is_read } : m)))
      window.dispatchEvent(new Event('pesan-updated'))
    } catch { /* ignore */ }
  }

  const remove = async (msg, e) => {
    e?.stopPropagation()
    if (!window.confirm(`Hapus pesan dari "${msg.nama}"?`)) return
    try {
      await api.delete(`/admin/pesan/${msg.id_komentar}`)
      setItems((list) => list.filter((m) => m.id_komentar !== msg.id_komentar))
      if (selected?.id_komentar === msg.id_komentar) setSelected(null)
      window.dispatchEvent(new Event('pesan-updated'))
    } catch { alert('Gagal menghapus') }
  }

  const unread = items.filter((m) => !m.is_read).length

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>Pesan Masuk</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Pesan dari formulir kontak situs{unread > 0 ? ` • ${unread} belum dibaca` : ''}
        </Typography>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 40 }} />
              <TableCell sx={{ fontWeight: 600 }}>Pengirim</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Subjek</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Tanggal</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((m) => (
              <TableRow
                key={m.id_komentar}
                hover
                onClick={() => open(m)}
                sx={{ cursor: 'pointer', bgcolor: m.is_read ? 'transparent' : 'action.hover' }}
              >
                <TableCell>
                  {!m.is_read && <Circle sx={{ fontSize: 10, color: 'primary.main' }} />}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: m.is_read ? 500 : 700 }}>{m.nama}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>{m.email}</Typography>
                </TableCell>
                <TableCell sx={{ fontWeight: m.is_read ? 400 : 600, maxWidth: 320 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subjek}</Typography>
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{fmt(m.tanggal_post)}</Typography></TableCell>
                <TableCell align="right">
                  <Tooltip title={m.is_read ? 'Tandai belum dibaca' : 'Tandai sudah dibaca'}>
                    <IconButton size="small" onClick={(e) => toggleRead(m, e)}>
                      {m.is_read ? <MarkEmailUnread fontSize="small" /> : <MarkEmailRead fontSize="small" color="primary" />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={(e) => remove(m, e)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>Belum ada pesan masuk.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Detail dialog */}
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selected.subjek}</DialogTitle>
            <Divider />
            <DialogContent>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{selected.nama}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Email sx={{ fontSize: 16 }} /><Typography variant="body2">{selected.email}</Typography></Box>
                  {selected.nomorkontak && <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Phone sx={{ fontSize: 16 }} /><Typography variant="body2">{selected.nomorkontak}</Typography></Box>}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><CalendarToday sx={{ fontSize: 16 }} /><Typography variant="body2">{fmt(selected.tanggal_post)}</Typography></Box>
                </Box>
                <Divider />
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.7 }}>{selected.pesan || '(tanpa isi pesan)'}</Typography>
              </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button color="error" startIcon={<DeleteIcon />} onClick={(e) => remove(selected, e)}>Hapus</Button>
              <Box sx={{ flexGrow: 1 }} />
              <Button onClick={() => setSelected(null)}>Tutup</Button>
              <Button
                variant="contained"
                startIcon={<Reply />}
                component="a"
                href={`mailto:${selected.email}?subject=${encodeURIComponent('Re: ' + selected.subjek)}`}
              >
                Balas via Email
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

export default PesanList
