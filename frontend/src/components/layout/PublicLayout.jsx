import { Outlet, Link, useLocation } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import {
  Box,
  AppBar,
  Toolbar,
  Container,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
  Grid,
  Collapse,
  Paper
} from '@mui/material'
import {
  Menu as MenuIcon,
  Home,
  Article,
  PhotoLibrary,
  VideoLibrary,
  Announcement,
  DarkMode,
  LightMode,
  Translate,
  Info,
  LocalHospital,
  DataUsage,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  LocationOn,
  Email,
  ExpandLess,
  ExpandMore,
  ChevronRight,
  Description,
  Business,
  People,
  HealthAndSafety,
  MedicalServices,
  CalendarMonth,
  Folder,
  Gavel,
  Assessment,
  AccessTime,
  KeyboardArrowUp
} from '@mui/icons-material'
import api from '../../utils/api'
import { getVisitorId } from '../../utils/visitor'
import FloatingPromo from '../public/FloatingPromo'
import SiteSeo from '../public/SiteSeo'
import { useColorMode } from '../../contexts/ColorModeContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useSettings } from '../../contexts/SettingsContext'

const BRAND_API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const brandImg = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${BRAND_API_ORIGIN}/gambar/${src}`))

// Map icon name (string stored in DB) to the MUI icon component
const ICONS = {
  Home, Article, PhotoLibrary, VideoLibrary, Announcement, Info, LocalHospital,
  DataUsage, Phone, Description, Business, People, HealthAndSafety, MedicalServices, CalendarMonth,
  Folder, Gavel, Assessment
}
const renderIcon = (name, props) => {
  const IconComp = ICONS[name]
  return IconComp ? <IconComp {...props} /> : null
}

// Fallback navigation if the API is unavailable
const FALLBACK_MENU = [
  { id_menu: 'home', label: 'Beranda', labelKey: 'nav.beranda', type: 'route', url: '/', icon: 'Home', children: [] },
  { id_menu: 'profil', label: 'Profil', labelKey: 'nav.profil', type: 'route', url: '/profil', icon: 'Info', children: [] },
  { id_menu: 'layanan', label: 'Layanan', labelKey: 'nav.layanan', type: 'route', url: '/layanan', icon: 'LocalHospital', children: [] },
  { id_menu: 'berita', label: 'Berita', labelKey: 'nav.berita', type: 'route', url: '/berita', icon: 'Article', children: [] },
  { id_menu: 'pengumuman', label: 'Pengumuman', labelKey: 'nav.pengumuman', type: 'route', url: '/pengumuman', icon: 'Announcement', children: [] },
  { id_menu: 'galeri', label: 'Galeri', labelKey: 'nav.galeri', type: 'route', url: '/galeri', icon: 'PhotoLibrary', children: [] },
  { id_menu: 'infografis', label: 'Infografis', labelKey: 'nav.infografis', type: 'route', url: '/infografis', icon: 'Assessment', children: [] },
  { id_menu: 'data', label: 'Data', labelKey: 'nav.data', type: 'route', url: '/data', icon: 'DataUsage', children: [] },
  { id_menu: 'kontak', label: 'Kontak', labelKey: 'nav.kontak', type: 'route', url: '/kontak', icon: 'Phone', children: [] }
]

// Resolve a menu item to a navigable target
const resolveLink = (item) => {
  if (item.type === 'halaman' && item.halaman) {
    return { internal: true, to: `/${item.halaman.slug}` }
  }
  if (item.type === 'url') {
    return { internal: false, href: item.url || '#', blank: !!item.target_blank }
  }
  if (item.type === 'route') {
    let to = item.url || '/'
    if (!to.startsWith('/')) to = `/${to}` // route links must be absolute
    return { internal: true, to }
  }
  return null // dropdown / no direct link
}

// Build router/anchor props for a Button from a resolved link
const linkButtonProps = (link) => {
  if (!link) return {}
  if (link.internal) return { component: Link, to: link.to }
  return { component: 'a', href: link.href, target: link.blank ? '_blank' : undefined, rel: link.blank ? 'noopener noreferrer' : undefined }
}

// Footer column heading — light, uppercase, with a small gradient accent bar
const FooterHeading = ({ children }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography sx={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: 0.8, textTransform: 'uppercase', color: '#fff' }}>
      {children}
    </Typography>
    <Box sx={{ width: 36, height: 3, borderRadius: 2, mt: 1, background: 'linear-gradient(90deg, #0E5AB8, #4FC3F7)' }} />
  </Box>
)

const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)
  const menuTimeoutRef = useRef(null)
  const [menu, setMenu] = useState([])
  const [openSubmenu, setOpenSubmenu] = useState({})
  const location = useLocation()
  const { mode, toggleColorMode } = useColorMode()
  const { lang, setLang, t } = useLanguage()
  const { settings } = useSettings()

  const siteTitle = settings.site_title || 'Portal Resmi'
  const siteSubtitle = settings.site_subtitle || t('brand.subtitle')
  const logoUrl = settings.logo ? brandImg(settings.logo) : ''
  const socials = [
    { icon: <Facebook />, url: settings.facebook, color: '#1877F2', label: 'Facebook' },
    { icon: <Twitter />, url: settings.twitter, color: '#1DA1F2', label: 'Twitter' },
    { icon: <Instagram />, url: settings.instagram, color: '#E4405F', label: 'Instagram' },
    { icon: <YouTube />, url: settings.youtube, color: '#FF0000', label: 'YouTube' }
  ].filter((s) => s.url)

  // Resolve a menu item's label, translating fallback items via i18n keys
  const labelOf = (item) => (item.labelKey ? t(item.labelKey) : item.label)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    let active = true
    api.get('/public/menu')
      .then((res) => {
        if (active && Array.isArray(res.data) && res.data.length) setMenu(res.data)
      })
      .catch(() => { /* keep fallback */ })
    return () => { active = false }
  }, [])

  // Track a site visit on each public page view (fire-and-forget)
  useEffect(() => {
    api.post('/public/track', {
      path: location.pathname,
      visitor_id: getVisitorId(),
      referrer: document.referrer || ''
    }).catch(() => {})
  }, [location.pathname])

  const navMenu = menu.length ? menu : FALLBACK_MENU

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  // Hover open/close. The pending close timer lives in a ref (not state) so the
  // very next handleMenuEnter always sees and clears the live timer — using state
  // caused a stale-closure race where switching menus flashed the panel then closed it.
  const handleMenuEnter = (id) => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current)
      menuTimeoutRef.current = null
    }
    setActiveMenu(id)
  }

  const handleMenuLeave = () => {
    if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current)
    menuTimeoutRef.current = setTimeout(() => setActiveMenu(null), 140)
  }

  // Clean up any pending close timer on unmount
  useEffect(() => () => { if (menuTimeoutRef.current) clearTimeout(menuTimeoutRef.current) }, [])

  const handleSubMenuClick = () => setActiveMenu(null)

  const toggleSubmenu = (id) => {
    setOpenSubmenu((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const isActive = (item) => {
    const link = resolveLink(item)
    return link?.internal && location.pathname === link.to
  }

  // Desktop dropdown panel — recursive: children with their own children show a flyout submenu on hover
  const renderMenuChildren = (items) => (
    <Paper
      sx={{
        borderRadius: 2.5,
        boxShadow: '0 12px 40px rgba(0, 102, 204, 0.15)',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'visible',
        py: 1,
        minWidth: 240
      }}
    >
      {items.map((child) => {
        const childLink = resolveLink(child)
        const childActive = isActive(child)
        const hasKids = child.children && child.children.length > 0
        return (
          <Box key={child.id_menu} sx={{ position: 'relative', '&:hover > .submenu': { display: 'block' } }}>
            <Button
              {...(hasKids ? { component: 'div' } : linkButtonProps(childLink))}
              onClick={hasKids ? undefined : handleSubMenuClick}
              fullWidth
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                textTransform: 'none',
                px: 2,
                py: 1.25,
                borderRadius: 0,
                gap: 1.5,
                color: childActive ? 'primary.main' : 'text.primary',
                bgcolor: childActive ? 'action.selected' : 'transparent',
                fontWeight: childActive ? 600 : 500,
                fontSize: '0.82rem',
                cursor: hasKids ? 'default' : 'pointer',
                '&:hover': { bgcolor: 'action.hover', color: 'primary.main' }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', color: 'primary.main' }}>
                {renderIcon(child.icon, { sx: { fontSize: '1.2rem' } }) || <ChevronRight sx={{ fontSize: '1.2rem' }} />}
              </Box>
              <Box component="span" sx={{ flexGrow: 1 }}>{labelOf(child)}</Box>
              {hasKids && <ChevronRight sx={{ fontSize: '1.1rem', ml: 0.5, opacity: 0.6 }} />}
            </Button>
            {hasKids && (
              <Box className="submenu" sx={{ display: 'none', position: 'absolute', left: '100%', top: -8, pl: 0.5, zIndex: 10000 }}>
                {renderMenuChildren(child.children)}
              </Box>
            )}
          </Box>
        )
      })}
    </Paper>
  )

  // Mobile drawer — recursive collapsible list of arbitrary depth
  const renderDrawerItems = (items, depth = 0) =>
    items.map((item) => {
      const hasChildren = item.children && item.children.length > 0
      const link = resolveLink(item)
      return (
        <Box key={item.id_menu}>
          <ListItemButton
            {...(hasChildren ? { onClick: () => toggleSubmenu(item.id_menu) } : { ...linkButtonProps(link), onClick: handleDrawerToggle })}
            selected={isActive(item)}
            sx={{
              py: 1.25,
              pr: 2,
              pl: 2 + depth * 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '&.Mui-selected': { bgcolor: 'primary.light', color: 'primary.main', '& .MuiListItemIcon-root': { color: 'primary.main' } },
              '&:hover': { bgcolor: 'action.hover' }
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: 36 }}>
              {renderIcon(item.icon, { sx: { fontSize: depth ? '1.1rem' : '1.25rem' } }) || <ChevronRight sx={{ fontSize: '1.1rem' }} />}
            </ListItemIcon>
            <ListItemText
              primary={labelOf(item)}
              slotProps={{ primary: { fontWeight: isActive(item) ? 600 : 500, fontSize: depth ? '0.88rem' : '0.92rem' } }}
            />
            {hasChildren && (openSubmenu[item.id_menu] ? <ExpandLess /> : <ExpandMore />)}
          </ListItemButton>
          {hasChildren && (
            <Collapse in={!!openSubmenu[item.id_menu]} timeout="auto" unmountOnExit>
              <List disablePadding>{renderDrawerItems(item.children, depth + 1)}</List>
            </Collapse>
          )}
        </Box>
      )
    })

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          p: 3,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box
          sx={{
            width: logoUrl ? 'auto' : 48,
            height: 48,
            maxWidth: 200,
            bgcolor: logoUrl ? 'transparent' : 'white',
            borderRadius: logoUrl ? 0 : 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'primary.main',
            fontWeight: 700,
            fontSize: '1.5rem',
            overflow: 'hidden'
          }}
        >
          {logoUrl ? <Box component="img" src={logoUrl} alt="" sx={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }} /> : siteTitle.charAt(0).toUpperCase()}
        </Box>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {siteTitle}
          </Typography>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {siteSubtitle}
          </Typography>
        </Box>
      </Box>

      <Divider />

      <List sx={{ flexGrow: 1, py: 2 }}>
        {renderDrawerItems(navMenu)}
      </List>

      <Box sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        {/* Language switch */}
        <Box sx={{ display: 'flex', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {['id', 'en'].map((code) => (
            <Box
              key={code}
              component="button"
              onClick={() => setLang(code)}
              sx={{
                border: 'none',
                cursor: 'pointer',
                px: 1.75,
                py: 0.75,
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'inherit',
                color: lang === code ? 'primary.contrastText' : 'text.secondary',
                bgcolor: lang === code ? 'primary.main' : 'transparent'
              }}
            >
              {code.toUpperCase()}
            </Box>
          ))}
        </Box>
        {/* Theme switch */}
        <Button
          onClick={toggleColorMode}
          variant="outlined"
          startIcon={mode === 'dark' ? <LightMode /> : <DarkMode />}
          sx={{ fontWeight: 600, textTransform: 'none' }}
        >
          {mode === 'dark' ? 'Terang' : 'Gelap'}
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Site-wide SEO: analytics + search-console verification (renders nothing) */}
      <SiteSeo />
      {/* Skip to content — visible only when focused (WCAG 2.4.1) */}
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute', left: 8, top: -48, zIndex: 13000,
          px: 2, py: 1, borderRadius: 1, bgcolor: 'primary.main', color: 'common.white',
          fontWeight: 700, textDecoration: 'none', transition: 'top .15s',
          '&:focus': { top: 8 }
        }}
      >
        Lewati ke konten utama
      </Box>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? (scrolled ? 'rgba(15, 39, 64, 0.98)' : 'rgba(15, 39, 64, 0.85)')
              : (scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(255, 255, 255, 0.95)'),
          color: 'text.primary',
          boxShadow: scrolled ? '0 2px 16px rgba(0, 102, 204, 0.08)' : 'none',
          transition: 'all 0.3s ease-in-out',
          backdropFilter: 'blur(8px)',
          borderBottom: scrolled ? '1px solid' : 'none',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: { xs: 58, md: 64 },
              justifyContent: 'space-between'
            }}
          >
            {/* Logo & Brand */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <Box
                sx={{
                  width: logoUrl ? 'auto' : { xs: 34, md: 38 },
                  height: { xs: 34, md: 38 },
                  maxWidth: 180,
                  bgcolor: logoUrl ? 'transparent' : 'primary.main',
                  borderRadius: logoUrl ? 0 : 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: { xs: '1.05rem', md: '1.2rem' },
                  overflow: 'hidden'
                }}
              >
                {logoUrl ? <Box component="img" src={logoUrl} alt="" sx={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }} /> : siteTitle.charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography
                  sx={{
                    fontWeight: 700,
                    fontSize: { md: '0.95rem', lg: '1.02rem' },
                    lineHeight: 1.2,
                    color: 'primary.main'
                  }}
                >
                  {siteTitle}
                </Typography>
                <Typography
                  sx={{ color: 'text.secondary', fontSize: '0.62rem', lineHeight: 1.3 }}
                >
                  {siteSubtitle}
                </Typography>
              </Box>
            </Box>

            {/* Desktop Navigation */}
            <Box
              sx={{
                display: { xs: 'none', lg: 'flex' },
                alignItems: 'center',
                gap: 0.5,
                ml: 4
              }}
            >
              {navMenu.map((item) => {
                const hasChildren = item.children && item.children.length > 0
                const link = resolveLink(item)
                const active = isActive(item)
                return (
                  <Box
                    key={item.id_menu}
                    onMouseEnter={() => hasChildren && handleMenuEnter(item.id_menu)}
                    onMouseLeave={handleMenuLeave}
                    sx={{ position: 'relative' }}
                  >
                    <Button
                      {...(hasChildren ? { component: 'div' } : linkButtonProps(link))}
                      startIcon={renderIcon(item.icon, { sx: { fontSize: '1rem' } })}
                      sx={{
                        color: active ? 'primary.main' : 'text.primary',
                        fontWeight: active ? 600 : 500,
                        bgcolor: active ? 'action.selected' : 'transparent',
                        borderRadius: 2,
                        px: 1.5,
                        py: 0.75,
                        textTransform: 'none',
                        fontSize: '0.8rem',
                        minWidth: 'auto',
                        cursor: 'pointer',
                        transition: 'background-color 0.25s ease, color 0.2s ease, transform 0.2s ease',
                        '&:hover': {
                          bgcolor: active ? 'action.selected' : 'action.hover',
                          color: 'primary.main',
                          transform: 'translateY(-1px)'
                        },
                        '&:active': { transform: 'translateY(0)' }
                      }}
                    >
                      {labelOf(item)}
                      {hasChildren && (
                        <ExpandMore
                          sx={{
                            ml: 0.25,
                            fontSize: '1rem',
                            transition: 'transform 0.2s',
                            transform: activeMenu === item.id_menu ? 'rotate(180deg)' : 'none'
                          }}
                        />
                      )}
                    </Button>

                    {/* Dropdown */}
                    {hasChildren && activeMenu === item.id_menu && (
                      <Box
                        onMouseEnter={() => handleMenuEnter(item.id_menu)}
                        onMouseLeave={handleMenuLeave}
                        sx={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          pt: 1,
                          minWidth: 260,
                          zIndex: 9999,
                          transformOrigin: 'top left',
                          animation: 'menuIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          '@keyframes menuIn': {
                            from: { opacity: 0, transform: 'translateY(8px) scale(0.98)' },
                            to: { opacity: 1, transform: 'translateY(0) scale(1)' }
                          }
                        }}
                      >
                        {renderMenuChildren(item.children)}
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>

            {/* Right Side Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.75, md: 1 } }}>
              {/* Language switch (ID / EN) */}
              <Box
                sx={{
                  display: { xs: 'none', sm: 'flex' },
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  overflow: 'hidden'
                }}
              >
                {['id', 'en'].map((code) => (
                  <Box
                    key={code}
                    component="button"
                    onClick={() => setLang(code)}
                    aria-label={t('a11y.language')}
                    sx={{
                      border: 'none',
                      cursor: 'pointer',
                      px: 1.25,
                      py: 0.5,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                      color: lang === code ? 'primary.contrastText' : 'text.secondary',
                      bgcolor: lang === code ? 'primary.main' : 'transparent',
                      transition: 'background-color 0.2s ease, color 0.2s ease',
                      '&:hover': { color: lang === code ? 'primary.contrastText' : 'primary.main' }
                    }}
                  >
                    {code.toUpperCase()}
                  </Box>
                ))}
              </Box>

              {/* Theme switch (light / dark) */}
              <IconButton
                onClick={toggleColorMode}
                aria-label={t('a11y.theme')}
                size="small"
                sx={{
                  color: 'text.secondary',
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected', color: 'primary.main' }
                }}
              >
                {mode === 'dark' ? <LightMode sx={{ fontSize: '1.2rem' }} /> : <DarkMode sx={{ fontSize: '1.2rem' }} />}
              </IconButton>

              {/* Mobile language toggle (compact, shown when the segmented control is hidden) */}
              <IconButton
                onClick={() => setLang(lang === 'id' ? 'en' : 'id')}
                aria-label={t('a11y.language')}
                size="small"
                sx={{
                  display: { xs: 'inline-flex', sm: 'none' },
                  color: 'text.secondary',
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected', color: 'primary.main' }
                }}
              >
                <Translate sx={{ fontSize: '1.2rem' }} />
              </IconButton>

              <IconButton
                color="inherit"
                aria-label={t('a11y.openMenu')}
                edge="end"
                onClick={handleDrawerToggle}
                sx={{
                  display: { lg: 'none' },
                  bgcolor: 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { lg: 'none' },
          '& .MuiDrawer-paper': {
            width: { xs: '85vw', sm: 320 },
            maxWidth: 320
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flexGrow: 1,
          pt: { xs: '58px', md: '64px' },
          bgcolor: 'background.default',
          outline: 'none'
        }}
      >
        <Outlet />
      </Box>

      {/* Floating promotion (ads/survey), closable */}
      <FloatingPromo />

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          color: 'rgba(255,255,255,0.82)',
          background: 'linear-gradient(180deg, #0C2E52 0%, #071C33 100%)'
        }}
      >
        {/* Decorative wave — blends into the page background above (light/dark aware) */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            '& svg': { display: 'block', width: '100%', height: '100%' },
            '& path': { fill: (theme) => theme.palette.background.default }
          }}
        >
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
            <path d="M0,32L60,37.3C120,43,240,53,360,53.3C480,53,600,43,720,37.3C840,32,960,32,1080,34.7C1200,37,1320,43,1380,45.3L1440,48L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z" />
          </svg>
        </Box>

        <Container maxWidth="xl" sx={{ pt: { xs: 9, md: 12 }, pb: 3, position: 'relative' }}>
          <Grid container spacing={{ xs: 4, md: 5 }}>
            {/* Brand / About */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75, mb: 2.5 }}>
                <Box
                  sx={{
                    width: logoUrl ? 'auto' : 52,
                    height: 52,
                    maxWidth: 200,
                    bgcolor: logoUrl ? 'transparent' : 'primary.main',
                    borderRadius: logoUrl ? 0 : 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    overflow: 'hidden',
                    flexShrink: 0
                  }}
                >
                  {logoUrl ? <Box component="img" src={logoUrl} alt="" sx={{ height: '100%', width: 'auto', maxWidth: '100%', objectFit: 'contain', display: 'block' }} /> : siteTitle.charAt(0).toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.15rem', color: '#fff', lineHeight: 1.25 }}>
                    {siteTitle}
                  </Typography>
                  <Typography sx={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>
                    {siteSubtitle}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 420, mb: 3 }}>
                {t('footer.about')}
              </Typography>

              {socials.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1.25, flexWrap: 'wrap' }}>
                  {socials.map((social, si) => (
                    <Box
                      key={si}
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.25s',
                        '&:hover': { bgcolor: social.color, borderColor: social.color, color: '#fff', transform: 'translateY(-3px)' }
                      }}
                    >
                      {social.icon}
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Quick Links */}
            <Grid size={{ xs: 6, md: 3 }}>
              <FooterHeading>{t('footer.quickLinks')}</FooterHeading>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: t('footer.beritaTerkini'), path: '/berita' },
                  { label: t('footer.pengumuman'), path: '/pengumuman' },
                  { label: t('footer.galeri'), path: '/galeri' },
                  { label: t('footer.video'), path: '/video' },
                  { label: t('footer.data'), path: '/data' }
                ].map((link) => (
                  <Box
                    key={link.label}
                    component={Link}
                    to={link.path}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      py: 0.85,
                      color: 'rgba(255,255,255,0.7)',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      transition: 'all 0.2s',
                      '& .chev': { fontSize: '1rem', opacity: 0, transform: 'translateX(-6px)', transition: 'all 0.2s', color: 'primary.light' },
                      '&:hover': { color: '#fff', pl: 0.5 },
                      '&:hover .chev': { opacity: 1, transform: 'translateX(0)' }
                    }}
                  >
                    <ChevronRight className="chev" />
                    {link.label}
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* Contact Info */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FooterHeading>{t('footer.contact')}</FooterHeading>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {settings.alamat && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <LocationOn sx={{ color: 'primary.light', fontSize: 20, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {settings.alamat}
                    </Typography>
                  </Box>
                )}
                {settings.telepon && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Phone sx={{ color: 'primary.light', fontSize: 20 }} />
                    <Typography variant="body2" component="a" href={`tel:${settings.telepon}`} sx={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                      {settings.telepon}
                    </Typography>
                  </Box>
                )}
                {settings.email && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Email sx={{ color: 'primary.light', fontSize: 20 }} />
                    <Typography variant="body2" component="a" href={`mailto:${settings.email}`} sx={{ color: 'rgba(255,255,255,0.75)', textDecoration: 'none', wordBreak: 'break-all', '&:hover': { color: '#fff' } }}>
                      {settings.email}
                    </Typography>
                  </Box>
                )}
                {settings.jam_operasional && (
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <AccessTime sx={{ color: 'primary.light', fontSize: 20, mt: 0.25 }} />
                    <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {settings.jam_operasional}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: { xs: 3, md: 4 }, borderColor: 'rgba(255,255,255,0.1)' }} />

          {/* Bottom Bar */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>
              © {new Date().getFullYear()} {siteTitle}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Typography component={Link} to="#" variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                {t('footer.privacy')}
              </Typography>
              <Typography component={Link} to="#" variant="body2" sx={{ color: 'rgba(255,255,255,0.55)', textDecoration: 'none', '&:hover': { color: '#fff' } }}>
                {t('footer.terms')}
              </Typography>
              <Box
                component="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="Kembali ke atas"
                sx={{
                  border: '1px solid rgba(255,255,255,0.2)',
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  color: 'rgba(255,255,255,0.8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: 'primary.main', borderColor: 'primary.main', color: '#fff' }
                }}
              >
                <KeyboardArrowUp fontSize="small" />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  )
}

export default PublicLayout
