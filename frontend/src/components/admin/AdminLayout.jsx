import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import api from '../../utils/api'
import {
  Box,
  Typography,
  Button,
  Drawer,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Badge
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Article as ArticleIcon,
  Description as DescriptionIcon,
  Announcement as AnnouncementIcon,
  Image as ImageIcon,
  Assessment as InfografisIcon,
  VideoLibrary as VideoIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  TravelExplore as SeoIcon,
  Mail as MailIcon,
  Web as WebIcon,
  AccountTree as MenuTreeIcon,
  Folder as FolderIcon,
  MedicalServices as LayananIcon,
  ViewCarousel as HeroIcon,
  Insights as StatistikIcon,
  Link as LinkIcon,
  Campaign as CampaignIcon,
  Summarize as ReportIcon,
  ExitToApp as LogoutIcon,
  Menu as MenuIcon,
  OpenInNew as OpenInNewIcon,
  KeyboardArrowDown
} from '@mui/icons-material'

const drawerWidth = 264
const ROLE_LABELS = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor', kontributor: 'Kontributor' }
const SIDEBAR_BG = 'linear-gradient(170deg, #07223F 0%, #0B3D7D 48%, #0E5AB8 100%)'

const NAV_SECTIONS = [
  {
    heading: 'Konten',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
      { text: 'Layanan', icon: <LayananIcon />, path: '/admin/layanan', ability: 'layanan' },
      { text: 'Berita', icon: <ArticleIcon />, path: '/admin/berita', ability: 'berita' },
      { text: 'Artikel', icon: <DescriptionIcon />, path: '/admin/artikel', ability: 'artikel' },
      { text: 'Pengumuman', icon: <AnnouncementIcon />, path: '/admin/pengumuman', ability: 'pengumuman' },
      { text: 'Galeri', icon: <ImageIcon />, path: '/admin/galeri', ability: 'galeri' },
      { text: 'Infografis', icon: <InfografisIcon />, path: '/admin/infografis', ability: 'infografis' },
      { text: 'Video', icon: <VideoIcon />, path: '/admin/video', ability: 'video' },
      { text: 'Dokumen', icon: <FolderIcon />, path: '/admin/dokumen', ability: 'dokumen' },
      { text: 'Kategori', icon: <CategoryIcon />, path: '/admin/kategori', ability: 'kategori' }
    ]
  },
  {
    heading: 'Situs',
    items: [
      { text: 'Hero Beranda', icon: <HeroIcon />, path: '/admin/hero', ability: 'hero' },
      { text: 'Tautan Penting', icon: <LinkIcon />, path: '/admin/tautan-penting', ability: 'hero' },
      { text: 'Promosi', icon: <CampaignIcon />, path: '/admin/promosi', ability: 'hero' },
      { text: 'Statistik', icon: <StatistikIcon />, path: '/admin/statistik', ability: 'statistik' },
      { text: 'Halaman', icon: <WebIcon />, path: '/admin/halaman', ability: 'halaman' },
      { text: 'Menu', icon: <MenuTreeIcon />, path: '/admin/menu', ability: 'menu' }
    ]
  },
  {
    heading: 'Laporan',
    items: [
      { text: 'Laporan Berita', icon: <ReportIcon />, path: '/admin/laporan/berita', ability: 'laporan' }
    ]
  },
  {
    heading: 'Sistem',
    items: [
      { text: 'Pesan Masuk', icon: <MailIcon />, path: '/admin/pesan', ability: 'pesan', badgeKey: 'pesan' },
      { text: 'Pengguna', icon: <PeopleIcon />, path: '/admin/users', ability: 'pengguna' },
      { text: 'SEO', icon: <SeoIcon />, path: '/admin/seo', ability: 'seo' },
      { text: 'Pengaturan', icon: <SettingsIcon />, path: '/admin/pengaturan', ability: 'pengaturan' }
    ]
  }
]

const ALL_ITEMS = NAV_SECTIONS.flatMap((s) => s.items)

const BRAND_API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const brandImg = (src) => (!src ? '' : (/^https?:\/\//.test(src) ? src : `${BRAND_API_ORIGIN}/gambar/${src}`))

const AdminLayout = () => {
  const { user, logout, can } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const location = useLocation()

  const siteTitle = settings.site_title || 'Portal Resmi'
  const logoUrl = settings.logo ? brandImg(settings.logo) : ''

  // Show only the modules the current role is allowed to access
  const navSections = NAV_SECTIONS
    .map((s) => ({ ...s, items: s.items.filter((i) => !i.ability || can(i.ability)) }))
    .filter((s) => s.items.length > 0)

  const [mobileOpen, setMobileOpen] = useState(false)
  const [userAnchor, setUserAnchor] = useState(null)
  const [unreadPesan, setUnreadPesan] = useState(0)

  // Poll the unread-messages count for the sidebar badge (only if allowed)
  useEffect(() => {
    if (!can('pesan')) return
    let active = true
    const load = () => api.get('/admin/pesan/unread-count')
      .then((r) => { if (active) setUnreadPesan(r.data?.count || 0) })
      .catch(() => {})
    load()
    const onUpdate = () => load()
    window.addEventListener('pesan-updated', onUpdate)
    const id = setInterval(load, 60000)
    return () => { active = false; window.removeEventListener('pesan-updated', onUpdate); clearInterval(id) }
  }, [can])

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/')
  const activeItem = ALL_ITEMS.find((i) => isActive(i.path))
  const pageTitle = activeItem?.text || 'Admin'

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const closeMobile = () => setMobileOpen(false)
  const initial = (user?.nama || 'A').charAt(0).toUpperCase()
  const roleLabel = ROLE_LABELS[user?.role] || 'Administrator'

  // One cohesive sidebar (brand + nav + footer) — used by both the floating
  // desktop panel and the mobile drawer. No dividers: the gradient flows as one piece.
  const sidebarBody = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', color: 'white' }}>
      {/* Brand */}
      <Box sx={{ px: 2.5, py: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.16)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '1.3rem',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          {logoUrl
            ? <Box component="img" src={logoUrl} alt={siteTitle} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            : (siteTitle.trim().charAt(0).toUpperCase() || 'D')}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.2 }}>{siteTitle}</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
            Panel Admin
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          px: 2,
          pb: 1,
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.25) transparent',
          '&::-webkit-scrollbar': { width: 6 },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 3 }
        }}
      >
        {navSections.map((section) => (
          <Box key={section.heading} sx={{ mb: 2 }}>
            <Typography
              sx={{
                px: 1.5,
                mb: 0.75,
                fontSize: '0.68rem',
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.45)'
              }}
            >
              {section.heading}
            </Typography>
            {section.items.map((item) => {
              const active = isActive(item.path)
              return (
                <ListItemButton
                  key={item.text}
                  component={Link}
                  to={item.path}
                  onClick={closeMobile}
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    py: 1,
                    px: 1.5,
                    color: active ? 'white' : 'rgba(255,255,255,0.72)',
                    bgcolor: active ? 'rgba(255,255,255,0.16)' : 'transparent',
                    position: 'relative',
                    transition: 'background-color 0.2s ease, color 0.2s ease',
                    boxShadow: active ? '0 6px 18px rgba(0,0,0,0.18)' : 'none',
                    '&::before': active
                      ? {
                          content: '""',
                          position: 'absolute',
                          left: 4,
                          top: '22%',
                          bottom: '22%',
                          width: 3,
                          borderRadius: 3,
                          bgcolor: '#7EB6FF'
                        }
                      : {},
                    '&:hover': {
                      bgcolor: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)',
                      color: 'white'
                    }
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>
                    {item.badgeKey === 'pesan' && unreadPesan > 0
                      ? <Badge badgeContent={unreadPesan} color="error">{item.icon}</Badge>
                      : item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{ primary: { fontSize: '0.875rem', fontWeight: active ? 600 : 500 } }}
                  />
                </ListItemButton>
              )
            })}
          </Box>
        ))}
      </Box>

      {/* User footer */}
      <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar sx={{ width: 38, height: 38, bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 700, fontSize: '1rem' }}>
          {initial}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.nama || 'Administrator'}
          </Typography>
          <Typography sx={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)' }}>{roleLabel}</Typography>
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} sx={{ color: 'rgba(255,255,255,0.8)', '&:hover': { color: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={closeMobile}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { lg: 'none' },
          '& .MuiDrawer-paper': { width: drawerWidth, border: 'none', background: SIDEBAR_BG }
        }}
      >
        {sidebarBody}
      </Drawer>

      {/* Desktop floating sidebar — one rounded, detached panel */}
      <Box
        sx={{
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          position: 'fixed',
          top: 16,
          left: 16,
          bottom: 16,
          width: drawerWidth,
          borderRadius: 3,
          overflow: 'hidden',
          background: SIDEBAR_BG,
          boxShadow: '0 16px 48px rgba(7, 34, 63, 0.28)',
          zIndex: 1200
        }}
      >
        {sidebarBody}
      </Box>

      {/* Main area */}
      <Box
        sx={{
          ml: { xs: 0, lg: `${drawerWidth + 16}px` },
          px: { xs: 2, md: 4, lg: 6 },
          py: 2,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {/* Floating topbar */}
        <Box
          sx={{
            position: 'sticky',
            top: 16,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: { xs: 1.5, md: 2.5 },
            py: 1.25,
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 6px 24px rgba(0,0,0,0.06)'
          }}
        >
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { lg: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.05rem', md: '1.25rem' }, lineHeight: 1.2 }}>
              {pageTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
              {settings.site_subtitle || 'Pemerintah Daerah'}
            </Typography>
          </Box>

          <Button
            component="a"
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            variant="outlined"
            size="small"
            startIcon={<OpenInNewIcon />}
            sx={{ display: { xs: 'none', sm: 'inline-flex' }, fontWeight: 600, borderRadius: 2 }}
          >
            Lihat Situs
          </Button>

          <Button
            onClick={(e) => setUserAnchor(e.currentTarget)}
            endIcon={<KeyboardArrowDown />}
            sx={{ textTransform: 'none', color: 'text.primary', borderRadius: 2, px: 1 }}
          >
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
              {initial}
            </Avatar>
            <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'left' }}>
              <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.1 }}>{user?.nama || 'Admin'}</Typography>
              <Typography sx={{ fontSize: '0.7rem', color: 'text.secondary', lineHeight: 1.1 }}>{roleLabel}</Typography>
            </Box>
          </Button>
          <Menu
            anchorEl={userAnchor}
            open={Boolean(userAnchor)}
            onClose={() => setUserAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 180, mt: 1 } } }}
          >
            <MenuItem component="a" href="/" target="_blank" onClick={() => setUserAnchor(null)}>
              <ListItemIcon><OpenInNewIcon fontSize="small" /></ListItemIcon>
              Lihat Situs
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setUserAnchor(null); handleLogout() }} sx={{ color: 'error.main' }}>
              <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>

        {/* Page content */}
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLayout
