import { useCallback, useEffect, useRef } from 'react'
import type { Editor as TiptapEditor } from '@tiptap/react'

const AUTOSAVE_INTERVAL_MS = 30_000

export function useAutosave(
  editor: TiptapEditor | null,
  draftId: string,
  onSaved: () => void
): { saveNow: () => Promise<void> } {
  const dirtyRef = useRef(false)

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
    dirtyRef.current = false
    const html = editor.getHTML()
    await window.bileog.saveDraft({ draftId, html })
    onSaved()
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
