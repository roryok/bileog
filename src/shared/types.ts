export interface StorySummary {
  id: string
  title: string
  coverUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface OpenedDraft {
  draftId: string
  storyId: string
  title: string
  html: string
}

export interface CreateStoryInput {
  title: string
  coverFilePath?: string | null
}

export interface SaveDraftInput {
  draftId: string
  html: string
}

export interface VersionSummary {
  id: string
  createdAt: string
}

export interface RestoreVersionInput {
  draftId: string
  versionId: string
}

export interface RenameStoryInput {
  storyId: string
  title: string
}

export interface CycleStoryCoverInput {
  storyId: string
  direction?: 'next' | 'prev'
}

export interface ExportStoryInput {
  title: string
  html: string
  format: 'html' | 'pdf'
  /** Writer's name, when one has been set in Settings. */
  author?: string
}

export interface ExportStoryResult {
  ok: boolean
  canceled?: boolean
}

export interface BileogApi {
  listStories: () => Promise<StorySummary[]>
  createStory: (input: CreateStoryInput) => Promise<OpenedDraft>
  openStory: (storyId: string) => Promise<OpenedDraft>
  renameStory: (input: RenameStoryInput) => Promise<{ ok: true }>
  deleteStory: (storyId: string) => Promise<{ ok: true }>
  cycleStoryCover: (input: CycleStoryCoverInput) => Promise<{ coverUrl: string | null }>
  exportStory: (input: ExportStoryInput) => Promise<ExportStoryResult>
  saveDraft: (input: SaveDraftInput) => Promise<{ ok: true }>
  listVersions: (storyId: string) => Promise<VersionSummary[]>
  clearStoryHistory: (storyId: string) => Promise<{ removed: number }>
  getVersionContent: (versionId: string) => Promise<string>
  restoreVersion: (input: RestoreVersionInput) => Promise<string>
  pickCoverImage: () => Promise<string | null>
  openExternal: (url: string) => Promise<void>
  onBeforeQuit: (handler: () => Promise<void> | void) => () => void
}
