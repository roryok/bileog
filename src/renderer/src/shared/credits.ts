import { deslug } from './format'

export interface ImageCredit {
  photographer: string
  label: string
  url: string
}

export interface ImageFile {
  file: string
  photographer: string
  url: string
  label: string
}

// all the cover files we use in Bileog
const COVER_FILES: ImageFile[] = [
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

const BACKGROUND_FILES: ImageFile[] = [
  { file: 'pexels-enginakyurt-6138036.jpg', label: "Stars in night sky", photographer: "Engin Akyurt", url: "https://www.pexels.com/photo/stars-in-night-sky-6138036/" },
  { file: 'pexels-marianna-sigov-2148401730-30923399.jpg', label: "Tranquil ocean horizon at dawn", photographer: "Marianna Sigov", url: "https://www.pexels.com/photo/tranquil-ocean-horizon-at-dawn-30923399/" },
  { file: 'pexels-plato-terentev-3804555-9962794.jpg', label: "Green leaves on tree branch", photographer: "Plato Terentev", url: "https://www.pexels.com/photo/green-leaves-on-tree-branch-9962794/" },
  { file: 'pexels-mccutcheon-3770703.jpg', label: "Pink textile in close up", photographer: "Alexander Grey", url: "https://www.pexels.com/photo/pink-textile-in-close-up-photography-3770703/" },
  { file: 'pexels-francesco-ungaro-13075382.jpg', label: "Small waves in the ocean", photographer: "Francesco Ungaro", url: "https://www.pexels.com/photo/small-waves-in-the-ocean-13075382/" }
]


// export Cover Credits
export const COVER_CREDITS: ImageCredit[] = COVER_FILES.map((c) => ({ ...c, label: deslug(c.label||'')}))

// export Background Credits
export const BACKGROUND_CREDITS: ImageCredit[] = BACKGROUND_FILES;

export const PEXELS_LICENSE_URL = 'https://www.pexels.com/license/'
export const WEBSITE_URL = 'https://roryok.com/bileog'
