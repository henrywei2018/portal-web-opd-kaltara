import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Tooltip,
  Grid
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  VisibilityOff,
  SubdirectoryArrowRight
} from '@mui/icons-material'
import api from '../../utils/api'

// Navigation icons: a different vocabulary from content icons, so this list
// stays local — but it no longer assumes a health agency.
const ICON_OPTIONS = ['Home', 'Info', 'Article', 'Announcement', 'PhotoLibrary', 'VideoLibrary',
  'DataUsage', 'Phone', 'Description', 'Business', 'People', 'CalendarMonth', 'Folder', 'Gavel',
  'Assessment', 'AccountBalance', 'School', 'Work', 'Map', 'Policy', 'Handshake', 'Public',
  'SupportAgent', 'Payments', 'Badge', 'Landscape']

const TYPE_LABELS = { route: 'Route Internal', halaman: 'Halaman Dinamis', url: 'Link Eksternal', dropdown: 'Dropdown' }

const emptyForm = { label: '', type: 'route', url: '', id_halaman: '', icon: '', parent_id: '', is_active: true, target_blank: false }

// Flatten a menu tree into a list with depth, for the parent picker
const flattenMenu = (nodes, depth = 0, acc = []) => {
  nodes.forEach((n) => {
    acc.push({ ...n, _depth: depth })
    if (n.children?.length) flattenMenu(n.children, depth + 1, acc)
  })
  return acc
}

// Collect an item's descendant ids (to prevent choosing itself/descendant as parent)
const descendantIds = (node) => {
  let ids = []
  ;(node.children || []).forEach((c) => {
    ids.push(c.id_menu)
    ids = ids.concat(descendantIds(c))
  })
  return ids
}

const MenuManager = () => {
  const [tree, setTree] = useState([])
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const fetchAll = async () => {
    try {
      const [menuRes, pagesRes] = await Promise.all([
        api.get('/admin/menu'),
        api.get('/admin/halaman')
      ])
      setTree(Array.isArray(menuRes.data) ? menuRes.data : [])
      setPages(Array.isArray(pagesRes.data) ? pagesRes.data : (pagesRes.data.data || []))
    } catch (e) {
      console.error('Error fetching menu:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (item) => {
    setEditing(item)
    setForm({
      label: item.label || '',
      type: item.type || 'route',
      url: item.url || '',
      id_halaman: item.id_halaman || '',
      icon: item.icon || '',
      parent_id: item.parent_id || '',
      is_active: !!item.is_active,
      target_blank: !!item.target_blank
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.label.trim()) return
    const payload = {
      label: form.label,
      type: form.type,
      id_halaman: form.type === 'halaman' && form.id_halaman ? Number(form.id_halaman) : null,
      url: (form.type === 'route' || form.type === 'url') ? form.url : null,
      icon: form.icon || null,
      parent_id: form.parent_id ? Number(form.parent_id) : null,
      is_active: form.is_active,
      target_blank: form.type === 'url' ? form.target_blank : false
    }
    try {
      if (editing) await api.put(`/admin/menu/${editing.id_menu}`, payload)
      else await api.post('/admin/menu', payload)
      setDialogOpen(false)
      fetchAll()
    } catch (e) {
      console.error('Error saving menu:', e.response?.data || e)
    }
  }

  const handleDelete = async (item) => {
    const warn = item.children?.length
      ? 'Hapus item ini beserta semua sub-itemnya?'
      : 'Hapus item menu ini?'
    if (window.confirm(warn)) {
      await api.delete(`/admin/menu/${item.id_menu}`)
      fetchAll()
    }
  }

  const toggleActive = async (item) => {
    await api.put(`/admin/menu/${item.id_menu}`, {
      label: item.label,
      type: item.type,
      id_halaman: item.id_halaman || null,
      url: item.url || null,
      icon: item.icon || null,
      parent_id: item.parent_id || null,
      urutan: item.urutan,
      is_active: !item.is_active,
      target_blank: item.target_blank || false
    })
    fetchAll()
  }

  const moveItem = async (item, siblings, dir) => {
    const idx = siblings.findIndex((s) => s.id_menu === item.id_menu)
    const target = idx + dir
    if (target < 0 || target >= siblings.length) return
    const reordered = [...siblings]
    ;[reordered[idx], reordered[target]] = [reordered[target], reordered[idx]]
    const payload = {
      items: reordered.map((s, i) => ({ id_menu: s.id_menu, urutan: i + 1, parent_id: s.parent_id ?? null }))
    }
    await api.post('/admin/menu/reorder', payload)
    fetchAll()
  }

  const targetText = (item) => {
    if (item.type === 'halaman') return item.halaman ? `/${item.halaman.slug}` : '(halaman dihapus)'
    if (item.type === 'dropdown') return '—'
    return item.url || '—'
  }

  const renderRow = (item, siblings, depth = 0) => (
    <Box key={item.id_menu}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          py: 1.25,
          pr: 2,
          pl: 2 + depth * 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: depth > 0 ? 'rgba(0,0,0,0.015)' : 'transparent',
          opacity: item.is_active ? 1 : 0.5
        }}
      >
        {depth > 0 && <SubdirectoryArrowRight sx={{ fontSize: '1rem', color: 'text.disabled' }} />}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.label}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {TYPE_LABELS[item.type]} · {targetText(item)}
          </Typography>
        </Box>
        {!item.is_active && <Chip label="Tersembunyi" size="small" variant="outlined" />}
        <Tooltip title="Naik"><span><IconButton size="small" onClick={() => moveItem(item, siblings, -1)}><ArrowUpward fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title="Turun"><span><IconButton size="small" onClick={() => moveItem(item, siblings, 1)}><ArrowDownward fontSize="small" /></IconButton></span></Tooltip>
        <Tooltip title={item.is_active ? 'Sembunyikan' : 'Tampilkan'}>
          <IconButton size="small" onClick={() => toggleActive(item)}>
            {item.is_active ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => openEdit(item)}><EditIcon fontSize="small" /></IconButton></Tooltip>
        <Tooltip title="Hapus"><IconButton size="small" color="error" onClick={() => handleDelete(item)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
      </Box>
      {(item.children || []).map((child) => renderRow(child, item.children, depth + 1))}
    </Box>
  )

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  // Any item (any depth) can be a parent, except the item being edited and its own descendants
  const excludedParentIds = editing ? [editing.id_menu, ...descendantIds(editing)] : []
  const parentChoices = flattenMenu(tree).filter((n) => !excludedParentIds.includes(n.id_menu))

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Manajemen Menu</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Atur navigasi navbar — urutan, dropdown, dan visibilitas
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>Tambah Item</Button>
      </Box>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
        {tree.map((item) => renderRow(item, tree, 0))}
        {tree.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">Belum ada item menu.</Typography>
          </Box>
        )}
      </Paper>

      {/* Add / Edit dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{editing ? 'Edit Item Menu' : 'Tambah Item Menu'}</DialogTitle>
        <Divider />
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} fullWidth required />

            <TextField select label="Tipe" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} fullWidth>
              {Object.entries(TYPE_LABELS).map(([val, label]) => (
                <MenuItem key={val} value={val}>{label}</MenuItem>
              ))}
            </TextField>

            {form.type === 'halaman' && (
              <TextField select label="Halaman Tujuan" value={form.id_halaman} onChange={(e) => setForm({ ...form, id_halaman: e.target.value })} fullWidth>
                {pages.map((p) => (
                  <MenuItem key={p.id_halaman} value={p.id_halaman}>{p.judul} (/p/{p.slug})</MenuItem>
                ))}
                {pages.length === 0 && <MenuItem disabled value="">Belum ada halaman</MenuItem>}
              </TextField>
            )}

            {(form.type === 'route' || form.type === 'url') && (
              <TextField
                label={form.type === 'url' ? 'URL Eksternal' : 'Path Internal'}
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                fullWidth
                placeholder={form.type === 'url' ? 'https://...' : '/berita'}
              />
            )}

            {form.type === 'url' && (
              <FormControlLabel
                control={<Switch checked={form.target_blank} onChange={(e) => setForm({ ...form, target_blank: e.target.checked })} />}
                label="Buka di tab baru"
              />
            )}

            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField select label="Ikon" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} fullWidth>
                  <MenuItem value="">(Tanpa ikon)</MenuItem>
                  {ICON_OPTIONS.map((name) => <MenuItem key={name} value={name}>{name}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid size={6}>
                <TextField select label="Induk (Parent)" value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} fullWidth>
                  <MenuItem value="">(Top-level)</MenuItem>
                  {parentChoices.map((t) => (
                    <MenuItem key={t.id_menu} value={t.id_menu}>
                      {t._depth > 0 ? '  '.repeat(t._depth) + '└ ' : ''}{t.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <FormControlLabel
              control={<Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />}
              label="Tampilkan di navbar"
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Batal</Button>
          <Button variant="contained" onClick={handleSave}>Simpan</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default MenuManager
