export const languages = {
  ko: '한국어',
  en: 'English',
} as const

export const defaultLang = 'ko' as const

export const ui = {
  ko: {
    'nav.posts': 'posts',
    'nav.resume': 'resume',
    'nav.rss': 'rss',
    '404.title': '페이지를 찾을 수 없습니다',
    '404.description': '요청하신 페이지가 존재하지 않습니다.',
    '404.recent': '최근 포스트',
  },
  en: {
    'nav.posts': 'posts',
    'nav.resume': 'resume',
    'nav.rss': 'rss',
    '404.title': 'Page Not Found',
    '404.description': 'The page you requested does not exist.',
    '404.recent': 'Recent Posts',
  },
} as const
