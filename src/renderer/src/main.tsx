import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles.css'
import {
  applyBackgroundImages,
  applyFont,
  applyTheme,
  getStoredBackgroundImages,
  getStoredFont,
  getStoredTheme
} from './settings'

applyTheme(getStoredTheme())
applyFont(getStoredFont())
applyBackgroundImages(getStoredBackgroundImages())

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
