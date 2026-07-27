import { useState } from 'react'
import { Box, Typography, Stack, Button, Chip } from '@mui/material'
import { PictureAsPdf, Download, Visibility } from '@mui/icons-material'
import PreviewModal from './PreviewModal'

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/api\/?$/, '')
const downloadUrl = (id) => `${API_ORIGIN}/api/public/dokumen/${id}/file`
const viewUrl = (file) => `${API_ORIGIN}/file/${file}`

const formatBytes = (b) => {
  if (!b) return ''
  const u = ['B', 'KB', 'MB', 'GB']
  let n = b, i = 0
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++ }
  return `${n.toFixed(i && n < 10 ? 1 : 0)} ${u[i]}`
}
const formatDate = (d) => (d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '')

const DocumentList = ({ documents = [], showCategory = true, emptyText = 'Belum ada dokumen.' }) => {
  const [preview, setPreview] = useState(null)

  return (
    <>
      {!documents.length ? (
        <Typography variant="body2" sx={{ color: 'text.secondary', py: 3, textAlign: 'center' }}>{emptyText}</Typography>
      ) : (
        <Stack spacing={1.5}>
          {documents.map((d) => (
            <Box
              key={d.id_dokumen}
              sx={{
                display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2,
                border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
                transition: 'all 0.2s', '&:hover': { boxShadow: 3, borderColor: 'primary.light' }
              }}
            >
              <PictureAsPdf sx={{ color: 'error.main', fontSize: 36, flexShrink: 0 }} />
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, color: 'text.primary' }}>{d.judul}</Typography>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', mt: 0.5, alignItems: 'center' }}>
                  {showCategory && d.kategori && <Chip size="small" label={d.kategori.nama} sx={{ bgcolor: 'primary.light', color: 'primary.dark' }} />}
                  {d.nomor && <Typography variant="caption" sx={{ color: 'text.secondary' }}>No. {d.nomor}</Typography>}
                  {d.tanggal && <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(d.tanggal)}</Typography>}
                  {d.ukuran ? <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatBytes(d.ukuran)}</Typography> : null}
                </Stack>
                {d.deskripsi && <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{d.deskripsi}</Typography>}
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
                <Button onClick={() => setPreview(d)} variant="text" size="small" startIcon={<Visibility />} sx={{ fontWeight: 600 }}>Lihat</Button>
                <Button component="a" href={downloadUrl(d.id_dokumen)} target="_blank" rel="noopener noreferrer" variant="outlined" size="small" startIcon={<Download />} sx={{ fontWeight: 600 }}>Unduh</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <PreviewModal
        open={!!preview}
        onClose={() => setPreview(null)}
        type="pdf"
        src={preview ? viewUrl(preview.file) : ''}
        title={preview?.judul}
        downloadUrl={preview ? downloadUrl(preview.id_dokumen) : ''}
      />
    </>
  )
}

export default DocumentList
