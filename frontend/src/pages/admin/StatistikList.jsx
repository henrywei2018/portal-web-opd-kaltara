import { useEffect, useState } from 'react'
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, IconButton, Chip, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Divider, Grid, Switch, FormControlLabel,
  ListSubheader, ListItemIcon
} from '@mui/material'
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, ArrowUpward, ArrowDownward } from '@mui/icons-material'
import api from '../../utils/api'
import { ICON_GROUPS, DEFAULT_ICON, renderIcon } from '../../utils/iconRegistry'

// Icons come from the shared registry — the old list was health-only, so a
// non-health agency had no usable icon for its statistics.
const COLOR_OPTIONS = ['primary', 'secondary', 'success', 'error', 'info', 'warning']

const emptyForm = { label: '', nilai: '', icon: DEFAULT_ICON, color: 'primary', tampil_hero: false, is_active: true, urutan: 0 }

const StatistikList = () => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const fetchAll = async () => {
    try { const r = await api.get('/admin/statistik'); setItems(Array.isArray(r.data) ? r.data : []) }
    catch (e) { console.error(e) } finally { setLoading(false) }
  }
  useEffect(() => { fetchAll() }, [])

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, urutan: (items.length ? Math.max(...items.map((i) => i.urutan || 0)) : 0) + 1 }); setOpen(true) }
  const openEdit = (it) => { setEditing(it); setForm({ ...emptyForm, ...it }); setOpen(true) }

  const handleSave = async () => {
    if (!form.label.trim() || !form.nilai.trim()) return
    try {
      if (editing) await api.put(`/admin/statistik/${editing.id_statistik}`, form)
      else await api.post('/admin/statistik', form)
      setOpen(false); fetchAll()
    } catch (e) { console.error(e.response?.data || e); alert(e.response?.data?.message || 'Gagal menyimpan') }
  }

  const handleDelete = async (it) => { if (window.confirm(`Hapus statistik "${it.label}"?`)) { await api.delete(`/admin/statistik/${it.id_statistik}`); fetchAll() } }

  const move = async (it, dir) => {
    const idx = items.findIndex((x) => x.id_statistik === it.id_statistik); const target = idx + dir
    if (target < 0 || target >= items.length) return
    const a = items[idx], b = items[target]
    await Promise.all([api.put(`/admin/statistik/${a.id_statistik}`, { ...a, urutan: b.urutan }), api.put(`/admin/statistik/${b.id_statistik}`, { ...b, urutan: a.urutan })])
    fetchAll()
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Statistik</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>Angka sorotan — tampil di Beranda; centang "Tampil di Hero" untuk muncul juga di hero</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Statistik</Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, width: 60 }}>Urutan</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Nilai</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Label</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Hero</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600 }}>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it, idx) => (
              <TableRow key={it.id_statistik} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                <TableCell>
                  <IconButton size="small" onClick={() => move(it, -1)} disabled={idx === 0}><ArrowUpward fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => move(it, 1)} disabled={idx === items.length - 1}><ArrowDownward fontSize="small" /></IconButton>
                </TableCell>
                <TableCell><Typography sx={{ fontWeight: 700, color: `${it.color}.main` }}>{it.nilai}</Typography></TableCell>
                <TableCell>{it.label}</TableCell>
                <TableCell>{it.tampil_hero ? <Chip size="small" color="primary" label="Hero" /> : <Typography variant="caption" color="text.secondary">—</Typography>}</TableCell>
                <TableCell><Chip size="small" label={it.is_active ? 'Aktif' : 'Nonaktif'} color={it.is_active ? 'success' : 'default'} variant={it.is_active ? 'filled' : 'outlined'} /></TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(it)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(it)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>Belum ada statistik.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Statistik' : 'Tambah Statistik'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Nilai" value={form.nilai} onChange={(e) => setForm({ ...form, nilai: e.target.value })} fullWidth required placeholder="50+ / 95% / 24/7" /></Grid>
            <Grid size={{ xs: 12, sm: 8 }}><TextField label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} fullWidth required placeholder="Fasilitas Kesehatan" /></Grid>
            <Grid size={{ xs: 6 }}>
              <TextField select label="Ikon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} fullWidth>
                {ICON_GROUPS.flatMap((g) => [
                  <ListSubheader key={g.label}>{g.label}</ListSubheader>,
                  ...Object.keys(g.icons).map((n) => (
                    <MenuItem key={n} value={n}>
                      <ListItemIcon sx={{ minWidth: 32 }}>{renderIcon(n, { fontSize: 'small' })}</ListItemIcon>
                      {n}
                    </MenuItem>
                  ))
                ])}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField select label="Warna" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} fullWidth>
                {COLOR_OPTIONS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}><TextField label="Urutan" type="number" value={form.urutan} onChange={(e) => setForm({ ...form, urutan: Number(e.target.value) })} fullWidth /></Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={form.tampil_hero} onChange={(e) => setForm({ ...form, tampil_hero: e.target.checked })} />} label="Tampil di Hero" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }} sx={{ display: 'flex', alignItems: 'center' }}>
              <FormControlLabel control={<Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />} label="Aktif" />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StatistikList
