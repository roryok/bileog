import { app } from 'electron'
import {
  mkdirSync,
  writeFileSync,
  readFileSync,
  copyFileSync,
  existsSync,
  unlinkSync,
  rmSync
} from 'node:fs'
import { join, extname } from 'node:path'
import { randomUUID } from 'node:crypto'

function userDataRoot(): string {
  return app.getPath('userData')
}

export function storiesRoot(): string {
  return join(userDataRoot(), 'stories')
}

function storyDir(storyId: string): string {
  return join(storiesRoot(), storyId)
}

function draftsDir(storyId: string): string {
  return join(storyDir(storyId), 'drafts')
}

function versionsDir(storyId: string): string {
  return join(storyDir(storyId), 'versions')
}

export function ensureStoryDirs(storyId: string): void {
  mkdirSync(draftsDir(storyId), { recursive: true })
  mkdirSync(versionsDir(storyId), { recursive: true })
}

/** Relative paths are stored in the DB (relative to userData), and resolved to absolute here. */
export function absolutePath(relativePath: string): string {
  return join(userDataRoot(), relativePath)
}

export function writeDraftHtml(storyId: string, draftId: string, html: string): string {
  ensureStoryDirs(storyId)
  const relativePath = join('stories', storyId, 'drafts', `${draftId}.html`)
  writeFileSync(absolutePath(relativePath), html, 'utf-8')
  return relativePath
}

export function readDraftHtml(relativeFilePath: string): string {
  const path = absolutePath(relativeFilePath)
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf-8')
}

export function writeVersionHtml(storyId: string, versionId: string, html: string): string {
  ensureStoryDirs(storyId)
  const relativePath = join('stories', storyId, 'versions', `${versionId}.html`)
  writeFileSync(absolutePath(relativePath), html, 'utf-8')
  return relativePath
}

export function readVersionHtml(relativeFilePath: string): string {
  const path = absolutePath(relativeFilePath)
  if (!existsSync(path)) return ''
  return readFileSync(path, 'utf-8')
}

export function saveCoverFromUpload(storyId: string, sourceFilePath: string): string {
  ensureStoryDirs(storyId)
  const ext = extname(sourceFilePath) || '.png'
  const relativePath = join('stories', storyId, `cover-${randomUUID()}${ext}`)
  copyFileSync(sourceFilePath, absolutePath(relativePath))
  return relativePath
}

export function deleteStoryFile(relativePath: string): void {
  try {
    unlinkSync(absolutePath(relativePath))
  } catch {
    // ignore missing / already-deleted files
  }
}

export function saveGeneratedCover(storyId: string, svgContent: string): string {
  ensureStoryDirs(storyId)
  const relativePath = join('stories', storyId, 'cover.svg')
  writeFileSync(absolutePath(relativePath), svgContent, 'utf-8')
  return relativePath
}

/** Removes a story's whole folder: drafts, versions and cover alike. */
export function deleteStoryDir(storyId: string): void {
  rmSync(storyDir(storyId), { recursive: true, force: true })
}
