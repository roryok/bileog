import { useRef, useState } from 'react'
import type { StorySummary } from '@shared/types'

interface DeleteStoryModalProps {
  story: StorySummary
  onCancel: () => void
  onDeleted: () => Promise<void> | void
}

export default function DeleteStoryModal({
  story,
  onCancel,
  onDeleted
}: DeleteStoryModalProps): JSX.Element {
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pressedOnOverlay = useRef(false)

  // same pattern we see on github
  const matches = typed.trim() === story.title.trim()

  const handleDelete = async (): Promise<void> => {
    if (!matches || busy) return
    setBusy(true)
    setError(null)
    try {
      await window.bileog.deleteStory(story.id)
      await onDeleted()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setBusy(false)
    }
  }

  return (
    <div
      className="modal-overlay delete-overlay"
      onMouseDown={(e) => {
        pressedOnOverlay.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressedOnOverlay.current && e.target === e.currentTarget) onCancel()
        pressedOnOverlay.current = false
      }}
    >
      <div className="modal delete-modal">
        <h1>Delete this story?</h1>

        <p className="delete-warning">
          This deletes <strong>{story.title}</strong> for good, along with every saved
          version of it. It cannot be undone.
        </p>

        <div className="settings-section">
          <div className="settings-label">Type the story&apos;s name to confirm</div>
          <div className="delete-name-echo">{story.title}</div>
          <input
            className="title-input"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && matches) void handleDelete()
              if (e.key === 'Escape') onCancel()
            }}
            placeholder="Story name"
            aria-label="Type the story name to confirm deletion"
            autoFocus
          />
        </div>

        {error && <div className="edit-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-text" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button
            className="btn btn-danger"
            disabled={!matches || busy}
            onClick={() => void handleDelete()}
          >
            {busy ? 'Deleting...' : 'Delete forever'}
          </button>
        </div>
      </div>
    </div>
  )
}
