import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Divider,
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
  Alert,
  Avatar
} from '@mui/material'
import {
  Search,
  Description,
  HealthAndSafety,
  LocalHospital,
  Medication,
  Emergency,
  Assignment,
  CheckCircle,
  Schedule,
  AttachMoney,
  Phone,
  LocationOn,
  ExpandMore,
  ArrowForward,
  DocumentScanner,
  VerifiedUser,
  Person,
  Business,
  AccessTime,
  Info,
  Warning,
  Gavel,
  Science,
  FamilyRestroom,
  PregnantWoman,
  Vaccines,
  Email
} from '@mui/icons-material'
import PageHeader from '../../components/ui/PageHeader'
import api from '../../utils/api'
import { useLanguage } from '../../contexts/LanguageContext'

const ICON_MAP = { HealthAndSafety, LocalHospital, Medication, Emergency, DocumentScanner, VerifiedUser, Person, Science, FamilyRestroom, PregnantWoman, Vaccines, Business }
const renderServiceIcon = (name) => {
  const IconComp = ICON_MAP[name] || LocalHospital
  return <IconComp />
}

const Layanan = () => {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState('panel1')
  const [searchTerm, setSearchTerm] = useState('')
  const [services, setServices] = useState([])

  useEffect(() => {
    api.get('/public/layanan')
      .then((r) => setServices(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
  }, [])

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  // Fallback data (only used if the API returns nothing)
  const _fallbackServices = [
    {
      id: 'panel1',
      title: t('layanan.fallback.sip.title'),
      icon: <DocumentScanner />,
      color: 'primary',
      category: t('layanan.category.perizinan'),
      description: t('layanan.fallback.sip.description'),
      requirements: [
        t('layanan.fallback.sip.req1'),
        t('layanan.fallback.sip.req2'),
        t('layanan.fallback.sip.req3'),
        t('layanan.fallback.sip.req4'),
        t('layanan.fallback.sip.req5'),
        t('layanan.fallback.sip.req6'),
        t('layanan.fallback.sip.req7')
      ],
      processingTime: t('layanan.fallback.sip.processingTime'),
      cost: 'Rp 150.000',
      validity: t('layanan.fallback.sip.validity'),
      procedure: [
        t('layanan.fallback.sip.proc1'),
        t('layanan.fallback.sip.proc2'),
        t('layanan.fallback.sip.proc3'),
        t('layanan.fallback.sip.proc4'),
        t('layanan.fallback.sip.proc5'),
        t('layanan.fallback.sip.proc6')
      ],
      contact: {
        phone: '(0551) 123456',
        email: 'perizinan@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.sip.location')
      }
    },
    {
      id: 'panel2',
      title: t('layanan.fallback.sertifikat.title'),
      icon: <VerifiedUser />,
      color: 'success',
      category: t('layanan.category.fasilitas'),
      description: t('layanan.fallback.sertifikat.description'),
      requirements: [
        t('layanan.fallback.sertifikat.req1'),
        t('layanan.fallback.sertifikat.req2'),
        t('layanan.fallback.sertifikat.req3'),
        t('layanan.fallback.sertifikat.req4'),
        t('layanan.fallback.sertifikat.req5'),
        t('layanan.fallback.sertifikat.req6'),
        t('layanan.fallback.sertifikat.req7'),
        t('layanan.fallback.sertifikat.req8')
      ],
      processingTime: t('layanan.fallback.sertifikat.processingTime'),
      cost: 'Rp 500.000 - Rp 2.000.000',
      validity: t('layanan.fallback.sertifikat.validity'),
      procedure: [
        t('layanan.fallback.sertifikat.proc1'),
        t('layanan.fallback.sertifikat.proc2'),
        t('layanan.fallback.sertifikat.proc3'),
        t('layanan.fallback.sertifikat.proc4'),
        t('layanan.fallback.sertifikat.proc5'),
        t('layanan.fallback.sertifikat.proc6')
      ],
      contact: {
        phone: '(0551) 123457',
        email: 'fasilitas@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.sertifikat.location')
      }
    },
    {
      id: 'panel3',
      title: 'PSC 119 - Emergency Medical Services',
      icon: <Emergency />,
      color: 'error',
      category: t('layanan.category.darurat'),
      description: t('layanan.fallback.psc119.description'),
      requirements: [
        t('layanan.fallback.psc119.req1'),
        t('layanan.fallback.psc119.req2'),
        t('layanan.fallback.psc119.req3'),
        t('layanan.fallback.psc119.req4')
      ],
      processingTime: t('layanan.fallback.psc119.processingTime'),
      cost: t('layanan.fallback.free'),
      validity: t('layanan.fallback.psc119.validity'),
      procedure: [
        t('layanan.fallback.psc119.proc1'),
        t('layanan.fallback.psc119.proc2'),
        t('layanan.fallback.psc119.proc3'),
        t('layanan.fallback.psc119.proc4'),
        t('layanan.fallback.psc119.proc5'),
        t('layanan.fallback.psc119.proc6')
      ],
      contact: {
        phone: '119 (24 Jam)',
        email: 'psc119@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.psc119.location')
      },
      emergency: true
    },
    {
      id: 'panel4',
      title: t('layanan.fallback.hiv.title'),
      icon: <HealthAndSafety />,
      color: 'info',
      category: t('layanan.category.masyarakat'),
      description: t('layanan.fallback.hiv.description'),
      requirements: [
        t('layanan.fallback.hiv.req1'),
        t('layanan.fallback.hiv.req2'),
        t('layanan.fallback.hiv.req3'),
        t('layanan.fallback.hiv.req4')
      ],
      processingTime: t('layanan.fallback.hiv.processingTime'),
      cost: t('layanan.fallback.free'),
      validity: '-',
      procedure: [
        t('layanan.fallback.hiv.proc1'),
        t('layanan.fallback.hiv.proc2'),
        t('layanan.fallback.hiv.proc3'),
        t('layanan.fallback.hiv.proc4'),
        t('layanan.fallback.hiv.proc5'),
        t('layanan.fallback.hiv.proc6')
      ],
      contact: {
        phone: '(0551) 123458',
        email: 'kts@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.hiv.location')
      }
    },
    {
      id: 'panel5',
      title: t('layanan.fallback.imunisasi.title'),
      icon: <Vaccines />,
      color: 'success',
      category: t('layanan.category.anak'),
      description: t('layanan.fallback.imunisasi.description'),
      requirements: [
        t('layanan.fallback.imunisasi.req1'),
        t('layanan.fallback.imunisasi.req2'),
        t('layanan.fallback.imunisasi.req3'),
        t('layanan.fallback.imunisasi.req4')
      ],
      processingTime: t('layanan.fallback.imunisasi.processingTime'),
      cost: t('layanan.fallback.imunisasi.cost'),
      validity: t('layanan.fallback.imunisasi.validity'),
      procedure: [
        t('layanan.fallback.imunisasi.proc1'),
        t('layanan.fallback.imunisasi.proc2'),
        t('layanan.fallback.imunisasi.proc3'),
        t('layanan.fallback.imunisasi.proc4'),
        t('layanan.fallback.imunisasi.proc5'),
        t('layanan.fallback.imunisasi.proc6'),
        t('layanan.fallback.imunisasi.proc7')
      ],
      contact: {
        phone: '(0551) 123459',
        email: 'imunisasi@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.imunisasi.location')
      }
    },
    {
      id: 'panel6',
      title: t('layanan.fallback.penelitian.title'),
      icon: <Science />,
      color: 'warning',
      category: t('layanan.category.perizinan'),
      description: t('layanan.fallback.penelitian.description'),
      requirements: [
        t('layanan.fallback.penelitian.req1'),
        t('layanan.fallback.penelitian.req2'),
        t('layanan.fallback.penelitian.req3'),
        t('layanan.fallback.penelitian.req4'),
        t('layanan.fallback.penelitian.req5'),
        t('layanan.fallback.penelitian.req6'),
        t('layanan.fallback.penelitian.req7'),
        t('layanan.fallback.penelitian.req8')
      ],
      processingTime: t('layanan.fallback.penelitian.processingTime'),
      cost: 'Rp 200.000',
      validity: t('layanan.fallback.penelitian.validity'),
      procedure: [
        t('layanan.fallback.penelitian.proc1'),
        t('layanan.fallback.penelitian.proc2'),
        t('layanan.fallback.penelitian.proc3'),
        t('layanan.fallback.penelitian.proc4'),
        t('layanan.fallback.penelitian.proc5'),
        t('layanan.fallback.penelitian.proc6'),
        t('layanan.fallback.penelitian.proc7')
      ],
      contact: {
        phone: '(0551) 123460',
        email: 'penelitian@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.penelitian.location')
      }
    },
    {
      id: 'panel7',
      title: t('layanan.fallback.jamkesda.title'),
      icon: <FamilyRestroom />,
      color: 'primary',
      category: t('layanan.category.jaminan'),
      description: t('layanan.fallback.jamkesda.description'),
      requirements: [
        t('layanan.fallback.jamkesda.req1'),
        t('layanan.fallback.jamkesda.req2'),
        t('layanan.fallback.jamkesda.req3'),
        t('layanan.fallback.jamkesda.req4'),
        t('layanan.fallback.jamkesda.req5'),
        t('layanan.fallback.jamkesda.req6')
      ],
      processingTime: t('layanan.fallback.jamkesda.processingTime'),
      cost: t('layanan.fallback.free'),
      validity: t('layanan.fallback.jamkesda.validity'),
      procedure: [
        t('layanan.fallback.jamkesda.proc1'),
        t('layanan.fallback.jamkesda.proc2'),
        t('layanan.fallback.jamkesda.proc3'),
        t('layanan.fallback.jamkesda.proc4'),
        t('layanan.fallback.jamkesda.proc5'),
        t('layanan.fallback.jamkesda.proc6'),
        t('layanan.fallback.jamkesda.proc7')
      ],
      contact: {
        phone: '(0551) 123461',
        email: 'jamkesda@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.jamkesda.location')
      }
    },
    {
      id: 'panel8',
      title: t('layanan.fallback.kb.title'),
      icon: <PregnantWoman />,
      color: 'info',
      category: t('layanan.category.keluarga'),
      description: t('layanan.fallback.kb.description'),
      requirements: [
        t('layanan.fallback.kb.req1'),
        t('layanan.fallback.kb.req2'),
        t('layanan.fallback.kb.req3'),
        t('layanan.fallback.kb.req4')
      ],
      processingTime: t('layanan.fallback.kb.processingTime'),
      cost: t('layanan.fallback.kb.cost'),
      validity: t('layanan.fallback.kb.validity'),
      procedure: [
        t('layanan.fallback.kb.proc1'),
        t('layanan.fallback.kb.proc2'),
        t('layanan.fallback.kb.proc3'),
        t('layanan.fallback.kb.proc4'),
        t('layanan.fallback.kb.proc5'),
        t('layanan.fallback.kb.proc6'),
        t('layanan.fallback.kb.proc7')
      ],
      contact: {
        phone: '(0551) 123462',
        email: 'kb@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.kb.location')
      }
    },
    {
      id: 'panel9',
      title: t('layanan.fallback.jiwa.title'),
      icon: <Person />,
      color: 'secondary',
      category: t('layanan.category.mental'),
      description: t('layanan.fallback.jiwa.description'),
      requirements: [
        t('layanan.fallback.jiwa.req1'),
        t('layanan.fallback.jiwa.req2'),
        t('layanan.fallback.jiwa.req3'),
        t('layanan.fallback.jiwa.req4')
      ],
      processingTime: t('layanan.fallback.jiwa.processingTime'),
      cost: t('layanan.fallback.jiwa.cost'),
      validity: t('layanan.fallback.jiwa.validity'),
      procedure: [
        t('layanan.fallback.jiwa.proc1'),
        t('layanan.fallback.jiwa.proc2'),
        t('layanan.fallback.jiwa.proc3'),
        t('layanan.fallback.jiwa.proc4'),
        t('layanan.fallback.jiwa.proc5'),
        t('layanan.fallback.jiwa.proc6'),
        t('layanan.fallback.jiwa.proc7')
      ],
      contact: {
        phone: '(0551) 123463',
        email: 'jiwa@dinkes.kaltaraprov.go.id',
        location: t('layanan.fallback.jiwa.location')
      }
    }
  ]

  // Use live data from the API; fall back to static data if empty
  const healthServices = services.length
    ? services.map((s) => ({
        id: `panel${s.id_layanan}`,
        title: s.judul,
        icon: renderServiceIcon(s.icon),
        color: s.color || 'primary',
        category: s.kategori || 'Lainnya',
        description: s.deskripsi || '',
        requirements: s.persyaratan || [],
        processingTime: s.waktu || '-',
        cost: s.biaya || '-',
        validity: s.masa_berlaku || '-',
        procedure: s.prosedur || [],
        contact: { phone: s.kontak_telepon || '-', email: s.kontak_email || '-', location: s.kontak_lokasi || '-' },
        emergency: s.darurat
      }))
    : _fallbackServices

  // Filter services based on search
  const filteredServices = healthServices.filter(service =>
    service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get unique categories
  const categories = [...new Set(healthServices.map(s => s.category))]

  const getCategoryColor = (category) => {
    const colors = {
      'Perizinan': 'primary',
      'Fasilitas Kesehatan': 'success',
      'Layanan Darurat': 'error',
      'Kesehatan Masyarakat': 'info',
      'Kesehatan Anak': 'success',
      'Jaminan Kesehatan': 'primary',
      'Kesehatan Keluarga': 'info',
      'Kesehatan Mental': 'secondary'
    }
    return colors[category] || 'default'
  }

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
        {/* Emergency Alert */}
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
            {t('layanan.emergencyAlertBefore')} <strong>PSC 119</strong> {t('layanan.emergencyAlertAfter')}
          </Typography>
        </Alert>

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
        {filteredServices.length > 0 ? (
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
                                {service.contact.phone}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Email sx={{ fontSize: 18, mt: 0.5 }} />
                              <Typography variant="body2">
                                {service.contact.email}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <LocationOn sx={{ fontSize: 18, mt: 0.5 }} />
                              <Typography variant="body2">
                                {service.contact.location}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>

                        {/* Action Button */}
                        {service.emergency ? (
                          <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            startIcon={<Emergency />}
                            sx={{ mt: 2, fontWeight: 600 }}
                            href={`tel:${service.contact.phone}`}
                          >
                            {t('layanan.callNow119')}
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<Phone />}
                            sx={{ mt: 2, fontWeight: 600 }}
                            href={`tel:${service.contact.phone}`}
                          >
                            {t('layanan.callService')}
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
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t('layanan.operationalHoursText')}
              </Typography>
              <Button
                variant="contained"
                color="warning"
                href="tel:119"
                startIcon={<Emergency />}
                sx={{ fontWeight: 600 }}
              >
                {t('layanan.emergency119')}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}

export default Layanan