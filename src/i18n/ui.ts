export const languages = {
  ko: '한국어',
  en: 'English',
} as const

export const defaultLang = 'ko' as const

export const ui = {
  ko: {
    'site.title': 'winterjung blog',
    'site.description': '글 쓰는 소프트웨어 엔지니어',
    'nav.posts': 'posts',
    'nav.resume': 'resume',
    'nav.rss': 'rss',
    'home.empty': '아직 포스트가 없습니다.',
    'home.checkOther': '다른 언어 포스트 보기',
    '404.title': '페이지를 찾을 수 없습니다',
    '404.description': '요청하신 페이지가 존재하지 않습니다.',
    '404.recent': '최근 포스트',
  },
  en: {
    'site.title': 'winterjung blog',
    'site.description': 'Software engineer who writes',
    'nav.posts': 'posts',
    'nav.resume': 'resume',
    'nav.rss': 'rss',
    'home.empty': 'No posts yet.',
    'home.checkOther': 'Check out posts in other languages',
    '404.title': 'Page Not Found',
    '404.description': 'The page you requested does not exist.',
    '404.recent': 'Recent Posts',
  },
} as const
