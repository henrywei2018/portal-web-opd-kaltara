import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme } from '../theme'

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} })

export const useColorMode = () => useContext(ColorModeContext)

const getInitialMode = () => {
  try {
    const saved = localStorage.getItem('colorMode')
    if (saved === 'light' || saved === 'dark') return saved
  } catch { /* ignore */ }
  return 'light'
}

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode)

  useEffect(() => {
    try { localStorage.setItem('colorMode', mode) } catch { /* ignore */ }
  }, [mode])

  const toggleColorMode = useCallback(() => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }, [])

  const theme = useMemo(() => createAppTheme(mode), [mode])
  const value = useMemo(() => ({ mode, toggleColorMode }), [mode, toggleColorMode])

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
