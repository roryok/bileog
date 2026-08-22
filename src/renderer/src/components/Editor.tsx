import { useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import type { OpenedDraft } from '../../../shared/types'
import { useAutosave } from '../useAutosave'
import { FontSize, FONT_SIZE_DEFAULT, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_STEP } from '../fontSizeExtension'
import VersionTimeline from './VersionTimeline'

interface EditorProps {
  draft: OpenedDraft
  onBack: () => void
  onOpenSettings: () => void
}

export default function Editor({ draft, onBack, onOpenSettings }: EditorProps): JSX.Element {
  const [justSaved, setJustSaved] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)

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
    await window.bileog.exportStory({ title: draft.title, html: editor.getHTML(), format })
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
        <div className="story-title-label">{draft.title}</div>
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
            ⚙
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

      {historyOpen && (
        <VersionTimeline
          storyId={draft.storyId}
          onRestore={handleRestore}
          onClose={() => setHistoryOpen(false)}
        />
      )}
    </div>
  )
}
