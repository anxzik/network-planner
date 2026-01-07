import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {NetworkProvider} from './context/NetworkContext'
import {SettingsProvider} from './context/SettingsContext'

import {AuthProvider} from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <NetworkProvider>
          <App />
        </NetworkProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
)
