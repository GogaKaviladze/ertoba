'use client'

import React, { createContext, useContext, useState } from 'react'
import { getDictionary, isLanguage, type Language } from './dictionaries'

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

function getLanguageCookieValue() {
  const languageCookie = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('ertoba_lang='))

  if (!languageCookie) {
    return null
  }

  const cookieValue = languageCookie.slice('ertoba_lang='.length)

  try {
    return decodeURIComponent(cookieValue)
  } catch {
    return null
  }
}

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'ka'
  }

  try {
    const saved = localStorage.getItem('ertoba_lang')
    if (isLanguage(saved)) {
      return saved
    }
  } catch {
    // Ignore localStorage access failures (for example private browsing or disabled storage)
    // and fall back to cookies/default language.
  }

  const cookieLanguage = getLanguageCookieValue()
  return isLanguage(cookieLanguage) ? cookieLanguage : 'ka'
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage)

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('ertoba_lang', lang)
    } catch {
      // Ignore localStorage write failures (for example private browsing or disabled storage)
      // and still persist the cookie when possible.
    }
    document.cookie = `ertoba_lang=${lang}; path=/; max-age=31536000; samesite=lax${
      window.location.protocol === 'https:' ? '; secure' : ''
    }`
  }

  const t = (key: string): string => {
    const dict = getDictionary(language) as Record<string, string>
    return dict[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
