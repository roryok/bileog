export const IPC = {
  listStories: 'stories:list',
  createStory: 'story:create',
  openStory: 'story:open',
  renameStory: 'story:rename',
  cycleStoryCover: 'story:cycleCover',
  exportStory: 'story:export',
  saveDraft: 'draft:save',
  listVersions: 'versions:list',
  getVersionContent: 'version:content',
  restoreVersion: 'version:restore',
  pickCoverImage: 'dialog:pickCoverImage',
  beforeQuit: 'app:before-quit',
  quitReady: 'app:quit-ready'
} as const
