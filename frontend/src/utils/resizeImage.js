// Crop (center "cover") and compress an image File in the browser before upload.
// Produces a JPEG File of exactly targetW x targetH — keeping uploads small
// (well under PHP's upload limit) and consistently shaped (auto-adjust + crop).
export function resizeImageCover(file, targetW, targetH, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type?.startsWith('image/')) {
      reject(new Error('File yang dipilih bukan gambar'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        // "cover": scale to fill the target, center-crop the overflow
        const scale = Math.max(targetW / img.width, targetH / img.height)
        const dw = img.width * scale
        const dh = img.height * scale
        ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh)
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url)
            if (!blob) { reject(new Error('Konversi gambar gagal')); return }
            const name = (file.name || 'image').replace(/\.[^.]+$/, '') + '.jpg'
            resolve(new File([blob], name, { type: 'image/jpeg' }))
          },
          'image/jpeg',
          quality
        )
      } catch (e) {
        URL.revokeObjectURL(url)
        reject(e)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('File bukan gambar yang valid'))
    }
    img.src = url
  })
}
