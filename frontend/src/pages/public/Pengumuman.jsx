import { Container, Typography } from '@mui/material'
import { useLanguage } from '../../contexts/LanguageContext'

const Pengumuman = () => {
  const { t } = useLanguage()
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4">{t('page.pengumuman.title')}</Typography>
      <Typography variant="body1">{t('common.comingSoon')}</Typography>
    </Container>
  )
}
export default Pengumuman
