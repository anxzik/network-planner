import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {NetworkProvider} from './context/NetworkContext'
import {SettingsProvider} from './context/SettingsContext'
import {ScratchpadProvider} from './context/ScratchpadContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <NetworkProvider>
        <ScratchpadProvider>
          <App />
        </ScratchpadProvider>
      </NetworkProvider>
    </SettingsProvider>
  </StrictMode>,
)
