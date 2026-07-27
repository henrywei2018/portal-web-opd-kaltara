import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Grid, Card, CardContent, Typography, Box, Paper, Button, Avatar, Chip,
  List, ListItem, ListItemText, ListItemAvatar, Divider, Stack, Tooltip, TextField, CircularProgress
} from '@mui/material'
import {
  Article as ArticleIcon,
  Announcement as AnnouncementIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  Folder as DokumenIcon,
  Description as ArtikelIcon,
  Assessment as InfografisIcon,
  People as UserIcon,
  Mail as MessageIcon,
  Visibility,
  Insights,
  GetApp,
  Add,
  Edit,
  History as HistoryIcon,
  Whatshot,
  ArrowForward,
  FiberManualRecord
} from '@mui/icons-material'
import api from '../../utils/api'
import LoadingState from '../../components/ui/LoadingState'
import { formatDateTime } from '../../utils/formatters'
import { useSettings } from '../../contexts/SettingsContext'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const gambarUrl = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${API_ORIGIN}/gambar/${src}`))
const nf = (n) => (n ?? 0).toLocaleString('id-ID')

// Categorical series colors (blue / amber — a colorblind-safe pair)
const C_BERITA = '#0E5AB8'
const C_PESAN = '#F59E0B'

// Humanise an audit-log action key like "tambah_berita" → "Tambah berita"
const humanizeAksi = (a) => (a || '').replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

// ---- Small dependency-free charts (CSS/flex) ----

// 6-month grouped bar trend: berita published + messages received
const TrendChart = ({ data = [] }) => {
  const max = Math.max(1, ...data.flatMap((d) => [d.berita, d.pesan]))
  return (
    <Box>
      {/* Legend */}
      <Stack direction="row" spacing={2.5} sx={{ mb: 2 }}>
        {[{ c: C_BERITA, l: 'Berita' }, { c: C_PESAN, l: 'Pesan Masuk' }].map((s) => (
          <Box key={s.l} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 12, height: 12, borderRadius: '3px', bgcolor: s.c }} />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{s.l}</Typography>
          </Box>
        ))}
      </Stack>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: { xs: 1, sm: 2 }, height: 200, px: 0.5 }}>
        {data.map((d, i) => (
          <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.75, height: 170, width: '100%', justifyContent: 'center' }}>
              {[{ v: d.berita, c: C_BERITA, l: 'Berita' }, { v: d.pesan, c: C_PESAN, l: 'Pesan' }].map((s, j) => (
                <Tooltip key={j} title={`${s.l}: ${nf(s.v)}`} arrow>
                  <Box
                    sx={{
                      width: { xs: 10, sm: 16 },
                      height: `${Math.max(2, (s.v / max) * 100)}%`,
                      minHeight: 2,
                      bgcolor: s.c,
                      borderRadius: '4px 4px 0 0',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.8 }
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem', whiteSpace: 'nowrap' }}>
              {d.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Content distribution — single-hue horizontal bars, sorted desc
const DistributionBars = ({ data = [] }) => {
  const rows = [...data].sort((a, b) => b.count - a.count)
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <Stack spacing={1.5}>
      {rows.map((r) => (
        <Box key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ width: 96, flexShrink: 0, color: 'text.secondary', fontSize: '0.82rem' }}>
            {r.label}
          </Typography>
          <Box sx={{ flexGrow: 1, height: 10, bgcolor: 'action.hover', borderRadius: 5, overflow: 'hidden' }}>
            <Box sx={{ width: `${(r.count / max) * 100}%`, height: '100%', minWidth: r.count > 0 ? 6 : 0, background: 'linear-gradient(90deg, #0E5AB8, #4FC3F7)', borderRadius: 5 }} />
          </Box>
          <Typography variant="body2" sx={{ width: 36, textAlign: 'right', fontWeight: 700, fontSize: '0.85rem' }}>
            {nf(r.count)}
          </Typography>
        </Box>
      ))}
    </Stack>
  )
}

// Daily site-traffic bars (single series). Bars fit the container width; labels
// are thinned to ~10 so a long range stays readable without horizontal scroll.
const DailyBars = ({ data = [] }) => {
  const max = Math.max(1, ...data.map((d) => d.views))
  const step = data.length > 16 ? Math.ceil(data.length / 10) : 1
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.4, height: 150 }}>
      {data.map((d, i) => (
        <Box key={i} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
          <Box sx={{ height: 120, width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <Tooltip title={`${d.label} — ${nf(d.views)} kunjungan`} arrow>
              <Box sx={{ width: '72%', maxWidth: 22, height: `${Math.max(2, (d.views / max) * 100)}%`, minHeight: 2, bgcolor: '#0E5AB8', borderRadius: '4px 4px 0 0', transition: 'opacity 0.2s', '&:hover': { opacity: 0.8 } }} />
            </Tooltip>
          </Box>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.58rem', whiteSpace: 'nowrap', height: 14, lineHeight: '14px' }}>
            {i % step === 0 ? d.label : ''}
          </Typography>
        </Box>
      ))}
    </Box>
  )
}

const todayStr = () => new Date().toISOString().slice(0, 10)
const daysAgoStr = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().slice(0, 10) }

// Filterable, exportable site-traffic report panel
const TrafficPanel = ({ allTime = {} }) => {
  const [from, setFrom] = useState(daysAgoStr(29))
  const [to, setTo] = useState(todayStr())
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = (f, t) => {
    setLoading(true)
    api.get('/admin/laporan-kunjungan', { params: { from: f, to: t } })
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }
  // Initial load: only setState asynchronously (loading starts true)
  useEffect(() => {
    api.get('/admin/laporan-kunjungan', { params: { from, to } })
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const exportCsv = () => {
    if (!report) return
    const rows = [
      ['Laporan Kunjungan Situs'],
      ['Periode', `${report.from} s/d ${report.to}`],
      ['Total Kunjungan', report.total_pageviews],
      ['Pengunjung Unik', report.unique_visitors],
      [],
      ['Tanggal', 'Kunjungan'],
      ...report.daily.map((d) => [d.date, d.views]),
      [],
      ['Halaman', 'Kunjungan'],
      ...report.top_pages.map((p) => [p.path, p.total]),
      [],
      ['Sumber Rujukan', 'Kunjungan'],
      ...report.top_referrers.map((r) => [r.referrer, r.total])
    ]
    const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `laporan-kunjungan-${report.from}_${report.to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
      {/* Header + filter controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Insights sx={{ color: '#0E5AB8' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Kunjungan Situs</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TextField type="date" size="small" label="Dari" InputLabelProps={{ shrink: true }} value={from} onChange={(e) => setFrom(e.target.value)} sx={{ width: 160 }} />
          <TextField type="date" size="small" label="Sampai" InputLabelProps={{ shrink: true }} value={to} onChange={(e) => setTo(e.target.value)} sx={{ width: 160 }} />
          <Button variant="contained" size="small" onClick={() => load(from, to)} disabled={loading}>Terapkan</Button>
          <Button variant="outlined" size="small" startIcon={<GetApp />} onClick={exportCsv} disabled={!report}>CSV</Button>
        </Box>
      </Box>

      {loading || !report ? (
        <Box sx={{ py: 6, textAlign: 'center' }}><CircularProgress size={24} /></Box>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {/* KPIs for the selected range */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>{nf(report.total_pageviews)}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Kunjungan (periode)</Typography>
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1 }}>{nf(report.unique_visitors)}</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>Pengunjung Unik</Typography>
              </Box>
              <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: '#0E5AB812', border: '1px solid', borderColor: '#0E5AB830' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Keseluruhan (sejak awal)</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0E5AB8' }}>
                  {nf(allTime.total_pageviews)} kunjungan · {nf(allTime.unique_visitors)} pengunjung
                </Typography>
              </Box>
            </Stack>
          </Grid>
          {/* Daily chart */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Kunjungan harian ({report.from} — {report.to})</Typography>
            <Box sx={{ mt: 1.5 }}>
              <DailyBars data={report.daily} />
            </Box>
          </Grid>
          {/* Top pages + referrers */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>Halaman Terpopuler</Typography>
            <Stack spacing={0.75} sx={{ mb: 2 }}>
              {report.top_pages.slice(0, 5).map((pg, i) => (
                <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                    {pg.path === '/' ? '/ (Beranda)' : pg.path}
                  </Typography>
                  <Chip label={nf(pg.total)} size="small" sx={{ height: 20, fontWeight: 700 }} />
                </Box>
              ))}
            </Stack>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 1 }}>Sumber Rujukan</Typography>
            {report.top_referrers.length === 0 ? (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>Langsung / tanpa rujukan</Typography>
            ) : (
              <Stack spacing={0.75}>
                {report.top_referrers.slice(0, 4).map((r, i) => (
                  <Box key={i} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'text.secondary' }}>
                      {(r.referrer || '').replace(/^https?:\/\//, '').slice(0, 24)}
                    </Typography>
                    <Chip label={nf(r.total)} size="small" sx={{ height: 20, fontWeight: 700 }} />
                  </Box>
                ))}
              </Stack>
            )}
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}

const StatTile = ({ label, value, icon, color, link, sub }) => {
  const inner = (
    <Card
      sx={{
        borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all 0.2s',
        '&:hover': link ? { boxShadow: 4, transform: 'translateY(-2px)', borderColor: color } : {}
      }}
    >
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar variant="rounded" sx={{ bgcolor: `${color}1A`, color, width: 46, height: 46 }}>{icon}</Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.1 }}>{nf(value)}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>{label}</Typography>
          {sub && <Typography variant="caption" sx={{ color: 'text.disabled' }}>{sub}</Typography>}
        </Box>
      </CardContent>
    </Card>
  )
  return link ? <Box component={Link} to={link} sx={{ textDecoration: 'none', display: 'block', height: '100%' }}>{inner}</Box> : inner
}

const Dashboard = () => {
  const { settings } = useSettings()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingState message="Memuat dashboard..." />
  if (!data) return <Box sx={{ p: 3 }}>Gagal memuat data dashboard.</Box>

  const s = data.stats || {}
  const traffic = data.traffic || {}
  const draft = (s.count_berita || 0) - (s.count_berita_pub || 0)

  const tiles = [
    { label: 'Total Dilihat', value: s.count_berita_views, icon: <Visibility />, color: '#6366F1', sub: 'Akumulasi view berita' },
    { label: 'Total Berita', value: s.count_berita, icon: <ArticleIcon />, color: '#0E5AB8', link: '/admin/berita', sub: `${nf(s.count_berita_pub)} terbit · ${nf(draft)} draft` },
    { label: 'Artikel', value: s.count_artikel, icon: <ArtikelIcon />, color: '#0D9488', link: '/admin/artikel' },
    { label: 'Infografis', value: s.count_infografis, icon: <InfografisIcon />, color: '#EA580C', link: '/admin/infografis' },
    { label: 'Galeri', value: s.count_galeri, icon: <ImageIcon />, color: '#7C3AED', link: '/admin/galeri' },
    { label: 'Video', value: s.count_video, icon: <VideoIcon />, color: '#DC2626', link: '/admin/video' },
    { label: 'Dokumen', value: s.count_dokumen, icon: <DokumenIcon />, color: '#0891B2', link: '/admin/dokumen' },
    { label: 'Pengumuman', value: s.count_pengumuman, icon: <AnnouncementIcon />, color: '#D97706', link: '/admin/pengumuman' },
    { label: 'Pengguna', value: s.count_user, icon: <UserIcon />, color: '#DB2777', link: '/admin/users' },
    { label: 'Pesan Masuk', value: s.count_pesan, icon: <MessageIcon />, color: '#2563EB', link: '/admin/pesan', sub: s.count_unread > 0 ? `${nf(s.count_unread)} belum dibaca` : 'Semua dibaca' }
  ]

  const quickActions = [
    { title: 'Tambah Berita', icon: <Add />, link: '/admin/berita', color: '#0E5AB8' },
    { title: 'Upload Infografis', icon: <Add />, link: '/admin/infografis', color: '#EA580C' },
    { title: 'Buat Pengumuman', icon: <Add />, link: '/admin/pengumuman', color: '#D97706' },
    { title: 'Kelola Halaman', icon: <Edit />, link: '/admin/halaman', color: '#0D9488' }
  ]

  return (
    <Box>
      {/* Welcome header */}
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: 3, background: 'linear-gradient(135deg, #0B3D7D 0%, #0E5AB8 55%, #2E90E5 100%)', color: 'white', boxShadow: '0 4px 16px rgba(13,71,161,0.25)' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>Dashboard</Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Ringkasan konten dan aktivitas {settings.site_title || 'Portal Resmi'}
        </Typography>
      </Paper>

      {/* Site traffic — filterable report (real, from visit tracking) */}
      <TrafficPanel allTime={traffic} />

      {/* Stat tiles */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {tiles.map((t) => (
          <Grid size={{ xs: 6, sm: 4, md: 3, lg: 2.4 }} key={t.label}>
            <StatTile {...t} />
          </Grid>
        ))}
      </Grid>

      {/* Charts */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>Tren 6 Bulan Terakhir</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>Berita terbit & pesan masuk per bulan</Typography>
            <Box sx={{ mt: 2 }}>
              <TrendChart data={data.chart_data || []} />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Distribusi Konten</Typography>
            <DistributionBars data={data.content_mix || []} />
          </Paper>
        </Grid>
      </Grid>

      {/* Popular news + recent messages + activity */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Berita terpopuler */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Whatshot sx={{ color: '#EA580C' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Berita Terpopuler</Typography>
            </Box>
            {(data.berita_terpopuler || []).length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Belum ada data.</Typography>
            ) : (
              <Stack spacing={1.5}>
                {data.berita_terpopuler.map((b, i) => (
                  <Box key={b.id_berita} component={Link} to={`/berita/${b.slug || b.id_berita}`} target="_blank" sx={{ display: 'flex', alignItems: 'center', gap: 1.5, textDecoration: 'none', color: 'inherit', p: 1, borderRadius: 2, '&:hover': { bgcolor: 'action.hover' } }}>
                    <Typography sx={{ fontWeight: 800, color: 'text.disabled', width: 20, textAlign: 'center', flexShrink: 0 }}>{i + 1}</Typography>
                    {b.gambar
                      ? <Box component="img" src={gambarUrl(b.gambar)} alt="" sx={{ width: 44, height: 44, borderRadius: 1.5, objectFit: 'cover', flexShrink: 0 }} />
                      : <Avatar variant="rounded" sx={{ width: 44, height: 44, bgcolor: 'action.hover', color: 'text.disabled' }}><ArticleIcon fontSize="small" /></Avatar>}
                    <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>{b.judul}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mt: 0.25 }}>
                        <Visibility sx={{ fontSize: 14 }} />
                        <Typography variant="caption">{nf(b.views)} dilihat</Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Pesan terbaru */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MessageIcon sx={{ color: '#2563EB' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Pesan Terbaru</Typography>
              </Box>
              <Button component={Link} to="/admin/pesan" size="small" endIcon={<ArrowForward />}>Semua</Button>
            </Box>
            {(data.pesan_terbaru || []).length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Belum ada pesan.</Typography>
            ) : (
              <List disablePadding>
                {data.pesan_terbaru.map((m, i) => (
                  <Box key={m.id_komentar || i}>
                    <ListItem disableGutters sx={{ py: 1 }}>
                      <ListItemAvatar sx={{ minWidth: 44 }}>
                        <Avatar sx={{ width: 34, height: 34, bgcolor: m.is_read ? 'action.hover' : 'primary.main', color: m.is_read ? 'text.secondary' : '#fff', fontSize: '0.9rem' }}>
                          {(m.nama || '?').charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <Typography variant="body2" sx={{ fontWeight: m.is_read ? 500 : 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.nama}</Typography>
                          {!m.is_read && <FiberManualRecord sx={{ fontSize: 9, color: 'error.main' }} />}
                        </Box>}
                        secondary={<Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.subjek}</Typography>}
                      />
                    </ListItem>
                    {i < data.pesan_terbaru.length - 1 && <Divider component="li" />}
                  </Box>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Aktivitas terbaru (audit) */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, height: '100%', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryIcon sx={{ color: 'text.secondary' }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Aktivitas Terbaru</Typography>
            </Box>
            {(data.audit_terbaru || []).length === 0 ? (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>Belum ada aktivitas.</Typography>
            ) : (
              <Stack spacing={1.75}>
                {data.audit_terbaru.map((a, i) => (
                  <Box key={a.id || i} sx={{ display: 'flex', gap: 1.25 }}>
                    <FiberManualRecord sx={{ fontSize: 10, color: 'primary.main', mt: 0.75, flexShrink: 0 }} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.82rem', lineHeight: 1.3 }}>{humanizeAksi(a.aksi)}</Typography>
                      {a.detail && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.detail}</Typography>}
                      <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.68rem' }}>
                        {a.nama_user} · {a.created_at ? formatDateTime(a.created_at) : ''}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Aksi Cepat</Typography>
        <Grid container spacing={2}>
          {quickActions.map((q) => (
            <Grid size={{ xs: 6, md: 3 }} key={q.title}>
              <Button
                component={Link}
                to={q.link}
                fullWidth
                startIcon={q.icon}
                sx={{
                  py: 1.5, borderRadius: 2, justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600,
                  color: q.color, bgcolor: `${q.color}12`, border: '1px solid', borderColor: `${q.color}30`,
                  '&:hover': { bgcolor: `${q.color}22` }
                }}
              >
                {q.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export default Dashboard
