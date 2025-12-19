# blog

> https://winterjung.dev

Astro 기반 개인 블로그

## 0. 로컬 개발환경 세팅

```sh
# Node.js 20+ 필요
node -v

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
# http://localhost:4321
```

## 1. 새 블로그 글 작성

### 파일 생성

`src/content/posts/ko/` 디렉토리에 마크다운 파일 생성:

```
src/content/posts/ko/YYYY-MM-DD-slug.md
```

예시: `2025-01-15-my-new-post.md`

### Frontmatter 작성

```yaml
---
title: 포스트 제목
image: images/YYYYMMDD/thumbnail.png  # 선택사항
lastmod: 2025-01-20  # 선택사항, 수정일
draft: true  # 선택사항, 작성 중일 때
---

본문 내용...
```

### 이미지 추가

1. `public/images/YYYYMMDD/` 디렉토리 생성
2. 이미지 파일 추가
3. 마크다운에서 참조: `![alt](/images/YYYYMMDD/image.png)`

### 점검 및 확인

```sh
# 개발 서버에서 확인
npm run dev

# 타입 체크
npm run check

# 린트
npm run lint

# 빌드 테스트
npm run build
npm run preview
```

### 발행

1. `draft: true` 제거 (있었다면)
2. 커밋 & 푸시 → GitHub Actions가 자동 배포

## 2. 블로그 기능 수정

### 주요 파일 구조

```
src/
├── components/       # 재사용 컴포넌트
│   ├── BaseHead.astro    # SEO 메타태그
│   ├── Header.astro      # 네비게이션
│   ├── Giscus.astro      # 댓글
│   └── ThemeToggle.astro # 다크모드 토글
├── layouts/          # 페이지 레이아웃
│   ├── BaseLayout.astro  # 기본 레이아웃
│   └── PostLayout.astro  # 포스트 레이아웃
├── pages/            # 라우팅
│   ├── index.astro       # 홈 (포스트 목록)
│   ├── [slug].astro      # 포스트 상세
│   ├── resume.astro      # 이력서
│   ├── 404.astro         # 에러 페이지
│   └── rss.xml.ts        # RSS 피드
├── content/          # 콘텐츠 (마크다운)
│   ├── config.ts         # 스키마 정의
│   └── posts/ko/*.md     # 포스트 파일
├── styles/
│   └── global.css        # 전역 스타일, CSS 변수
└── i18n/             # 다국어 설정
    ├── ui.ts             # 번역 문자열
    └── utils.ts          # 헬퍼 함수
```

### 수정 워크플로우

```sh
# 1. 개발 서버 실행 (핫 리로드)
npm run dev

# 2. 코드 수정

# 3. 린트 & 포맷
npm run lint
npm run format

# 4. 타입 체크
npm run check

# 5. 빌드 테스트
npm run build
```

### 주요 설정 파일

| 파일 | 용도 |
|------|------|
| `astro.config.mjs` | Astro 설정 (사이트 URL, 마크다운, i18n) |
| `src/content/config.ts` | 포스트 스키마 (frontmatter 필드) |
| `src/styles/global.css` | CSS 변수 (색상, 다크모드) |
| `biome.json` | 린터/포매터 설정 |

### 스타일 수정

다크모드 색상은 `src/styles/global.css`의 CSS 변수로 관리:

```css
:root {
  --color-text: #24292f;
  --color-bg: #ffffff;
  --color-link: #0969da;
  /* ... */
}

[data-theme="dark"] {
  --color-text: #e6edf3;
  --color-bg: #0d1117;
  --color-link: #58a6ff;
  /* ... */
}
```

### 새 페이지 추가

`src/pages/` 디렉토리에 `.astro` 파일 생성:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro'
---

<BaseLayout title="페이지 제목">
  <h1>내용</h1>
</BaseLayout>
```

## 명령어 요약

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 (localhost:4321) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run check` | Astro 타입 체크 |
| `npm run lint` | Biome 린트 |
| `npm run format` | Biome 포맷 |
