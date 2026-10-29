import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  IconButton,
  Stack,
  Grid,
  Divider,
  Menu,
  Snackbar,
  Alert,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  FormControlLabel,
  Switch
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ArrowUpward,
  ArrowDownward,
  Save as SaveIcon,
  ArrowBack,
  Image as ImageIcon,
  ContentCopy,
  OpenInNew,
  AutoFixHigh,
  AutoAwesome,
  ViewModule,
  Visibility,
  Close as CloseIcon
} from '@mui/icons-material'
import api from '../../utils/api'
import { PAGE_TEMPLATES } from './pageTemplates'
import BlockRenderer from '../../components/public/BlockRenderer'
import TemplateThumbnail from './TemplateThumbnail'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const imageUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))

// Mirror of Laravel Str::slug — preview the final URL slug as the user types
const slugify = (s) =>
  (s || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .split('/')
    .map((seg) =>
      seg
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s_]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
    )
    .filter(Boolean)
    .join('/')

// Block type registry: label + default data
const BLOCK_TYPES = [
  { type: 'hero', label: 'Hero', defaults: { title: '', subtitle: '', description: '', bgColor: '', ctaText: '', ctaLink: '' } },
  { type: 'text', label: 'Teks', defaults: { heading: '', html: '' } },
  { type: 'image', label: 'Gambar', defaults: { src: '', caption: '' } },
  { type: 'gallery', label: 'Galeri', defaults: { heading: '', images: [] } },
  { type: 'cards', label: 'Kartu', defaults: { heading: '', items: [] } },
  { type: 'cta', label: 'Ajakan (CTA)', defaults: { title: '', description: '', buttonText: '', buttonLink: '' } },
  { type: 'dokumen', label: 'Daftar Dokumen', defaults: { heading: '', kategori: '', limit: '' } },
  { type: 'html', label: 'HTML (Lanjutan)', defaults: { html: '' } },
  {
    type: 'kontak',
    label: 'Kontak (Unit Kerja)',
    defaults: {
      title: 'Hubungi Kami', subtitle: '', badge: '',
      showEmergency: false, emergencyNumber: '', emergencyText: '',
      officeTitle: 'Kantor', address: '', phone: '', fax: '', email: '', website: '',
      workingHoursTitle: 'Jam Operasional', workingHours: [], workingHoursNote: '',
      showForm: true, formTitle: 'Kirim Pesan', unitLabel: '',
      mapTitle: 'Lokasi Kantor', mapEmbed: '', mapsLink: '',
      socialTitle: 'Media Sosial', facebook: '', twitter: '', instagram: '', youtube: ''
    }
  }
]
const blockLabel = (type) => BLOCK_TYPES.find((b) => b.type === type)?.label || type

let blockCounter = 0
const newBlockId = () => `b${Date.now()}_${blockCounter++}`

const uploadImage = async (file) => {
  const fd = new FormData()
  fd.append('image', file)
  const res = await api.post('/admin/halaman/upload-image', fd, { headers: { 'Content-Type': undefined } })
  return res.data.filename
}

// Small reusable image picker (upload + preview)
const ImagePicker = ({ value, onChange, height = 140 }) => {
  const [busy, setBusy] = useState(false)
  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      const filename = await uploadImage(file)
      onChange(filename)
    } catch (err) {
      console.error('Upload gagal:', err)
    } finally {
      setBusy(false)
    }
  }
  return (
    <Box>
      {value ? (
        <Box
          component="img"
          src={imageUrl(value)}
          alt=""
          sx={{ width: '100%', height, objectFit: 'cover', borderRadius: 2, mb: 1, border: '1px solid', borderColor: 'divider' }}
        />
      ) : (
        <Box sx={{ width: '100%', height, bgcolor: 'action.hover', borderRadius: 2, mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <ImageIcon sx={{ color: 'text.disabled' }} />
        </Box>
      )}
      <Button component="label" size="small" variant="outlined" disabled={busy} startIcon={busy ? <CircularProgress size={14} /> : <ImageIcon />}>
        {value ? 'Ganti Gambar' : 'Unggah Gambar'}
        <input type="file" accept="image/*" hidden onChange={handleFile} />
      </Button>
    </Box>
  )
}

const PageBuilder = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [judul, setJudul] = useState('')
  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState('Draft')
  const [metaDescription, setMetaDescription] = useState('')
  const [blocks, setBlocks] = useState([])
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [snack, setSnack] = useState(null)
  const [addAnchor, setAddAnchor] = useState(null)
  const [menuTree, setMenuTree] = useState([])
  const [docCategories, setDocCategories] = useState([])
  const [templateOpen, setTemplateOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [addToMenuParent, setAddToMenuParent] = useState('')

  // Flatten the nested menu tree; used to detect an existing menu link for this page
  const flattenMenu = (items) => (items || []).flatMap((m) => [m, ...flattenMenu(m.children)])
  const existingMenuLink = isEdit ? flattenMenu(menuTree).find((m) => String(m.id_halaman) === String(id)) : null
  // Top-level menu items usable as a navigation parent
  const menuParentOptions = menuTree.map((m) => ({ id: m.id_menu, label: m.label }))

  const applyTemplate = (tpl) => {
    if (blocks.length > 0 && !window.confirm('Terapkan template akan mengganti blok yang ada. Lanjutkan?')) {
      return
    }
    setBlocks((tpl.blocks || []).map((b) => ({ id: newBlockId(), type: b.type, data: JSON.parse(JSON.stringify(b.data || {})) })))
    if (!judul.trim() && tpl.suggestTitle) setJudul(tpl.suggestTitle)
    setTemplateOpen(false)
    setSnack({ type: 'success', msg: `Template "${tpl.name}" diterapkan` })
  }

  useEffect(() => {
    if (!isEdit) return
    api.get(`/admin/halaman/${id}`)
      .then((res) => {
        const p = res.data
        setJudul(p.judul || '')
        setSlug(p.slug || '')
        setStatus(p.status || 'Draft')
        setMetaDescription(p.meta_description || '')
        setBlocks(Array.isArray(p.blocks) ? p.blocks : [])
      })
      .catch(() => setSnack({ type: 'error', msg: 'Gagal memuat halaman' }))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  // Top-level menu items become available URL "parents" (prefixes)
  useEffect(() => {
    api.get('/admin/menu')
      .then((res) => setMenuTree(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
    api.get('/public/dokumen-kategori')
      .then((res) => setDocCategories(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
  }, [])

  const addBlock = (type) => {
    const def = BLOCK_TYPES.find((b) => b.type === type)
    setBlocks((prev) => [...prev, { id: newBlockId(), type, data: JSON.parse(JSON.stringify(def.defaults)) }])
    setAddAnchor(null)
  }

  const removeBlock = (index) => setBlocks((prev) => prev.filter((_, i) => i !== index))

  const moveBlock = (index, dir) => {
    setBlocks((prev) => {
      const next = [...prev]
      const target = index + dir
      if (target < 0 || target >= next.length) return prev
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  const updateData = (index, patch) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, data: { ...b.data, ...patch } } : b)))
  }

  const handleSave = async () => {
    if (!judul.trim()) {
      setSnack({ type: 'error', msg: 'Judul halaman wajib diisi' })
      return
    }
    setSaving(true)
    const payload = {
      judul,
      slug: slug || undefined,
      status,
      meta_description: metaDescription || undefined,
      blocks
    }
    try {
      let pageId = id
      if (isEdit) {
        await api.put(`/admin/halaman/${id}`, payload)
      } else {
        const res = await api.post('/admin/halaman', payload)
        pageId = res.data?.id_halaman
      }

      // Optionally link the page into the navigation menu under the chosen parent
      let menuWarn = false
      if (addToMenuParent && pageId && !existingMenuLink) {
        try {
          await api.post('/admin/menu', {
            label: judul,
            type: 'halaman',
            id_halaman: pageId,
            parent_id: addToMenuParent,
            is_active: true
          })
        } catch {
          menuWarn = true
        }
      }

      setSnack(menuWarn
        ? { type: 'warning', msg: 'Halaman tersimpan, tetapi gagal menambahkan ke menu' }
        : { type: 'success', msg: 'Halaman tersimpan' })
      setTimeout(() => navigate('/admin/halaman'), 800)
    } catch (e) {
      setSnack({ type: 'error', msg: e.response?.data?.message || 'Gagal menyimpan halaman' })
      setSaving(false)
    }
  }

  // Final slug that will actually be used (empty falls back to the title)
  const previewSlug = slugify(slug) || slugify(judul) || 'halaman'
  const fullUrl = `${window.location.origin}/${previewSlug}`

  // Derive a URL prefix from a menu item (dropdown → label, route → url, halaman → its slug)
  const prefixFromMenuItem = (m) => {
    if (m.type === 'dropdown') return slugify(m.label)
    if (m.type === 'route' && m.url && m.url !== '/') return slugify(m.url)
    if (m.type === 'halaman' && m.halaman) return m.halaman.slug
    return ''
  }
  const parentOptions = []
  menuTree.forEach((m) => {
    const pfx = prefixFromMenuItem(m)
    if (pfx && !parentOptions.some((o) => o.value === pfx)) parentOptions.push({ label: m.label, value: pfx })
  })

  // Current prefix/leaf derived from the slug (single source of truth)
  const effectiveSlug = slugify(slug)
  const leaf = effectiveSlug.split('/').filter(Boolean).pop() || slugify(judul) || ''
  const currentPrefix = effectiveSlug.includes('/') ? effectiveSlug.split('/').slice(0, -1).join('/') : ''
  if (currentPrefix && !parentOptions.some((o) => o.value === currentPrefix)) {
    parentOptions.unshift({ label: `${currentPrefix} (kustom)`, value: currentPrefix })
  }

  const onParentChange = (prefix) => {
    setSlug(prefix ? `${prefix}/${leaf}` : leaf)
  }

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl)
      setSnack({ type: 'success', msg: 'URL disalin ke clipboard' })
    } catch {
      setSnack({ type: 'error', msg: 'Gagal menyalin URL' })
    }
  }

  const generateSlugFromTitle = () => {
    setSlug(slugify(judul))
  }

  if (loading) return <Box sx={{ p: 3 }}>Loading...</Box>

  return (
    <Box>
      {/* Header bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/admin/halaman')}><ArrowBack /></IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {isEdit ? 'Edit Halaman' : 'Buat Halaman'}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button variant="text" startIcon={<Visibility />} onClick={() => setPreviewOpen(true)} disabled={blocks.length === 0}>
            Pratinjau
          </Button>
          <Button variant="outlined" startIcon={<AutoAwesome />} onClick={() => setTemplateOpen(true)}>
            Gunakan Template
          </Button>
          <Button variant="contained" startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />} onClick={handleSave} disabled={saving}>
            Simpan
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Page settings */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 3, position: { md: 'sticky' }, top: 88 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Pengaturan Halaman</Typography>
            <Stack spacing={2}>
              <TextField label="Judul" value={judul} onChange={(e) => setJudul(e.target.value)} fullWidth size="small" required />

              <TextField
                select
                label="Induk (di bawah menu)"
                value={currentPrefix}
                onChange={(e) => onParentChange(e.target.value)}
                fullWidth
                size="small"
                helperText="Menempatkan halaman di bawah path induk, mis. profil/…"
              >
                <MenuItem value="">(Tanpa induk — top level)</MenuItem>
                {parentOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>{o.label} &nbsp;·&nbsp; /{o.value}</MenuItem>
                ))}
              </TextField>

              <Box>
                <TextField
                  label="Slug (URL)"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  onBlur={() => slug && setSlug(slugify(slug))}
                  fullWidth
                  size="small"
                  placeholder="cth: profil/tentang-kami"
                  InputProps={{
                    endAdornment: (
                      <Tooltip title="Buat dari judul">
                        <span>
                          <IconButton size="small" edge="end" onClick={generateSlugFromTitle} disabled={!judul}>
                            <AutoFixHigh sx={{ fontSize: 18 }} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )
                  }}
                />
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1,
                    py: 0.75,
                    borderRadius: 1.5,
                    bgcolor: 'action.hover',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography
                    sx={{
                      flexGrow: 1,
                      minWidth: 0,
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: 'primary.main',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    /{previewSlug}
                  </Typography>
                  <Tooltip title="Salin URL lengkap">
                    <IconButton size="small" onClick={copyUrl}><ContentCopy sx={{ fontSize: 15 }} /></IconButton>
                  </Tooltip>
                  {isEdit && (
                    <Tooltip title="Buka halaman di tab baru">
                      <IconButton size="small" component="a" href={`/${previewSlug}`} target="_blank" rel="noopener noreferrer">
                        <OpenInNew sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}>
                  Bisa bertingkat dengan tanda "/" (cth: profil/tentang-kami). Otomatis dari judul bila kosong; huruf kecil & tanda hubung, akhiran ditambah otomatis jika slug sudah dipakai.
                </Typography>
              </Box>
              <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth size="small">
                <MenuItem value="Draft">Draft</MenuItem>
                <MenuItem value="Publish">Publish</MenuItem>
              </TextField>

              {existingMenuLink ? (
                <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Sudah tertaut di menu navigasi (item: <strong>{existingMenuLink.label}</strong>). Atur posisinya di halaman Menu.
                  </Typography>
                </Box>
              ) : (
                <TextField
                  select
                  label="Tampilkan di Menu Navigasi"
                  value={addToMenuParent}
                  onChange={(e) => setAddToMenuParent(e.target.value)}
                  fullWidth
                  size="small"
                  helperText="Menambahkan halaman sebagai anak menu (mis. di bawah Profil) saat disimpan"
                >
                  <MenuItem value="">(Jangan tampilkan di menu)</MenuItem>
                  {menuParentOptions.map((o) => (
                    <MenuItem key={o.id} value={o.id}>Di bawah: {o.label}</MenuItem>
                  ))}
                </TextField>
              )}
              <TextField
                label="Meta Description (SEO)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                fullWidth
                size="small"
                multiline
                minRows={2}
              />
            </Stack>
          </Paper>
        </Grid>

        {/* Block builder */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {blocks.map((block, index) => (
              <Paper key={block.id} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1, bgcolor: 'action.hover' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {index + 1}. {blockLabel(block.type)}
                  </Typography>
                  <Box>
                    <Tooltip title="Naik"><span><IconButton size="small" onClick={() => moveBlock(index, -1)} disabled={index === 0}><ArrowUpward fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title="Turun"><span><IconButton size="small" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}><ArrowDownward fontSize="small" /></IconButton></span></Tooltip>
                    <Tooltip title="Hapus blok"><IconButton size="small" color="error" onClick={() => removeBlock(index)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <BlockEditor block={block} index={index} updateData={updateData} docCategories={docCategories} />
                </Box>
              </Paper>
            ))}

            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={(e) => setAddAnchor(e.currentTarget)}
              sx={{ alignSelf: 'flex-start', borderStyle: 'dashed' }}
            >
              Tambah Blok
            </Button>
            <Menu anchorEl={addAnchor} open={Boolean(addAnchor)} onClose={() => setAddAnchor(null)}>
              {BLOCK_TYPES.map((b) => (
                <MenuItem key={b.type} onClick={() => addBlock(b.type)}>{b.label}</MenuItem>
              ))}
            </Menu>

            {blocks.length === 0 && (
              <Paper sx={{ p: 5, borderRadius: 3, textAlign: 'center', border: '1px dashed', borderColor: 'divider', bgcolor: 'transparent' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                  Belum ada blok. Mulai cepat dengan template, atau klik "Tambah Blok" untuk menyusun manual.
                </Typography>
                <Button variant="contained" startIcon={<AutoAwesome />} onClick={() => setTemplateOpen(true)}>
                  Pilih Template
                </Button>
              </Paper>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Live preview */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} fullScreen>
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, bgcolor: 'primary.main', color: 'white', boxShadow: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Visibility fontSize="small" />
            <Typography sx={{ fontWeight: 700 }}>Pratinjau: {judul || '(tanpa judul)'}</Typography>
            <Chip size="small" label="Belum disimpan" sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
          </Box>
          <IconButton onClick={() => setPreviewOpen(false)} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100%' }}>
          {previewOpen && <BlockRenderer blocks={blocks} />}
        </Box>
      </Dialog>

      {/* Template gallery */}
      <Dialog open={templateOpen} onClose={() => setTemplateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ViewModule color="primary" /> Pilih Template Halaman
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Pilih titik awal untuk halaman Anda. Semua blok dapat diubah setelah diterapkan.
          </Typography>
          <Grid container spacing={2}>
            {PAGE_TEMPLATES.map((tpl) => (
              <Grid size={{ xs: 12, sm: 6 }} key={tpl.id}>
                <Card variant="outlined" sx={{ borderRadius: 2, height: '100%', overflow: 'hidden' }}>
                  <CardActionArea onClick={() => applyTemplate(tpl)} sx={{ height: '100%', alignItems: 'stretch', display: 'flex', flexDirection: 'column' }}>
                    <TemplateThumbnail blocks={tpl.blocks} />
                    <CardContent sx={{ width: '100%' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>{tpl.name}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, minHeight: 40 }}>{tpl.description}</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {tpl.blocks.length === 0
                          ? <Chip size="small" label="Tanpa blok" variant="outlined" />
                          : tpl.blocks.map((b, i) => <Chip key={i} size="small" label={blockLabel(b.type)} />)}
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateOpen(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={Boolean(snack)} autoHideDuration={3000} onClose={() => setSnack(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        {snack ? <Alert severity={snack.type} onClose={() => setSnack(null)} variant="filled">{snack.msg}</Alert> : undefined}
      </Snackbar>
    </Box>
  )
}

// ---- Per-type editors ----
const BlockEditor = ({ block, index, updateData, docCategories = [] }) => {
  const d = block.data || {}
  const set = (patch) => updateData(index, patch)

  switch (block.type) {
    case 'hero':
      return (
        <Stack spacing={2}>
          <TextField label="Judul" value={d.title || ''} onChange={(e) => set({ title: e.target.value })} fullWidth size="small" />
          <TextField label="Subjudul" value={d.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} fullWidth size="small" />
          <TextField label="Deskripsi" value={d.description || ''} onChange={(e) => set({ description: e.target.value })} fullWidth size="small" multiline minRows={2} />
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Teks Tombol" value={d.ctaText || ''} onChange={(e) => set({ ctaText: e.target.value })} fullWidth size="small" /></Grid>
            <Grid size={6}><TextField label="Link Tombol" value={d.ctaLink || ''} onChange={(e) => set({ ctaLink: e.target.value })} fullWidth size="small" placeholder="/kontak" /></Grid>
          </Grid>
          <TextField label="Warna Latar (opsional)" value={d.bgColor || ''} onChange={(e) => set({ bgColor: e.target.value })} fullWidth size="small" placeholder="#0066CC" />
        </Stack>
      )
    case 'text':
      return (
        <Stack spacing={2}>
          <TextField label="Heading (opsional)" value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} fullWidth size="small" />
          <TextField label="Konten (HTML)" value={d.html || ''} onChange={(e) => set({ html: e.target.value })} fullWidth size="small" multiline minRows={5} placeholder="<p>Tulis konten di sini...</p>" />
        </Stack>
      )
    case 'image':
      return (
        <Stack spacing={2}>
          <ImagePicker value={d.src} onChange={(filename) => set({ src: filename })} />
          <TextField label="Caption (opsional)" value={d.caption || ''} onChange={(e) => set({ caption: e.target.value })} fullWidth size="small" />
        </Stack>
      )
    case 'gallery':
      return (
        <Stack spacing={2}>
          <TextField label="Heading (opsional)" value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} fullWidth size="small" />
          <Grid container spacing={2}>
            {(d.images || []).map((img, i) => (
              <Grid size={{ xs: 6, sm: 4 }} key={i}>
                <ImagePicker
                  value={img.src}
                  height={100}
                  onChange={(filename) => {
                    const images = [...(d.images || [])]
                    images[i] = { ...images[i], src: filename }
                    set({ images })
                  }}
                />
                <Button size="small" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => set({ images: (d.images || []).filter((_, idx) => idx !== i) })} sx={{ mt: 0.5 }}>
                  Hapus
                </Button>
              </Grid>
            ))}
          </Grid>
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => set({ images: [...(d.images || []), { src: '', caption: '' }] })} sx={{ alignSelf: 'flex-start' }}>
            Tambah Gambar
          </Button>
        </Stack>
      )
    case 'cards':
      return (
        <Stack spacing={2}>
          <TextField label="Heading (opsional)" value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} fullWidth size="small" />
          {(d.items || []).map((item, i) => (
            <Paper key={i} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <TextField label={`Judul Kartu ${i + 1}`} value={item.title || ''} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], title: e.target.value }; set({ items }) }} fullWidth size="small" />
                <TextField label="Deskripsi" value={item.description || ''} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], description: e.target.value }; set({ items }) }} fullWidth size="small" multiline minRows={2} />
                <TextField label="Link (opsional)" value={item.link || ''} onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], link: e.target.value }; set({ items }) }} fullWidth size="small" placeholder="/layanan" />
                <Button size="small" color="error" startIcon={<DeleteIcon fontSize="small" />} onClick={() => set({ items: d.items.filter((_, idx) => idx !== i) })} sx={{ alignSelf: 'flex-start' }}>
                  Hapus Kartu
                </Button>
              </Stack>
            </Paper>
          ))}
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => set({ items: [...(d.items || []), { title: '', description: '', link: '' }] })} sx={{ alignSelf: 'flex-start' }}>
            Tambah Kartu
          </Button>
        </Stack>
      )
    case 'cta':
      return (
        <Stack spacing={2}>
          <TextField label="Judul" value={d.title || ''} onChange={(e) => set({ title: e.target.value })} fullWidth size="small" />
          <TextField label="Deskripsi" value={d.description || ''} onChange={(e) => set({ description: e.target.value })} fullWidth size="small" multiline minRows={2} />
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Teks Tombol" value={d.buttonText || ''} onChange={(e) => set({ buttonText: e.target.value })} fullWidth size="small" /></Grid>
            <Grid size={6}><TextField label="Link Tombol" value={d.buttonLink || ''} onChange={(e) => set({ buttonLink: e.target.value })} fullWidth size="small" placeholder="/kontak" /></Grid>
          </Grid>
        </Stack>
      )
    case 'html':
      return (
        <Stack spacing={1}>
          <TextField
            label="Kode HTML"
            value={d.html || ''}
            onChange={(e) => set({ html: e.target.value })}
            fullWidth
            multiline
            minRows={12}
            placeholder="<section>...</section>"
            InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.8rem' } }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            HTML penuh untuk kustomisasi lanjutan (gunakan gaya inline). Blok ini dirender apa adanya — isi hanya dengan konten tepercaya.
          </Typography>
        </Stack>
      )
    case 'dokumen':
      return (
        <Stack spacing={2}>
          <TextField label="Heading (opsional)" value={d.heading || ''} onChange={(e) => set({ heading: e.target.value })} fullWidth size="small" />
          <Grid container spacing={2}>
            <Grid size={8}>
              <TextField select label="Kategori dokumen" value={d.kategori || ''} onChange={(e) => set({ kategori: e.target.value })} fullWidth size="small">
                <MenuItem value="">Semua kategori</MenuItem>
                {docCategories.map((c) => <MenuItem key={c.id_kategori_dokumen} value={c.slug}>{c.nama}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={4}>
              <TextField label="Maks. item" type="number" value={d.limit || ''} onChange={(e) => set({ limit: e.target.value })} fullWidth size="small" />
            </Grid>
          </Grid>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Menyematkan daftar dokumen yang bisa diunduh sesuai kategori (mis. untuk halaman PPID).
          </Typography>
        </Stack>
      )
    case 'kontak': {
      const hours = d.workingHours || []
      const sub = (text) => (
        <Typography variant="overline" sx={{ display: 'block', mt: 1, color: 'text.secondary', fontWeight: 700 }}>{text}</Typography>
      )
      return (
        <Stack spacing={2}>
          {sub('Header')}
          <TextField label="Judul" value={d.title || ''} onChange={(e) => set({ title: e.target.value })} fullWidth size="small" />
          <TextField label="Subjudul" value={d.subtitle || ''} onChange={(e) => set({ subtitle: e.target.value })} fullWidth size="small" />
          <TextField label="Badge (opsional)" value={d.badge || ''} onChange={(e) => set({ badge: e.target.value })} fullWidth size="small" placeholder="cth: Layanan 24/7" />
          <TextField label="Label Unit Kerja (penanda pesan masuk)" value={d.unitLabel || ''} onChange={(e) => set({ unitLabel: e.target.value })} fullWidth size="small" helperText="Ditambahkan ke subjek pesan agar admin tahu asal pesan, mis. UPTD Labkes" />

          <Divider />
          {sub('Layanan Darurat')}
          <FormControlLabel control={<Switch checked={d.showEmergency !== false} onChange={(e) => set({ showEmergency: e.target.checked })} />} label="Tampilkan peringatan darurat" />
          {d.showEmergency !== false && (
            <>
              <TextField label="Nomor Darurat" value={d.emergencyNumber || ''} onChange={(e) => set({ emergencyNumber: e.target.value })} fullWidth size="small" helperText="Isi nomor darurat milik unit ini. Kosongkan bila tidak ada — peringatan tidak akan ditampilkan." />
              <TextField label="Teks Peringatan (opsional)" value={d.emergencyText || ''} onChange={(e) => set({ emergencyText: e.target.value })} fullWidth size="small" />
            </>
          )}

          <Divider />
          {sub('Informasi Kantor')}
          <TextField label="Judul Kartu Kantor" value={d.officeTitle || ''} onChange={(e) => set({ officeTitle: e.target.value })} fullWidth size="small" />
          <TextField label="Alamat" value={d.address || ''} onChange={(e) => set({ address: e.target.value })} fullWidth size="small" multiline minRows={2} />
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Telepon" value={d.phone || ''} onChange={(e) => set({ phone: e.target.value })} fullWidth size="small" /></Grid>
            <Grid size={6}><TextField label="Fax" value={d.fax || ''} onChange={(e) => set({ fax: e.target.value })} fullWidth size="small" /></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Email" value={d.email || ''} onChange={(e) => set({ email: e.target.value })} fullWidth size="small" /></Grid>
            <Grid size={6}><TextField label="Website" value={d.website || ''} onChange={(e) => set({ website: e.target.value })} fullWidth size="small" /></Grid>
          </Grid>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>Kolom yang dikosongkan tidak akan ditampilkan.</Typography>

          <Divider />
          {sub('Jam Operasional')}
          <TextField label="Judul" value={d.workingHoursTitle || ''} onChange={(e) => set({ workingHoursTitle: e.target.value })} fullWidth size="small" />
          {hours.map((h, i) => (
            <Grid container spacing={1} key={i} alignItems="center">
              <Grid size={5}><TextField label="Hari" value={h.day || ''} onChange={(e) => { const w = [...hours]; w[i] = { ...w[i], day: e.target.value }; set({ workingHours: w }) }} fullWidth size="small" /></Grid>
              <Grid size={6}><TextField label="Jam" value={h.hours || ''} onChange={(e) => { const w = [...hours]; w[i] = { ...w[i], hours: e.target.value }; set({ workingHours: w }) }} fullWidth size="small" placeholder="08.00 - 16.00 WITA" /></Grid>
              <Grid size={1}><IconButton size="small" color="error" onClick={() => set({ workingHours: hours.filter((_, idx) => idx !== i) })}><DeleteIcon fontSize="small" /></IconButton></Grid>
            </Grid>
          ))}
          <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => set({ workingHours: [...hours, { day: '', hours: '' }] })} sx={{ alignSelf: 'flex-start' }}>
            Tambah Baris Jam
          </Button>
          <TextField label="Catatan (opsional)" value={d.workingHoursNote || ''} onChange={(e) => set({ workingHoursNote: e.target.value })} fullWidth size="small" />

          <Divider />
          {sub('Formulir Pesan')}
          <FormControlLabel control={<Switch checked={d.showForm !== false} onChange={(e) => set({ showForm: e.target.checked })} />} label="Tampilkan formulir kirim pesan" />
          {d.showForm !== false && (
            <TextField label="Judul Formulir" value={d.formTitle || ''} onChange={(e) => set({ formTitle: e.target.value })} fullWidth size="small" />
          )}

          <Divider />
          {sub('Peta Lokasi')}
          <TextField label="Judul" value={d.mapTitle || ''} onChange={(e) => set({ mapTitle: e.target.value })} fullWidth size="small" />
          <TextField label="URL Embed Peta (src iframe Google Maps)" value={d.mapEmbed || ''} onChange={(e) => set({ mapEmbed: e.target.value })} fullWidth size="small" placeholder="https://www.google.com/maps/embed?..." />
          <TextField label="Link Google Maps (fallback tombol)" value={d.mapsLink || ''} onChange={(e) => set({ mapsLink: e.target.value })} fullWidth size="small" placeholder="https://maps.google.com/?q=..." />

          <Divider />
          {sub('Media Sosial')}
          <TextField label="Judul" value={d.socialTitle || ''} onChange={(e) => set({ socialTitle: e.target.value })} fullWidth size="small" />
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Facebook URL" value={d.facebook || ''} onChange={(e) => set({ facebook: e.target.value })} fullWidth size="small" /></Grid>
            <Grid size={6}><TextField label="Twitter URL" value={d.twitter || ''} onChange={(e) => set({ twitter: e.target.value })} fullWidth size="small" /></Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid size={6}><TextField label="Instagram URL" value={d.instagram || ''} onChange={(e) => set({ instagram: e.target.value })} fullWidth size="small" /></Grid>
            <Grid size={6}><TextField label="YouTube URL" value={d.youtube || ''} onChange={(e) => set({ youtube: e.target.value })} fullWidth size="small" /></Grid>
          </Grid>
        </Stack>
      )
    }
    default:
      return null
  }
}

export default PageBuilder
