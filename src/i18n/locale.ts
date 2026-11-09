import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Locale = 'ru' | 'en'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'ru',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'aivibe-locale' },
  ),
)

export function getLocale(): Locale {
  return useLocaleStore.getState().locale
}
