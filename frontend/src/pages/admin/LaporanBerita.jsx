import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  Chip,
  Tooltip,
  IconButton,
  Link,
  Snackbar,
  CircularProgress
} from '@mui/material'
import {
  Summarize as ReportIcon,
  GetApp as ExportIcon,
  Refresh as RefreshIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  Visibility as ViewsIcon,
  Article as ArticleIcon,
  CheckCircle as PublishIcon,
  DriveFileRenameOutline as DraftIcon
} from '@mui/icons-material'
import api from '../../utils/api'

// Recharts is heavy and this app has no route-based code splitting — keep it out
// of the bundle every public visitor downloads.
const LaporanBeritaCharts = lazy(() => import('../../components/admin/LaporanBeritaCharts'))

const todayStr = () => new Date().toISOString().slice(0, 10)
const monthsAgoStr = (n) => {
  const d = new Date()
  d.setMonth(d.getMonth() - n)
  return d.toISOString().slice(0, 10)
}

const COLUMNS = [
  { key: 'tanggal', label: 'Tanggal Rilis', sortable: true, width: 130 },
  { key: 'judul', label: 'Judul Berita', sortable: true },
  { key: 'kategori', label: 'Kategori', sortable: true, width: 160 },
  { key: 'penulis', label: 'Penulis', sortable: false, width: 140 },
  { key: 'status', label: 'Status', sortable: true, width: 100 },
  { key: 'views', label: 'Jumlah View', sortable: true, width: 120, align: 'right' },
  { key: 'link', label: 'Link', sortable: false, width: 90, align: 'center' }
]

const formatDateId = (iso) => {
  if (!iso) return '-'
  const d = new Date(`${iso}T00:00:00`)
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

const SummaryCard = ({ icon, label, value, color }) => (
  <Paper sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      <Box
        sx={{
          width: 40, height: 40, borderRadius: 2, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          bgcolor: `${color}.light`, color: `${color}.dark`, flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>{value}</Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>{label}</Typography>
      </Box>
    </Box>
  </Paper>
)

const LaporanBerita = () => {
  // Applied filters — what the table currently reflects.
  const [filters, setFilters] = useState({
    from: monthsAgoStr(3),
    to: todayStr(),
    kategori: '',
    penulis: '',
    status: '',
    search: ''
  })
  // Draft filters — what the user is editing before pressing "Terapkan".
  const [draft, setDraft] = useState(filters)

  const [sort, setSort] = useState('tanggal')
  const [dir, setDir] = useState('desc')
  const [page, setPage] = useState(0) // MUI TablePagination is 0-indexed
  const [perPage, setPerPage] = useState(25)

  const [rows, setRows] = useState([])
  const [grafik, setGrafik] = useState(null)
  const [summary, setSummary] = useState(null)
  const [meta, setMeta] = useState({ total: 0, last_page: 1 })
  const [options, setOptions] = useState({ kategori: [], penulis: [], status: [] })
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast] = useState('')
  const [reloadToken, setReloadToken] = useState(0)

  // Only the filters scope the charts — paging and sorting the table must not
  // refetch (or change) the aggregates.
  const filterParams = useMemo(() => {
    const p = {}
    Object.entries(filters).forEach(([k, v]) => { if (v) p[k] = v })
    return p
  }, [filters])

  const queryParams = useMemo(
    () => ({ ...filterParams, sort, dir, per_page: perPage, page: page + 1 }),
    [filterParams, sort, dir, page, perPage]
  )

  const load = useCallback(() => {
    setLoading(true)
    return api.get('/admin/laporan/berita', { params: queryParams })
      .then((r) => {
        setRows(r.data?.data || [])
        setSummary(r.data?.summary || null)
        setMeta(r.data?.meta || { total: 0, last_page: 1 })
      })
      .catch((error) => {
        console.error('Error fetching laporan berita:', error)
        setRows([])
        setSummary(null)
        setToast('Gagal memuat laporan.')
      })
      .finally(() => setLoading(false))
  }, [queryParams, reloadToken]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadGrafik = useCallback(() => {
    setChartLoading(true)
    return api.get('/admin/laporan/berita/grafik', { params: filterParams })
      .then((r) => setGrafik(r.data))
      .catch((error) => {
        console.error('Error fetching grafik laporan:', error)
        setGrafik(null)
      })
      .finally(() => setChartLoading(false))
  }, [filterParams, reloadToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])
  useEffect(() => { loadGrafik() }, [loadGrafik])

  useEffect(() => {
    api.get('/admin/laporan/berita/filters')
      .then((r) => setOptions({
        kategori: r.data?.kategori || [],
        penulis: r.data?.penulis || [],
        status: r.data?.status || []
      }))
      .catch(() => {})
  }, [])

  const handleSort = (key) => {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSort(key); setDir(key === 'judul' || key === 'kategori' ? 'asc' : 'desc') }
    setPage(0)
  }

  const applyFilters = () => { setFilters(draft); setPage(0) }

  const resetFilters = () => {
    const blank = { from: '', to: '', kategori: '', penulis: '', status: '', search: '' }
    setDraft(blank)
    setFilters(blank)
    setPage(0)
  }

  const publicUrl = (path) => `${window.location.origin}${path}`

  const copyLink = async (path) => {
    try {
      await navigator.clipboard.writeText(publicUrl(path))
      setToast('Link disalin.')
    } catch {
      setToast('Gagal menyalin link.')
    }
  }

  const periodeLabel = () => {
    const { from, to } = filters
    if (from && to) return `${formatDateId(from)} s/d ${formatDateId(to)}`
    if (from) return `Sejak ${formatDateId(from)}`
    if (to) return `Sampai ${formatDateId(to)}`
    return 'Seluruh periode'
  }

  // Export pulls the whole filtered set in the current sort order — not just
  // the page on screen — so the file matches what the filters describe.
  const exportCsv = async () => {
    setExporting(true)
    try {
      const r = await api.get('/admin/laporan/berita', {
        params: { ...queryParams, per_page: 1000, page: 1 }
      })
      const all = r.data?.data || []
      const s = r.data?.summary || {}
      const table = [
        ['LAPORAN REKAPITULASI BERITA'],
        ['Periode', periodeLabel()],
        ['Diekspor', new Date().toLocaleString('id-ID')],
        ['Jumlah Berita', s.jumlah_berita ?? all.length],
        ['Total View', s.total_views ?? ''],
        ['Rata-rata View', s.rata_views ?? ''],
        ['Terbit', s.terbit ?? ''],
        ['Draft', s.draft ?? ''],
        [],
        ['No', 'Tanggal Rilis', 'Judul Berita', 'Kategori', 'Penulis', 'Status', 'Jumlah View', 'Link'],
        ...all.map((row, i) => [
          i + 1,
          row.tanggal_post || '',
          row.judul || '',
          row.kategori || '',
          row.penulis || '',
          row.status_berita || '',
          row.views ?? 0,
          publicUrl(row.path)
        ])
      ]
      const csv = table
        .map((line) => line.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
        .join('\n')
      // BOM so Excel opens UTF-8 titles correctly
      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `laporan-berita-${filters.from || 'awal'}_${filters.to || todayStr()}.csv`
      a.click()
      URL.revokeObjectURL(url)
      if (all.length < (s.jumlah_berita ?? 0)) {
        setToast(`Diekspor ${all.length} dari ${s.jumlah_berita} baris (batas 1000 per file).`)
      } else {
        setToast(`${all.length} baris diekspor.`)
      }
    } catch (error) {
      console.error('Error exporting laporan:', error)
      setToast('Gagal mengekspor laporan.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ReportIcon sx={{ color: '#0E5AB8' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>Laporan Berita</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Rekapitulasi judul, tanggal rilis, jumlah view, dan link publikasi
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => setReloadToken((t) => t + 1)}
            disabled={loading}
          >
            Muat Ulang
          </Button>
          <Button
            variant="contained"
            startIcon={exporting ? <CircularProgress size={16} color="inherit" /> : <ExportIcon />}
            onClick={exportCsv}
            disabled={exporting || loading || rows.length === 0}
          >
            Ekspor CSV
          </Button>
        </Box>
      </Box>

      {/* Filter bar */}
      <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField
              type="date" size="small" fullWidth label="Dari Tanggal"
              InputLabelProps={{ shrink: true }}
              value={draft.from}
              onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <TextField
              type="date" size="small" fullWidth label="Sampai Tanggal"
              InputLabelProps={{ shrink: true }}
              value={draft.to}
              onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="lap-kategori">Kategori</InputLabel>
              <Select
                labelId="lap-kategori" label="Kategori" value={draft.kategori}
                onChange={(e) => setDraft((d) => ({ ...d, kategori: e.target.value }))}
              >
                <MenuItem value=""><em>Semua Kategori</em></MenuItem>
                {options.kategori.map((k) => (
                  <MenuItem key={k.idkat} value={k.idkat.toString()}>{k.nmkat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="lap-penulis">Penulis</InputLabel>
              <Select
                labelId="lap-penulis" label="Penulis" value={draft.penulis}
                onChange={(e) => setDraft((d) => ({ ...d, penulis: e.target.value }))}
              >
                <MenuItem value=""><em>Semua Penulis</em></MenuItem>
                {options.penulis.map((u) => (
                  <MenuItem key={u.id_user} value={u.id_user.toString()}>{u.nama}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 6, sm: 4, md: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="lap-status">Status</InputLabel>
              <Select
                labelId="lap-status" label="Status" value={draft.status}
                onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}
              >
                <MenuItem value=""><em>Semua Status</em></MenuItem>
                {options.status.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              size="small" fullWidth label="Cari judul"
              value={draft.search}
              onChange={(e) => setDraft((d) => ({ ...d, search: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            />
          </Grid>
          <Grid size={12}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="contained" size="small" onClick={applyFilters} disabled={loading}>Terapkan</Button>
              <Button variant="text" size="small" onClick={resetFilters}>Reset</Button>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                Periode: {periodeLabel()}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard icon={<ArticleIcon />} color="primary" label="Jumlah Berita" value={summary.jumlah_berita} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard icon={<ViewsIcon />} color="info" label={`Total View (rata-rata ${summary.rata_views})`} value={summary.total_views} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard icon={<PublishIcon />} color="success" label="Terbit" value={summary.terbit} />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <SummaryCard icon={<DraftIcon />} color="warning" label="Draft" value={summary.draft} />
          </Grid>
        </Grid>
      )}

      {/* Charts — scoped by the same filter row above, never their own filters */}
      <Box sx={{ mb: 3 }}>
        <Suspense
          fallback={
            <Paper sx={{ p: 6, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
              <CircularProgress size={28} />
            </Paper>
          }
        >
          <LaporanBeritaCharts grafik={grafik} loading={chartLoading} />
        </Suspense>
      </Box>

      {/* Recap table */}
      <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" sx={{ minWidth: 900 }}>
            <TableHead>
              <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'action.hover', whiteSpace: 'nowrap' } }}>
                <TableCell sx={{ width: 56 }}>No</TableCell>
                {COLUMNS.map((col) => (
                  <TableCell key={col.key} align={col.align || 'left'} sx={{ width: col.width }}>
                    {col.sortable ? (
                      <TableSortLabel
                        active={sort === col.key}
                        direction={sort === col.key ? dir : 'asc'}
                        onClick={() => handleSort(col.key)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={COLUMNS.length + 1} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Tidak ada berita pada filter ini.
                  </TableCell>
                </TableRow>
              ) : rows.map((row, i) => (
                <TableRow key={row.id_berita} hover>
                  <TableCell sx={{ color: 'text.secondary' }}>{page * perPage + i + 1}</TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateId(row.tanggal_post)}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{row.judul}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.kategori || '-'}</TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{row.penulis || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status_berita}
                      color={row.status_berita === 'Publish' ? 'success' : 'default'}
                      variant={row.status_berita === 'Publish' ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    {Number(row.views).toLocaleString('id-ID')}
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Tooltip title={publicUrl(row.path)}>
                      <IconButton
                        size="small"
                        component={Link}
                        href={publicUrl(row.path)}
                        target="_blank"
                        rel="noopener"
                        aria-label={`Buka ${row.judul}`}
                      >
                        <OpenIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Salin link">
                      <IconButton size="small" onClick={() => copyLink(row.path)} aria-label="Salin link">
                        <CopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={meta.total || 0}
          page={page}
          onPageChange={(e, value) => setPage(value)}
          rowsPerPage={perPage}
          onRowsPerPageChange={(e) => { setPerPage(parseInt(e.target.value, 10)); setPage(0) }}
          rowsPerPageOptions={[10, 25, 50, 100]}
          labelRowsPerPage="Baris per halaman"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} dari ${count}`}
        />
      </Paper>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  )
}

export default LaporanBerita
