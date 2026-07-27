import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Box, Container, Typography, Button } from '@mui/material'
import { Home } from '@mui/icons-material'
import api from '../../utils/api'
import LoadingState from '../../components/ui/LoadingState'
import BlockRenderer from '../../components/public/BlockRenderer'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSeo } from '../../utils/seo'

const DynamicPage = () => {
  const { t } = useLanguage()
  const params = useParams()
  const slug = params['*'] || ''
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let active = true
    const fetchPage = async () => {
      setLoading(true)
      setNotFound(false)
      try {
        const res = await api.get(`/public/halaman/${slug}`)
        if (!active) return
        setPage(res.data)
      } catch (e) {
        if (active) setNotFound(true)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchPage()
    return () => { active = false }
  }, [slug])

  useSeo({
    title: page?.judul,
    description: page?.meta_description,
    image: page?.gambar
  })

  if (loading) {
    return <LoadingState message={t('dynamic.loadingPage')} fullScreen />
  }

  if (notFound || !page) {
    return (
      <Container maxWidth="sm" sx={{ py: { xs: 10, md: 14 }, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>404</Typography>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>{t('dynamic.notFound')}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
          {t('dynamic.notFoundDesc')}
        </Typography>
        <Button component={Link} to="/" variant="contained" startIcon={<Home />}>
          {t('dynamic.backToHome')}
        </Button>
      </Container>
    )
  }

  const blocks = Array.isArray(page.blocks) ? page.blocks : []

  return (
    <Box>
      {blocks.length > 0 ? (
        <BlockRenderer blocks={blocks} />
      ) : (
        <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 6, md: 10 } }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>{page.judul}</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {t('dynamic.noContent')}
          </Typography>
        </Container>
      )}
    </Box>
  )
}

export default DynamicPage
