import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Fab, Drawer, Typography, IconButton, Button, Divider, Stack, Tooltip, Chip
} from '@mui/material'
import {
  AccessibilityNew, Close, TextIncrease, TextDecrease, FormatLineSpacing, FontDownload,
  Link as LinkIcon, MotionPhotosOff, Mouse, VolumeUp, StopCircle, RestartAlt, DarkMode, LightMode,
  Mic, MicOff
} from '@mui/icons-material'
import { useColorMode } from '../../contexts/ColorModeContext'
import { announce } from '../../utils/announce'

const DEFAULT = { fontScale: 1, spacing: false, readable: false, links: false, motion: false, cursor: false }
const FONT_MIN = 0.875
const FONT_MAX = 1.5

// Voice command → route map. Each entry lists Indonesian/English keywords.
const NAV = [
  { kw: ['beranda', 'home', 'halaman utama', 'utama'], path: '/', name: 'Beranda' },
  { kw: ['berita', 'news'], path: '/berita', name: 'Berita' },
  { kw: ['artikel'], path: '/artikel', name: 'Artikel' },
  { kw: ['infografis'], path: '/infografis', name: 'Infografis' },
  { kw: ['pengumuman'], path: '/pengumuman', name: 'Pengumuman' },
  { kw: ['galeri', 'gallery'], path: '/galeri', name: 'Galeri' },
  { kw: ['video'], path: '/video', name: 'Video' },
  { kw: ['layanan', 'service'], path: '/layanan', name: 'Layanan' },
  { kw: ['data'], path: '/data', name: 'Data' },
  { kw: ['dokumen', 'document'], path: '/dokumen', name: 'Dokumen' },
  { kw: ['kontak', 'contact', 'hubungi'], path: '/kontak', name: 'Kontak' },
  { kw: ['profil', 'profile'], path: '/profil', name: 'Profil' },
  { kw: ['visi', 'misi'], path: '/visi-misi', name: 'Visi dan Misi' },
  { kw: ['sejarah'], path: '/sejarah', name: 'Sejarah' }
]

const load = () => {
  try { return { ...DEFAULT, ...JSON.parse(localStorage.getItem('a11y') || '{}') } } catch { return { ...DEFAULT } }
}

const apply = (s) => {
  const el = document.documentElement
  el.classList.toggle('a11y-spacing', !!s.spacing)
  el.classList.toggle('a11y-readable', !!s.readable)
  el.classList.toggle('a11y-links', !!s.links)
  el.classList.toggle('a11y-motion', !!s.motion)
  el.classList.toggle('a11y-cursor', !!s.cursor)
  el.style.fontSize = !s.fontScale || s.fontScale === 1 ? '' : `${Math.round(s.fontScale * 100)}%`
  // CSS cannot stop motion inside an iframe, so components that embed one
  // (the hero's video background) listen for this and unmount the player.
  window.dispatchEvent(new Event('a11y-changed'))
}

const VOICE_SUPPORTED = typeof window !== 'undefined' && !!(window.SpeechRecognition || window.webkitSpeechRecognition)

// Toggle button used for on/off accessibility options
const Toggle = ({ active, icon, label, onClick }) => (
  <Button
    onClick={onClick}
    variant={active ? 'contained' : 'outlined'}
    startIcon={icon}
    fullWidth
    sx={{ justifyContent: 'flex-start', textTransform: 'none', py: 1.1, fontWeight: 600, borderRadius: 2 }}
    aria-pressed={active}
  >
    {label}
  </Button>
)

const AccessibilityWidget = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { mode, toggleColorMode } = useColorMode()
  const [open, setOpen] = useState(false)
  const [s, setS] = useState(load)
  const [speaking, setSpeaking] = useState(false)
  const [voiceOn, setVoiceOn] = useState(false)
  const [heard, setHeard] = useState('')

  const hidden = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login')

  // Apply + persist whenever preferences change
  useEffect(() => {
    apply(s)
    try { localStorage.setItem('a11y', JSON.stringify(s)) } catch { /* ignore */ }
  }, [s])

  const set = (patch) => setS((prev) => ({ ...prev, ...patch }))
  const bumpFont = (dir) => setS((prev) => ({ ...prev, fontScale: Math.min(FONT_MAX, Math.max(FONT_MIN, +(prev.fontScale + dir * 0.125).toFixed(3))) }))

  const stopSpeak = useCallback(() => { window.speechSynthesis?.cancel(); setSpeaking(false) }, [])

  const speak = useCallback(() => {
    const synth = window.speechSynthesis
    if (!synth) { alert('Browser tidak mendukung pembacaan suara.'); return }
    synth.cancel()
    const main = document.querySelector('main')
    const text = (window.getSelection()?.toString() || main?.innerText || document.body.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 8000)
    if (!text) return
    const u = new SpeechSynthesisUtterance(text)
    u.lang = (localStorage.getItem('lang') === 'en' ? 'en-US' : 'id-ID')
    u.rate = 1
    u.onend = () => setSpeaking(false)
    u.onerror = () => setSpeaking(false)
    setSpeaking(true)
    synth.speak(u)
  }, [])

  // --- Voice command handling ---------------------------------------------
  const recogRef = useRef(null)
  const voiceOnRef = useRef(false)
  const sayingRef = useRef(false)        // ignore mic input while we speak confirmations
  const speakingRef = useRef(false)      // true while reading the full page aloud
  const cmdRef = useRef(() => {})
  useEffect(() => { voiceOnRef.current = voiceOn }, [voiceOn])
  useEffect(() => { speakingRef.current = speaking }, [speaking])

  // Short spoken + screen-reader confirmation for a recognized command.
  const confirm = useCallback((msg) => {
    announce(msg)
    const synth = window.speechSynthesis
    if (!synth) return
    sayingRef.current = true
    synth.cancel()
    const u = new SpeechSynthesisUtterance(msg)
    u.lang = (localStorage.getItem('lang') === 'en' ? 'en-US' : 'id-ID')
    u.onend = () => { sayingRef.current = false }
    u.onerror = () => { sayingRef.current = false }
    synth.speak(u)
  }, [])

  const handleCommand = useCallback((raw) => {
    const t = (raw || '').toLowerCase().trim()
    if (!t) return
    const isStop = /\b(berhenti|stop|diam)\b/.test(t)
    // While reading the page aloud, the mic hears the TTS — only honor "stop".
    if (speakingRef.current && !isStop) return
    setHeard(t)
    if (isStop) { stopSpeak(); confirm('Berhenti'); return }
    if (/(bacakan|baca halaman|baca konten|baca isi)/.test(t)) { announce('Membacakan halaman'); speak(); return }
    if (/(ke atas|scroll atas|atas halaman|paling atas)/.test(t)) { window.scrollTo({ top: 0, behavior: 'smooth' }); confirm('Ke atas'); return }
    if (/(ke bawah|scroll bawah|bawah halaman|gulir bawah)/.test(t)) { window.scrollBy({ top: Math.round(window.innerHeight * 0.85), behavior: 'smooth' }); confirm('Ke bawah'); return }
    if (/(kembali|halaman sebelumnya)/.test(t)) { navigate(-1); confirm('Kembali'); return }
    if (/^(cari|pencarian|telusuri)\b/.test(t)) {
      const el = document.querySelector('main input[type="search"], main input[aria-label*="cari" i], main input[placeholder*="cari" i], main input[aria-label*="search" i]')
      if (el) { el.focus(); confirm('Kolom pencarian difokuskan. Silakan ketik.') } else { confirm('Tidak ada pencarian di halaman ini') }
      return
    }
    const hit = NAV.find((n) => n.kw.some((k) => t.includes(k)))
    if (hit) { navigate(hit.path); confirm(`Membuka ${hit.name}`); return }
    confirm('Perintah tidak dikenali')
  }, [navigate, speak, stopSpeak, confirm])

  useEffect(() => { cmdRef.current = handleCommand }, [handleCommand])

  // Start/stop the recognizer when voiceOn changes.
  useEffect(() => {
    if (!voiceOn || !VOICE_SUPPORTED) return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR()
    r.lang = (localStorage.getItem('lang') === 'en' ? 'en-US' : 'id-ID')
    r.continuous = true
    r.interimResults = false
    r.onresult = (e) => {
      if (sayingRef.current) return
      const res = e.results[e.results.length - 1]
      if (res && res.isFinal) cmdRef.current(res[0].transcript)
    }
    r.onend = () => { if (voiceOnRef.current) { try { r.start() } catch { /* already started */ } } }
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setVoiceOn(false)
        announce('Akses mikrofon ditolak. Izinkan mikrofon untuk memakai navigasi suara.', true)
      }
    }
    recogRef.current = r
    try { r.start() } catch { /* ignore */ }
    announce('Navigasi suara aktif. Sebutkan nama halaman seperti berita atau layanan.')
    return () => {
      try { r.onend = null; r.stop() } catch { /* ignore */ }
      recogRef.current = null
    }
  }, [voiceOn])

  const toggleVoice = useCallback(() => {
    if (!VOICE_SUPPORTED) { announce('Browser tidak mendukung navigasi suara.', true); return }
    setVoiceOn((v) => {
      const next = !v
      if (!next) { announce('Navigasi suara dimatikan.'); setHeard('') }
      return next
    })
  }, [])

  // Global keyboard shortcut: Alt+V toggles voice navigation.
  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && !e.ctrlKey && !e.metaKey && (e.key === 'v' || e.key === 'V')) {
        e.preventDefault()
        toggleVoice()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleVoice])

  const reset = () => { stopSpeak(); setS({ ...DEFAULT }) }

  // Stop speech when navigating or unmounting
  useEffect(() => stopSpeak, [location.pathname, stopSpeak])

  if (hidden) return null

  return (
    <>
      <Tooltip title="Aksesibilitas" placement="right">
        <Fab
          color="primary"
          aria-label="Buka menu aksesibilitas"
          onClick={() => setOpen(true)}
          sx={{ position: 'fixed', left: { xs: 12, md: 20 }, bottom: { xs: 12, md: 20 }, zIndex: 11000 }}
        >
          <AccessibilityNew />
        </Fab>
      </Tooltip>

      {/* Persistent listening indicator (works even when the drawer is closed) */}
      {voiceOn && (
        <Chip
          icon={<Mic />}
          color="error"
          label={heard ? `Dengar: ${heard}` : 'Mendengarkan…'}
          onDelete={toggleVoice}
          deleteIcon={<MicOff titleAccess="Matikan navigasi suara" />}
          sx={{ position: 'fixed', left: { xs: 12, md: 20 }, bottom: { xs: 78, md: 90 }, zIndex: 11000, maxWidth: 280, fontWeight: 600, boxShadow: 4 }}
        />
      )}

      <Drawer anchor="left" open={open} onClose={() => setOpen(false)} sx={{ zIndex: 11001 }} PaperProps={{ sx: { width: { xs: '85vw', sm: 340 }, maxWidth: 360 } }}>
        <Box sx={{ p: 2.5, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessibilityNew />
            <Typography sx={{ fontWeight: 700 }}>Aksesibilitas</Typography>
          </Box>
          <IconButton onClick={() => setOpen(false)} sx={{ color: 'white' }} aria-label="Tutup"><Close /></IconButton>
        </Box>

        <Box sx={{ p: 2, overflowY: 'auto' }}>
          {/* Voice navigation */}
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Navigasi Suara</Typography>
          <Stack spacing={1} sx={{ mb: 1, mt: 0.5 }}>
            {VOICE_SUPPORTED ? (
              <>
                <Toggle
                  active={voiceOn}
                  onClick={toggleVoice}
                  icon={voiceOn ? <MicOff /> : <Mic />}
                  label={voiceOn ? 'Matikan Mikrofon (Alt+V)' : 'Aktifkan Mikrofon (Alt+V)'}
                />
                {voiceOn && (
                  <Box sx={{ px: 1, py: 1, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: 'error.main', animation: 'a11yPulse 1.2s ease-in-out infinite', '@keyframes a11yPulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                      {heard ? `“${heard}”` : 'Mendengarkan…'}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Browser ini tidak mendukung perintah suara. Gunakan Google Chrome atau Microsoft Edge.
              </Typography>
            )}
          </Stack>
          {VOICE_SUPPORTED && (
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Ucapkan: “beranda”, “berita”, “layanan”, “kontak”, “cari”, “bacakan halaman”, “berhenti”, “ke atas/bawah”, “kembali”.
            </Typography>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Text size */}
          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Ukuran Teks</Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, mt: 0.5 }}>
            <Button variant="outlined" onClick={() => bumpFont(-1)} disabled={s.fontScale <= FONT_MIN} startIcon={<TextDecrease />} sx={{ flex: 1, borderRadius: 2 }}>Kecil</Button>
            <Box sx={{ minWidth: 52, textAlign: 'center', fontWeight: 700 }}>{Math.round(s.fontScale * 100)}%</Box>
            <Button variant="outlined" onClick={() => bumpFont(1)} disabled={s.fontScale >= FONT_MAX} startIcon={<TextIncrease />} sx={{ flex: 1, borderRadius: 2 }}>Besar</Button>
          </Stack>

          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Tampilan</Typography>
          <Stack spacing={1} sx={{ mb: 2, mt: 0.5 }}>
            <Toggle active={mode === 'dark'} onClick={toggleColorMode} icon={mode === 'dark' ? <LightMode /> : <DarkMode />} label={mode === 'dark' ? 'Mode Terang' : 'Mode Gelap'} />
            <Toggle active={s.readable} onClick={() => set({ readable: !s.readable })} icon={<FontDownload />} label="Font Mudah Dibaca" />
            <Toggle active={s.spacing} onClick={() => set({ spacing: !s.spacing })} icon={<FormatLineSpacing />} label="Jarak Teks Lebih Lebar" />
            <Toggle active={s.links} onClick={() => set({ links: !s.links })} icon={<LinkIcon />} label="Sorot Tautan" />
            <Toggle active={s.motion} onClick={() => set({ motion: !s.motion })} icon={<MotionPhotosOff />} label="Kurangi Animasi" />
            <Toggle active={s.cursor} onClick={() => set({ cursor: !s.cursor })} icon={<Mouse />} label="Kursor Besar" />
          </Stack>

          <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700 }}>Baca Nyaring</Typography>
          <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 0.5 }}>
            {speaking ? (
              <Button variant="contained" color="error" onClick={stopSpeak} startIcon={<StopCircle />} fullWidth sx={{ borderRadius: 2 }}>Berhenti</Button>
            ) : (
              <Button variant="contained" onClick={speak} startIcon={<VolumeUp />} fullWidth sx={{ borderRadius: 2 }}>Bacakan Halaman</Button>
            )}
          </Stack>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Pilih (seleksi) teks tertentu lalu tekan "Bacakan" untuk membaca bagian itu saja.
          </Typography>

          <Divider sx={{ mb: 2 }} />
          <Button variant="text" color="inherit" onClick={reset} startIcon={<RestartAlt />} fullWidth sx={{ borderRadius: 2 }}>Atur Ulang Semua</Button>
        </Box>
      </Drawer>
    </>
  )
}

export default AccessibilityWidget
