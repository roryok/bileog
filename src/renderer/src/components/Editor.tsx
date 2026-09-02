import { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { OpenedDraft, StorySummary } from '@shared/types'
import { useAutosave } from '../lib/useAutosave'
import { FontSize, FONT_SIZE_DEFAULT, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_STEP } from '../fontSizeExtension'
import VersionTimeline from './VersionTimeline'
import StoryEditModal from './StoryEditModal'

interface EditorProps {
  draft: OpenedDraft
  /** Writer's name from Settings; empty when unset. */
  author: string
  /** Debug mode, unlocked by the code in Settings. */
  debug: boolean
  onBack: () => void
  onOpenSettings: () => void
}

export default function Editor({
  draft,
  author,
  debug,
  onBack,
  onOpenSettings
}: EditorProps): JSX.Element {
  const [justSaved, setJustSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [title, setTitle] = useState(draft.title)
  const [editingStory, setEditingStory] = useState<StorySummary | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: false,
        orderedList: false,
        listItem: false,
        blockquote: false,
        codeBlock: false,
        code: false,
        strike: false,
        horizontalRule: false,
        heading: false
      }),
      FontSize,
      Placeholder.configure({ placeholder: 'Once upon a time...' })
    ],
    content: draft.html,
    autofocus: 'end'
  })

  const currentStory = useCallback(async (): Promise<StorySummary | undefined> => {
    const stories = await window.bileog.listStories()
    return stories.find((s: any) => s.id === draft.storyId)
  }, [draft.storyId])

  const handleEditStory = useCallback(async (): Promise<void> => {
    const story = await currentStory()
    if (story) setEditingStory(story)
  }, [currentStory])

  // Fires after a rename and after every cover change, so re-read the story to
  // keep the topbar and the export filename in step.
  const handleStoryChanged = useCallback(async (): Promise<void> => {
    const story = await currentStory()
    if (story) {
      setTitle(story.title)
      setEditingStory(story)
    }
  }, [currentStory])

  const handleSaved = useCallback((): void => {
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }, [])

  const { saveNow } = useAutosave(editor, draft.draftId, handleSaved)

  const handleBack = async (): Promise<void> => {
    await saveNow()
    onBack()
  }

  const handleRestore = async (versionId: string): Promise<void> => {
    if (!editor) return
    await saveNow()
    const html = await window.bileog.restoreVersion({ draftId: draft.draftId, versionId })
    editor.commands.setContent(html)
  }

  const handleExport = async (format: 'html' | 'pdf'): Promise<void> => {
    if (!editor) return
    setExportOpen(false)
    await window.bileog.exportStory({ title, html: editor.getHTML(), format, author })
  }

  const currentFontSize = (): number => {
    const raw = editor?.getAttributes('paragraph').fontSize as string | undefined
    return raw ? parseInt(raw, 10) : FONT_SIZE_DEFAULT
  }

  const stepFontSize = (delta: number): void => {
    if (!editor) return
    const next = Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, currentFontSize() + delta))
    editor.chain().focus().updateAttributes('paragraph', { fontSize: `${next}px` }).run()
  }

  const fontSize = currentFontSize()

  return (
    <div className="editor-screen">
      <div className="editor-topbar">
        <button className="btn btn-text back-btn" onClick={() => void handleBack()}>
          ← Stories
        </button>
        <button
          className="story-title-label"
          onClick={() => void handleEditStory()}
          title="Edit title and cover"
        >
          {title}
        </button>
        <div className="editor-topbar-right">
          <div className={`saved-indicator ${justSaved ? 'visible' : ''}`}>Saved</div>
          <div className="export-menu-wrap">
            <button className="btn btn-text" onClick={() => setExportOpen((v) => !v)}>
              Export
            </button>
            {exportOpen && (
              <div className="export-menu">
                <button className="export-menu-item" onClick={() => void handleExport('html')}>
                  Export as HTML
                </button>
                <button className="export-menu-item" onClick={() => void handleExport('pdf')}>
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          <button className="btn btn-text" onClick={() => setHistoryOpen(true)}>
            History
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
      </div>

      {editor && (
        <div className="editor-toolbar">
          <button
            className={editor.isActive('bold') ? 'active' : ''}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            B
          </button>
          <button
            className={editor.isActive('italic') ? 'active' : ''}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            I
          </button>
          <div className="editor-toolbar-divider" />
          <button
            onClick={() => stepFontSize(-FONT_SIZE_STEP)}
            disabled={fontSize <= FONT_SIZE_MIN}
            aria-label="Make text smaller"
          >
            −
          </button>
          <button
            onClick={() => stepFontSize(FONT_SIZE_STEP)}
            disabled={fontSize >= FONT_SIZE_MAX}
            aria-label="Make text bigger"
          >
            +
          </button>
        </div>
      )}

      <div className="editor-page">
        <EditorContent editor={editor} />
      </div>

      {editingStory && (
        <StoryEditModal
          story={editingStory}
          onClose={() => setEditingStory(null)}
          onChanged={handleStoryChanged}
          onDeleted={() => {
            setEditingStory(null)
            void onBack()
          }}
        />
      )}

      {historyOpen && (
        <VersionTimeline
          storyId={draft.storyId}
          debug={debug}
          onRestore={handleRestore}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}
