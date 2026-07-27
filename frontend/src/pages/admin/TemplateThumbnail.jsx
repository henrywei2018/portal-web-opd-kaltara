import { Box } from '@mui/material'

// Lightweight schematic wireframe of a page template (no real rendering / fetching).
// Each block type maps to a tiny stylised representation stacked top-to-bottom.

const Line = ({ w = '100%', h = 4, c = 'rgba(0,0,0,0.16)', mx = 'auto', mb = 0.5 }) => (
  <Box sx={{ width: w, height: h, borderRadius: 0.5, bgcolor: c, mx, mb }} />
)

const MiniHero = () => (
  <Box sx={{ bgcolor: 'primary.main', borderRadius: 0.5, py: 1, px: 1, textAlign: 'center' }}>
    <Line w="50%" h={5} c="rgba(255,255,255,0.9)" mb={0.5} />
    <Line w="72%" h={3} c="rgba(255,255,255,0.55)" mb={0.6} />
    <Box sx={{ width: 26, height: 7, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.92)', mx: 'auto' }} />
  </Box>
)

const MiniText = () => (
  <Box sx={{ px: 1, py: 0.75 }}>
    <Line w="42%" h={5} c="rgba(0,0,0,0.32)" mx={0} mb={0.75} />
    <Line w="100%" /><Line w="94%" /><Line w="86%" mb={0} />
  </Box>
)

const MiniImage = () => (
  <Box sx={{ px: 1, py: 0.5 }}>
    <Box sx={{ height: 28, borderRadius: 0.5, bgcolor: 'rgba(0,0,0,0.1)' }} />
  </Box>
)

const MiniGallery = () => (
  <Box sx={{ px: 1, py: 0.5, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0.5 }}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Box key={i} sx={{ pt: '70%', borderRadius: 0.5, bgcolor: 'rgba(0,0,0,0.1)' }} />
    ))}
  </Box>
)

const MiniCards = () => (
  <Box sx={{ px: 1, py: 0.5, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0.5 }}>
    {Array.from({ length: 3 }).map((_, i) => (
      <Box key={i} sx={{ p: 0.5, borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>
        <Line w="80%" h={3} c="rgba(0,0,0,0.3)" mx={0} mb={0.5} />
        <Line w="100%" h={2} /><Line w="65%" h={2} mb={0} />
      </Box>
    ))}
  </Box>
)

const MiniCta = () => (
  <Box sx={{ bgcolor: 'primary.dark', borderRadius: 0.5, py: 0.9, px: 1, textAlign: 'center' }}>
    <Line w="55%" h={4} c="rgba(255,255,255,0.9)" mb={0.6} />
    <Box sx={{ width: 30, height: 7, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.92)', mx: 'auto' }} />
  </Box>
)

const MiniDokumen = () => (
  <Box sx={{ px: 1, py: 0.5 }}>
    <Line w="42%" h={4} c="rgba(0,0,0,0.3)" mx={0} mb={0.6} />
    {Array.from({ length: 3 }).map((_, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
        <Box sx={{ width: 8, height: 10, borderRadius: 0.3, bgcolor: 'error.light', flexShrink: 0 }} />
        <Line w="80%" h={3} mx={0} mb={0} />
      </Box>
    ))}
  </Box>
)

const MiniHtml = () => (
  <Box sx={{ px: 1, py: 0.9, bgcolor: '#0B1220', borderRadius: 0.5 }}>
    <Line w="60%" h={3} c="rgba(120,200,255,0.75)" mx={0} mb={0.6} />
    <Line w="86%" h={3} c="rgba(255,255,255,0.35)" mx={0} mb={0.6} />
    <Line w="48%" h={3} c="rgba(255,200,120,0.65)" mx={0} mb={0} />
  </Box>
)

const MiniKontak = () => (
  <Box>
    <Box sx={{ bgcolor: 'primary.main', borderRadius: 0.5, py: 0.75, px: 1, textAlign: 'center', mb: 0.5 }}>
      <Line w="45%" h={4} c="rgba(255,255,255,0.9)" mb={0} />
    </Box>
    <Box sx={{ px: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
      <Box sx={{ p: 0.5, borderRadius: 0.5, border: '1px solid', borderColor: 'primary.main' }}>
        <Line w="70%" h={3} c="rgba(0,0,0,0.3)" mx={0} mb={0.5} />
        <Line w="100%" h={2} /><Line w="85%" h={2} mb={0} />
      </Box>
      <Box sx={{ p: 0.5, borderRadius: 0.5, border: '1px solid', borderColor: 'divider' }}>
        <Line w="60%" h={3} c="rgba(0,0,0,0.3)" mx={0} mb={0.5} />
        <Line w="90%" h={2} /><Line w="75%" h={2} mb={0} />
      </Box>
    </Box>
  </Box>
)

const MINI = {
  hero: MiniHero,
  text: MiniText,
  image: MiniImage,
  gallery: MiniGallery,
  cards: MiniCards,
  cta: MiniCta,
  dokumen: MiniDokumen,
  html: MiniHtml,
  kontak: MiniKontak
}

const TemplateThumbnail = ({ blocks = [] }) => (
  <Box
    sx={{
      height: 138,
      overflow: 'hidden',
      bgcolor: 'background.default',
      borderBottom: '1px solid',
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
      p: 0.75
    }}
  >
    {blocks.length === 0 ? (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed',
          borderColor: 'divider',
          borderRadius: 1,
          color: 'text.disabled',
          fontSize: 12
        }}
      >
        Halaman kosong
      </Box>
    ) : (
      blocks.map((b, i) => {
        const Comp = MINI[b.type]
        return Comp ? <Comp key={i} /> : null
      })
    )}
  </Box>
)

export default TemplateThumbnail
