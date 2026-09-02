import { useState } from 'react'
import type { OpenedDraft } from '@shared/types'

interface NewStoryModalProps {
  allowCancel: boolean
  onCancel: () => void
  onCreated: (draft: OpenedDraft) => void
}

export default function NewStoryModal({
  allowCancel,
  onCancel,
  onCreated
}: NewStoryModalProps): JSX.Element {
  const [title, setTitle] = useState('')
  const [coverFilePath, setCoverFilePath] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const handlePickCover = async (): Promise<void> => {
    const picked = await window.bileog.pickCoverImage()
    if (picked) setCoverFilePath(picked)
  }

  const handleCreate = async (): Promise<void> => {
    if (!title.trim() || creating) return
    setCreating(true)
    const draft = await window.bileog.createStory({ title, coverFilePath })
    onCreated(draft)
  }

  return (
    <div className="modal-overlay">
      <div className="modal new-story-modal">
        <h1>Let&apos;s write a story!</h1>
        <p className="modal-subtitle">What&apos;s it called?</p>

        <input
          autoFocus
          className="title-input"
          placeholder="My Story"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleCreate()
          }}
        />

        <div className="cover-picker">
          <button className="btn btn-secondary" onClick={handlePickCover}>
            {coverFilePath ? '✓ Cover picked' : 'Add a cover picture (optional)'}
          </button>
        </div>

        <div className="modal-actions">
          {allowCancel && (
            <button className="btn btn-text" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={!title.trim() || creating}
            onClick={handleCreate}
          >
            Start Writing
          </button>
        </div>
      </div>
    </div>
  )
}
