// Global ARIA live region — lets us announce dynamic changes (search results,
// form success/error, voice command feedback) to screen readers without
// stealing focus. One hidden node is reused for the whole app.

let node = null

const ensure = () => {
  if (node) return node
  node = document.createElement('div')
  node.setAttribute('aria-live', 'polite')
  node.setAttribute('aria-atomic', 'true')
  node.setAttribute('role', 'status')
  Object.assign(node.style, {
    position: 'absolute', width: '1px', height: '1px', padding: '0',
    margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap', border: '0'
  })
  document.body.appendChild(node)
  return node
}

// Announce a message. assertive=true interrupts the screen reader (use for errors).
export const announce = (msg, assertive = false) => {
  if (!msg) return
  const n = ensure()
  n.setAttribute('aria-live', assertive ? 'assertive' : 'polite')
  // Clear first so an identical repeated message is still re-announced.
  n.textContent = ''
  setTimeout(() => { n.textContent = msg }, 60)
}
