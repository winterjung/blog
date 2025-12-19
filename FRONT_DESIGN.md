
## 프론트엔드 디자인 원칙

### 철학: 콘텐츠 우선, 최소 기능

> "단순함을 유지하기가 얼마나 어려운지" - 58 Bytes of CSS

**핵심 가치:**
- 콘텐츠가 주인공, 디자인은 조연
- 추가하기 전에 제거할 것을 먼저 고려
- 브라우저 기본 동작을 존중
- 접근성은 타협 불가

### 참고 사이트 (미니멀 디자인의 모범)

| 사이트 | 특징 |
|--------|------|
| [danluu.com](https://danluu.com) | 극단적 미니멀, 장식 제로, 텍스트만 |
| [bellard.org](https://bellard.org) | 90년대 웹 미학, 링크 목록만 |
| [brandur.org](https://brandur.org) | 깔끔한 타이포그래피, 다크모드 |
| [herman.bearblog.dev](https://herman.bearblog.dev) | 720px 폭, 시스템 폰트 |

### 핵심 CSS 규칙 (100바이트 철학)

```css
/* 이것만으로도 충분히 좋아 보인다 */
html {
  max-width: 70ch;      /* 가독성 최적 폭 (60-80자) */
  padding: 3em 1em;     /* 상하 여백, 모바일 가장자리 방지 */
  margin: auto;         /* 중앙 정렬 */
  line-height: 1.75;    /* 행간 */
  font-size: 1.25em;    /* 기본보다 약간 큰 폰트 */
}
```

### 타이포그래피 원칙

**폰트 선택:**
```css
font-family: 'Pretendard', system-ui, -apple-system, sans-serif;
```
- 시스템 폰트 폴백으로 빠른 로딩
- 한글/영문 모두 Pretendard로 통일

**반응형 폰트 사이즈:**
```css
:root {
  font-size: calc(1rem + 0.25vw);  /* 화면 크기에 따라 부드럽게 확장 */
}
```
- 미디어 쿼리 없이 자연스러운 스케일링
- 모바일 16px → 데스크톱 ~18px

**행간과 폭:**
- `line-height: 1.75` (기본 1.2보다 넓게)
- `max-width: 70ch` (한 줄 45-90자 유지)

### 색상 원칙

**제한된 팔레트:**
```css
:root {
  --color-text: #24292f;        /* 검정이 아닌 부드러운 다크 그레이 */
  --color-bg: #ffffff;
  --color-link: #0969da;        /* GitHub 블루 */
  --color-border: #d0d7de;
  --color-code-bg: #f6f8fa;     /* 약간의 회색 배경 */
}
```

**다크모드:**
```css
[data-theme="dark"] {
  --color-text: #e6edf3;
  --color-bg: #0d1117;          /* GitHub Dark */
  --color-link: #58a6ff;
}

/* 시스템 설정 자동 감지 */
@media (prefers-color-scheme: dark) { ... }
```

### 레이아웃 원칙

**하지 말 것:**
- 그리드/플렉스 남용
- 고정 픽셀 값
- 복잡한 네스팅
- 과도한 애니메이션
- 그림자, 그라데이션
- 불필요한 카드 UI

**할 것:**
- 자연스러운 문서 흐름 존중
- `margin: auto`로 중앙 정렬
- `max-width`로 읽기 폭 제한
- `padding`으로 여백 확보

### 이미지/미디어 원칙

```css
img, svg, video {
  max-width: 100%;    /* 컨테이너 초과 방지 */
  height: auto;       /* 비율 유지 */
  display: block;     /* 인라인 간격 제거 */
}
```

### 링크 스타일

```css
a {
  color: var(--color-link);
  text-decoration: none;        /* 기본 밑줄 제거 */
}

a:hover {
  text-decoration: underline;
  text-underline-offset: 2px;   /* 밑줄 간격 */
}
```

### 코드 블록

```css
pre, code {
  font-family: 'Fira Code', ui-monospace, monospace;
  background-color: var(--color-code-bg);
}

pre {
  padding: 1rem;
  border-radius: 6px;
  overflow-x: auto;             /* 가로 스크롤 */
}
```

### 모던 CSS 한 줄 업그레이드

```css
/* 논리적 속성 사용 */
margin-inline: auto;            /* margin-left + margin-right */

/* 콘텐츠에 맞는 크기 */
width: fit-content;

/* 스크롤 동작 */
scroll-behavior: smooth;

/* 다크모드 브라우저 UI */
color-scheme: light dark;

/* 폼 요소 색상 */
accent-color: var(--color-link);
```

### 금지 목록

| 하지 말 것 | 이유 |
|-----------|------|
| `!important` | 유지보수 불가 |
| 인라인 스타일 | 재사용 불가 |
| ID 셀렉터 (#id) | 특이성 과다 |
| 깊은 네스팅 (3단계+) | 복잡성 증가 |
| 픽셀 단위 폰트 | 접근성 저해 |
| 커스텀 스크롤바 | 일관성 파괴 |
| 자동 재생 미디어 | 사용자 경험 저해 |
| 무한 스크롤 | 탐색 불편 |

### 성능 원칙

**CSS 크기 목표:**
- 전체 CSS < 10KB (압축 전)
- 크리티컬 CSS 인라인 가능한 수준

**로딩 최적화:**
```html
<!-- 폰트 프리로드 -->
<link rel="preconnect" href="https://cdn.jsdelivr.net">
<link rel="preload" href="...pretendard.min.css" as="style">
```

### 체크리스트: 새 스타일 추가 전

1. [ ] 브라우저 기본 스타일로 충분한가?
2. [ ] 기존 CSS 변수로 해결 가능한가?
3. [ ] 모바일에서 테스트했는가?
4. [ ] 다크모드에서 테스트했는가?
5. [ ] 접근성 (대비, 폰트 크기)을 고려했는가?
6. [ ] 이 스타일 없이도 콘텐츠가 읽히는가?
