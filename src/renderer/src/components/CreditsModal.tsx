import { useRef } from 'react'
import { BACKGROUND_CREDITS, COVER_CREDITS, PEXELS_LICENSE_URL } from '../credits'
import type { ImageCredit } from '../credits'

interface CreditsModalProps {
  onClose: () => void
}

function CreditRow({ credit }: { credit: ImageCredit }): JSX.Element {
  const open = (): void => {
    void window.bileog.openExternal(credit.url)
  }
  return (
    <li className="credit-row">
      <span className="credit-label">{credit.label}</span>
      <button className="credit-link" onClick={open} title={credit.url}>
        {credit.photographer === null
          ? 'view on Pexels'
          : credit.provisional
            ? `${credit.photographer} on Pexels`
            : `by ${credit.photographer}`}
      </button>
    </li>
  )
}

export default function CreditsModal({ onClose }: CreditsModalProps): JSX.Element {
  const pressedOnOverlay = useRef(false)
  // Only worth warning about while some covers are still unconfirmed.
  const anyUnconfirmed = COVER_CREDITS.some((c) => c.provisional)

  return (
    <div
      className="modal-overlay credits-overlay"
      onMouseDown={(e) => {
        pressedOnOverlay.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressedOnOverlay.current && e.target === e.currentTarget) onClose()
        pressedOnOverlay.current = false
      }}
    >
      <div className="modal credits-modal">
        <h1>Picture credits</h1>

        <p className="credits-intro">
          Every photograph in Bileog comes from Pexels and is used under the Pexels
          License. Thank you to the photographers.
        </p>

        <div className="settings-section">
          <div className="settings-label">Backgrounds</div>
          <ul className="credit-list">
            {BACKGROUND_CREDITS.map((c) => (
              <CreditRow key={c.url} credit={c} />
            ))}
          </ul>
        </div>

        <div className="settings-section">
          <div className="settings-label">Story covers</div>
          {anyUnconfirmed && (
            <p className="credits-note">
              Some of these are Pexels handles read from the image filenames rather
              than confirmed photographer names. Follow a link for the full credit.
            </p>
          )}
          <ul className="credit-list">
            {COVER_CREDITS.map((c) => (
              <CreditRow key={c.url} credit={c} />
            ))}
          </ul>
        </div>

        <div className="modal-actions">
          <button
            className="btn btn-text"
            onClick={() => void window.bileog.openExternal(PEXELS_LICENSE_URL)}
          >
            Pexels License
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
