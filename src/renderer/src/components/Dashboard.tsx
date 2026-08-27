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
            ⚙
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
