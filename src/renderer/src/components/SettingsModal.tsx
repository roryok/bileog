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
import { WEBSITE_URL } from '../credits'
import { signedTitle } from '../../../shared/format'
import CreditsModal from './CreditsModal'

interface SettingsModalProps {
  open: boolean
  username: string
  onUsernameChange: (name: string) => void
  debug: boolean
  onDisableDebug: () => void
  onClose: () => void
}

export default function SettingsModal({
  open,
  username,
  onUsernameChange,
  debug,
  onDisableDebug,
  onClose
}: SettingsModalProps): JSX.Element | null {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme)
  const [creditsOpen, setCreditsOpen] = useState(false)
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
    <>
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

          <div className="settings-section">
          <div className="settings-label">Your name</div>
          <input
            className="title-input"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Add your name"
            aria-label="Your name"
            maxLength={40}
          />
          <p className="settings-hint">
            {username.trim()
              ? `Your stories will show "by ${username.trim()}" on their covers, and exports will be saved as "${signedTitle('My Story', username)}".`
              : 'Add your name and it will appear on your story covers and on anything you export.'}
          </p>
        </div>

        {debug && (
          <div className="settings-section debug-section">
            <div className="settings-label">
              <span className="debug-badge">Debug</span> Debug mode is on
            </div>
            <p className="settings-hint">
              Extra tools are showing around the app. Version history now has a
              delete control inside a story&apos;s History panel.
            </p>
            <button className="btn btn-text debug-action" onClick={onDisableDebug}>
              Turn off debug mode
            </button>
          </div>
        )}

        <div className="settings-section about-section">
            <div className="settings-label">About</div>
            <p className="about-text">
              Bileog is a quiet place for children to write stories. There is nothing to
              set up and no save button to remember - every story is kept on this
              computer as it is written, along with a timeline of earlier drafts to look
              back through. Nothing is ever sent anywhere.
            </p>
            <div className="about-links">
              <button
                className="btn btn-text about-link"
                onClick={() => void window.bileog.openExternal(WEBSITE_URL)}
              >
                Visit the website
              </button>
              <button className="btn btn-text about-link" onClick={() => setCreditsOpen(true)}>
                Picture credits
              </button>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={onClose}>
              Done
            </button>
          </div>
          </div>
        </div>

      {creditsOpen && <CreditsModal onClose={() => setCreditsOpen(false)} />}
    </>
  )
}
