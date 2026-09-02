import { useState } from 'react'
import type { StorySummary } from '../../../shared/types'
import StoryEditModal from './StoryEditModal'

interface DashboardProps {
  stories: StorySummary[]
  /** Writer's name from Settings; empty when unset. */
  author: string
  onOpenStory: (storyId: string) => void
  onNewStory: () => void
  onOpenSettings: () => void
  onStoriesChanged: () => Promise<void>
}

export default function Dashboard({
  stories,
  author,
  onOpenStory,
  onNewStory,
  onOpenSettings,
  onStoriesChanged
}: DashboardProps): JSX.Element {
  const [editingStory, setEditingStory] = useState<StorySummary | null>(null)

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My Stories</h1>
        <div className="dashboard-header-actions">
          <button className="btn btn-primary" onClick={onNewStory}>
            + New Story
          </button>
          <button className="icon-btn" aria-label="Settings" onClick={onOpenSettings}>
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
              <path
                d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.4-2.4 1a7.6 7.6 0 0 0-1.7-1L14.9 3h-3.8l-.4 2.6a7.6 7.6 0 0 0-1.7 1l-2.4-1-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7.6 7.6 0 0 0 1.7 1l.4 2.6h3.8l.4-2.6a7.6 7.6 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>

      <div className="story-grid">
        {stories.map((story) => (
          <div key={story.id} className="story-card">
            <button className="story-cover" onClick={() => onOpenStory(story.id)}>
              {story.coverUrl && <img src={story.coverUrl} alt="" />}
              <span className="story-cover-title">
                {story.title}
                {author && <span className="story-cover-author">by {author}</span>}
              </span>
            </button>
            <div className="story-card-footer">
              <button
                className="story-edit-btn"
                aria-label="Edit story"
                onClick={() => setEditingStory(story)}
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingStory && (
        <StoryEditModal
          story={editingStory}
          onClose={() => setEditingStory(null)}
          onChanged={onStoriesChanged}
          onDeleted={async () => {
            setEditingStory(null)
            await onStoriesChanged()
          }}
        />
      )}
    </div>
  )
}
