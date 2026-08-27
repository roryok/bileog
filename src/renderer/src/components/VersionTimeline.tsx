import { useCallback, useEffect, useState } from 'react'
import type { VersionSummary } from '../../../shared/types'

interface VersionTimelineProps {
  storyId: string
  /** Debug mode; reveals the destructive history tools. */
  debug: boolean
  onRestore: (versionId: string) => Promise<void>
  onClose: () => void
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function VersionTimeline({
  storyId,
  debug,
  onRestore,
  onClose
}: VersionTimelineProps): JSX.Element {
  const [versions, setVersions] = useState<VersionSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [restoring, setRestoring] = useState(false)
  // Two-step rather than a modal: debug mode is already behind a secret code,
  // but this throws away every saved version, so it should not be one click.
  const [confirmingClear, setConfirmingClear] = useState(false)
  const [clearing, setClearing] = useState(false)

  const refresh = useCallback(async (): Promise<void> => {
    setLoading(true)
    const list = await window.bileog.listVersions(storyId)
    setVersions(list)
    setLoading(false)
  }, [storyId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleSelect = async (versionId: string): Promise<void> => {
    setSelectedId(versionId)
    setPreviewHtml(null)
    const html = await window.bileog.getVersionContent(versionId)
    setPreviewHtml(html)
  }

  const handleClearHistory = async (): Promise<void> => {
    setClearing(true)
    try {
      await window.bileog.clearStoryHistory(storyId)
      setSelectedId(null)
      setPreviewHtml(null)
      setConfirmingClear(false)
      await refresh()
    } finally {
      setClearing(false)
    }
  }

  const handleRestore = async (versionId: string): Promise<void> => {
    setRestoring(true)
    try {
      await onRestore(versionId)
      setSelectedId(null)
      setPreviewHtml(null)
      await refresh()
    } finally {
      setRestoring(false)
    }
  }

  return (
    <div className="modal-overlay timeline-overlay" onClick={onClose}>
      <div className="modal timeline-modal" onClick={(e) => e.stopPropagation()}>
        <h1>Version history</h1>
        <p className="modal-subtitle">Roll back to an earlier version of your story.</p>

        {loading ? (
          <div className="timeline-empty">Loading…</div>
        ) : versions.length === 0 ? (
          <div className="timeline-empty">No saved versions yet. Keep writing!</div>
        ) : (
          <div className="timeline-body">
            <div className="timeline-list">
              {versions.map((v) => (
                <button
                  key={v.id}
                  className={`timeline-item ${selectedId === v.id ? 'selected' : ''}`}
                  onClick={() => void handleSelect(v.id)}
                >
                  <span className="timeline-dot" />
                  <span className="timeline-time">{formatTimestamp(v.createdAt)}</span>
                </button>
              ))}
            </div>
            <div className="timeline-preview">
              {selectedId === null ? (
                <div className="timeline-empty">Select a version to preview it.</div>
              ) : previewHtml === null ? (
                <div className="timeline-empty">Loading…</div>
              ) : (
                <>
                  <div
                    className="timeline-preview-content"
                    dangerouslySetInnerHTML={{
                      __html: previewHtml.replace(/<[^>]*>/g, '').trim()
                        ? previewHtml
                        : '<em>(empty)</em>'
                    }}
                  />
                  <div className="timeline-actions">
                    <button
                      className="btn btn-primary"
                      disabled={restoring}
                      onClick={() => void handleRestore(selectedId)}
                    >
                      {restoring ? 'Restoring…' : 'Restore this version'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {debug && (
          <div className="debug-strip">
            <span className="debug-badge">Debug</span>
            {confirmingClear ? (
              <>
                <span className="debug-strip-text">
                  Delete all {versions.length} saved{' '}
                  {versions.length === 1 ? 'version' : 'versions'}? The story itself stays.
                </span>
                <button
                  className="btn btn-text"
                  onClick={() => setConfirmingClear(false)}
                  disabled={clearing}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => void handleClearHistory()}
                  disabled={clearing}
                >
                  {clearing ? 'Deleting...' : 'Delete history'}
                </button>
              </>
            ) : (
              <>
                <span className="debug-strip-text">Delete this story&apos;s history.</span>
                <button
                  className="btn btn-text debug-action"
                  onClick={() => setConfirmingClear(true)}
                  disabled={versions.length === 0}
                >
                  Delete history
                </button>
              </>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-text" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
