# Bileog

A distraction-free story writing app for kids.

*Bileog* (BILL-ogue) is Irish for "leaf".

Bileog gives children a calm, full-screen place to write stories. Every story
gets a cover, autosaves as they type, and keeps a timeline of earlier versions
they can look back through - so nothing is ever lost and nothing needs saving
by hand.

## Features

- **Distraction-free editor** - one story, one page, no menus in the way
- **Autosave** - drafts are written continuously; there is no save button
- **Version timeline** - snapshots as the story grows, with one-click restore
- **Story covers** - picked from a bundled set, generated, or chosen from a photo
- **Reading themes** - several backgrounds and editor fonts to choose from
- **Export** - save any story as HTML or PDF
- **Completely offline** - no accounts, no network calls, no telemetry

## Install

Download the latest build from the [Releases page](https://github.com/roryok/bileog/releases).

macOS builds are not yet notarized, so after dragging Bileog to Applications you
need to clear the quarantine flag once - see [INSTALL.md](INSTALL.md).

## Development

Requires Node.js 20 or newer.

```sh
npm install     # also rebuilds better-sqlite3 against Electron
npm run dev     # start with hot reload
```

Other scripts:

```sh
npm run typecheck   # tsc over main, preload and renderer
npm run build       # compile to out/ without packaging
npm run start       # run the compiled build
npm run dist        # typecheck, build, and package a DMG into dist/
npm run dist:dir    # unpacked .app only - much faster when testing packaging
```

## Architecture

| Path | Role |
| --- | --- |
| `src/main` | Electron main process - SQLite, file storage, IPC, PDF export |
| `src/preload` | Context-isolated bridge exposing a typed API to the renderer |
| `src/renderer` | React 18 + TipTap editor UI |
| `src/shared` | Types and IPC channel names shared across processes |

Stories are stored as HTML files on disk; SQLite holds the index of stories,
drafts and versions. Images are served to the renderer through a custom
`bileog-media://` protocol rather than `file://`, so the renderer keeps a strict
Content-Security-Policy with no filesystem access.

## Where your stories are kept

Everything lives outside the app bundle, so it survives updates:

| Platform | Location |
| --- | --- |
| macOS | `~/Library/Application Support/bileog/` |
| Windows | `%APPDATA%\bileog\` |
| Linux | `~/.config/bileog/` |

To move a library between machines, copy that folder with Bileog closed on both.

## Roadmap

[`roadmap.html`](roadmap.html) tracks the route to open sourcing and publishing
on Flathub, the Microsoft Store and the Mac App Store - what's done, what's
blocked, and why the stores are tackled in that order. Open it in a browser.

## Built with

Electron · electron-vite · React · TipTap · better-sqlite3 · TypeScript

## License

Source code is [MIT](LICENSE) licensed.

The bundled cover photographs, backgrounds and fonts are third-party assets
under their own terms - see [NOTICE](NOTICE).
