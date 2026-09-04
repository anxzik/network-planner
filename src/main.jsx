import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {NetworkProvider} from './context/NetworkContext'
import {SettingsProvider} from './context/SettingsContext'
import {ScratchpadProvider} from './context/ScratchpadContext'
import {LibraryProvider} from './context/LibraryContext'
import {PlanProvider} from './context/PlanContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SettingsProvider>
      <NetworkProvider>
        <LibraryProvider>
        <ScratchpadProvider>
          <PlanProvider>
            <App />
          </PlanProvider>
        </ScratchpadProvider>
        </LibraryProvider>
      </NetworkProvider>
    </SettingsProvider>
  </StrictMode>,
)
