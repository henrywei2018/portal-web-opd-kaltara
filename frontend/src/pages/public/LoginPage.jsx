import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material'
import { VerifiedUser } from '@mui/icons-material'
import api from '../../utils/api'
import GoogleReCaptcha from 'react-google-recaptcha'

// Kode galat dari callback SSO (?sso_galat=...) -> pesan untuk pengguna.
const PESAN_SSO = {
  nonaktif: 'Login SSO belum diaktifkan untuk situs ini.',
  gagal: 'Login melalui SSO Portal Kaltara gagal. Silakan coba lagi.',
  realm: 'Akun SSO Anda tidak termasuk pengguna yang diizinkan masuk panel admin.',
  peran: 'Akun Anda belum diberi peran untuk aplikasi ini di SSO Portal Kaltara. Hubungi admin portal.',
  akun_nonaktif: 'Akun Anda dinonaktifkan di situs ini. Hubungi administrator.',
}

const LoginPage = () => {
  const { login, loginSso } = useAuth()
  const [params, setParams] = useSearchParams()
  const [sso, setSso] = useState(null)
  const [ssoProses, setSsoProses] = useState(Boolean(params.get('sso')))
  const sudahTukar = useRef(false)
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [error, setError] = useState(() => {
    const galat = params.get('sso_galat')
    return galat ? (PESAN_SSO[galat] || PESAN_SSO.gagal) : ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    api.get('/auth/sso').then((r) => setSso(r.data)).catch(() => setSso(null))
  }, [])

  // Kembali dari portal: tukar kode serah-terima (sekali, meski StrictMode
  // menjalankan efek dua kali), lalu bersihkan kodenya dari URL.
  useEffect(() => {
    const kode = params.get('sso')
    const galat = params.get('sso_galat')
    if (galat) {
      // Pesannya sudah dibaca saat inisialisasi state; cukup rapikan URL.
      setParams({}, { replace: true })
      return
    }
    if (!kode || sudahTukar.current) return
    sudahTukar.current = true
    setParams({}, { replace: true })
    loginSso(kode)
      .then(() => navigate('/admin/dashboard', { replace: true }))
      .catch((err) => {
        setError(err.response?.data?.error || PESAN_SSO.gagal)
        setSsoProses(false)
      })
  }, [params, setParams, loginSso, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if reCAPTCHA is required (for production)
    const requireRecaptcha = import.meta.env.VITE_REQUIRE_RECAPTCHA !== 'false'

    if (requireRecaptcha && !recaptchaToken) {
      setError('Please complete the reCAPTCHA')
      setLoading(false)
      return
    }

    try {
      // Pass empty string for recaptchaToken if not required (development bypass)
      await login(username, password, recaptchaToken || '')

      // Redirect to admin dashboard after successful login
      navigate('/admin/dashboard')
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token)
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            {settings.site_title || 'Portal Resmi'}
          </Typography>
          <Typography variant="body2" align="center" color="textSecondary" sx={{ mb: 3 }}>
            Admin Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {ssoProses && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, py: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2">Menyelesaikan login SSO…</Typography>
            </Box>
          )}

          {sso?.aktif && !ssoProses && (
            <>
              <Button
                component="a"
                href={sso.url_masuk}
                fullWidth
                size="large"
                variant="contained"
                color="secondary"
                startIcon={<VerifiedUser />}
                sx={{ mt: 1 }}
              >
                Masuk dengan SSO Portal Kaltara
              </Button>
              <Divider sx={{ my: 3, color: 'text.secondary', fontSize: '0.8rem' }}>atau dengan akun lokal</Divider>
            </>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, display: ssoProses ? 'none' : 'block' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {/* Show reCAPTCHA only when required */}
            {import.meta.env.VITE_REQUIRE_RECAPTCHA !== 'false' && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <GoogleReCaptcha
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={handleRecaptchaChange}
                />
              </Box>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage
