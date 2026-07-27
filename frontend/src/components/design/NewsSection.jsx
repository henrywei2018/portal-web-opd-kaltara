import { useState, useEffect } from 'react'
import { Box, Grid, Typography, Paper, Chip, List, ListItem, ListItemButton, Link, Divider, Button } from '@mui/material'
import { gambarUrl, fileUrl } from '../../utils/assetUrl'
import { ArrowForward, TrendingUp, Description, Info, Announcement, Pin, Visibility } from '@mui/icons-material'
import { formatDate } from '../../utils/formatters'
import { useLanguage } from '../../contexts/LanguageContext'
import NewsCarousel from './NewsCarousel'

// Auto-rotating infografis preview for the homepage — crossfades through all
// published infografis (like the news carousel) with clickable indicator dots.
const InfografisRotator = ({ items = [] }) => {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (items.length <= 1) return
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 5000)
    return () => clearInterval(id)
  }, [items.length])

  // Derive a safe index so a shrinking list never points out of bounds
  const safeIdx = items.length ? idx % items.length : 0
  const active = items[safeIdx] || items[0]

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 250, borderRadius: 2, overflow: 'hidden', mb: 2, bgcolor: 'background.default' }}>
      {items.map((it, i) => (
        <Box
          key={it.id_infografis ?? i}
          component="img"
          src={gambarUrl(it.gambar)}
          alt={it.judul || 'Infografis'}
          loading="lazy"
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: i === safeIdx ? 1 : 0, transition: 'opacity 0.8s ease' }}
        />
      ))}

      {/* Current title caption */}
      {active?.judul && (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, px: 1.5, pt: 3, pb: items.length > 1 ? 2.5 : 1.25, background: 'linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))' }}>
          <Typography sx={{ color: 'white', fontWeight: 600, fontSize: '0.85rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {active.judul}
          </Typography>
        </Box>
      )}

      {/* Indicator dots */}
      {items.length > 1 && (
        <Box sx={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 0.75 }}>
          {items.map((_, i) => (
            <Box
              key={i}
              onClick={() => setIdx(i)}
              sx={{ width: i === safeIdx ? 18 : 7, height: 7, borderRadius: 4, bgcolor: i === safeIdx ? 'secondary.main' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 0 0 1px rgba(0,0,0,0.2)' }}
            />
          ))}
        </Box>
      )}
    </Box>
  )
}

const NewsSection = ({ latestNews = [], featured = [], articles = [], announcements = [], infografis = [] }) => {
  const { t } = useLanguage()
  // Featured (pinned) news drives the main carousel; fall back to latest when none pinned.
  const featuredNews = featured.length ? featured.slice(0, 5) : latestNews.slice(0, 5)
  const recentNews = featured.length ? latestNews.slice(0, 4) : latestNews.slice(5, 9)
  return (
    <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: 'background.default' }}>
      <Box sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>

        {/* Section Header */}
        <Box sx={{ mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', md: '2rem' },
              color: 'text.primary',
              mb: 1
            }}
          >
            {t('home.news.sectionTitle')}
          </Typography>
          <Divider sx={{ borderColor: 'primary.main', borderWidth: 2, width: 80 }} />
        </Box>

        <Grid container spacing={2.5}>
          {/* Left Column - Main Content */}
          <Grid size={{ xs: 12, md: 7.5, lg: 8 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* 1. Berita Utama (Pinned/Carousel) */}
              <Paper
                sx={{
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: '1.1rem', md: '1.25rem' },
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <Pin sx={{ color: 'error.main' }} />
                      {t('home.news.headline')}
                    </Typography>
                  </Box>
                </Box>

                {featuredNews.length > 0 ? (
                  <NewsCarousel news={featuredNews} autoSlideDuration={7000} />
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      bgcolor: 'background.default',
                      borderTop: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('home.news.empty')}
                    </Typography>
                  </Box>
                )}
              </Paper>

              {/* 2. Two Containers Below: Berita Terbaru + Artikel */}
              <Grid container spacing={2}>
                {/* Berita Terbaru */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      border: '1px solid rgba(0,0,0,0.12)',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Info sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
                        {t('home.news.latest')}
                      </Typography>
                    </Box>

                    <List sx={{ py: 0 }}>
                      {recentNews.map((news, idx) => (
                        <ListItem
                          key={news.id_berita}
                          disablePadding
                          sx={{
                            borderBottom: idx < recentNews.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                            py: 1.5,
                            px: 0
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            to={`/berita/${news.slug || news.id_berita}`}
                            sx={{
                              p: 0,
                              alignItems: 'flex-start',
                              gap: 2,
                              '&:hover': { bgcolor: 'transparent' }
                            }}
                          >
                            {news.gambar && (
                              <Box
                                component="img"
                                src={gambarUrl(news.gambar)}
                                alt={news.judul}
                                sx={{
                                  width: 70,
                                  height: 70,
                                  borderRadius: 2,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  bgcolor: 'background.default'
                                }}
                              />
                            )}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              {news.kategori && (
                                <Chip
                                  label={news.kategori.nmkat}
                                  size="small"
                                  sx={{
                                    bgcolor: 'primary.light',
                                    color: 'primary.dark',
                                    fontSize: '0.65rem',
                                    height: 18,
                                    mb: 0.5
                                  }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: 'text.primary',
                                  mb: 0.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.3
                                }}
                              >
                                {news.judul}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                                <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                  {formatDate(news.tanggal_post, 'short')}
                                </Typography>
                                {news.views > 0 && (
                                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, fontSize: '0.72rem' }}>
                                    <Visibility sx={{ fontSize: 13 }} /> {news.views}
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>

                    <Button
                      variant="text"
                      size="small"
                      endIcon={<ArrowForward />}
                      href="/berita"
                      sx={{
                        mt: 1,
                        color: 'primary.main',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      {t('home.viewAll')}
                    </Button>
                  </Paper>
                </Grid>

                {/* Artikel */}
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: { xs: 2, md: 2.5 },
                      borderRadius: 3,
                      bgcolor: 'background.paper',
                      boxShadow: 1,
                      border: '1px solid rgba(0,0,0,0.12)',
                      height: '100%'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Description sx={{ color: 'info.main', fontSize: '1.1rem' }} />
                        {t('nav.artikel')}
                      </Typography>
                    </Box>

                    <List sx={{ py: 0 }}>
                      {articles && articles.length > 0 ? articles.slice(0, 4).map((article, idx) => (
                        <ListItem
                          key={article.id_artikel || article.id}
                          disablePadding
                          sx={{
                            borderBottom: idx < Math.min(3, articles.slice(0, 4).length - 1) ? '1px solid' : 'none',
                            borderColor: 'divider',
                            py: 1.5,
                            px: 0
                          }}
                        >
                          <ListItemButton
                            component={Link}
                            to={`/artikel/${article.slug || article.id_artikel || article.id}`}
                            sx={{
                              p: 0,
                              alignItems: 'flex-start',
                              gap: 2,
                              '&:hover': { bgcolor: 'transparent' }
                            }}
                          >
                            {article.gambar && (
                              <Box
                                component="img"
                                src={gambarUrl(article.gambar)}
                                alt={article.judul}
                                sx={{
                                  width: 70,
                                  height: 70,
                                  borderRadius: 2,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  bgcolor: 'background.default'
                                }}
                              />
                            )}
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  fontSize: '0.875rem',
                                  color: 'text.primary',
                                  mb: 0.5,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  lineHeight: 1.3
                                }}
                              >
                                {article.judul}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                              >
                                {formatDate(article.tanggal_post, 'short')}
                              </Typography>
                            </Box>
                          </ListItemButton>
                        </ListItem>
                      )) : null}
                    </List>

                    {articles && articles.length > 0 && (
                      <Button
                        variant="text"
                        size="small"
                        endIcon={<ArrowForward />}
                        href="/artikel"
                        sx={{
                          mt: 1,
                          color: 'info.main',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          '&:hover': { bgcolor: 'info.main', color: 'white' }
                        }}
                      >
                        {t('home.viewAll')}
                      </Button>
                    )}
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          {/* Right Column - Sidebar */}
          <Grid size={{ xs: 12, md: 4.5, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, height: '100%' }}>

              {/* 1. Infografis (Sejajar dengan Berita Utama) */}
              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Description sx={{ color: 'secondary.main', fontSize: '1.25rem' }} />
                  {t('nav.infografis')}
                </Typography>

                {infografis.length > 0 ? (
                  <InfografisRotator items={infografis} />
                ) : (
                  <Box
                    sx={{
                      width: '100%',
                      height: 200,
                      bgcolor: 'background.default',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {t('home.infografis.empty')}
                    </Typography>
                  </Box>
                )}

                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ArrowForward />}
                  href="/infografis"
                  fullWidth
                  sx={{
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    fontWeight: 600,
                    py: 1,
                    '&:hover': { bgcolor: 'secondary.main', color: 'white', borderColor: 'secondary.main' }
                  }}
                >
                  {t('home.viewAll')}
                </Button>
              </Paper>

              {/* 2. Pengumuman (Di bawah Infografis) */}
              <Paper
                sx={{
                  p: { xs: 2, md: 2.5 },
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  border: '1px solid',
                  borderColor: 'divider'
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    fontSize: '1.1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Announcement sx={{ color: 'warning.main', fontSize: '1.25rem' }} />
                  {t('nav.pengumuman')}
                </Typography>

                <List sx={{ py: 0 }}>
                  {announcements.map((item, idx) => (
                    <ListItem
                      key={item.id_pengumuman || idx}
                      disablePadding
                      sx={{
                        borderBottom: idx < announcements.length - 1 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        py: 1.5,
                        px: 0
                      }}
                    >
                      <ListItemButton
                        component={item.file ? 'a' : Link}
                        href={item.file ? fileUrl(item.file) : undefined}
                        to={item.file ? undefined : '/pengumuman'}
                        target={item.file ? '_blank' : undefined}
                        rel={item.file ? 'noopener noreferrer' : undefined}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          alignItems: 'flex-start',
                          '&:hover': { bgcolor: 'action.selected' }
                        }}
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              color: 'text.primary',
                              mb: 0.5,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.3
                            }}
                          >
                            {item.judul}
                          </Typography>
                          {item.pengumuman_tanggal && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                            >
                              {formatDate(item.pengumuman_tanggal, 'short')}
                            </Typography>
                          )}
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>

                {announcements.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <Typography variant="body2">{t('home.announcement.empty')}</Typography>
                  </Box>
                )}

                {announcements.length > 3 && (
                  <Button
                    variant="text"
                    size="small"
                    endIcon={<ArrowForward />}
                    href="/pengumuman"
                    sx={{
                      mt: 1,
                      color: 'warning.main',
                      fontWeight: 600,
                      '&:hover': { bgcolor: 'warning.main', color: 'white' }
                    }}
                  >
                    {t('home.viewAll')}
                  </Button>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  )
}

export default NewsSection
