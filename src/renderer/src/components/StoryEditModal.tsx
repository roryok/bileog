import { useState } from 'react'
import type { StorySummary } from '../../../shared/types'

interface StoryEditModalProps {
  story: StorySummary
  onClose: () => void
  onChanged: () => Promise<void>
}

export default function StoryEditModal({
  story,
  onClose,
  onChanged
}: StoryEditModalProps): JSX.Element {
  const [title, setTitle] = useState(story.title)
  const [coverUrl, setCoverUrl] = useState<string | null>(story.coverUrl)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
    <div className="modal-overlay edit-overlay" onClick={onClose}>
      <div className="modal edit-modal" onClick={(e) => e.stopPropagation()}>
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
    </div>
  )
}
