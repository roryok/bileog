/**
 * How a story is named once a writer's name has been set: "Wolves in the
 * Garden - by Aoife". Shared so the export filename, the exported document's
 * title and the hint shown in Settings cannot drift apart.
 */
export function signedTitle(title: string, author?: string): string {
  const name = author?.trim()
  return name ? `${title} - by ${name}` : title
}
