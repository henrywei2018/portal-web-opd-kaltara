import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Alert
} from '@mui/material'
import {
  Search,
  Description,
  Emergency,
  Assignment,
  CheckCircle,
  Schedule,
  AttachMoney,
  Phone,
  LocationOn,
  ExpandMore,
  AccessTime,
  Info,
  Warning,
  Email
} from '@mui/icons-material'
import PageHeader from '../../components/ui/PageHeader'
import LoadingState from '../../components/ui/LoadingState'
import api from '../../utils/api'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSettings } from '../../contexts/SettingsContext'
import { renderIcon, categoryColor } from '../../utils/iconRegistry'


const Layanan = () => {
  const { t } = useLanguage()
  const { settings } = useSettings()
  // No hardcoded default: an agency without an emergency line shows no banner.
  const emergencyNum = (settings.telepon_darurat || '').trim()
  const [expanded, setExpanded] = useState('panel1')
  const [searchTerm, setSearchTerm] = useState('')
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    api.get('/public/layanan')
      .then((r) => { if (active) setServices(Array.isArray(r.data) ? r.data : []) })
      .catch(() => { if (active) setServices([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  // Services come from the API only. There is deliberately no static fallback:
  // requirements, fees and processing times are official information, and
  // inventing them when the list is empty would mislead the public.
  const healthServices = services.map((s) => ({
        id: `panel${s.id_layanan}`,
        title: s.judul,
        icon: renderIcon(s.icon),
        color: s.color || 'primary',
        category: s.kategori || 'Lainnya',
        description: s.deskripsi || '',
        requirements: s.persyaratan || [],
        processingTime: s.waktu || '-',
        cost: s.biaya || '-',
        validity: s.masa_berlaku || '-',
        procedure: s.prosedur || [],
        // Kept empty rather than '-' so callers can tell "not set" from a value.
        contact: { phone: s.kontak_telepon || '', email: s.kontak_email || '', location: s.kontak_lokasi || '' },
        emergency: s.darurat
  }))

  // Filter services based on search
  const filteredServices = healthServices.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique categories
  const categories = [...new Set(healthServices.map(s => s.category))]

  // Categories are free text typed by the admin, so their colour is derived
  // rather than looked up in a fixed, sector-specific list.
  const getCategoryColor = categoryColor

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={t('layanan.title')}
        subtitle={t('layanan.subtitle')}
        breadcrumbs={[
          { label: t('nav.beranda'), href: '/' },
          { label: t('nav.layanan') }
        ]}
        badge={{ label: t('layanan.servicesAvailable', { count: healthServices.length }), color: 'success' }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Emergency Alert — only when an emergency number is configured. Not
            every agency runs one, and an unconditional "call 119" banner is a
            health-sector assumption. */}
        {emergencyNum && (
          <Alert
            severity="error"
            sx={{
              mb: { xs: 3, md: 4 },
              borderRadius: 3,
              '& .MuiAlert-icon': {
                fontSize: { xs: 28, sm: 32 }
              }
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {t('layanan.emergencyAlertTitle')}
            </Typography>
            <Typography variant="body2">
              {t('layanan.emergencyAlertBefore')} <strong>{emergencyNum}</strong> {t('layanan.emergencyAlertAfter')}
            </Typography>
          </Alert>
        )}

        {/* Search Section */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'white'
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            {t('layanan.searchTitle')}
          </Typography>
          <TextField
            fullWidth
            placeholder={t('layanan.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            inputProps={{ 'aria-label': t('layanan.searchPlaceholder') }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: 'rgba(255,255,255,0.7)' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'rgba(255,255,255,0.1)',
                borderRadius: 2,
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white'
                }
              }
            }}
            sx={{
              '& .MuiInputBase-root': {
                color: 'white'
              }
            }}
          />

          {/* Category Filters */}
          <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={t('layanan.filterAll')}
              onClick={() => setSearchTerm('')}
              sx={{
                bgcolor: searchTerm === '' ? 'white' : 'rgba(255,255,255,0.1)',
                color: searchTerm === '' ? 'primary.main' : 'white',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.2)'
                }
              }}
            />
            {categories.map((category) => (
              <Chip
                key={category}
                label={category}
                onClick={() => setSearchTerm(category)}
                sx={{
                  bgcolor: searchTerm === category ? 'white' : 'rgba(255,255,255,0.1)',
                  color: searchTerm === category ? 'primary.main' : 'white',
                  fontWeight: 600,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)'
                  }
                }}
              />
            ))}
          </Box>
        </Paper>

        {/* Results Info */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('layanan.resultsInfo', { filtered: filteredServices.length, total: healthServices.length })}
            {searchTerm && ` ${t('layanan.resultsSearchSuffix', { term: searchTerm })}`}
          </Typography>
        </Box>

        {/* Services List */}
        {loading ? (
          <LoadingState message={t('layanan.loading')} />
        ) : healthServices.length === 0 ? (
          /* No services published at all — distinct from "search found nothing",
             so it must not offer to clear a search that would change nothing. */
          <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}>
            <Assignment sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('layanan.emptyTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('layanan.emptySubtitle')}
            </Typography>
          </Paper>
        ) : filteredServices.length > 0 ? (
          <Stack spacing={2}>
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                sx={{
                  borderRadius: 3,
                  border: service.emergency ? '2px solid' : '1px solid',
                  borderColor: service.emergency ? 'error.main' : 'divider',
                  boxShadow: service.emergency ? '0 4px 12px rgba(211, 47, 47, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                  overflow: 'hidden'
                }}
              >
                <Accordion
                  expanded={expanded === service.id}
                  onChange={handleChange(service.id)}
                  sx={{
                    '&:before': { display: 'none' },
                    boxShadow: 'none'
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                      {/* Service Icon */}
                      <Box
                        sx={{
                          width: { xs: 48, sm: 56 },
                          height: { xs: 48, sm: 56 },
                          bgcolor: service.emergency ? 'error.main' : `${service.color}.light`,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: service.emergency ? 'white' : `${service.color}.main`
                        }}
                      >
                        {service.icon}
                      </Box>

                      {/* Service Info */}
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {service.title}
                          </Typography>
                          {service.emergency && (
                            <Chip
                              label={t('layanan.emergencyBadge')}
                              size="small"
                              color="error"
                              sx={{ fontWeight: 700 }}
                            />
                          )}
                          <Chip
                            label={service.category}
                            size="small"
                            sx={{
                              bgcolor: `${getCategoryColor(service.category)}.light`,
                              color: `${getCategoryColor(service.category)}.main`,
                              fontWeight: 600
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {service.description}
                        </Typography>
                      </Box>

                      {/* Quick Info */}
                      <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1, flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Chip
                          icon={<Schedule />}
                          label={service.processingTime}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          icon={<AttachMoney />}
                          label={service.cost}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>

                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* Requirements */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description fontSize="small" />
                            {t('layanan.requirementsLabel')}
                          </Typography>
                          <List dense>
                            {service.requirements.map((req, idx) => (
                              <ListItem key={idx} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <CheckCircle sx={{ color: 'success.main', fontSize: 18 }} />
                                </ListItemIcon>
                                <ListItemText primary={req} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>

                        {/* Procedure */}
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Assignment fontSize="small" />
                            {t('layanan.procedureLabel')}
                          </Typography>
                          <List dense>
                            {service.procedure.map((step, idx) => (
                              <ListItem key={idx} sx={{ px: 0 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                  <Box
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      bgcolor: 'primary.light',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem',
                                      fontWeight: 600,
                                      color: 'primary.contrastText'
                                    }}
                                  >
                                    {idx + 1}
                                  </Box>
                                </ListItemIcon>
                                <ListItemText primary={step} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      </Grid>

                      {/* Contact and Details */}
                      <Grid size={{ xs: 12, md: 6 }}>
                        {/* Service Details */}
                        <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            {t('layanan.serviceInfo')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Schedule sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                <strong>{t('layanan.processingTimeLabel')}</strong> {service.processingTime}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AttachMoney sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                <strong>{t('layanan.costLabel')}</strong> {service.cost}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                              <Typography variant="body2">
                                <strong>{t('layanan.validityLabel')}</strong> {service.validity}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>

                        {/* Contact Information */}
                        <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                            {t('layanan.contactLocation')}
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Phone sx={{ fontSize: 18, mt: 0.5 }} />
                              <Typography variant="body2">
                                {service.contact.phone || '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Email sx={{ fontSize: 18, mt: 0.5 }} />
                              <Typography variant="body2">
                                {service.contact.email || '-'}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 18, mt: 0.5 }} />
                              <Typography variant="body2">
                                {service.contact.location || '-'}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>

                        {/* Action button — only when a number exists. Without
                            this guard a service with no phone rendered a call
                            button pointing at "tel:-". */}
                        {service.contact.phone && (
                          <Button
                            fullWidth
                            variant={service.emergency ? 'contained' : 'outlined'}
                            color={service.emergency ? 'error' : 'primary'}
                            startIcon={service.emergency ? <Emergency /> : <Phone />}
                            sx={{ mt: 2, fontWeight: 600 }}
                            href={`tel:${service.contact.phone}`}
                          >
                            {service.emergency ? t('layanan.callEmergency') : t('layanan.callService')}
                          </Button>
                        )}
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Card>
            ))}
          </Stack>
        ) : (
          <Paper
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: 3
            }}
          >
            <Search sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              {t('layanan.noResultsTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {t('layanan.noResultsSubtitle')}
            </Typography>
            <Button variant="contained" onClick={() => setSearchTerm('')}>
              {t('layanan.showAllServices')}
            </Button>
          </Paper>
        )}

        {/* Additional Information */}
        <Grid container spacing={3} sx={{ mt: { xs: 3, md: 4 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Info />
                {t('layanan.importantInfoTitle')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t('layanan.importantInfoText')}
              </Typography>
              <Button
                variant="contained"
                color="info"
                component={Link}
                to="/kontak"
                startIcon={<Phone />}
                sx={{ fontWeight: 600 }}
              >
                {t('layanan.contactUs')}
              </Button>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning />
                {t('layanan.operationalHoursTitle')}
              </Typography>
              {/* Real hours come from site settings; the old copy hardcoded one
                  agency's schedule and its emergency line. */}
              <Typography variant="body2" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {settings.jam_operasional?.trim() || t('layanan.operationalHoursUnset')}
              </Typography>
              {emergencyNum && (
                <Button
                  variant="contained"
                  color="warning"
                  href={`tel:${emergencyNum}`}
                  startIcon={<Emergency />}
                  sx={{ fontWeight: 600 }}
                >
                  {t('layanan.emergencyCall', { num: emergencyNum })}
                </Button>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Layanan