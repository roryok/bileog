import { useCallback, useEffect, useRef } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'

const AUTOSAVE_INTERVAL_MS = 30_000

/**
 * FNV-1a over the document, paired with its length. Two drafts collide only if
 * they are byte-for-byte the same length *and* hash alike, which is remote
 * enough for a child's story while costing far less than keeping a second copy
 * of the text in memory purely to diff against.
 */
export function checksum(html: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < html.length; i++) {
    hash ^= html.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return `${html.length}:${(hash >>> 0).toString(36)}`
}

export function useAutosave(
  editor: TiptapEditor | null,
  draftId: string,
  onSaved: () => void
): { saveNow: () => Promise<void> } {
  const dirtyRef = useRef(false)
  const savedChecksumRef = useRef<string | null>(null)

  // Baseline against the editor's own serialisation rather than the HTML that
  // came off disk: TipTap normalises whatever it parses, so comparing with the
  // stored string would report a change on every single open.
  useEffect(() => {
    if (!editor) return
    savedChecksumRef.current = checksum(editor.getHTML())
    dirtyRef.current = false
  }, [editor, draftId])

  useEffect(() => {
    if (!editor) return
    const markDirty = (): void => {
      dirtyRef.current = true
    }
    editor.on('update', markDirty)
    return () => {
      editor.off('update', markDirty)
    }
  }, [editor])

  const save = useCallback(async (): Promise<void> => {
    if (!editor || !dirtyRef.current) return

    const html = editor.getHTML()
    const sum = checksum(html)

    // The document was touched but ended up identical - typing a word and
    // deleting it again, say. Nothing to write, and no "Saved" flash either.
    if (sum === savedChecksumRef.current) {
      dirtyRef.current = false
      return
    }

    // Cleared before the await so edits made *during* the write mark the draft
    // dirty again rather than being swallowed by this save.
    dirtyRef.current = false
    try {
      await window.bileog.saveDraft({ draftId, html })
      savedChecksumRef.current = sum
      onSaved()
    } catch (err) {
      // Leave it dirty so the next tick retries instead of dropping the work.
      dirtyRef.current = true
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
