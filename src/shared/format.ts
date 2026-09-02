// format a story title and author
export function signedTitle(title: string, author?: string): string {
  const name = author?.trim()
  return name ? `${title} - by ${name}` : title
}

// remove dashes to turn a slug into a butterfly
export function deslug(slug: string): string {
  const words = slug.replace(/-/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

// format a timestamp
export function formatTimestamp(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}