import { useState, useEffect } from 'react'
import { Box, Container, Paper, Typography, Grid } from '@mui/material'
import { FiberManualRecord, Today, Event, DateRange, CalendarMonth, Visibility, People, QueryStats } from '@mui/icons-material'
import api from '../../utils/api'

const nf = (n) => (n ?? 0).toLocaleString('id-ID')

const VisitorStats = () => {
  const [d, setD] = useState(null)

  useEffect(() => {
    let active = true
    api.get('/public/statistik-kunjungan')
      .then((r) => { if (active) setD(r.data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  if (!d) return null

  const items = [
    { label: 'Online', value: d.online, icon: <FiberManualRecord sx={{ fontSize: 16 }} />, online: true },
    { label: 'Hari Ini', value: d.hari_ini, icon: <Today /> },
    { label: 'Kemarin', value: d.kemarin, icon: <Event /> },
    { label: 'Minggu Ini', value: d.minggu_ini, icon: <DateRange /> },
    { label: 'Bulan Ini', value: d.bulan_ini, icon: <CalendarMonth /> },
    { label: 'Total Kunjungan', value: d.total, icon: <Visibility /> },
    { label: 'Total Pengunjung', value: d.total_pengunjung, icon: <People /> }
  ]

  return (
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.paper' }}>
      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <QueryStats sx={{ color: 'primary.main' }} />
          <Typography variant="h5" sx={{ fontWeight: 700, fontSize: { xs: '1.35rem', md: '1.6rem' } }}>
            Statistik Pengunjung
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {items.map((it) => (
            <Grid size={{ xs: 6, sm: 4, md: 12 / 7 }} key={it.label}>
              <Paper
                sx={{
                  p: { xs: 1.75, md: 2 },
                  borderRadius: 3,
                  height: '100%',
                  textAlign: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': { boxShadow: 3, transform: 'translateY(-2px)' }
                }}
              >
                <Box
                  sx={{
                    width: 40, height: 40, mx: 'auto', mb: 1, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: it.online ? 'success.light' : 'primary.light',
                    color: it.online ? 'success.dark' : 'primary.dark'
                  }}
                >
                  {it.icon}
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.15rem', md: '1.4rem' }, lineHeight: 1.1, color: it.online ? 'success.main' : 'text.primary' }}>
                  {nf(it.value)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                  {it.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default VisitorStats
