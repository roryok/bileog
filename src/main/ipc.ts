import { ipcMain, dialog, app, shell, BrowserWindow } from 'electron'
import { nanoid } from 'nanoid'
import { basename, join } from 'node:path'
import { writeFileSync } from 'node:fs'
import { getDb, type StoryRow, type DraftRow, type VersionRow } from './db'
import {
  writeDraftHtml,
  readDraftHtml,
  writeVersionHtml,
  readVersionHtml,
  saveCoverFromUpload,
  saveGeneratedCover,
  deleteStoryFile,
  deleteStoryDir
} from './storage'
import { generateCoverSvg } from './coverGenerator'
import { toMediaUrl } from './mediaProtocol'
import { IPC } from '../shared/ipcChannels'
import { signedTitle } from '../shared/format'
import type {
  StorySummary,
  OpenedDraft,
  CreateStoryInput,
  SaveDraftInput,
  VersionSummary,
  RestoreVersionInput,
  RenameStoryInput,
  CycleStoryCoverInput,
  ExportStoryInput,
  ExportStoryResult
} from '../shared/types'

const coverModules = import.meta.glob('../assets/images/covers/*.jpg', {
  eager: true,
  import: 'default',
  query: '?asset'
}) as Record<string, string>

const COVER_IMAGES: string[] = Object.keys(coverModules)
  .sort()
  .map((key) => coverModules[key])

function pickRandomCover(excludeName?: string | null): { path: string; name: string } | null {
  if (COVER_IMAGES.length === 0) return null
  const pool = excludeName
    ? COVER_IMAGES.filter((path) => basename(path) !== excludeName)
    : COVER_IMAGES
  const candidates = pool.length > 0 ? pool : COVER_IMAGES
  const path = candidates[Math.floor(Math.random() * candidates.length)]
  return { path, name: basename(path) }
}

function stepCover(
  currentName: string | null | undefined,
  step: number
): { path: string; name: string } | null {
  const count = COVER_IMAGES.length
  if (count === 0) return null
  const currentIndex = currentName
    ? COVER_IMAGES.findIndex((path) => basename(path) === currentName)
    : -1
  // Unknown cover (uploaded or generated): step forward into the first image, back into the last.
  const from = currentIndex >= 0 ? currentIndex : step > 0 ? -1 : 0
  const path = COVER_IMAGES[(((from + step) % count) + count) % count]
  return { path, name: basename(path) }
}

function isMeaningfulHtml(html: string): boolean {
  return html.replace(/<[^>]*>/g, '').trim().length > 0
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[\\/:*?"<>|]/g, '').trim()
  return cleaned || 'story'
}

function buildHtmlDocument(title: string, html: string, author?: string): string {
  const name = author?.trim()
  const byline = name ? `<p class="byline">by ${escapeHtml(name)}</p>` : ''
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(signedTitle(title, author))}</title>
<style>
  body { font-family: Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.7; color: #1a1a1a; max-width: 720px; margin: 48px auto; padding: 0 24px; }
  h1 { font-family: 'Trebuchet MS', 'Comic Sans MS', sans-serif; text-align: center; margin: 0 0 8px; }
  .byline { font-family: 'Trebuchet MS', 'Comic Sans MS', sans-serif; text-align: center; color: #666; margin: 0 0 32px; }
  p { margin: 0 0 1em; }
</style>
</head>
<body>
<h1>${escapeHtml(title)}</h1>
${byline}
${html}
</body>
</html>`
}

async function renderHtmlToPdf(document: string): Promise<Buffer> {
  const win = new BrowserWindow({
    show: false,
    webPreferences: { sandbox: false }
  })
  try {
    await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(document)}`)
    return await win.webContents.printToPDF({ printBackground: true })
  } finally {
    win.destroy()
  }
}

function createVersion(storyId: string, html: string): VersionRow {
  const db = getDb()
  const versionId = nanoid()
  const now = new Date().toISOString()
  const filePath = writeVersionHtml(storyId, versionId, html)

  db.prepare(
    `INSERT INTO versions (id, story_id, file_path, created_at)
     VALUES (?, ?, ?, ?)`
  ).run(versionId, storyId, filePath, now)

  return db.prepare('SELECT * FROM versions WHERE id = ?').get(versionId) as VersionRow
}

function getLatestVersion(storyId: string): VersionRow | undefined {
  const db = getDb()
  return db
    .prepare('SELECT * FROM versions WHERE story_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1')
    .get(storyId) as VersionRow | undefined
}

function maybeCreateVersion(storyId: string, html: string): void {
  const latest = getLatestVersion(storyId)
  if (latest && readVersionHtml(latest.file_path) === html) return
  if (!latest && !isMeaningfulHtml(html)) return
  createVersion(storyId, html)
}

function toStorySummary(row: StoryRow): StorySummary {
  return {
    id: row.id,
    title: row.title,
    coverUrl: row.cover_path ? toMediaUrl(row.cover_path) : null,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }
}

function createDraftForSession(storyId: string, seedHtml: string): DraftRow {
  const db = getDb()
  const draftId = nanoid()
  const now = new Date().toISOString()
  const filePath = writeDraftHtml(storyId, draftId, seedHtml)
  const hasContent = isMeaningfulHtml(seedHtml) ? 1 : 0

  db.prepare(
    `INSERT INTO drafts (id, story_id, file_path, session_started_at, updated_at, has_content)
     VALUES (@id, @storyId, @filePath, @now, @now, @hasContent)`
  ).run({ id: draftId, storyId, filePath, now, hasContent })

  if (hasContent) {
    db.prepare(`UPDATE stories SET last_good_draft_id = ?, updated_at = ? WHERE id = ?`).run(
      draftId,
      now,
      storyId
    )
  }

  return db.prepare('SELECT * FROM drafts WHERE id = ?').get(draftId) as DraftRow
}

export function registerIpcHandlers(): void {
  const db = getDb()

  ipcMain.handle(IPC.listStories, (): StorySummary[] => {
    const rows = db.prepare('SELECT * FROM stories ORDER BY updated_at DESC').all() as StoryRow[]
    return rows.map(toStorySummary)
  })

  ipcMain.handle(IPC.createStory, (_event, input: CreateStoryInput): OpenedDraft => {
    const storyId = nanoid()
    const now = new Date().toISOString()
    const title = input.title.trim() || 'Untitled Story'

    let coverPath: string
    let coverSource: string | null = null

    if (input.coverFilePath) {
      coverPath = saveCoverFromUpload(storyId, input.coverFilePath)
    } else {
      const randomCover = pickRandomCover()
      if (randomCover) {
        coverPath = saveCoverFromUpload(storyId, randomCover.path)
        coverSource = randomCover.name
      } else {
        coverPath = saveGeneratedCover(storyId, generateCoverSvg(storyId, title))
      }
    }

    db.prepare(
      `INSERT INTO stories (id, title, cover_path, cover_source, created_at, updated_at, last_good_draft_id)
       VALUES (?, ?, ?, ?, ?, ?, NULL)`
    ).run(storyId, title, coverPath, coverSource, now, now)

    const draft = createDraftForSession(storyId, '')

    return { draftId: draft.id, storyId, title, html: '' }
  })

  ipcMain.handle(IPC.openStory, (_event, storyId: string): OpenedDraft => {
    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId) as
      | StoryRow
      | undefined
    if (!story) throw new Error(`Story not found: ${storyId}`)

    const lastGoodDraft = story.last_good_draft_id
      ? (db.prepare('SELECT * FROM drafts WHERE id = ?').get(story.last_good_draft_id) as
          | DraftRow
          | undefined)
      : undefined

    const seedHtml = lastGoodDraft ? readDraftHtml(lastGoodDraft.file_path) : ''
    const draft = createDraftForSession(storyId, seedHtml)

    return { draftId: draft.id, storyId, title: story.title, html: seedHtml }
  })

  ipcMain.handle(IPC.renameStory, (_event, input: RenameStoryInput): { ok: true } => {
    const title = input.title.trim()
    if (!title) throw new Error('Title cannot be empty')

    const now = new Date().toISOString()
    const result = db.prepare('UPDATE stories SET title = ?, updated_at = ? WHERE id = ?').run(
      title,
      now,
      input.storyId
    )
    if (result.changes === 0) throw new Error(`Story not found: ${input.storyId}`)

    return { ok: true }
  })

  ipcMain.handle(IPC.deleteStory, (_event, storyId: string): { ok: true } => {
    const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(storyId) as
      | StoryRow
      | undefined
    if (!story) throw new Error(`Story not found: ${storyId}`)

    // foreign_keys is ON and the schema has no ON DELETE CASCADE, so the
    // children have to go before the parent, and all of it in one transaction
    // so a failure part-way cannot leave a story with orphaned drafts.
    const removeRows = db.transaction((id: string) => {
      db.prepare('DELETE FROM versions WHERE story_id = ?').run(id)
      db.prepare('DELETE FROM drafts WHERE story_id = ?').run(id)
      db.prepare('DELETE FROM stories WHERE id = ?').run(id)
    })
    removeRows(storyId)

    // Files last: if this throws we are left with unreferenced files on disk,
    // which is harmless, whereas the reverse order would leave rows pointing at
    // content that no longer exists.
    deleteStoryDir(storyId)

    return { ok: true }
  })

  ipcMain.handle(
    IPC.cycleStoryCover,
    (_event, input: CycleStoryCoverInput): { coverUrl: string | null } => {
      const story = db.prepare('SELECT * FROM stories WHERE id = ?').get(input.storyId) as
        | StoryRow
        | undefined
      if (!story) throw new Error(`Story not found: ${input.storyId}`)

      const cover = stepCover(story.cover_source, input.direction === 'prev' ? -1 : 1)
      if (!cover || cover.name === story.cover_source) {
        return { coverUrl: story.cover_path ? toMediaUrl(story.cover_path) : null }
      }

      const coverPath = saveCoverFromUpload(input.storyId, cover.path)
      const now = new Date().toISOString()
      db.prepare('UPDATE stories SET cover_path = ?, cover_source = ?, updated_at = ? WHERE id = ?').run(
        coverPath,
        cover.name,
        now,
        input.storyId
      )

      if (story.cover_path) deleteStoryFile(story.cover_path)

      return { coverUrl: toMediaUrl(coverPath) }
    }
  )

  ipcMain.handle(
    IPC.exportStory,
    async (_event, input: ExportStoryInput): Promise<ExportStoryResult> => {
      const document = buildHtmlDocument(input.title, input.html, input.author)
      const isPdf = input.format === 'pdf'
      const extension = isPdf ? 'pdf' : 'html'

      const result = await dialog.showSaveDialog({
        title: 'Export story',
        defaultPath: join(
          app.getPath('documents'),
          `${sanitizeFilename(signedTitle(input.title, input.author))}.${extension}`
        ),
        filters: [
          { name: isPdf ? 'PDF Document' : 'HTML Document', extensions: [extension] }
        ]
      })
      if (result.canceled || !result.filePath) return { ok: false, canceled: true }

      if (isPdf) {
        const pdf = await renderHtmlToPdf(document)
        writeFileSync(result.filePath, pdf)
      } else {
        writeFileSync(result.filePath, document, 'utf-8')
      }

      return { ok: true }
    }
  )

  ipcMain.handle(IPC.saveDraft, (_event, input: SaveDraftInput): { ok: true } => {
    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(input.draftId) as
      | DraftRow
      | undefined
    if (!draft) throw new Error(`Draft not found: ${input.draftId}`)

    const now = new Date().toISOString()
    writeDraftHtml(draft.story_id, draft.id, input.html)
    const hasContent = isMeaningfulHtml(input.html) ? 1 : 0

    db.prepare(`UPDATE drafts SET updated_at = ?, has_content = ? WHERE id = ?`).run(
      now,
      hasContent,
      draft.id
    )

    if (hasContent) {
      db.prepare(`UPDATE stories SET last_good_draft_id = ?, updated_at = ? WHERE id = ?`).run(
        draft.id,
        now,
        draft.story_id
      )
    }

    maybeCreateVersion(draft.story_id, input.html)

    return { ok: true }
  })

  ipcMain.handle(IPC.listVersions, (_event, storyId: string): VersionSummary[] => {
    const rows = db
      .prepare('SELECT * FROM versions WHERE story_id = ? ORDER BY created_at DESC, rowid DESC')
      .all(storyId) as VersionRow[]
    return rows.map((row) => ({ id: row.id, createdAt: row.created_at }))
  })

  // Debug-only: drops every saved version of a story, leaving the story and its
  // current draft alone. Rows first, then files, so a failure cannot leave rows
  // pointing at content that is already gone.
  ipcMain.handle(IPC.clearStoryHistory, (_event, storyId: string): { removed: number } => {
    const story = db.prepare('SELECT id FROM stories WHERE id = ?').get(storyId)
    if (!story) throw new Error(`Story not found: ${storyId}`)

    const rows = db
      .prepare('SELECT * FROM versions WHERE story_id = ?')
      .all(storyId) as VersionRow[]
    db.prepare('DELETE FROM versions WHERE story_id = ?').run(storyId)
    for (const row of rows) deleteStoryFile(row.file_path)

    return { removed: rows.length }
  })

  ipcMain.handle(IPC.getVersionContent, (_event, versionId: string): string => {
    const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(versionId) as
      | VersionRow
      | undefined
    if (!version) throw new Error(`Version not found: ${versionId}`)
    return readVersionHtml(version.file_path)
  })

  ipcMain.handle(IPC.restoreVersion, (_event, input: RestoreVersionInput): string => {
    const version = db.prepare('SELECT * FROM versions WHERE id = ?').get(input.versionId) as
      | VersionRow
      | undefined
    if (!version) throw new Error(`Version not found: ${input.versionId}`)

    const draft = db.prepare('SELECT * FROM drafts WHERE id = ?').get(input.draftId) as
      | DraftRow
      | undefined
    if (!draft) throw new Error(`Draft not found: ${input.draftId}`)
    if (draft.story_id !== version.story_id) throw new Error('Draft does not belong to this story')

    const html = readVersionHtml(version.file_path)
    const now = new Date().toISOString()
    writeDraftHtml(draft.story_id, draft.id, html)
    const hasContent = isMeaningfulHtml(html) ? 1 : 0

    db.prepare(`UPDATE drafts SET updated_at = ?, has_content = ? WHERE id = ?`).run(
      now,
      hasContent,
      draft.id
    )

    if (hasContent) {
      db.prepare(`UPDATE stories SET last_good_draft_id = ?, updated_at = ? WHERE id = ?`).run(
        draft.id,
        now,
        draft.story_id
      )
    }

    maybeCreateVersion(draft.story_id, html)

    return html
  })

  // Opening a URL hands it to the OS, so only ever pass through plain web
  // links - anything else could invoke an arbitrary protocol handler.
  ipcMain.handle(IPC.openExternal, async (_event, url: string): Promise<void> => {
    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      throw new Error(`Refusing to open a malformed URL: ${url}`)
    }
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error(`Refusing to open a non-web URL: ${parsed.protocol}`)
    }
    await shell.openExternal(parsed.toString())
  })

  ipcMain.handle(IPC.pickCoverImage, async (): Promise<string | null> => {
    const result = await dialog.showOpenDialog({
      title: 'Choose a cover picture',
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'webp'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}
