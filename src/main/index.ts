import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'node:path'
import { registerMediaProtocolScheme, registerMediaProtocolHandler } from './mediaProtocol'
import { registerIpcHandlers } from './ipc'
import { IPC } from '../shared/ipcChannels'
import appIcon from '../assets/icons/leaf_1024.png?asset'

registerMediaProtocolScheme()

let mainWindow: BrowserWindow | null = null
let quitConfirmed = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    icon: appIcon,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log(`[renderer:${level}] ${message} (${sourceId}:${line})`)
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerMediaProtocolHandler()
  registerIpcHandlers()

  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(appIcon)
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Give the renderer a chance to flush an in-progress autosave before the app closes.
app.on('before-quit', (event) => {
  if (quitConfirmed || !mainWindow || mainWindow.isDestroyed()) return
  event.preventDefault()
  mainWindow.webContents.send(IPC.beforeQuit)
  setTimeout(() => {
    quitConfirmed = true
    app.quit()
  }, 1500)
})

ipcMain.on(IPC.quitReady, () => {
  quitConfirmed = true
  app.quit()
})
