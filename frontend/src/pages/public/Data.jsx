import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment
} from '@mui/material'
import { Analytics, Assessment, Info, Search } from '@mui/icons-material'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import DocumentList from '../../components/public/DocumentList'
import api from '../../utils/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { renderIcon } from '../../utils/iconRegistry'

/**
 * Public data page.
 *
 * Everything here is admin-managed: statistics come from the Statistik module,
 * reports from the Dokumen module. Nothing is hardcoded — the previous version
 * shipped invented population figures, health indicators and a directory of
 * hospitals with addresses and phone numbers, all presented as official data.
 *
 * The old "facility directory" tab is gone: no module backs it, and a fabricated
 * directory is worse than no directory.
 */
const Data = () => {
  const { t } = useLanguage()
  const [tabValue, setTabValue] = useState(0)

  const [stats, setStats] = useState([])
  const [docs, setDocs] = useState([])
  const [categories, setCategories] = useState([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingDocs, setLoadingDocs] = useState(true)

  const [docCategory, setDocCategory] = useState('')
  const [docSearch, setDocSearch] = useState('')

  useEffect(() => {
    let active = true
    api.get('/public/statistik')
      .then((r) => { if (active) setStats(Array.isArray(r.data) ? r.data : []) })
      .catch(() => { if (active) setStats([]) })
      .finally(() => { if (active) setLoadingStats(false) })
    api.get('/public/dokumen-kategori')
      .then((r) => { if (active) setCategories(Array.isArray(r.data) ? r.data : []) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoadingDocs(true)
    const params = new URLSearchParams()
    if (docCategory) params.set('kategori', docCategory)
    if (docSearch.trim()) params.set('search', docSearch.trim())
    const qs = params.toString()
    api.get(`/public/dokumen${qs ? `?${qs}` : ''}`)
      .then((r) => { if (active) setDocs(Array.isArray(r.data) ? r.data : []) })
      .catch(() => { if (active) setDocs([]) })
      .finally(() => { if (active) setLoadingDocs(false) })
    return () => { active = false }
  }, [docCategory, docSearch])

  return (
    <Box>
      <PageHeader
        title={t('data.pageTitle')}
        subtitle={t('data.pageSubtitle')}
        breadcrumbs={[
          { label: t('nav.beranda'), href: '/' },
          { label: t('nav.data') }
        ]}
        badge={{ label: t('data.badgePublicInfo'), color: 'info' }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Paper sx={{ mb: { xs: 3, md: 4 }, borderRadius: 3, overflow: 'hidden' }}>
          <Tabs
            value={tabValue}
            onChange={(e, v) => setTabValue(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={t('data.tabStats')} icon={<Analytics />} iconPosition="start" />
            <Tab label={t('data.tabPublicReports')} icon={<Assessment />} iconPosition="start" />
          </Tabs>
        </Paper>

        {/* ---------------- Statistics ---------------- */}
        {tabValue === 0 && (
          loadingStats ? (
            <LoadingState message={t('data.loadingStats')} />
          ) : stats.length === 0 ? (
            <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}>
              <Analytics sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>{t('data.statsEmptyTitle')}</Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('data.statsEmptySubtitle')}
              </Typography>
            </Paper>
          ) : (
            <Grid container spacing={2}>
              {stats.map((s) => (
                <Grid size={{ xs: 6, sm: 4, md: 3 }} key={s.id_statistik}>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      borderRadius: 3,
                      height: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5
                    }}
                  >
                    <Box
                      sx={{
                        width: 44, height: 44, borderRadius: 2,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: `${s.color || 'primary'}.light`,
                        color: `${s.color || 'primary'}.dark`
                      }}
                    >
                      {renderIcon(s.icon)}
                    </Box>
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {s.nilai}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {s.label}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )
        )}

        {/* ---------------- Public reports ---------------- */}
        {tabValue === 1 && (
          <Box>
            <Paper sx={{ p: { xs: 2, md: 2.5 }, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <TextField
                fullWidth size="small"
                placeholder={t('data.searchDocuments')}
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                inputProps={{ 'aria-label': t('data.searchDocuments') }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search color="primary" /></InputAdornment>
                }}
                sx={{ mb: categories.length ? 2 : 0 }}
              />
              {categories.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                  <Chip
                    label={t('common.all')}
                    color={docCategory === '' ? 'primary' : 'default'}
                    onClick={() => setDocCategory('')}
                  />
                  {categories.map((c) => (
                    <Chip
                      key={c.id_kategori_dokumen}
                      label={`${c.nama}${c.dokumen_count != null ? ` (${c.dokumen_count})` : ''}`}
                      color={docCategory === c.slug ? 'primary' : 'default'}
                      onClick={() => setDocCategory(c.slug)}
                    />
                  ))}
                </Stack>
              )}
            </Paper>

            {loadingDocs
              ? <LoadingState message={t('data.loadingDocuments')} />
              : <DocumentList documents={docs} emptyText={t('data.documentsEmpty')} />}
          </Box>
        )}

        {/* Ask-for-data note */}
        <Paper sx={{ p: { xs: 3, md: 4 }, mt: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Info />
            {t('data.additionalInfoTitle')}
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {t('data.additionalInfoText')}
          </Typography>
          <Button variant="contained" color="info" component={Link} to="/kontak" sx={{ fontWeight: 600 }}>
            {t('data.contactUs')}
          </Button>
        </Paper>
      </Container>
    </Box>
  )
}

export default Data
