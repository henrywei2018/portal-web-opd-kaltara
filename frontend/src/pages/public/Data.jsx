import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Button,
  Stack,
  Avatar,
  IconButton,
  Tabs,
  Tab
} from '@mui/material'
import {
  Search,
  LocalHospital,
  HealthAndSafety,
  People,
  Vaccines,
  PregnantWoman,
  ChildCare,
  LocationOn,
  Phone,
  TrendingUp,
  TrendingDown,
  Download,
  Assessment,
  Analytics,
  Map,
  Room,
  FilterList,
  Sort,
  ArrowForward
} from '@mui/icons-material'
import PageHeader from '../../components/ui/PageHeader'
import { useLanguage } from '../../contexts/LanguageContext'

const Data = () => {
  const { t } = useLanguage()
  const [tabValue, setTabValue] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [cityFilter, setCityFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  // Health Statistics Data
  const healthStats = {
    population: {
      total: 723000,
      growth: 2.3,
      male: 52,
      female: 48
    },
    healthFacilities: {
      hospitals: 15,
      puskesmas: 48,
      clinics: 120,
      pharmacies: 85
    },
    healthPersonnel: {
      doctors: 450,
      nurses: 1200,
      midwives: 380,
      pharmacists: 95
    },
    healthIndicators: {
      infantMortality: { rate: 8.5, target: 7.0, status: 'good' },
      maternalMortality: { rate: 120, target: 100, status: 'moderate' },
      lifeExpectancy: { rate: 72.5, target: 75.0, status: 'good' },
      immunizationCoverage: { rate: 95, target: 95, status: 'excellent' }
    }
  }

  // Health Facilities Directory
  const healthFacilities = [
    {
      id: 1,
      name: 'RSUD Dr. H. Soemarno',
      type: 'Rumah Sakit',
      class: 'RSUD Tipe B',
      city: 'Tarakan',
      address: 'Jl. DR. Soebardjo No. 1, Tarakan',
      phone: '(0551) 25123',
      emergency: '(0551) 25124',
      beds: 250,
      facilities: ['IGD', 'ICU', 'MRI', 'CT Scan', 'Laboratorium', 'Radiologi'],
      services: ['Rawat Inap', 'Rawat Jalan', 'Operasi', 'Melahirkan'],
      icon: <LocalHospital />
    },
    {
      id: 2,
      name: 'RSUD Bulungan',
      type: 'Rumah Sakit',
      class: 'RSUD Tipe C',
      city: 'Tanjung Selor',
      address: 'Jl. Panglima Batur No. 45, Tanjung Selor',
      phone: '(0551) 34567',
      emergency: '(0551) 34568',
      beds: 150,
      facilities: ['IGD', 'ICU', 'Laboratorium', 'Radiologi', 'Farmasi'],
      services: ['Rawat Inap', 'Rawat Jalan', 'Operasi'],
      icon: <LocalHospital />
    },
    {
      id: 3,
      name: 'Puskesmas Tarakan',
      type: 'Puskesmas',
      class: 'Puskesmas Perawatan',
      city: 'Tarakan',
      address: 'Jl. Sei Apung No. 12, Tarakan',
      phone: '(0551) 23456',
      emergency: '(0551) 23457',
      beds: 20,
      facilities: ['IGD', 'Laboratorium Dasar', 'Farmasi', 'KIA'],
      services: ['Rawat Inap', 'Rawat Jalan', 'Imunisasi', 'KIA'],
      icon: <HealthAndSafety />
    },
    {
      id: 4,
      name: 'Puskesmas Tanjung Selor',
      type: 'Puskesmas',
      class: 'Puskesmas Non-Perawatan',
      city: 'Tanjung Selor',
      address: 'Jl. KH. Ahmad Dahlan No. 8, Tanjung Selor',
      phone: '(0551) 37890',
      emergency: '(0551) 37891',
      beds: 0,
      facilities: ['Laboratorium Dasar', 'Farmasi', 'KIA'],
      services: ['Rawat Jalan', 'Imunisasi', 'KIA', 'KB'],
      icon: <HealthAndSafety />
    },
    {
      id: 5,
      name: 'Klinik Pratama Sehat',
      type: 'Klinik',
      class: 'Klinik Pratama',
      city: 'Nunukan',
      address: 'Jl. Pantai No. 23, Nunukan',
      phone: '(0551) 45678',
      emergency: '-',
      beds: 0,
      facilities: ['Laboratorium Dasar', 'Farmasi'],
      services: ['Rawat Jalan', 'Imunisasi'],
      icon: <HealthAndSafety />
    },
    {
      id: 6,
      name: 'Apotek Kimia Farma',
      type: 'Farmasi',
      class: 'Apotek',
      city: 'Tarakan',
      address: 'Jl. Yos Sudarso No. 56, Tarakan',
      phone: '(0551) 28901',
      emergency: '-',
      beds: 0,
      facilities: ['Farmasi', 'Konseling Obat'],
      services: ['Resep Dokter', 'Jual Bebas'],
      icon: <Assessment />
    }
  ]

  // Annual Reports
  const annualReports = [
    {
      title: 'Laporan Kinerja Instansi Pemerintah (LKjIP) 2024',
      description: 'Laporan kinerja dan pencapaian target tahun 2024',
      file: 'lkjip-2024.pdf',
      size: '2.5 MB',
      date: '2024-12-31',
      category: 'Kinerja',
      downloads: 145
    },
    {
      title: 'Profil Kesehatan Provinsi Kalimantan Utara 2024',
      description: 'Data dan statistik kesehatan provinsi tahun 2024',
      file: 'profil-kesehatan-2024.pdf',
      size: '4.8 MB',
      date: '2024-11-15',
      category: 'Statistik',
      downloads: 234
    },
    {
      title: 'Renstra Dinas Kesehatan 2020-2024',
      description: 'Rencana strategis pembangunan kesehatan 5 tahunan',
      file: 'renstra-2020-2024.pdf',
      size: '3.2 MB',
      date: '2020-01-15',
      category: 'Perencanaan',
      downloads: 567
    },
    {
      title: 'Laporan Layanan PSC 119 Tahun 2024',
      description: 'Laporan aktivitas dan performa layanan gawat darurat',
      file: 'laporan-psc119-2024.pdf',
      size: '1.8 MB',
      date: '2024-12-20',
      category: 'Layanan',
      downloads: 189
    },
    {
      title: 'Data Fasilitas Kesehatan 2024',
      description: 'Direktori lengkap fasilitas kesehatan di Kalimantan Utara',
      file: 'data-faskes-2024.pdf',
      size: '2.1 MB',
      date: '2024-10-30',
      category: 'Direktori',
      downloads: 321
    }
  ]

  // Filter facilities
  const filteredFacilities = healthFacilities.filter(facility => {
    const matchSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       facility.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchCity = !cityFilter || facility.city === cityFilter
    const matchType = !typeFilter || facility.type === typeFilter
    return matchSearch && matchCity && matchType
  })

  // Get unique cities and types
  const cities = [...new Set(healthFacilities.map(f => f.city))]
  const types = [...new Set(healthFacilities.map(f => f.type))]

  const formatNumber = (num) => {
    return new Intl.NumberFormat('id-ID').format(num)
  }

  return (
    <Box>
      {/* Page Header */}
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
        {/* Tabs Navigation */}
        <Paper sx={{ mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: { xs: 2, sm: 3 },
              pt: { xs: 2, sm: 3 },
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          >
            <Tab label={t('data.tabHealthStats')} icon={<Analytics />} />
            <Tab label={t('data.tabFacilitiesDirectory')} icon={<LocalHospital />} />
            <Tab label={t('data.tabPublicReports')} icon={<Assessment />} />
          </Tabs>
        </Paper>

        {/* Tab 1: Health Statistics */}
        {tabValue === 0 && (
          <Box>
            {/* Population Overview */}
            <Paper sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('data.populationStatsTitle')}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', margin: '0 auto', mb: 1 }}>
                      <People />
                    </Avatar>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatNumber(healthStats.population.total)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.totalPopulation')}
                    </Typography>
                    <Chip
                      label={`+${healthStats.population.growth}%`}
                      size="small"
                      sx={{ mt: 1, bgcolor: 'success.light', color: 'success.contrastText' }}
                      icon={<TrendingUp />}
                    />
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {healthStats.population.male}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.male')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      {healthStats.population.female}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.female')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      70%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.productiveAge')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Health Facilities Statistics */}
            <Paper sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('data.healthFacilitiesTitle')}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                    <LocalHospital sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {healthStats.healthFacilities.hospitals}
                    </Typography>
                    <Typography variant="body2">
                      {t('data.statHospitals')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                    <HealthAndSafety sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {healthStats.healthFacilities.puskesmas}
                    </Typography>
                    <Typography variant="body2">
                      {t('data.statPuskesmas')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <HealthAndSafety sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {healthStats.healthFacilities.clinics}
                    </Typography>
                    <Typography variant="body2">
                      {t('data.statClinics')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                    <Assessment sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>
                      {healthStats.healthFacilities.pharmacies}
                    </Typography>
                    <Typography variant="body2">
                      {t('data.statPharmacies')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Health Personnel Statistics */}
            <Paper sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('data.healthPersonnelTitle')}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {formatNumber(healthStats.healthPersonnel.doctors)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.doctors')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                      {formatNumber(healthStats.healthPersonnel.nurses)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.nurses')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main' }}>
                      {formatNumber(healthStats.healthPersonnel.midwives)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.midwives')}
                    </Typography>
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main' }}>
                      {formatNumber(healthStats.healthPersonnel.pharmacists)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('data.pharmacists')}
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            </Paper>

            {/* Health Indicators */}
            <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                {t('data.healthIndicatorsTitle')}
              </Typography>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t('data.indicatorInfantMortality')}
                      </Typography>
                      <ChildCare sx={{ color: 'primary.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                      {healthStats.healthIndicators.infantMortality.rate}
                    </Typography>
                    <Chip
                      label={t('data.targetLabel', { value: healthStats.healthIndicators.infantMortality.target })}
                      size="small"
                      sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t('data.indicatorMaternalMortality')}
                      </Typography>
                      <PregnantWoman sx={{ color: 'warning.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', mb: 1 }}>
                      {healthStats.healthIndicators.maternalMortality.rate}
                    </Typography>
                    <Chip
                      label={t('data.targetLabel', { value: healthStats.healthIndicators.maternalMortality.target })}
                      size="small"
                      sx={{ bgcolor: 'warning.light', color: 'warning.contrastText', fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {t('data.indicatorLifeExpectancy')}
                      </Typography>
                      <People sx={{ color: 'success.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main', mb: 1 }}>
                      {healthStats.healthIndicators.lifeExpectancy.rate}
                    </Typography>
                    <Chip
                      label={t('data.targetLabel', { value: healthStats.healthIndicators.lifeExpectancy.target })}
                      size="small"
                      sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Card sx={{ p: 2, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {t('data.indicatorImmunizationCoverage')}
                      </Typography>
                      <Vaccines sx={{ color: 'info.main' }} />
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'info.main', mb: 1 }}>
                      {healthStats.healthIndicators.immunizationCoverage.rate}
                    </Typography>
                    <Chip
                      label={t('data.targetLabel', { value: healthStats.healthIndicators.immunizationCoverage.target })}
                      size="small"
                      sx={{ bgcolor: 'success.light', color: 'success.contrastText', fontWeight: 600 }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        )}

        {/* Tab 2: Health Facilities Directory */}
        {tabValue === 1 && (
          <Box>
            {/* Search and Filters */}
            <Paper sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    placeholder={t('data.searchFacilitiesPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    inputProps={{ 'aria-label': t('data.searchFacilitiesPlaceholder') }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2
                      }
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('data.allCities')}</InputLabel>
                    <Select
                      value={cityFilter}
                      label={t('data.allCities')}
                      onChange={(e) => setCityFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">{t('data.allCities')}</MenuItem>
                      {cities.map((city) => (
                        <MenuItem key={city} value={city}>{city}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{t('data.allTypes')}</InputLabel>
                    <Select
                      value={typeFilter}
                      label={t('data.allTypes')}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="">{t('data.allTypes')}</MenuItem>
                      {types.map((type) => (
                        <MenuItem key={type} value={type}>{type}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Results Info */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t('data.showingResults', { shown: filteredFacilities.length, total: healthFacilities.length })}
              </Typography>
            </Box>

            {/* Facilities List */}
            {filteredFacilities.length > 0 ? (
              <Grid container spacing={3}>
                {filteredFacilities.map((facility) => (
                  <Grid size={{ xs: 12, md: 6 }} key={facility.id}>
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      <CardContent>
                        {/* Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar
                            sx={{
                              width: { xs: 48, sm: 56 },
                              height: { xs: 48, sm: 56 },
                              bgcolor: 'primary.light',
                              color: 'primary.contrastText'
                            }}
                          >
                            {facility.icon}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {facility.name}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip label={facility.type} size="small" sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }} />
                              <Chip label={facility.class} size="small" variant="outlined" />
                              <Chip label={facility.city} size="small" variant="outlined" />
                            </Box>
                          </Box>
                        </Box>

                        {/* Contact Info */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {facility.address}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {facility.phone}
                            </Typography>
                          </Box>
                          {facility.emergency !== '-' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone sx={{ fontSize: 18, color: 'error.main' }} />
                              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600 }}>
                                {t('data.emergencyLabel')} {facility.emergency}
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Facilities */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>
                            {t('data.facilitiesCaption')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {facility.facilities.slice(0, 4).map((fac, idx) => (
                              <Chip
                                key={idx}
                                label={fac}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            ))}
                            {facility.facilities.length > 4 && (
                              <Chip
                                label={t('data.moreItems', { count: facility.facilities.length - 4 })}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Services */}
                        <Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5, display: 'block' }}>
                            {t('data.servicesCaption')}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {facility.services.map((service, idx) => (
                              <Chip
                                key={idx}
                                label={service}
                                size="small"
                                sx={{
                                  bgcolor: 'action.hover',
                                  fontSize: '0.7rem'
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        {/* Beds Info */}
                        {facility.beds > 0 && (
                          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {t('data.bedCapacityLabel')} <strong>{t('data.bedsUnit', { count: facility.beds })}</strong>
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper sx={{ p: { xs: 4, sm: 6 }, textAlign: 'center', borderRadius: 3 }}>
                <Search sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {t('data.noFacilitiesFound')}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  {t('data.noFacilitiesHint')}
                </Typography>
                <Button variant="contained" onClick={() => { setSearchTerm(''); setCityFilter(''); setTypeFilter('') }}>
                  {t('data.resetFilter')}
                </Button>
              </Paper>
            )}
          </Box>
        )}

        {/* Tab 3: Public Reports */}
        {tabValue === 2 && (
          <Box>
            {/* Search */}
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
                {t('data.reportsHeaderTitle')}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {t('data.reportsHeaderSubtitle')}
              </Typography>
            </Paper>

            {/* Reports List */}
            <Grid container spacing={3}>
              {annualReports.map((report, index) => (
                <Grid size={{ xs: 12, md: 6 }} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar
                          sx={{
                            width: { xs: 48, sm: 56 },
                            height: { xs: 48, sm: 56 },
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                          }}
                        >
                          <Assessment sx={{ fontSize: { xs: 28, sm: 32 } }} />
                        </Avatar>
                        <Chip
                          label={report.category}
                          size="small"
                          sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            fontWeight: 600
                          }}
                        />
                      </Box>

                      {/* Title and Description */}
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                        {report.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
                        {report.description}
                      </Typography>

                      {/* File Info */}
                      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t('data.sizeLabel', { size: report.size })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t('data.dateLabel', { date: new Date(report.date).toLocaleDateString('id-ID') })}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t('data.downloadsLabel', { downloads: report.downloads })}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Download Button */}
                      <Button
                        fullWidth
                        variant="contained"
                        startIcon={<Download />}
                        endIcon={<ArrowForward />}
                        sx={{ fontWeight: 600 }}
                      >
                        {t('data.downloadPdf')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Additional Information */}
            <Paper sx={{ p: { xs: 3, md: 4 }, mt: { xs: 3, md: 4 }, borderRadius: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                {t('data.additionalInfoTitle')}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {t('data.additionalInfoText')}
              </Typography>
              <Button
                variant="contained"
                color="info"
                component="a"
                href="/kontak"
                sx={{ fontWeight: 600 }}
              >
                {t('data.contactUs')}
              </Button>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Data