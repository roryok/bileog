import { useCallback, useEffect, useState } from 'react'
import type { OpenedDraft, StorySummary } from './shared/types'
import Dashboard from './components/Dashboard'
import NewStoryModal from './components/NewStoryModal'
import Editor from './components/Editor'
import SettingsModal from './components/SettingsModal'
import {
  getStoredDebug,
  getStoredUsername,
  isDebugCode,
  setStoredDebug,
  setStoredUsername
} from './shared/settings'

type View =
  | { kind: 'loading' }
  | { kind: 'dashboard' }
  | { kind: 'newStory' }
  | { kind: 'editor'; draft: OpenedDraft }

export default function App(): JSX.Element {
  const [view, setView] = useState<View>({ kind: 'loading' })
  const [stories, setStories] = useState<StorySummary[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [username, setUsername] = useState(getStoredUsername())

  const [debug, setDebug] = useState(getStoredDebug())

  const handleUsernameChange = useCallback((name: string) => {
    if (isDebugCode(name)) {
      setDebug((on) => {
        const next = !on
        setStoredDebug(next)
        return next
      })
      setStoredUsername('')
      setUsername('')
      return
    }
    setStoredUsername(name)
    setUsername(name)
  }, [])

  const refreshStories = useCallback(async () => {
    const list = await window.bileog.listStories()
    setStories(list)
    return list
  }, [])

  useEffect(() => {
    refreshStories().then((list) => {
      setView(list.length === 0 ? { kind: 'newStory' } : { kind: 'dashboard' })
    })
  }, [refreshStories])

  const handleStoryCreated = (draft: OpenedDraft): void => {
    setView({ kind: 'editor', draft })
  }

  const handleOpenStory = async (storyId: string): Promise<void> => {
    const draft = await window.bileog.openStory(storyId)
    setView({ kind: 'editor', draft })
  }

  const handleBackToDashboard = async (): Promise<void> => {
    await refreshStories()
    setView({ kind: 'dashboard' })
  }

  let content: JSX.Element

  if (view.kind === 'loading') {
    content = <div className="app-loading" />
  } else if (view.kind === 'editor') {
    content = (
      <Editor
        draft={view.draft}
        author={username.trim()}
        debug={debug}
        onBack={handleBackToDashboard}
        onOpenSettings={() => setSettingsOpen(true)}
      />
    )
  } else if (view.kind === 'newStory') {
    content = (
      <NewStoryModal
        allowCancel={stories.length > 0}
        onCancel={() => setView({ kind: 'dashboard' })}
        onCreated={handleStoryCreated}
      />
    )
  } else {
    content = (
      <Dashboard
        stories={stories}
        author={username.trim()}
        onOpenStory={handleOpenStory}
        onNewStory={() => setView({ kind: 'newStory' })}
        onOpenSettings={() => setSettingsOpen(true)}
        onStoriesChanged={async () => {
          await refreshStories()
        }}
      />
    )
  }

  return (
    <>
      {content}
      <SettingsModal
        open={settingsOpen}
        username={username}
        onUsernameChange={handleUsernameChange}
        debug={debug}
        onDisableDebug={() => {
          setStoredDebug(false)
          setDebug(false)
        }}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  )
}
