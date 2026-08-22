import { Extension } from '@tiptap/core'

export const FONT_SIZE_DEFAULT = 22
export const FONT_SIZE_MIN = 14
export const FONT_SIZE_MAX = 64
export const FONT_SIZE_STEP = 4

export const FontSize = Extension.create({
  name: 'fontSize',

  addGlobalAttributes() {
    return [
      {
        types: ['paragraph'],
        attributes: {
          fontSize: {
            default: null,
            keepOnSplit: false,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) return {}
              return { style: `font-size: ${attributes.fontSize}` }
            }
          }
        }
      }
    ]
  }
})
