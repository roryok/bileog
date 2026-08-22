import type { BileogApi } from '../../shared/types'

declare global {
  interface Window {
    bileog: BileogApi
  }
}

export {}
