import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Box, Container, Typography, Chip, Stack } from '@mui/material'
import { Folder } from '@mui/icons-material'
import api from '../../utils/api'
import LoadingState from '../../components/ui/LoadingState'
import DocumentList from '../../components/public/DocumentList'
import { useLanguage } from '../../contexts/LanguageContext'

const Dokumen = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()
  const kategori = searchParams.get('kategori') || ''
  const [categories, setCategories] = useState([])
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/public/dokumen-kategori').then((r) => setCategories(Array.isArray(r.data) ? r.data : [])).catch(() => {})
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    api.get(`/public/dokumen${kategori ? `?kategori=${kategori}` : ''}`)
      .then((r) => { if (active) setDocs(Array.isArray(r.data) ? r.data : []) })
      .catch(() => { if (active) setDocs([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [kategori])

  const setKat = (slug) => {
    if (slug) setSearchParams({ kategori: slug })
    else setSearchParams({})
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: { xs: 5, md: 7 } }}>
        <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Folder />
            <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>{t('page.dokumen.overline')}</Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', md: '2.5rem' } }}>{t('page.dokumen.title')}</Typography>
          <Typography variant="body1" sx={{ opacity: 0.9, mt: 1 }}>
            {t('page.dokumen.subtitle')}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth={false} sx={{ maxWidth: '1280px', px: { xs: 2, sm: 3, md: 4 }, py: { xs: 4, md: 6 } }}>
        {/* Category filter */}
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={t('common.all')} color={kategori === '' ? 'primary' : 'default'} onClick={() => setKat('')} />
          {categories.map((c) => (
            <Chip
              key={c.id_kategori_dokumen}
              label={`${c.nama} (${c.dokumen_count ?? 0})`}
              color={kategori === c.slug ? 'primary' : 'default'}
              onClick={() => setKat(c.slug)}
            />
          ))}
        </Stack>

        {loading ? <LoadingState message={t('loading.dokumen')} /> : <DocumentList documents={docs} />}
      </Container>
    </Box>
  )
}

export default Dokumen
