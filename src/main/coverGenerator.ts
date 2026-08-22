const PALETTES: Array<[string, string]> = [
  ['#FF9A8B', '#FF6A88'],
  ['#A18CD1', '#FBC2EB'],
  ['#84FAB0', '#8FD3F4'],
  ['#FFECD2', '#FCB69F'],
  ['#89F7FE', '#66A6FF'],
  ['#FDCBF1', '#E6DEE9'],
  ['#F6D365', '#FDA085'],
  ['#A1C4FD', '#C2E9FB'],
  ['#FBC2EB', '#A6C1EE'],
  ['#FCCF31', '#F55555']
]

function hashString(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function wrapTitle(title: string, maxCharsPerLine = 14): string[] {
  const words = title.trim().split(/\s+/)
  const lines: string[] = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)

  return lines.slice(0, 5)
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export function generateCoverSvg(seed: string, title: string): string {
  const [from, to] = PALETTES[hashString(seed) % PALETTES.length]
  const lines = wrapTitle(title || 'My Story')
  const width = 600
  const height = 800
  const fontSize = 48
  const lineHeight = fontSize * 1.25
  const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2

  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="${width / 2}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}" />
      <stop offset="100%" stop-color="${to}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="24" />
  <text
    text-anchor="middle"
    dominant-baseline="middle"
    font-family="'Comic Sans MS', 'Baloo 2', 'Trebuchet MS', sans-serif"
    font-weight="700"
    font-size="${fontSize}"
    fill="#ffffff"
    style="paint-order: stroke; stroke: rgba(0,0,0,0.15); stroke-width: 2px;"
  >${tspans}</text>
</svg>`
}
