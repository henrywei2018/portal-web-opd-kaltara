import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Stack
} from '@mui/material'
import {
  Business,
  People,
  Assignment,
  HealthAndSafety,
  ExpandMore,
  CheckCircle,
  LocationOn,
  Phone,
  Email,
  Star,
  Flag,
  AccountBalance,
  TrendingUp
} from '@mui/icons-material'
import PageHeader from '../../components/ui/PageHeader'
import { useLanguage } from '../../contexts/LanguageContext'

const Profil = () => {
  const { t } = useLanguage()
  const [expanded, setExpanded] = useState('panel1')

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false)
  }

  // Organizational Structure Data
  const organizationalStructure = [
    {
      position: t('profil.orgKepalaDinasPosition'),
      name: 'dr. [Nama Kepala Dinas], M.Kes',
      role: t('profil.orgKepalaDinasRole'),
      avatar: 'KD',
      color: 'primary'
    },
    {
      position: t('profil.orgSekretarisPosition'),
      name: '[Nama Sekretaris], SKM, M.Kes',
      role: t('profil.orgSekretarisRole'),
      avatar: 'SD',
      color: 'secondary'
    },
    {
      position: t('profil.orgKesmasPosition'),
      name: 'dr. [Nama Kepala Bidang]',
      role: t('profil.orgKesmasRole'),
      avatar: 'KK',
      color: 'info'
    },
    {
      position: t('profil.orgYankesPosition'),
      name: 'dr. [Nama Kepala Bidang]',
      role: t('profil.orgYankesRole'),
      avatar: 'KY',
      color: 'success'
    },
    {
      position: t('profil.orgP2pPosition'),
      name: 'dr. [Nama Kepala Bidang]',
      role: t('profil.orgP2pRole'),
      avatar: 'KP',
      color: 'warning'
    }
  ]

  // Vision and Mission
  const visionMission = {
    vision: t('profil.visionText'),
    missions: [
      t('profil.mission1'),
      t('profil.mission2'),
      t('profil.mission3'),
      t('profil.mission4'),
      t('profil.mission5')
    ]
  }

  // Core Values
  const coreValues = [
    { icon: <Star />, label: t('profil.valueProfesional'), color: 'primary' },
    { icon: <HealthAndSafety />, label: t('profil.valueMelayani'), color: 'success' },
    { icon: <TrendingUp />, label: t('profil.valueInovatif'), color: 'info' },
    { icon: <Flag />, label: t('profil.valueIntegritas'), color: 'warning' }
  ]

  // Key Achievements Timeline
  const achievements = [
    { year: '2020', title: t('profil.achievement2020Title'), description: t('profil.achievement2020Desc') },
    { year: '2021', title: t('profil.achievement2021Title'), description: t('profil.achievement2021Desc') },
    { year: '2022', title: t('profil.achievement2022Title'), description: t('profil.achievement2022Desc') },
    { year: '2023', title: t('profil.achievement2023Title'), description: t('profil.achievement2023Desc') },
    { year: '2024', title: t('profil.achievement2024Title'), description: t('profil.achievement2024Desc') }
  ]

  // Department Functions
  const departmentFunctions = [
    {
      title: t('profil.deptKesmasTitle'),
      icon: <People />,
      color: 'primary',
      description: t('profil.deptKesmasDesc'),
      responsibilities: [
        t('profil.deptKesmasResp1'),
        t('profil.deptKesmasResp2'),
        t('profil.deptKesmasResp3'),
        t('profil.deptKesmasResp4'),
        t('profil.deptKesmasResp5')
      ]
    },
    {
      title: t('profil.deptYankesTitle'),
      icon: <HealthAndSafety />,
      color: 'secondary',
      description: t('profil.deptYankesDesc'),
      responsibilities: [
        t('profil.deptYankesResp1'),
        t('profil.deptYankesResp2'),
        t('profil.deptYankesResp3'),
        t('profil.deptYankesResp4'),
        t('profil.deptYankesResp5')
      ]
    },
    {
      title: t('profil.deptP2pTitle'),
      icon: <Assignment />,
      color: 'error',
      description: t('profil.deptP2pDesc'),
      responsibilities: [
        t('profil.deptP2pResp1'),
        t('profil.deptP2pResp2'),
        t('profil.deptP2pResp3'),
        t('profil.deptP2pResp4'),
        t('profil.deptP2pResp5')
      ]
    }
  ]

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={t('profil.title')}
        subtitle={t('profil.subtitle')}
        breadcrumbs={[
          { label: t('nav.beranda'), href: '/' },
          { label: t('profil.breadcrumbTentangKami'), href: '/profil' },
          { label: t('nav.profil') }
        ]}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Introduction */}
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            mb: { xs: 3, md: 4 },
            borderRadius: 3,
            bgcolor: 'primary.main',
            color: 'white',
            boxShadow: '0 8px 24px rgba(13, 71, 161, 0.2)'
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
            {t('profil.welcomeTitle')}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.8 }}>
            {t('profil.welcomeText')}
          </Typography>
        </Paper>

        {/* Vision and Mission */}
        <Paper sx={{ p: { xs: 3, md: 4 }, mb: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{ color: 'warning.main' }} />
            {t('profil.visiHeading')}
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic', color: 'text.secondary', lineHeight: 1.8 }}>
            "{visionMission.vision}"
          </Typography>

          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Flag sx={{ color: 'primary.main' }} />
            {t('profil.misiHeading')}
          </Typography>
          <List>
            {visionMission.missions.map((mission, index) => (
              <ListItem key={index} sx={{ px: 0 }}>
                <ListItemIcon>
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText primary={mission} />
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Core Values */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {t('profil.coreValuesHeading')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
          {coreValues.map((value, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                sx={{
                  textAlign: 'center',
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                    borderColor: `${value.color}.main`
                  }
                }}
              >
                <Box
                  sx={{
                    width: { xs: 48, sm: 56 },
                    height: { xs: 48, sm: 56 },
                    bgcolor: `${value.color}.light`,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto',
                    mb: 2,
                    color: `${value.color}.main`
                  }}
                >
                  {value.icon}
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: `${value.color}.main` }}>
                  {value.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Organizational Structure */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {t('profil.orgStructureHeading')}
        </Typography>
        <Grid container spacing={3} sx={{ mb: { xs: 3, md: 4 } }}>
          {organizationalStructure.map((person, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
              <Card
                sx={{
                  p: { xs: 2, sm: 3 },
                  borderRadius: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    sx={{
                      width: { xs: 56, sm: 64 },
                      height: { xs: 56, sm: 64 },
                      bgcolor: `${person.color}.light`,
                      color: `${person.color}.main`,
                      fontWeight: 700,
                      fontSize: { xs: '1.2rem', sm: '1.5rem' }
                    }}
                  >
                    {person.avatar}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      {person.position}
                    </Typography>
                    <Chip
                      label={person.role}
                      size="small"
                      sx={{
                        bgcolor: `${person.color}.light`,
                        color: `${person.color}.main`,
                        fontWeight: 600,
                        mt: 0.5
                      }}
                    />
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {person.name}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Department Functions */}
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          {t('profil.deptFunctionsHeading')}
        </Typography>
        {departmentFunctions.map((dept, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index + 1}`}
            onChange={handleChange(`panel${index + 1}`)}
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              '&:before': { display: 'none' }
            }}
          >
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: `${dept.color}.light`,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: `${dept.color}.main`
                  }}
                >
                  {dept.icon}
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dept.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {dept.description}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 600 }}>
                {t('profil.responsibilitiesLabel')}
              </Typography>
              <List>
                {dept.responsibilities.map((resp, idx) => (
                  <ListItem key={idx} sx={{ px: 0 }}>
                    <ListItemIcon>
                      <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText primary={resp} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Key Achievements */}
        <Typography variant="h5" sx={{ mt: { xs: 4, md: 6 }, mb: 3, fontWeight: 600 }}>
          {t('profil.achievementsHeading')}
        </Typography>
        <Paper sx={{ p: { xs: 3, md: 4 }, borderRadius: 3 }}>
          <Stack spacing={3}>
            {achievements.map((achievement, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  gap: 3,
                  alignItems: 'flex-start',
                  pb: index < achievements.length - 1 ? 3 : 0,
                  borderBottom: index < achievements.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider'
                }}
              >
                {/* Year */}
                <Box sx={{ minWidth: { xs: 80, sm: 100 }, textAlign: { xs: 'left', sm: 'right' } }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {achievement.year}
                  </Typography>
                </Box>

                {/* Connector and Dot */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: 2,
                      borderColor: 'primary.main',
                      bgcolor: 'background.paper'
                    }}
                  />
                  {index < achievements.length - 1 && (
                    <Box
                      sx={{
                        width: 2,
                        flexGrow: 1,
                        bgcolor: 'divider',
                        my: 1
                      }}
                    />
                  )}
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {achievement.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {achievement.description}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Paper>
      </Container>
    </Box>
  )
}

export default Profil