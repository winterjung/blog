---
title: 릴리즈 - 메타 태그 지원
image: images/focus.jpg
---

드디어 블로그에서 메타 태그를 지원합니다!

![🎉](https://user-images.githubusercontent.com/13811604/99905481-52ff7000-2d14-11eb-9ce0-4ce16aca36ac.png)

## 그 여정

이전 블로그와 다르게 처음부터 하나하나 만들다 보니 지금의 블로그는 아직 부족함이 많고 그중 하나가 메타 태그였습니다.

<figure style="text-align: center;">
  <img src="https://user-images.githubusercontent.com/13811604/99905430-103d9800-2d14-11eb-96ea-6c0ba6764de6.png" alt="슬랙에 블로그 글을 공유했으나 미리보기가 없는 사진">
  <figcaption>
    새로운 블로그 글을 공유했으나 미리보기가 없다
  </figcaption>
</figure>

밑바탕을 준비하고 2주에 한 번씩 글을 쓰는 사내 소모임을 참여하다 보니 자연스레 메타 태그 작업을 가장 먼저 하고 싶었습니다. 아직 웹 프론트엔드를 잘 모르기에 Gatsbyjs에서 제공하는 [Adding an SEO Component 가이드](https://www.gatsbyjs.com/docs/add-seo-component/)를 그저 충실히 따라 했습니다. `react-helmet`을 이용한 seo 컴포넌트를 추가해줬고 간결한 코드를 위해 [marisamorby/marisamorby.com의 seo 컴포넌트](https://github.com/marisamorby/marisamorby.com/blob/e811f7ee68f1fe6c6dcf92e487d554d02a5c5b79/packages/gatsby-theme-blog-sanity/src/components/seo.js)를 조금 참고해 다듬었습니다.

로컬환경에서 테스트할 땐 공유된 링크가 어떻게 보이는지까진 테스트하지 않았습니다. 하려면 [ngrok](https://ngrok.com/)을 사용해 어떻게든 할 수야 있겠지만 차라리 [테크스펙](https://docs.google.com/document/d/1eW6lOty0yyaBvF4EDigVE0HaaHIUi2iu1pqtjw5gt2E/edit)에서 언급했던 preview 기능 니즈를 1 스택 적립하는 게 낫다고 생각했습니다.

## 트러블 슈팅

나름 잘 따라 했다고 생각했는데 막상 [metatags.io](https://metatags.io/)와 [heymeta.com](https://www.heymeta.com/)으로 테스트를 해보니 제대로 미리보기가 보이지 않아서 헤매던 차 [구글봇이 react helmet의 meta tag를 제대로 파악하지 못한다는 이슈](https://github.com/nfl/react-helmet/issues/377)와 [react-helmet의 동작 방식](https://jeonghwan-kim.github.io/dev/2020/08/15/react-helmet.html) 글을 보고 `gatsby-plugin-react-helmet`을 추가해주어 무사히 원하던 결과를 얻을 수 있었습니다.

## 다음 기능

사실 스리슬쩍 이전 블로그 포스트의 마이그레이션도 끝내둔 상태입니다. [예전 블로그 글 링크](https://winterj.me/floating-point-in-python/)로 들어가면 [이 블로그의 글](https://blog.winterjung.dev/2020/01/06/floating-point-in-python)로 301코드<sub>Moved Permanently</sub>와 함께 리다이렉트됩니다.

다음으론 다크 모드를 지원하는 작업을 가볍게 해볼까 하고, 생각보다 코드 태그(`<pre>`, `<code>`)를 구분하기 어려워 syntax highlight까진 아니지만 간단한 스타일을 적용시켜주려 합니다.
