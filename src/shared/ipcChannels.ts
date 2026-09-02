export const IPC = {
  listStories: 'stories:list',
  createStory: 'story:create',
  openStory: 'story:open',
  renameStory: 'story:rename',
  deleteStory: 'story:delete',
  cycleStoryCover: 'story:cycleCover',
  exportStory: 'story:export',
  saveDraft: 'draft:save',
  listVersions: 'versions:list',
  clearStoryHistory: 'versions:clear',
  getVersionContent: 'version:content',
  restoreVersion: 'version:restore',
  pickCoverImage: 'dialog:pickCoverImage',
  openExternal: 'shell:openExternal',
  beforeQuit: 'app:before-quit',
  quitReady: 'app:quit-ready'
} as const
