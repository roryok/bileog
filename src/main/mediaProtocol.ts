import { protocol, net } from 'electron'
import { pathToFileURL } from 'node:url'
import { absolutePath } from './storage'

export const MEDIA_SCHEME = 'bileog-media'

/** Must be called before app.whenReady(). */
export function registerMediaProtocolScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: MEDIA_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true
      }
    }
  ])
}

/** Must be called after app.whenReady(). */
export function registerMediaProtocolHandler(): void {
  protocol.handle(MEDIA_SCHEME, (request) => {
    const url = new URL(request.url)
    // Chromium normalizes the empty-host form (scheme:///a/b) down to host="a", path="/b"
    // for this non-special custom scheme, so the real relative path is hostname + pathname.
    const relativePath = decodeURIComponent(`${url.hostname}${url.pathname}`).replace(/^\/+/, '')
    const fileUrl = pathToFileURL(absolutePath(relativePath)).toString()
    return net.fetch(fileUrl)
  })
}

/** relativePath is relative to userData, e.g. "stories/<id>/cover.svg" */
export function toMediaUrl(relativePath: string): string {
  return `${MEDIA_SCHEME}:///${relativePath.split(/[\\/]/).map(encodeURIComponent).join('/')}`
}
