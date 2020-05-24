---
title: Pyinstaller로 PyQt5코드를 exe로 만들기
---

원래 쓰려던 것은 `pyinstaller`로 `requests`라이브러리가 포함된 코드를 빌드할 때 발생하는 에러와 그에 관한 해결 방법을 포스팅하려 했으나, 이는 뒤로 넘기고 먼저 `pyinstaller`를 통해 `PyQt5`라이브러리를 사용한 python코드를 윈도우 exe파일로 만드는 법을 적고자 한다.

> 참고로 아래 방법을 통해 윈도우8.1과 윈도우10에서 동작하는 exe는 만들 수 있었으나, 윈도우7에서는 오류가 났고 macOS에서도 동작하지 않았다.


```shell
> pip install pyinstaller
> pyinstaller --version
3.2.1
> pyinstaller main.py
```
2017년 2월 24일 기준으로 `3.2.1버전`의 `pyinstaller`를 설치할 수 있다.  
`pyinstaller main.py`를 하면 `main.py`가 실행되는 exe파일이 `dist`폴더 아래에 생성된다.

pyinstaller의 옵션은 다양하지만 보통 쓰이는 옵션은 몇 개 안된다.
- `-F`, `--onefile`: 최종 출력으로 exe파일 하나만 생성한다.
- `-w`, `--windowed`: 콘솔 창이 출력되지 않게한다.
- `-i`, `--icon`: exe파일의 아이콘을 지정한다.

더 자세한 설명과 옵션들은 아래의 이미지 참고.  
![options](https://winterj.me/images/20170223/option.png)

---
더불어 PyQt5를 빌드하기 위해서는 PyQt5의 bin폴더를 환경변수에 추가해줘야한다.  
보통은 PyQt를 설치할 때 자동으로 추가되나 만약 추가되지 않은경우 `lib not found`같은 에러와 함께 PyQt의 여러 dll들을 찾지 못한다는 에러가 난다.  
추가해야 하는 경로의 예시는 `C:\Python35\Lib\site-packages\PyQt5\Qt\bin`이다.

> 당연히 위의 경로는 하나의 예시일 뿐이므로 그대로 갖다 붙이지말자.

---
윈도우 10에서는 `WARNING: lib not found: api-ms-win-core-*.dll`같은 에러가 출력되는데 이를 해결하기 위해 아래의 페이지를 참고하자.
- [마이크로소프트 SDK파일 다운로드](https://blogs.msdn.microsoft.com/vcblog/2015/03/03/introducing-the-universal-crt/)
- [pyinstaller 깃허브 이슈페이지](https://github.com/pyinstaller/pyinstaller/issues/1566)

github issue페이지에서 이 답변이 제일 도움이 되었다.

---
The following solved the problem for me (on Win10 v1607 - PyQt5 App):  

Add the directory of the required dlls to system Path.  
My application uses PyQt5 which is dependent on api-ms-win dlls.  

For PyQt5 add this directory: `%WHERE EVER YOU INSTALLED PYTHON%\Lib\site-packages\PyQt5\Qt\bin`

For api-ms-win dlls you need Visual Studio 2015 OR Windows SDK (download here):  
Directory if you have Visual Studio:  
`C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\IDE\Remote Debugger\x64`  
Directory if you have Windows SDK:  
`C:\Program Files (x86)\Windows Kits\10\Redist\ucrt\DLLs\x64`  

After you add the required paths, pyinstaller can find the files.

---
하여튼 나는 PyQt5의 bin폴더와 저 `api-ms-win-core-*.dll`을 한 폴더에 몰아주고 `-p` 옵션으로 폴더를 인식시키고 아래의 명령어를 실행하여 윈도우8.1과 윈도우10에서 동작하는 exe파일을 얻을 수 있었다.  
`pyinstaller --onefile --windowed --icon=heart.ico --clean -p C:\test main.py`  


다음 포스팅으로 쓸 내용을 그냥 써보자면  
`pyinstaller 3.2버전`과 `requests 2.13버전`을 썼을 때 `urllib3`과 `queue`의 `import error`가 나는 문제는 그냥 `requests`라이브러리 버전을 `2.5`로 낮춰 해결했다.


> 참고 블로그 : [PYINSTALLER EXE 파일 빌드하며 짜증났던 부분 정리](http://slays.tistory.com/42)
