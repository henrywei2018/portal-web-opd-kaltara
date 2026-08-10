// Shared YouTube helpers. The id regex was previously copy-pasted into
// Video.jsx, Home.jsx, VideoList.jsx and PreviewModal.jsx; new code uses this.

/** Pull the 11-char video id out of a watch / youtu.be / embed URL (or a bare id). */
export const youtubeId = (url) => {
  if (!url) return ''
  const raw = String(url).trim()
  if (/^[\w-]{11}$/.test(raw)) return raw
  const m = raw.match(/(?:embed\/|youtu\.be\/|[?&]v=)([\w-]{11})/)
  return m ? m[1] : ''
}

/** Always-present thumbnail. `maxresdefault` 404s on many videos; hqdefault does not. */
export const youtubeThumb = (idOrUrl) => {
  const id = youtubeId(idOrUrl)
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : ''
}

/**
 * Embed URL for a silent, looping background player.
 *
 * - `mute=1` is mandatory: browsers block unmuted autoplay outright.
 * - `loop=1` needs `playlist=<id>` to actually loop a single video, and looping
 *   is also what keeps the end screen (with its suggested videos) off screen.
 * - `playsinline=1` stops iOS from hijacking the video into fullscreen.
 * - nocookie host defers YouTube's tracking cookies; it does not remove the
 *   third-party request, which is why the player stays behind cookie consent.
 */
/**
 * Embed URL for a player the visitor deliberately opened: real controls, sound
 * on, starts playing because clicking play is what got us here. Unlike the
 * background player this loads only after an explicit user action, which is why
 * it needs no cookie gate of its own.
 */
export const youtubePlayerSrc = (idOrUrl) => {
  const id = youtubeId(idOrUrl)
  if (!id) return ''
  const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

export const youtubeBackgroundSrc = (idOrUrl, { origin } = {}) => {
  const id = youtubeId(idOrUrl)
  if (!id) return ''
  const params = new URLSearchParams({
    autoplay: '1',
    mute: '1',
    controls: '0',
    loop: '1',
    playlist: id,
    playsinline: '1',
    rel: '0',
    fs: '0',
    disablekb: '1',
    iv_load_policy: '3'
  })
  if (origin) params.set('origin', origin)
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
