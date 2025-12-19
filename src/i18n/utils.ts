import { defaultLang, languages, ui } from './ui'

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/')
  if (lang in languages) return lang as keyof typeof languages
  return defaultLang
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key]
  }
}

export function getLocalizedPath(path: string, lang: keyof typeof languages) {
  if (lang === defaultLang) return path
  return `/${lang}${path}`
}
