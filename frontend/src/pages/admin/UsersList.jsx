import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Stack, Divider, Alert
} from '@mui/material'
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, LockReset, Visibility, VisibilityOff
} from '@mui/icons-material'
import api from '../../utils/api'
import { useAuth } from '../../contexts/AuthContext'

const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor', kontributor: 'Kontributor' }
const ROLE_COLORS = { super_admin: 'error', admin: 'primary', editor: 'info', kontributor: 'default' }

const emptyForm = { nama: '', username: '', password: '', role: 'editor', status: 1 }

const UsersList = () => {
  const { user: currentUser } = useAuth()
  const isSuper = currentUser?.role === 'super_admin'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showPass, setShowPass] = useState(false)
  const [resetResult, setResetResult] = useState(null)

  const roleOptions = Object.keys(ROLE_LABELS).filter((r) => isSuper || r !== 'super_admin')

  const fetchAll = async () => {
    try { const r = await api.get('/admin/user'); setUsers(Array.isArray(r.data) ? r.data : []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowPass(false); setOpen(true) }
  const openEdit = (u) => { setEditing(u); setForm({ nama: u.nama || '', username: u.username || '', password: '', role: u.role || 'editor', status: u.status ?? 1 }); setShowPass(false); setOpen(true) }

  const handleSave = async () => {
    if (!form.nama.trim() || !form.username.trim()) return
    if (!editing && !form.password) { alert('Password wajib diisi'); return }
    const payload = { nama: form.nama, username: form.username, role: form.role, status: form.status }
    if (form.password) payload.password = form.password
    try {
      if (editing) await api.put(`/admin/user/${editing.id_user}`, payload)
      else await api.post('/admin/user', payload)
      setOpen(false); fetchAll()
    } catch (e) { alert(e.response?.data?.error || e.response?.data?.message || 'Gagal menyimpan pengguna') }
  }

  const handleDelete = async (u) => {
    if (window.confirm(`Hapus pengguna "${u.username}"?`)) {
      try { await api.delete(`/admin/user/${u.id_user}`); fetchAll() }
      catch (e) { alert(e.response?.data?.error || 'Gagal menghapus') }
    }
  }

  const toggleStatus = async (u) => {
    try { await api.post(`/admin/user/${u.id_user}/toggle-status`); fetchAll() }
    catch (e) { alert(e.response?.data?.error || 'Gagal mengubah status') }
  }

  const resetPassword = async (u) => {
    if (window.confirm(`Reset password untuk "${u.username}"?`)) {
      try { const r = await api.post(`/admin/user/${u.id_user}/reset-password`); setResetResult(r.data) }
      catch (e) { alert(e.response?.data?.error || 'Gagal reset password') }
    }
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manajemen Pengguna</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Kelola akun & peran (RBAC)</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Pengguna</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Nama</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Peran</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Login Terakhir</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id_user} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell sx={{ fontWeight: 500 }}>{u.nama}{u.id_user === currentUser?.id_user && <Chip size="small" label="Anda" sx={{ ml: 1 }} />}</TableCell>
                <TableCell><Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{u.username}</Typography></TableCell>
                <TableCell><Chip size="small" label={ROLE_LABELS[u.role] || u.role} color={ROLE_COLORS[u.role] || 'default'} /></TableCell>
                <TableCell>
                  <Chip size="small" label={u.status ? 'Aktif' : 'Nonaktif'} color={u.status ? 'success' : 'default'} variant={u.status ? 'filled' : 'outlined'}
                    onClick={() => u.id_user !== currentUser?.id_user && toggleStatus(u)} sx={{ cursor: u.id_user !== currentUser?.id_user ? 'pointer' : 'default' }} />
                </TableCell>
                <TableCell><Typography variant="caption" color="text.secondary">{u.last_login ? new Date(u.last_login).toLocaleString('id-ID') : '—'}</Typography></TableCell>
                <TableCell align="right">
                  <Tooltip title="Reset password"><IconButton size="small" onClick={() => resetPassword(u)}><LockReset fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Hapus"><span><IconButton size="small" color="error" onClick={() => handleDelete(u)} disabled={u.id_user === currentUser?.id_user}><DeleteIcon fontSize="small" /></IconButton></span></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add / Edit dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Pengguna' : 'Tambah Pengguna'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Nama" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} fullWidth required />
            <TextField label="Username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} fullWidth required />
            <TextField
              label={editing ? 'Password (kosongkan jika tidak diubah)' : 'Password'}
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
              required={!editing}
              InputProps={{ endAdornment: <IconButton size="small" onClick={() => setShowPass((v) => !v)}>{showPass ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton> }}
            />
            <TextField select label="Peran" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} fullWidth helperText="Menentukan hak akses modul">
              {roleOptions.map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
            </TextField>
            <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: Number(e.target.value) })} fullWidth>
              <MenuItem value={1}>Aktif</MenuItem>
              <MenuItem value={0}>Nonaktif</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>

      {/* Reset password result */}
      <Dialog open={!!resetResult} onClose={() => setResetResult(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Password Direset</DialogTitle>
        <Divider />
        <DialogContent>
          <Alert severity="success" sx={{ mb: 2 }}>Salin & berikan password baru ini ke pengguna. Tidak akan ditampilkan lagi.</Alert>
          <Typography variant="body2">Username: <strong>{resetResult?.username}</strong></Typography>
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 2, bgcolor: 'action.hover', fontFamily: 'monospace', fontSize: '1.1rem', textAlign: 'center', userSelect: 'all' }}>
            {resetResult?.new_password}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="contained" onClick={() => { navigator.clipboard?.writeText(resetResult?.new_password || ''); }}>Salin</Button>
          <Button onClick={() => setResetResult(null)}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default UsersList
