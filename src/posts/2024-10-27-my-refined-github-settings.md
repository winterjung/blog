---
title: 슬기로운 깃헙 생활을 위한 refined github 세팅
image: //images/20241027/refined-github.png
---

GitHub에서 코드 작업과 리뷰를 하다보면 사소하지만 불편한 부분들이 있다. 깃헙팀에서도 이런 불편함을 개선하기 위해 <kbd>⌘</kbd> + <kbd>k</kbd>로 이용 가능한 [command palette 기능](https://docs.github.com/en/get-started/accessibility/github-command-palette)이나 [코드 트리](https://github.blog/news-insights/product-news/github-code-search-is-generally-available/)와 [심볼을 사이드바로 볼 수 있게 하는 패치](https://docs.github.com/ko/repositories/working-with-files/using-files/navigating-code-on-github) 등 예전엔 브라우저 확장을 이용해야만 가능했던 기능을 꾸준히 도입하고 있다. 그럼에도 아쉬움으로 남아있는 부분들은 존재하고 이를 위해 여러 플러그인이 있는데, 그 중 [refined-github](https://github.com/refined-github/refined-github) 브라우저 확장을 몇 년째 애용하고 있다. 이 글에서는 내가 코드를 생산하고, 이슈를 탐색하며, 다른 동료의 코드를 리뷰할 때 인지부하를 줄이고 깃헙 생활을 더 쉽고 유용하게 만들어주는 refined github 세팅을 공유하려한다.

## 들어가기 전
깃헙 브라우저 확장은 그 특성상 깃헙 사이트의 사소한 변경에도 큰 영향을 받는데 refined github은 메인테이너의 대응이 매우 빠르고 다른 기여자들 또한 활발히 활동하고 있어 대부분은 빠르게 고쳐진다. 또 이 글에서 다룬 기능들은 언제나 사라지거나 잠시 비활성화 상태일 수 있으니 그럴 땐 [릴리즈 탭](https://github.com/refined-github/refined-github/releases)이나 [이슈 페이지](https://github.com/refined-github/refined-github/issues)를 참고하자.

![](/images/20241027/image%2018.png)
다른 기능들은 브라우저 확장의 옵션 페이지에서 확인 가능하다. 일단 모두 비활성화하고 본인에게 필요한 기능인지 스크린샷을 참고하며 활성화하길 권장한다. (전체 토글은 아래 debugging 섹션에서 toggle all features 버튼으로 가능하다) 예시는 [크롬 refined-github 옵션 페이지](chrome-extension://hlepfoohegkhhmjieoechaddaejaokhf/assets/options.html)

## 좋아하는 옵션
가능한 한 a-z 이름으로 소개했다.

### [action-pr-link](https://github.com/refined-github/refined-github/blob/319c40054dc15d02864de7ae5961f185de1ec40d/source/features/action-pr-link.tsx)
> Adds a link back to the PR that ran the workflow.
![](/images/20241027/image%203.png)
사소하지만 유용하다. 코드 작업을 하다보면 내 pr에 올린 커밋의 actions run 결과를 상세하게 보는 일이 많은데 다 보고나서 다시 pr로 돌아갈 때 편하다. 원랜 아래처럼 actions 리스트로 이동한다.
![](/images/20241027/image%2019.png)

### [clean-conversation-sidebar](https://github.com/refined-github/refined-github/blob/319c40054dc15d02864de7ae5961f185de1ec40d/source/features/clean-conversation-sidebar.tsx)
> Hides empty sections (or just their "empty" label) in the issue/PR sidebar.

![](/images/20241027/image%204.png)
pr 리뷰할 때 인지 부하를 줄여줘서 좋았다.

### [clean-readme-url](https://github.com/refined-github/refined-github/blob/319c40054dc15d02864de7ae5961f185de1ec40d/source/features/clean-readme-url.tsx)
> Drops redundant "readme-ov-file" parameter from repo URLs.
![](/images/20241027/image%205.png)
리드미에 있는 `## Installation`, `## Usage` 등의 헤더 앵커 링크를 복사할 때 붙는 `tab=readme-ov-file` 쿼리 파라미터를 없애준다. 매우 만족. [discussion](https://github.com/orgs/community/discussions/70577)을 보니 다른 사람들도 불편해하는데 방치된 이슈로 보인다.

### [collapsible-content-button](https://github.com/refined-github/refined-github/blob/main/source/features/collapsible-content-button.tsx)
> Adds a button to insert collapsible content (via `<details>`).
![](/images/20241027/image%207.png)
`details` 태그로 노션의 토글버튼처럼 내용을 접어둘 수 있는데 개인적으로 아래처럼 이슈나 pr에서 자주 쓰는 기능이다. 이를 원 버튼 클릭으로 만들어줘 편하다.
![](/images/20241027/image%2020.png)
### [copy-on-y](https://github.com/refined-github/refined-github/blob/319c40054dc15d02864de7ae5961f185de1ec40d/source/features/copy-on-y.tsx)
> Enhances the <kbd>y</kbd> hotkey to also copy the permalink.
![](/images/20241027/image%2021.png)
파일이나 코드의 특정 라인을 공유할 땐 단순히 master, main으로 공유하면 나중에 시간이 흘렀을 때 해당 파일이 없어진 경우도 있고 라인이 틀어져 원래 무엇을 의도했는지 모르기에 permalink로 공유해주는게 좋다. 깃헙에서도 이를 위해 <kbd>y</kbd>를 누르면 permalink를 url로 띄워주는데 이 기능은 클립보드에 복사까지 해줘서 좋다.
다만 깃헙도 그렇듯 한글 입력상태에서 누르면 <kbd>y</kbd>가 아니라 <kbd>ㅛ</kbd>로 인식돼 동작하지 않는다.

### [dim-bots](https://github.com/refined-github/refined-github/blob/319c40054dc15d02864de7ae5961f185de1ec40d/source/features/dim-bots.tsx)
> Dims commits and PRs by bots to reduce noise.
![](/images/20241027/image%208.png)
고맙지만 때때로 성가신 dependabot의 pr들을 흐린 눈으로 볼 수 있게 해준다.

### [expand-all-hidden-comments](https://github.com/refined-github/refined-github/blob/319c40054dc15d02864de7ae5961f185de1ec40d/source/features/expand-all-hidden-comments.tsx)
> On long conversations where GitHub hides comments under a "N hidden items. Load more...", alt-clicking it will load up to 200 comments at once instead of 60.
![](/images/20241027/image%2022.png)
설명은 200개만 불러온다 하는데 사실 다 펼쳐준다. 묵은 이슈를 볼 때 코멘트가 많곤한데 유용하고 좋아요 많이받은건 꼭 collapsed에 있기 마련이라 종종 유용하다.

### [hide-low-quality-comments](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/hide-low-quality-comments.tsx)
> Hides reaction comments ("+1", "👍", …) (except the maintainers’) but they can still be shown.
이슈를 볼 때 굳이 안봐도 되는 코멘트를 가려줘서 좋다.

### [highest-rated-comment](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/highest-rated-comment.tsx)
> Highlights the most useful comment in issues.
![](/images/20241027/image%209.png)
이슈에서 유용하거나 인기많은 댓글을 하이라이트해주는데 workaround 적용이나 솔루션에 빠르게 접근할 수 있어 유용했다. 다만 코멘트가 너무 많아 가려져있고 load more 버튼으로 페이지네이션해야할 때 그 안에 가려진 코멘트까지 고려해서 하이라이트해주진 않는다. 최근엔 llm에게 물어보는 습관으로 유용성이 예전보단 덜해진 느낌도 있다.

### [new-or-deleted-file](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/new-or-deleted-file.tsx)
> Indicates with an icon whether files in commits and PRs are being added or removed.
![](/images/20241027/image%2010.png)
리뷰하다보면 이게 아예 새롭게 추가된 파일인건지 그냥 많은 줄이 추가된건지 다 봐야만 아는 경우가 있는데 이를 심볼을 추가해 좀 더 인지하기 편하게 해준다.

### [one-click-pr-or-gist](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/one-click-pr-or-gist.tsx)
> Lets you create draft PRs and public gists in one click.
![](/images/20241027/image%2011.png)
나는 pr 올릴 때 draft로 올리고 file changes를 셀프 리뷰해보며 리뷰어를 위한 코멘트를 달거나 잘못된게 없는지 다시 짚어본 뒤 ready for review로 오픈하곤 한다. 이 때 사소하게 편하게 pr을 열 수 있다. 최근엔 이전에 사용했던 옵션을 기억해 자동으로 띄워주는듯 하지만 그래도 여전히 편하다.

### [one-click-review-submission](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/one-click-review-submission.tsx)
> Simplifies the PR review form: Approve or reject reviews faster with one-click review-type buttons.
![](/images/20241027/image%2012.png)
종종 레이아웃이 깨지거나 핫픽스하느라 옵션이 비활성화 되는 경우가 있는데 그래도 refined github에서 제일 좋아하는 기능이다. 전 직장에선 리뷰를 1만개 넘게 할 정도로 리뷰를 많이 하는데 저 조그마한 라디오 버튼을 일일이 클릭해 바꿀 필요가 없이 한 번에 리뷰를 마칠 수 있어 매우 편했다.

### [open-all-notifications](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/open-all-notifications.tsx)
> Adds a button to open all your unread notifications at once.
![](/images/20241027/image%2013.png)
위에서 말한 원클릭 리뷰 다음으로 좋아하는 기능이다. 회사에서 동료들과 일하다 보면 코드 리뷰하거나 단순 watching하는 이슈나 pr이 많아지는데 일일이 열어 보는 것도 일이었다. 이 기능 덕분에 아침에 출근하고 혹은 퇴근 전에 inbox 비우는 느낌으로 스트레스 없이 리뷰할 수 있었다.

### [show-whitespace](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/show-whitespace.tsx)
> Makes whitespace characters visible.
![](/images/20241027/image.png)
은근 꿀기능. 언어에 따라 탭과 스페이스를 혼용하면 에러나는 경우도 있는데 이를 방지할 수도 있다. 굳이 그런 경우가 아니더라도 readme에 코드 예시를 적을 때 golang처럼 탭을 쓰는 코드를 쓰다보면 스페이스가 섞여 들어가서 보기 어려워지곤 하는데 이를 잡아낼 수 있다.

> python 같은 경우 혼용하면 에러가 난다.
```py
>>> def hello():
    print("4 spaces")
	print("1 tab")
  File "<stdin>", line 3
    print("1 tab")
TabError: inconsistent use of tabs and spaces in indentation
```

### [status-subscription](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/status-subscription.tsx)
> Lets you subscribe to opening/closing events of issues in one click.
![](/images/20241027/image%2016.png)<!-- {"width":319} -->
리뷰를 하면 해당 pr에 author가 커밋을 하거나 내가 단 코멘트에 reply를 달 때 마다 알림이 온다. 리뷰할 게 적을 땐 괜찮은데 많아지다보면 (특히 위의 open all notifications 기능이랑 같이 쓰다 보면) 아직 볼 게 없는데도 pr이 열리고 이를 인지해야하는 경우가 잦았다. 이를 위해 리뷰 요청이 다시 오거나, 머지가 됐거나 등 유의미한 상태 변화가 있을 때만 알림을 받고자 해당 pr의 알림 설정을 바꾸곤 하는데 이 때 1 depth 편해진다.

### [useful-not-found-page](https://github.com/refined-github/refined-github/blob/8fb3e4383f420d088be45cedc3f5572f3d2bfe4d/source/features/useful-not-found-page.tsx)
> Adds possible related pages and alternatives on 404 pages.
![](/images/20241027/image%202.png)
브랜치가 없어진건지 파일이 없어진건지 레포가 없는건지 인지하기 편해진다.

## 꼭 끄는거
좋아하는 기능이 있다면 반대로 정신 사나워지고 괜히 인지 비용만 드는 기능도 있다.

### ci-link
![](/images/20241027/image%206.png)
레포의 최신 커밋 actions 상태를 이름 옆에다 달아주는데 어느 페이지를 가나 보여서 정신사나웠다.

### conventional-commits
![](/images/20241027/image%2017.png)
최근에 추가된 기능으로 [conventional commit](https://www.conventionalcommits.org/ko/v1.0.0/)에 맞게 작성된 커밋 메시지는 앞에 카테고리를 달아준다. 커밋 앞에 알록달록한게 정신사납기도 하고 커밋 컨벤션이라는게 아무리 `feat: `, `fix: ` prefix로 맞추려해도 회사마다 팀마다 docs, chore, hotfix 등으로 달라지기 마련이라 저 기능으로 잘 잡히지도 않아서 그냥 끄는게 나았다.

### reactions-avatars
![](/images/20241027/image%2014.png)
제일 싫어하는 기능이다. 굳이 다른 사람들의 아바타를 볼 필요가 없어서 반드시 끈다.

### repo-avatars
![](/images/20241027/image%2015.png)
마찬가지로 레포의 아바타를 굳이 볼 필요가 없어서 끈다.

## 그 외 도움 되는 브라우저 확장
refined github은 아니지만 프로젝트의 코드를 트리로 보고 싶을 때 정식 기능이 있음에도 아쉬운 점이 있어 [octotree](https://www.octotree.io/)(부분 유료)나 [gitako](https://github.com/EnixCoda/Gitako)(무료)를 써보길 추천한다. 레포 뿐만 아니라 pr에서 어떤 파일이 변했는지 한 눈에 보여주는 점이 좋다. 깃헙에서도 해당 기능을 빌트인으로 제공해주긴하나 사용 경험이 묘하게 좋진 않았다.

## 끝으로
이렇게 아주 개인적인 취향의 refined github 기능을 정리해봤는데 이 외에도 개인에 따라 충분히 유용하다고 느낄만한 기능이 많으니 한 번 옵션 페이지에서 각 기능들의 설명과 스크린샷을 보며 커스터마이징 해보길 추천한다.
