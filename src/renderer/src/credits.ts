import { THEMES } from './settings'

export interface ImageCredit {
  /** Photographer's Pexels handle, or null where the filename carries no author. */
  photographer: string | null
  /**
   * True where the name is a handle scraped from the download filename rather
   * than a confirmed credit. Checked against the five hand-written background
   * credits, filename handles matched the real photographer name only 4 times
   * out of 5 - pexels-mccutcheon-3770703.jpg is in fact by Alexander Grey - so
   * these are shown as handles and never asserted as authorship.
   */
  provisional?: boolean
  /** What the picture is used for, shown as the row's heading. */
  label: string
  url: string
}

/**
 * Cover photographs.
 *
 * Photo ids and urls come from the Pexels download filenames, which encode
 * them. Photographer names and titles are confirmed against Pexels by hand -
 * they cannot be derived, because the handle in a filename is often stale or
 * absent (pexels-ian-panelo-4002809.jpg is by Nothing Ahead, and
 * pexels-photo-12353410.jpg names nobody at all).
 *
 * Any row still missing a label is treated as unconfirmed and renders its
 * filename handle rather than claiming authorship.
 */
const COVER_FILES: {
  file: string
  photographer: string | null
  url: string
  /**
   * The photo's title on Pexels, as a slug. Its presence marks the row as
   * checked: rows with a label show "by <name>", rows without fall back to
   * showing the raw filename handle as "<handle> on Pexels".
   */
  label?: string
}[] = [
  { file: "pexels-akshay-s-1243594686-30367867.jpg", label: "person-in-vibrant-digital-art-installation", photographer: "Akshay S", url: "https://www.pexels.com/photo/30367867/" },
  { file: "pexels-ananthu-418925486-18968216.jpg", label: "silhouette-of-a-person-sitting-in-a-trolley-of-an-amusement-ride", photographer: "ananthu", url: "https://www.pexels.com/photo/18968216/" },
  { file: "pexels-face-bee-701833185-18214301.jpg", label: "traditional-lanterns-and-umbrella-over-alley-in-town", photographer: "face-bee", url: "https://www.pexels.com/photo/18214301/" },
  { file: "pexels-ian-panelo-4002809.jpg", label: "crop-unrecognizable-person-with-garlands-tied-on-hand-against-sundown-sky", photographer: "Nothing Ahead", url: "https://www.pexels.com/photo/4002809/" },
  { file: "pexels-igor-meghega-315695093-14746301.jpg", label: "christmas-decorations-an-extremely-beautiful-atmosphere-of-the-christmas-holiday", photographer: "Igor Meghega", url: "https://www.pexels.com/photo/14746301/" },
  { file: "pexels-jasperjoko-35224763.jpg", label: "glowing-star-sphere-in-hand-at-night", photographer: "Jasper Kortmann", url: "https://www.pexels.com/photo/35224763/" },
  { file: "pexels-johnpet-4317234.jpg", label: "a-hand-holding-a-moon-lamp", photographer: "John Petalcurin", url: "https://www.pexels.com/photo/4317234/" },
  { file: "pexels-jonathan-pagaoa-46448199-14997903.jpg", label: "close-up-of-a-pair-of-dice-on-the-black-background", photographer: "Jonathan Pagaoa", url: "https://www.pexels.com/photo/14997903/" },
  { file: "pexels-konrads-photo-35049222.jpg", label: "moody-indoor-portrait-with-mystical-lighting", photographer: "Daniil Kondrashin", url: "https://www.pexels.com/photo/35049222/" },
  { file: "pexels-marek-piwnicki-3907296-34792547.jpg", label: "narrow-wooden-corridor-in-kyoto-at-night", photographer: "Marek Piwnicki", url: "https://www.pexels.com/photo/34792547/" },
  { file: "pexels-merlin-20139057.jpg", label: "a-green-and-blue-glowing-light-is-shown-in-the-dark", photographer: "Merlin Lightpainting", url: "https://www.pexels.com/photo/20139057/" },
  { file: "pexels-onbab-10874943.jpg", label: "woman-looking-at-projection-on-a-wall", photographer: "Sami Abdullah", url: "https://www.pexels.com/photo/10874943/" },
  { file: "pexels-onbab-10874947.jpg", label: "a-person-shadow-over-colorful-surface", photographer: "Sami Abdullah", url: "https://www.pexels.com/photo/10874947/" },
  { file: "pexels-photo-12353410.jpg", label: "woman-in-neon-club", photographer: "Ayşin S", url: 'https://www.pexels.com/photo/12353410/' },
  { file: "pexels-sebastiaan9977-34742150.jpg", label: "moody-portrait-in-dramatic-lighting", photographer: "Sebastiaan Stam", url: "https://www.pexels.com/photo/34742150/" },
  { file: "pexels-toniferreirafilms-1900184.jpg", label: "woman-reading-harry-potter-book-while-lying-in-bed", photographer: "Toni Ferreira", url: "https://www.pexels.com/photo/1900184/" },
  { file: "pexels-vladislovas-sketerskis-2157863731-35414271.jpg", label: "magical-snow-globe-with-santa-figure", photographer: "Vladislovas Sketerskis", url: "https://www.pexels.com/photo/35414271/" },
]

function humanise(slug: string): string {
  const words = slug.replace(/-/g, ' ').trim()
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export const COVER_CREDITS: ImageCredit[] = COVER_FILES.map((c) => ({
  photographer: c.photographer,
  label: c.label ? humanise(c.label) : 'Story cover',
  url: c.url,
  provisional: !c.label
}))

/**
 * Background photographs. These already carry full titles and photographer
 * names, so they are read straight off the theme definitions.
 */
export const BACKGROUND_CREDITS: ImageCredit[] = THEMES.map((theme) => {
  const [description, rest] = theme.credit.split(', by ')
  const [photographer, url] = (rest ?? '').split(' - ')
  return {
    photographer: photographer?.trim() || null,
    label: `${theme.label} background - ${description}`,
    url: (url ?? '').trim()
  }
})

export const PEXELS_LICENSE_URL = 'https://www.pexels.com/license/'
export const WEBSITE_URL = 'https://roryok.com/bileog'
