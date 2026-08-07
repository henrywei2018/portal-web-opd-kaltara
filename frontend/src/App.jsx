import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import LoginPage from './pages/public/LoginPage'
import Home from './pages/public/Home'
import Berita from './pages/public/Berita'
import DetailBerita from './pages/public/DetailBerita'
import Pengumuman from './pages/public/Pengumuman'
import Galeri from './pages/public/Galeri'
import Video from './pages/public/Video'
import Kontak from './pages/public/Kontak'
import Sejarah from './pages/public/Sejarah'
import VisiMisi from './pages/public/VisiMisi'
import Profil from './pages/public/Profil'
import Layanan from './pages/public/Layanan'
import Data from './pages/public/Data'
import Dokumen from './pages/public/Dokumen'
import Artikel from './pages/public/Artikel'
import DetailArtikel from './pages/public/DetailArtikel'
import Infografis from './pages/public/Infografis'
import DynamicPage from './pages/public/DynamicPage'
import AdminDashboard from './pages/admin/Dashboard'
import AdminBerita from './pages/admin/BeritaList'
import AdminArtikel from './pages/admin/ArtikelList'
import AdminPengumuman from './pages/admin/PengumumanList'
import AdminGaleri from './pages/admin/GaleriList'
import AdminInfografis from './pages/admin/InfografisList'
import AdminHalaman from './pages/admin/HalamanList'
import PageBuilder from './pages/admin/PageBuilder'
import AdminMenu from './pages/admin/MenuManager'
import AdminDokumen from './pages/admin/DokumenList'
import AdminLayanan from './pages/admin/LayananList'
import AdminHero from './pages/admin/HeroList'
import AdminStatistik from './pages/admin/StatistikList'
import AdminVideo from './pages/admin/VideoList'
import AdminKategori from './pages/admin/KategoriList'
import AdminTautanPenting from './pages/admin/TautanPentingList'
import AdminPromosi from './pages/admin/PromosiList'
import AdminUsers from './pages/admin/UsersList'
import AdminSettings from './pages/admin/SettingsPage'
import AdminSeo from './pages/admin/SeoPage'
import AdminPesan from './pages/admin/PesanList'
import AdminLaporanBerita from './pages/admin/LaporanBerita'
import AdminLayout from './components/admin/AdminLayout'
import PublicLayout from './components/layout/PublicLayout'
import LoadingState from './components/ui/LoadingState'
import CookieConsent from './components/ui/CookieConsent'
import AccessibilityWidget from './components/ui/AccessibilityWidget'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Memuat..." fullScreen />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

// Ability-gated admin route — redirect to dashboard if the role lacks access
const RequireAbility = ({ ability, children }) => {
  const { can, loading } = useAuth()
  if (loading) {
    return <LoadingState message="Memuat..." fullScreen />
  }
  return can(ability) ? children : <Navigate to="/admin/dashboard" replace />
}

// Public Route (redirect to admin if logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingState message="Memuat..." fullScreen />
  }

  if (user) {
    return <Navigate to="/admin/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes with PublicLayout */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/berita" element={<Berita />} />
          <Route path="/berita/:id" element={<DetailBerita />} />
          <Route path="/artikel" element={<Artikel />} />
          <Route path="/artikel/:id" element={<DetailArtikel />} />
          <Route path="/infografis" element={<Infografis />} />
          <Route path="/pengumuman" element={<Pengumuman />} />
          <Route path="/galeri" element={<Galeri />} />
          <Route path="/video" element={<Video />} />
          <Route path="/kontak" element={<Kontak />} />
          <Route path="/sejarah" element={<Sejarah />} />
          <Route path="/visi-misi" element={<VisiMisi />} />
          <Route path="/profil" element={<Profil />} />
          <Route path="/layanan" element={<Layanan />} />
          <Route path="/data" element={<Data />} />
          <Route path="/dokumen" element={<Dokumen />} />
          {/* Catch-all: resolves any other path as a dynamic page (supports nested slugs like /profil/tentang-kami) */}
          <Route path="*" element={<DynamicPage />} />
        </Route>

        {/* Login Route (without PublicLayout) */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="berita" element={<RequireAbility ability="berita"><AdminBerita /></RequireAbility>} />
          <Route path="artikel" element={<RequireAbility ability="artikel"><AdminArtikel /></RequireAbility>} />
          <Route path="pengumuman" element={<RequireAbility ability="pengumuman"><AdminPengumuman /></RequireAbility>} />
          <Route path="galeri" element={<RequireAbility ability="galeri"><AdminGaleri /></RequireAbility>} />
          <Route path="infografis" element={<RequireAbility ability="infografis"><AdminInfografis /></RequireAbility>} />
          <Route path="halaman" element={<RequireAbility ability="halaman"><AdminHalaman /></RequireAbility>} />
          <Route path="halaman/new" element={<RequireAbility ability="halaman"><PageBuilder /></RequireAbility>} />
          <Route path="halaman/:id/edit" element={<RequireAbility ability="halaman"><PageBuilder /></RequireAbility>} />
          <Route path="menu" element={<RequireAbility ability="menu"><AdminMenu /></RequireAbility>} />
          <Route path="dokumen" element={<RequireAbility ability="dokumen"><AdminDokumen /></RequireAbility>} />
          <Route path="layanan" element={<RequireAbility ability="layanan"><AdminLayanan /></RequireAbility>} />
          <Route path="hero" element={<RequireAbility ability="hero"><AdminHero /></RequireAbility>} />
          <Route path="tautan-penting" element={<RequireAbility ability="hero"><AdminTautanPenting /></RequireAbility>} />
          <Route path="promosi" element={<RequireAbility ability="hero"><AdminPromosi /></RequireAbility>} />
          <Route path="statistik" element={<RequireAbility ability="statistik"><AdminStatistik /></RequireAbility>} />
          <Route path="video" element={<RequireAbility ability="video"><AdminVideo /></RequireAbility>} />
          <Route path="kategori" element={<RequireAbility ability="kategori"><AdminKategori /></RequireAbility>} />
          <Route path="users" element={<RequireAbility ability="pengguna"><AdminUsers /></RequireAbility>} />
          <Route path="pengaturan" element={<RequireAbility ability="pengaturan"><AdminSettings /></RequireAbility>} />
          <Route path="seo" element={<RequireAbility ability="seo"><AdminSeo /></RequireAbility>} />
          <Route path="pesan" element={<RequireAbility ability="pesan"><AdminPesan /></RequireAbility>} />
          <Route path="laporan/berita" element={<RequireAbility ability="laporan"><AdminLaporanBerita /></RequireAbility>} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Routes>

      {/* Cookie Consent Banner */}
      <CookieConsent />
      <AccessibilityWidget />
    </>
  )
}

export default App
