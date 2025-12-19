---
title: python script.py에서 벗어나기
date: 2018-06-30
---

파이썬을 이용해 커맨드라인 툴을 만들어 사용할 때 매번 `$ python script.py arg1 arg2`처럼 입력하기 번거롭다. 그렇다고 `setup.py`를 만들어 엔트리포인트를 설정하자니 일을 키우는 느낌이다. 이 글에서는 `$ script arg1 arg2`처럼 파이썬으로 작성한 스크립트를 간단하게 실행하는 방법에 대해 정리했다.

> 이 포스트는 리눅스/맥 OS 기준으로 작성되었다.

## 작은 커맨드라인 툴

파이썬으로 커맨드라인 툴을 만든다면 간단하게는 `sys.argv`, 혹은 [argparse](https://docs.python.org/3/library/argparse.html)를 사용하거나 더 현대적으로 [click](http://click.pocoo.org/6/)을 사용하곤 한다. 이 글에서는 어떻게 커맨드라인 툴을 만드냐가 아닌 만든 툴을 어떻게 쉽게 실행시키냐가 목적이므로 `sys.argv`를 사용해 아래와 같은 스크립트를 만들었다.

```python
# add.py
import sys

x = int(sys.argv[1])
y = int(sys.argv[2])
print(f'{x} + {y} = {x + y}')
```

이렇게 만든 스크립트는 다음과 같이 동작한다.

```bash
$ python add.py 1 2
1 + 2 = 3
```

이제 이 번거로운 13글자의 `python add.py`라는 명령어를 바꿔보자.

## 개선시키기

### 실행 권한 부여

```bash
$ chmod +x add.py
$ ls -alh | grep add.py
-rwxr-xr-x    1 WinterJ  staff    85B  6 30 15:19 add.py
```

`add.py`가 실행가능하게 됐지만 바로 실행하면 에러가 발생한다.

```bash
$ ./add.py 1 2
./add.py: line 3: syntax error near unexpected token `('
./add.py: line 3: `x = int(sys.argv[1])'
```

이는 쉘이 `add.py`를 파이썬 스크립트임을 알지 못하고 기본적인 `/bin/sh`로 실행시켰기 때문이다.

### 셔뱅 추가

`add.py` 첫 줄에 [셔뱅](https://ko.wikipedia.org/wiki/셔뱅)을 추가하자. 파이썬 인터프리터가 설치된 위치는 환경에 따라 다르기때문에 `/bin/python3.6`처럼 적지 않고 다음과 같이 PATH 환경 변수에 등록된 파이썬 실행 경로를 참조했다.

```python
#!/usr/bin/env python
import sys

# ...
```

이제 다시 실행해보면 파이썬 인터프리터로 실행된 결과가 출력된다.

```bash
$ ./add.py 1 2
1 + 2 = 3
```

### 확장자 제거

이젠 쉘에서 `add.py`를 실행시킬 때 셔뱅을 통해 파이썬 인터프리터를 사용해야함을 명시해줬으므로 굳이 `.py` 확장자가 필요없다.

```bash
$ mv add.py add
$ ./add 1 2
1 + 2 = 3
```

이 정도로도 충분히 만족하며 사용할 수 있으나 해당 폴더가 아니라면 실행되지 않는 번거로움이 여전히 존재한다.

### bin에 넣기

이렇게 만든 `./add`를 바로 `/usr/local/bin`이나 `/usr/bin`에 넣으면 기존 PATH에 등록되어있기 때문에 손쉽게 끝낼 수 있다. 다만 이런 방식은 같은 이름을 가진 명령어가 이미 존재해 충돌을 발생시킬 수 있고, 나중에 스크립트를 수정하거나 삭제할 시 어떤게 내 스크립트였고 지우면 안되는건지 되는건지 헷갈려 관리가 어려워질 수 있다. 여기선 홈 경로에 bin 폴더를 생성시키고 PATH 환경 변수에 커스텀 경로를 추가시켜주었다.

```bash
$ mkdir ~/bin
$ cp add ~/bin
$ export PATH=$PATH":$HOME/bin"
```

다만 export한 환경변수는 해당 세션에만 유효하므로 터미널을 껐다 키거나 로그인할 때 마다 다시 설정해줘야한다. 이를 방지하기 위해서 적절한 위치에 export 명령어를 추가시켜주면 된다. 만약 zsh를 사용한다면 `~/.zshrc`에 추가시키자.

```bash
$ echo 'export PATH=$PATH":$HOME/bin"' >> ~/.zshrc
```

이제 드디어 완벽한 커맨드라인 툴이 됐다. `python add.py` 13글자에서 시작해 `add` 3글자 까지 줄였고 그럴듯한 나만의 스크립트를 사용할 수 있게됐다. 🎉

```bash
$ add 1 2
1 + 2 = 3
```

## 참고 자료

- [How Do I Make My Own Command-Line Commands Using Python?](https://dbader.org/blog/how-to-make-command-line-commands-with-python)
- [How can I make a program executable from everywhere](https://unix.stackexchange.com/questions/3809/how-can-i-make-a-program-executable-from-everywhere)
