import { useCallback, useEffect, useRef, useState } from 'react'
import { gambarUrl } from '../../utils/assetUrl'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Container,
  Grid,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Box,
  Pagination,
  TextField,
  Button,
  Chip,
  InputAdornment,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton
} from '@mui/material'
import {
  Search,
  CalendarToday,
  Person,
  FilterList,
  Tune,
  Close,
  ArrowForward
} from '@mui/icons-material'
import api from '../../utils/api'
import { announce } from '../../utils/announce'
import { formatDate, truncateText } from '../../utils/formatters'
import LoadingState from '../../components/ui/LoadingState'
import PageHeader from '../../components/ui/PageHeader'
import { useLanguage } from '../../contexts/LanguageContext'

const PER_PAGE = 9
const SORT_OPTIONS = ['newest', 'oldest', 'popular', 'title']

const Berita = () => {
  const { t } = useLanguage()
  const [searchParams, setSearchParams] = useSearchParams()

  // The URL is the single source of truth for every filter, so results stay
  // shareable and the browser back button walks through filter changes.
  const searchTerm = searchParams.get('q') || ''
  const selectedCategory = searchParams.get('kategori') || ''
  const selectedYear = searchParams.get('tahun') || ''
  const sortParam = searchParams.get('sort') || 'newest'
  const sortBy = SORT_OPTIONS.includes(sortParam) ? sortParam : 'newest'
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1)

  const [berita, setBerita] = useState([])
  const [kategori, setKategori] = useState([])
  const [years, setYears] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [firstLoad, setFirstLoad] = useState(true)
  // Text typed in the box; pushed to the URL after a short debounce.
  const [searchInput, setSearchInput] = useState(searchTerm)

  const hasFilters = Boolean(searchTerm || selectedCategory || selectedYear) || sortBy !== 'newest'

  const updateParams = useCallback((changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      Object.entries(changes).forEach(([key, value]) => {
        if (value === '' || value === null || value === undefined) next.delete(key)
        else next.set(key, String(value))
      })
      // Any filter change invalidates the current page number.
      if (!('page' in changes)) next.delete('page')
      return next
    })
  }, [setSearchParams])

  useEffect(() => {
    api.get('/public/berita-filters')
      .then((r) => {
        setKategori(Array.isArray(r.data?.kategori) ? r.data.kategori : [])
        setYears(Array.isArray(r.data?.tahun) ? r.data.tahun : [])
      })
      .catch((error) => console.error('Error fetching filter options:', error))
  }, [])

  // Last value this component pushed into the URL — lets us tell our own
  // debounced writes apart from external ones (chip delete, reset, back button).
  const pushedSearchRef = useRef(searchTerm)

  // Keep the input in sync when the URL changes from elsewhere, without
  // clobbering what the user is still typing.
  useEffect(() => {
    if (searchTerm === pushedSearchRef.current) return
    pushedSearchRef.current = searchTerm
    setSearchInput(searchTerm)
  }, [searchTerm])

  useEffect(() => {
    if (searchInput === searchTerm) return
    const timer = setTimeout(() => {
      pushedSearchRef.current = searchInput
      updateParams({ q: searchInput })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput, searchTerm, updateParams])

  useEffect(() => {
    let active = true
    setLoading(true)

    const params = new URLSearchParams({ per_page: PER_PAGE, sort: sortBy })
    if (page > 1) params.set('page', page)
    if (selectedCategory) params.set('kategori', selectedCategory)
    if (selectedYear) params.set('tahun', selectedYear)
    if (searchTerm) params.set('search', searchTerm)

    api.get(`/public/berita?${params.toString()}`)
      .then((response) => {
        if (!active) return
        const rows = response.data?.data || []
        setBerita(rows)
        setTotalPages(response.data?.last_page || 1)
        setTotal(response.data?.total ?? rows.length)
        if (searchTerm) {
          announce(`${response.data?.total ?? rows.length} hasil ditemukan untuk "${searchTerm}".`)
        }
      })
      .catch((error) => {
        if (!active) return
        console.error('Error fetching berita:', error)
        setBerita([])
        setTotalPages(1)
        setTotal(0)
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
        setFirstLoad(false)
      })

    return () => { active = false }
  }, [page, selectedCategory, selectedYear, sortBy, searchTerm])

  // A stale or hand-edited ?page= past the end of the result set: fall back.
  useEffect(() => {
    if (!loading && page > totalPages) {
      updateParams({ page: totalPages > 1 ? totalPages : '' })
    }
  }, [loading, page, totalPages, updateParams])

  const handleSearch = (e) => {
    e.preventDefault()
    pushedSearchRef.current = searchInput
    updateParams({ q: searchInput })
  }

  const handleCategoryChange = (category) => updateParams({ kategori: category })

  const clearFilters = () => {
    pushedSearchRef.current = ''
    setSearchInput('')
    setSearchParams({})
  }

  const rangeFrom = berita.length ? (page - 1) * PER_PAGE + 1 : 0
  const rangeTo = berita.length ? rangeFrom + berita.length - 1 : 0

  const getCategoryColor = (katName) => {
    const colors = {
      'Umum': 'primary',
      'Kesehatan Masyarakat': 'secondary',
      'Pelayanan Kesehatan': 'info',
      'Obat dan Farmasi': 'success',
      'default': 'primary'
    }
    return colors[katName] || colors.default
  }

  if (firstLoad) {
    return <LoadingState message={t('loading.berita')} fullScreen />
  }

  return (
    <Box>
      {/* Page Header */}
      <PageHeader
        title={t('page.berita.title')}
        subtitle={t('page.berita.subtitle')}
        breadcrumbs={[
          { label: t('nav.beranda'), href: '/' },
          { label: t('nav.berita') }
        ]}
        badge={{ label: t('page.berita.badge', { count: total }), color: 'primary' }}
      />

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {/* Search and Filter Section */}
        <Paper
          sx={{
            p: { xs: 2, sm: 3 },
            mb: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Grid container spacing={2} alignItems="center" component="form" onSubmit={handleSearch}>
            {/* Search */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                size="small"
                placeholder={t('common.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                inputProps={{ 'aria-label': t('common.search') }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: searchInput ? (
                    <InputAdornment position="end">
                      <IconButton
                        type="button"
                        size="small"
                        aria-label={t('common.clearFilter')}
                        onClick={() => {
                          pushedSearchRef.current = ''
                          setSearchInput('')
                          updateParams({ q: '' })
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="berita-kategori-label">{t('common.allCategories')}</InputLabel>
                <Select
                  labelId="berita-kategori-label"
                  value={kategori.length ? selectedCategory : ''}
                  label={t('common.allCategories')}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>{t('common.allCategories')}</em>
                  </MenuItem>
                  {kategori.map((kat) => (
                    <MenuItem key={kat.idkat} value={kat.idkat.toString()}>
                      {kat.nmkat}{kat.berita_count != null ? ` (${kat.berita_count})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Year Filter */}
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="berita-tahun-label">{t('common.allYears')}</InputLabel>
                <Select
                  labelId="berita-tahun-label"
                  value={years.length ? selectedYear : ''}
                  label={t('common.allYears')}
                  onChange={(e) => updateParams({ tahun: e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="">
                    <em>{t('common.allYears')}</em>
                  </MenuItem>
                  {years.map((year) => (
                    <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Sort */}
            <Grid size={{ xs: 6, sm: 3, md: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="berita-sort-label">{t('common.sort')}</InputLabel>
                <Select
                  labelId="berita-sort-label"
                  value={sortBy}
                  label={t('common.sort')}
                  onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value })}
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value="newest">{t('common.newest')}</MenuItem>
                  <MenuItem value="oldest">{t('common.oldest')}</MenuItem>
                  <MenuItem value="popular">{t('common.popular')}</MenuItem>
                  <MenuItem value="title">{t('common.titleAZ')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Clear Filters */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Tune />}
                onClick={clearFilters}
                disabled={!hasFilters}
                sx={{ borderRadius: 2, whiteSpace: 'nowrap' }}
              >
                {t('common.reset')}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Active Filters */}
        {hasFilters && (
          <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mr: 1 }}>
              {t('common.activeFilters')}
            </Typography>
            {selectedCategory && (
              <Chip
                label={kategori.find(k => k.idkat.toString() === selectedCategory)?.nmkat || selectedCategory}
                onDelete={() => handleCategoryChange('')}
                size="small"
                sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}
              />
            )}
            {selectedYear && (
              <Chip
                label={t('common.yearChip', { year: selectedYear })}
                onDelete={() => updateParams({ tahun: '' })}
                size="small"
                sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}
              />
            )}
            {sortBy !== 'newest' && (
              <Chip
                label={t(`common.${sortBy === 'title' ? 'titleAZ' : sortBy}`)}
                onDelete={() => updateParams({ sort: '' })}
                size="small"
                sx={{ bgcolor: 'action.selected', color: 'text.primary' }}
              />
            )}
            {searchTerm && (
              <Chip
                label={t('common.searchChip', { term: searchTerm })}
                onDelete={() => {
                  pushedSearchRef.current = ''
                  setSearchInput('')
                  updateParams({ q: '' })
                }}
                size="small"
                sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}
              />
            )}
          </Box>
        )}

        {/* Results Info */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} aria-live="polite">
            {berita.length > 0
              ? t('common.showingRange', { from: rangeFrom, to: rangeTo, total })
              : t('common.showingResults', { count: 0 })}
          </Typography>
          {totalPages > 1 && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t('common.pageOf', { page, totalPages })}
            </Typography>
          )}
        </Box>

        {/* News Grid */}
        {loading ? (
          <LoadingState message={t('loading.berita')} />
        ) : berita.length > 0 ? (
          <Grid container spacing={3}>
            {berita.map((item) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id_berita}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6,
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  {/* Card Image */}
                  {item.gambar && (
                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '56.25%', // 16:9 aspect ratio
                          overflow: 'hidden'
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={gambarUrl(item.gambar)}
                          alt={item.judul}
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.3s'
                          }}
                        />
                      </Box>
                      {/* Category Badge */}
                      {item.kategori && (
                        <Chip
                          label={item.kategori.nmkat}
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: { xs: 8, sm: 12 },
                            left: { xs: 8, sm: 12 },
                            bgcolor: `${getCategoryColor(item.kategori.nmkat)}.light`,
                            color: `${getCategoryColor(item.kategori.nmkat)}.contrastText`,
                            fontWeight: 600,
                            borderRadius: 1
                          }}
                        />
                      )}
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
                    {/* Meta Information */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDate(item.tanggal_post)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {item.user?.nama || t('common.author')}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      component={Link}
                      to={`/berita/${item.slug || item.id_berita}`}
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textDecoration: 'none',
                        color: 'text.primary',
                        '&:hover': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      {item.judul}
                    </Typography>

                    {/* Excerpt */}
                    {item.isi && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: 'text.secondary',
                          mb: 2,
                          lineHeight: 1.6,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {truncateText(item.isi.replace(/<[^>]*>/g, ''), 150)}
                      </Typography>
                    )}

                    {/* Tags */}
                    {item.keyword && (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 2 }}>
                          {item.keyword.split(',').slice(0, 3).map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag.trim()}
                              size="small"
                              sx={{
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: 'action.hover',
                                color: 'text.secondary'
                              }}
                            />
                          ))}
                        </Box>
                    )}
                  </CardContent>

                  {/* Card Actions */}
                  <CardActions sx={{ p: { xs: 2, sm: 3 }, pt: 0 }}>
                    <Button
                      size="small"
                      component={Link}
                      to={`/berita/${item.slug || item.id_berita}`}
                      endIcon={<ArrowForward />}
                      sx={{ fontWeight: 600, px: 2 }}
                    >
                      {t('common.readMore')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          /* Empty State */
          <Paper
            sx={{
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              borderRadius: 3,
              bgcolor: 'background.paper'
            }}
          >
            <FilterList sx={{ fontSize: { xs: 36, sm: 48 }, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
              {t('empty.beritaTitle')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              {hasFilters ? t('empty.searchHint') : t('empty.berita')}
            </Typography>
            {hasFilters && (
              <Button variant="contained" onClick={clearFilters} sx={{ mt: 2 }}>
                {t('common.clearFilter')}
              </Button>
            )}
          </Paper>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && berita.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 3, md: 4 }, mb: 2 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => {
                updateParams({ page: value > 1 ? value : '' })
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600
                }
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  )
}

export default Berita