import { useRef, useState } from 'react'
import type { StorySummary } from '@shared/types'
import DeleteStoryModal from './DeleteStoryModal'

interface StoryEditModalProps {
  story: StorySummary
  onClose: () => void
  onChanged: () => Promise<void>
  onDeleted: () => Promise<void> | void
}

export default function StoryEditModal({
  story,
  onClose,
  onChanged,
  onDeleted
}: StoryEditModalProps): JSX.Element {
  const [title, setTitle] = useState(story.title)
  const [coverUrl, setCoverUrl] = useState<string | null>(story.coverUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pressedOnOverlay = useRef(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const handleRename = async (): Promise<void> => {
    const next = title.trim()
    if (!next || next === story.title) {
      onClose()
      return
    }
    setBusy(true)
    setError(null)
    try {
      await window.bileog.renameStory({ storyId: story.id, title: next })
      await onChanged()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  const handleCycleCover = async (direction: 'next' | 'prev'): Promise<void> => {
    setBusy(true)
    setError(null)
    try {
      const result = await window.bileog.cycleStoryCover({ storyId: story.id, direction })
      setCoverUrl(result.coverUrl)
      await onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="modal-overlay edit-overlay"
      onMouseDown={(e) => {
        pressedOnOverlay.current = e.target === e.currentTarget
      }}
      onClick={(e) => {
        if (pressedOnOverlay.current && e.target === e.currentTarget) onClose()
        pressedOnOverlay.current = false
      }}
    >
      <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="icon-btn delete-story-btn"
          onClick={() => setConfirmingDelete(true)}
          disabled={busy}
          aria-label="Delete this story"
          title="Delete this story"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path
              d="M4 7h16M10 4h4M9 7v12m6-12v12M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <h1>Edit story</h1>

        <div className="edit-cover-row">
          <button
            className="btn btn-secondary edit-cover-arrow"
            onClick={() => void handleCycleCover('prev')}
            disabled={busy}
            aria-label="Previous cover"
            title="Previous cover"
          >
            ‹
          </button>
          <div className="edit-cover-preview">
            {coverUrl ? <img src={coverUrl} alt="" /> : <div className="edit-cover-placeholder">No cover</div>}
          </div>
          <button
            className="btn btn-secondary edit-cover-arrow"
            onClick={() => void handleCycleCover('next')}
            disabled={busy}
            aria-label="Next cover"
            title="Next cover"
          >
            ›
          </button>
        </div>

        <div className="settings-section">
          <div className="settings-label">Title</div>
          <input
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleRename()
            }}
          />
        </div>

        {error && <div className="edit-error">{error}</div>}

        <div className="modal-actions">
          <button className="btn btn-text" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" disabled={busy || !title.trim()} onClick={() => void handleRename()}>
            Save
          </button>
        </div>
      </div>

      {confirmingDelete && (
        <DeleteStoryModal
          story={story}
          onCancel={() => setConfirmingDelete(false)}
          onDeleted={onDeleted}
        />
      )}
    </div>
  )
}
