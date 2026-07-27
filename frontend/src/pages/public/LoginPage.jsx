import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSettings } from '../../contexts/SettingsContext'
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Alert
} from '@mui/material'
import GoogleReCaptcha from 'react-google-recaptcha'

const LoginPage = () => {
  const { login } = useAuth()
  const { settings } = useSettings()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
