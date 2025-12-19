---
title: 파이썬의 await vs return vs return await
---

예전에 담아둔 마음함을 정리하다가 [JS에서 `await`, `return`, `return await`의 결과를 비교하는 글](https://jakearchibald.com/2017/await-vs-return-vs-return-await/)을 봤다. 헷갈려 잘못 사용할 수 있는 비동기 함수를 사례별로 구분해 보여주는 좋은 글이었는데 JS에서는 파이썬과 달리 await를 하지 않아도 함수가 실행되는게 당황스러웠다. 언어에 따라 같은 비동기 개념이라도 구현, 사용 방법이 다르구나 느끼면서 파이썬에서는 각각의 경우가 어떻게 동작하는지 정리하고자 한다.

## 재료 준비

다음과 같이 반반의 확률로 `'통과!'` 혹은 에러를 발생하는 함수를 준비했다. 더불어 파이썬에서는 async함수를 REPL에서 await할 수 없고 이벤트 루프를 통해 실행시켜야 하는데 이를 미리 준비해두겠다.

> 파이썬 3.5 이상에서 작동하는 예제로 3.4에서 실행시키기 위해선 `async`, `await` 키워드를 각각 `@asyncio.coroutine`, `yield from`으로 바꿔줘야한다.

```python
import asyncio
from random import random

async def toss():
    await asyncio.sleep(1)
    if random() > 0.5:
        raise Exception('에러!')
    return '통과!'

loop = asyncio.get_event_loop()
```

## 1. 단순 호출

```python
async def call():
    try:
        toss()
    except:
        return '잡았다!'

loop.run_until_complete(call())
# 바로
# RuntimeWarning: coroutine 'toss' was never awaited
# None
```

`toss` 함수를 단순하게 호출하면 런타임경고와 함께 1초의 기다림도 없이 바로 `None`이 반환된다. `toss` 함수를 호출하는 순간 파이썬에서는 코루틴 객체를 반환하는데, 이 때는 함수 내부 코드가 실행되지 않는다. 그렇기에 딜레이없이 try 구문을 아무 문제없이 통과하고 명시적인 return 구문이 없어 암묵적으로 `None`이 반환되었다.

또한 `call` 함수는 내부에 await구문이 없으므로 단순 def로 선언해도 되며, 이 땐 런타임경고 없이 항상 `None`이 반환된다.

## 2. await

```python
async def call():
    try:
        await toss()
    except:
        return '잡았다!'

loop.run_until_complete(call())
# 1초 후
# None or '잡았다!'
```

`toss` 함수를 await 구문과 함께 호출하면, 항상 1초를 기다린 후에 반반의 확률로 `None` 혹은 `'잡았다!'` 라는 결과를 얻게된다. await 구문을 사용하면 키워드 그대로 async 함수의 결과를 기다린다. 그러면서 `toss` 내부 코드가 실행되는데 먼저 1초를 기다린다. 만약 앞 선 경우처럼 `await`가 없다면 `asyncio.sleep(1)`은 단순히 코루틴만 반환한채 기다림없이 바로 다음 구문이 실행 된다. 이제 반반의 확률로 `'통과!'`가 반환되거나 `Exception('에러!')`가 발생한다.

1. `'통과!'` 반환: 문제 없이 값이 반환되었으나 `call` 함수에선 이를 받아주지 않는다. 그렇기에 앞에서 처럼 암묵적인 `None`이 반환된다.
2. `Exception('에러!')` 발생: 발생한 에러가 상위 스택으로 전파된다. 이를 `call` 내부에서 except로 받아주기 때문에 `잡았다!`가 반환된다.

> 예전엔 async/await 개념을 몰라서 "그냥 `time.sleep(1)`하면 되는거 아닌가? 어차피 1초 기다리는건 똑같은데" 처럼 생각했었다. async/await를 사용하면 `await asyncio.sleep(1)` 구문에서 다른 코루틴으로 스위칭이 발생하므로 `asyncio.gather(call(), call())`처럼 `call`함수를 여러번 실행하면 1초 후 결과 하나, 다시 1초 후 결과 하나 이런식이 아니라 1초 후에 결과 두 개를 받아볼 수 있다.

## 3. return

```python
async def call():
    try:
        return toss()
    except:
        return '잡았다!'

loop.run_until_complete(call())
# 바로
# <coroutine object toss at 0x10964b518>
```

`toss` 함수를 await 없이 리턴하면 `toss()`의 결과인 코루틴 객체가 바로 반환된다. **JS와는 다르게** `toss` 함수 내부 코드가 실행되지 않으므로 1초의 기다림없이 에러도 발생하지 않고 언제나 코루틴 객체가 바로 반환된다.

## 4. return await

```python
async def call():
    try:
        return await toss()
    except:
        return '잡았다!'

loop.run_until_complete(call())
# 1초 후
# '통과!' or '잡았다!'
```

`toss` 함수를 await한 후 리턴하면 1초를 기다린 후 정상적으로 실행된 결과인 `'통과!'`가 반환되거나 에러가 발생하고 이를 예외로 돌려 `'잡았다!'`가 반환된다. async 함수를 await 했으므로 2번 처럼 진행되는데, 이번엔 `call` 함수에서 `toss` 함수가 반환한 결과를 그대로 반환하므로 `None`이 반환되지 않는다. 참고로 `return await toss()` 구문은 다음과 같이 두 줄로 구분해 쓸 수 있다.

```python
async def call():
    try:
        result = await toss()
        return result
    except:
        return '잡았다!'
```

## 결론

async 함수를 사용할 땐 await를 어디선가 빼먹지 않았는지 신경쓰고, JS와는 동작이 다름에 주의하자. 항상 드는 생각인데 `loop.run_until_complete`의 shortcut이 생기거나 네이티브 REPL에서 await를 할 수 있으면 좋겠다.

> [`aioconsole`](https://github.com/vxgmichel/aioconsole), [`aiomonitor`](https://github.com/aio-libs/aiomonitor) 라이브러리를 설치하면 확장 REPL에서 await 구문을 사용할 수 있다.
