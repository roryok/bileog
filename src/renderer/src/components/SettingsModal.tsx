import { useState } from 'react'
import {
  FONTS,
  THEMES,
  applyBackgroundImages,
  applyFont,
  applyTheme,
  getStoredBackgroundImages,
  getStoredFont,
  getStoredTheme,
  type FontId,
  type ThemeId
} from '../settings'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps): JSX.Element | null {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme)
  const [font, setFont] = useState<FontId>(getStoredFont)
  const [bgImages, setBgImages] = useState<boolean>(getStoredBackgroundImages)

  if (!open) return null

  const handleThemeSelect = (id: ThemeId): void => {
    setTheme(id)
    applyTheme(id)
  }

  const handleFontSelect = (id: FontId): void => {
    setFont(id)
    applyFont(id)
  }

  const handleBgImagesToggle = (enabled: boolean): void => {
    setBgImages(enabled)
    applyBackgroundImages(enabled)
  }

  return (
    <div className="modal-overlay settings-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <h1>Settings</h1>

        <div className="settings-section">
          <div className="settings-label">Theme</div>
          <div className="theme-swatches">
            {THEMES.map((t) => (
              <button
                key={t.id}
                className={`theme-swatch ${theme === t.id ? 'selected' : ''}`}
                style={{ backgroundImage: `url(${t.image})` }}
                onClick={() => handleThemeSelect(t.id)}
              >
                {theme === t.id && <span className="swatch-check">✓</span>}
                <span className="swatch-label">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-row">
            <div className="settings-label" style={{ marginBottom: 0 }}>
              Background images
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={bgImages}
                onChange={(e) => handleBgImagesToggle(e.target.checked)}
              />
              <span className="toggle-track">
                <span className="toggle-thumb" />
              </span>
            </label>
          </div>
        </div>

        <div className="settings-section">
          <div className="settings-label">Writing font</div>
          <div className="font-options">
            {FONTS.map((f) => (
              <button
                key={f.id}
                className={`font-option ${font === f.id ? 'selected' : ''}`}
                style={{ fontFamily: f.family }}
                onClick={() => handleFontSelect(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
