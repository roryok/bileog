import { useCallback, useEffect, useRef } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'

// just internal for now. we could expose this later
// but its a bit much complexity for a kids app
const AUTOSAVE_INTERVAL_MS = 30 * 1000

// checksum func to check if content has diverged from what was saved
export function checksum(html: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < html.length; i++) {
    hash ^= html.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${html.length}:${(hash >>> 0).toString(36)}`
}

// autosave the current open doc
export function useAutosave(
  editor: TiptapEditor | null,
  draftId: string,
  onSaved: () => void
): { saveNow: () => Promise<void> } {

  const contentChangedRef = useRef(false)
  const savedChecksumRef = useRef<string | null>(null)

  // Use editor's own serialisation rather than the HTML from save 
  // TipTap normalises whatever it parses, so comparing with the
  // stored string would report a change on every single open.
  useEffect(() => {
    if (!editor) return
    savedChecksumRef.current = checksum(editor.getHTML())
    contentChangedRef.current = false
  }, [editor, draftId])

  // when a tiptap update event fires, mark the content as changed
  useEffect(() => {
    if (!editor) return
    const markChanged = (): void => {
      contentChangedRef.current = true
    }
    editor.on('update', markChanged)
    return () => {
      editor.off('update', markChanged)
    }
  }, [editor])

  const save = useCallback(async (): Promise<void> => {
    if (!editor || !contentChangedRef.current) return

    const html = editor.getHTML()
    const sum = checksum(html)

    // double check against ref incase this was a non-change
    // (like typing a word and deleting it again)
    if (sum === savedChecksumRef.current) {
      contentChangedRef.current = false
      return
    }

    contentChangedRef.current = false
    try {
      await window.bileog.saveDraft({ draftId, html })
      savedChecksumRef.current = sum
      onSaved()
    } catch (err) {
      // Leave it changed so the next tick retries 
      contentChangedRef.current = true
      console.error('Autosave failed; will retry', err)
    }
  }, [editor, draftId, onSaved])

  useEffect(() => {
    const interval = setInterval(() => {
      void save()
    }, AUTOSAVE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [save])

  useEffect(() => window.bileog.onBeforeQuit(save), [save])

  return { saveNow: save }
}
