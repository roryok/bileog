# Bileog

A distraction-free story writing app for kids.

*Bileog* (BILL-ogue) is Irish for "leaf".

I built this for my own kids as a simple way to write stuff without all the extra complications of things like Google Docs or Pages or Word. 

Bileog gives children a calm, full-screen place to write stories. Every story gets a cover, autosaves as they type, and keeps a timeline of earlier versions they can look back through - so nothing is ever lost and nothing needs saving by hand.

It makes pretty covers (in app only) using free images from Pexels with credits in the settings / about page. 

## Install

Download the latest build from the [Releases page](https://github.com/roryok/bileog/releases).

## App stores

I'm hoping to add it to FlatHub / flatpak, Windows Store. and Mac OS Store soon.


## Where your stories are kept

Everything lives outside the app bundle, so it survives updates:

| Platform | Location |
| --- | --- |
| macOS | `~/Library/Application Support/bileog/` |
| Windows | `%APPDATA%\bileog\` |
| Linux | `~/.config/bileog/` |

To move a library between machines, copy that folder with Bileog closed on both.

## Built with

Electron · electron-vite · React · TipTap · better-sqlite3 · TypeScript

## License

Source code is [MIT](LICENSE) licensed.

The bundled cover photographs, backgrounds and fonts are third-party assets
under their own terms - see [NOTICE](NOTICE).
