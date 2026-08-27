import spaceImg from '../../assets/images/backgrounds/pexels-enginakyurt-6138036.jpg'
import daylightImg from '../../assets/images/backgrounds/pexels-marianna-sigov-2148401730-30923399.jpg'
import forestImg from '../../assets/images/backgrounds/pexels-plato-terentev-3804555-9962794.jpg'
import pinkImg from '../../assets/images/backgrounds/pexels-mccutcheon-3770703.jpg'
import oceanImg from '../../assets/images/backgrounds/pexels-francesco-ungaro-13075382.jpg'

export type ThemeId = 'space' | 'daylight' | 'forest' | 'pink' | 'ocean'
export type FontId = 'rounded' | 'classic' | 'simple' | 'handwriting'

export interface ThemeOption {
  id: ThemeId
  label: string
  image: string
  credit: string
}

export interface FontOption {
  id: FontId
  label: string
  family: string
}



export const THEMES: ThemeOption[] = [
  { id: 'space', label: 'Space', image: spaceImg, credit: "Stars in night sky, by Engin Akyurt - https://www.pexels.com/photo/stars-in-night-sky-6138036/" },
  { id: 'daylight', label: 'Daylight', image: daylightImg, credit: "Tranquil ocean horizon at dawn, by Marianna Sigov - https://www.pexels.com/photo/tranquil-ocean-horizon-at-dawn-30923399/" },
  { id: 'forest', label: 'Forest', image: forestImg, credit: "Green leaves on tree branch, by Plato Terentev - https://www.pexels.com/photo/green-leaves-on-tree-branch-9962794/" },
  { id: 'pink', label: 'Pink', image: pinkImg, credit: "Pink textile in close up, by Alexander Grey - https://www.pexels.com/photo/pink-textile-in-close-up-photography-3770703/" },
  { id: 'ocean', label: 'Ocean', image: oceanImg, credit: "Small waves in the ocean, by Francesco Ungaro - https://www.pexels.com/photo/small-waves-in-the-ocean-13075382/" }
]

export const FONTS: FontOption[] = [
  { id: 'rounded', label: 'Rounded', family: "'Baloo 2', 'Trebuchet MS', sans-serif" },
  { id: 'classic', label: 'Classic', family: "Georgia, 'Times New Roman', serif" },
  { id: 'simple', label: 'Simple', family: 'Arial, Helvetica, sans-serif' },
  { id: 'handwriting', label: 'Handwriting', family: "'Comic Sans MS', 'Chalkboard SE', cursive" }
]

const THEME_KEY = 'bileog:theme'
const FONT_KEY = 'bileog:font'
const BG_IMAGES_KEY = 'bileog:bgImages'
const USERNAME_KEY = 'bileog:username'
const DEBUG_KEY = 'bileog:debug'
const DEFAULT_THEME: ThemeId = 'space'
const DEFAULT_FONT: FontId = 'rounded'

export function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem(THEME_KEY)
  return THEMES.some((t) => t.id === stored) ? (stored as ThemeId) : DEFAULT_THEME
}

export function getStoredFont(): FontId {
  const stored = localStorage.getItem(FONT_KEY)
  return FONTS.some((f) => f.id === stored) ? (stored as FontId) : DEFAULT_FONT
}

export function getStoredBackgroundImages(): boolean {
  const stored = localStorage.getItem(BG_IMAGES_KEY)
  return stored === null ? true : stored === 'true'
}

export function applyTheme(theme: ThemeId): void {
  document.documentElement.dataset.theme = theme
  const option = THEMES.find((t) => t.id === theme)
  if (option) {
    document.documentElement.style.setProperty('--bg-image', `url(${option.image})`)
  }
  localStorage.setItem(THEME_KEY, theme)
}

export function applyFont(font: FontId): void {
  document.documentElement.dataset.font = font
  localStorage.setItem(FONT_KEY, font)
}

export function applyBackgroundImages(enabled: boolean): void {
  document.documentElement.dataset.bgImages = enabled ? 'on' : 'off'
  localStorage.setItem(BG_IMAGES_KEY, String(enabled))
}

/** The writer's name, shown on covers and used to sign exported stories. Empty means unset. */
export function getStoredUsername(): string {
  return localStorage.getItem(USERNAME_KEY) ?? ''
}

export function setStoredUsername(name: string): void {
  const trimmed = name.trim()
  if (trimmed) localStorage.setItem(USERNAME_KEY, trimmed)
  else localStorage.removeItem(USERNAME_KEY)
}

/**
 * Typing this into the name field toggles debug mode instead of setting a name.
 * Spaces and case are forgiving, so "Guybrush Threepwood" works too.
 */
const DEBUG_CODE = 'guybrush-threepwood'

export function isDebugCode(value: string): boolean {
  return value.trim().toLowerCase().replace(/\s+/g, '-') === DEBUG_CODE
}

export function getStoredDebug(): boolean {
  return localStorage.getItem(DEBUG_KEY) === 'true'
}

export function setStoredDebug(enabled: boolean): void {
  if (enabled) localStorage.setItem(DEBUG_KEY, 'true')
  else localStorage.removeItem(DEBUG_KEY)
}
