import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/accessibility.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import { ColorModeProvider } from './contexts/ColorModeContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { SettingsProvider } from './contexts/SettingsContext'
import ErrorBoundary from './components/ui/ErrorBoundary'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ColorModeProvider>
        <LanguageProvider>
          <SettingsProvider>
            <ErrorBoundary>
              <AuthProvider>
                <App />
              </AuthProvider>
            </ErrorBoundary>
          </SettingsProvider>
        </LanguageProvider>
      </ColorModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
