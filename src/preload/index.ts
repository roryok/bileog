import { contextBridge, ipcRenderer } from 'electron'
import { IPC } from '../shared/ipcChannels'
import type {
  BileogApi,
  CreateStoryInput,
  SaveDraftInput,
  StorySummary,
  OpenedDraft,
  VersionSummary,
  RestoreVersionInput,
  RenameStoryInput,
  CycleStoryCoverInput,
  ExportStoryInput,
  ExportStoryResult
} from '../shared/types'

const api: BileogApi = {
  listStories: (): Promise<StorySummary[]> => ipcRenderer.invoke(IPC.listStories),

  createStory: (input: CreateStoryInput): Promise<OpenedDraft> =>
    ipcRenderer.invoke(IPC.createStory, input),

  openStory: (storyId: string): Promise<OpenedDraft> => ipcRenderer.invoke(IPC.openStory, storyId),

  renameStory: (input: RenameStoryInput): Promise<{ ok: true }> =>
    ipcRenderer.invoke(IPC.renameStory, input),

  deleteStory: (storyId: string): Promise<{ ok: true }> =>
    ipcRenderer.invoke(IPC.deleteStory, storyId),

  cycleStoryCover: (input: CycleStoryCoverInput): Promise<{ coverUrl: string | null }> =>
    ipcRenderer.invoke(IPC.cycleStoryCover, input),

  exportStory: (input: ExportStoryInput): Promise<ExportStoryResult> =>
    ipcRenderer.invoke(IPC.exportStory, input),

  saveDraft: (input: SaveDraftInput): Promise<{ ok: true }> =>
    ipcRenderer.invoke(IPC.saveDraft, input),

  listVersions: (storyId: string): Promise<VersionSummary[]> =>
    ipcRenderer.invoke(IPC.listVersions, storyId),

  clearStoryHistory: (storyId: string): Promise<{ removed: number }> =>
    ipcRenderer.invoke(IPC.clearStoryHistory, storyId),

  getVersionContent: (versionId: string): Promise<string> =>
    ipcRenderer.invoke(IPC.getVersionContent, versionId),

  restoreVersion: (input: RestoreVersionInput): Promise<string> =>
    ipcRenderer.invoke(IPC.restoreVersion, input),

  pickCoverImage: (): Promise<string | null> => ipcRenderer.invoke(IPC.pickCoverImage),

  openExternal: (url: string): Promise<void> => ipcRenderer.invoke(IPC.openExternal, url),

  onBeforeQuit: (handler: () => Promise<void> | void): (() => void) => {
    const listener = async (): Promise<void> => {
      try {
        await handler()
      } finally {
        ipcRenderer.send(IPC.quitReady)
      }
    }
    ipcRenderer.on(IPC.beforeQuit, listener)
    return () => ipcRenderer.removeListener(IPC.beforeQuit, listener)
  }
}

contextBridge.exposeInMainWorld('bileog', api)
