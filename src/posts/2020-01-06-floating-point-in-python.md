---
title: 파이썬에서 부동소수점 오차 해결하기
image: images/floating-point-in-python.png
---

실수형 값을 다룰 때 흔히 마주칠 수 있는 부동소수점 오차 문제를 파이썬에서 어떻게 해결할 수 있는지 알아보았다.

> 이 글은 [2017년에 작성했던 글](https://github.com/JungWinter/JungWinter.github.io/blob/496e1b8e4563cd32c291cde1f1db62684d6db7dd/_posts/2017-1-12-Floating-Point.md)을 다듬고 내용을 추가해 다시 작성한 글입니다. 본래 글은 이 문서로 리다이렉트됩니다.

## 부동소수점의 문제

`float` 자료형을 쓸 때는 항상 주의해야 한다. 특히 `if` 문으로 값을 확인할 때 이를 간과하면 아래처럼 찾기 힘든 버그가 발생한다.

```python
>>> 0.1 * 3 == 0.3
False
>>> 1.2 - 0.1 == 1.1
False
>>> 0.1 * 0.1 == 0.01
False
```

그동안 위와 같은 일이 발생해도 그저 '부동소수점 때문에 그래' 정도로만 알고 있었는데 그 이유를 좀 더 자세히 알아보고 파이썬에서 어떻게 해결할 수 있는지 알아보았다.

> `부동소수점`에 대한 설명은 다른 자료들에서 잘 다루고 있으니 여기선 [위키피디아 문서](https://ko.wikipedia.org/wiki/부동소수점)로 대체한다.

## 부동소수점의 표현 방식

컴퓨터에서 부동소수점 숫자들은 2진 분수로 표현되기에 꽤 많은 값은 정확히 표현될 수 없다. 그렇기에 사람이 이해하기 쉽게 입력하는 10진 부동소수점 숫자는 2진 부동소수점 숫자로 근사 된다. 예를 들어 10진수 0.1은 2진 분수로 정확하게 표현될 수 없고 `0.0001100110011001100110...`처럼 무한히 반복되기에 특정 비트에서 멈추고 근사값을 얻는다. 0.1의 경우는 `3602879701896397 / 2 ** 55`이며 0.1에 가깝지만, 정확히 동일하지는 않다.

```python
>>> decimal.Decimal(3602879701896397 / 2 ** 55)
Decimal('0.1000000000000000055511151231257827021181583404541015625')
>>> decimal.Decimal(0.1)
Decimal('0.1000000000000000055511151231257827021181583404541015625')
```

다만 이를 곧이곧대로 길게 표현한다면 꽤 많은 상황에서 성가실 것이기에 파이썬에선 이런 부동소수점 값을 표현할 때 정확히 표현하지 않고 10진수 근삿값만을 표시한다.

```python
>>> 0.1
0.1000000000000000055511151231257827021181583404541015625
```

0.1에 대해 실제 십진수 값을 출력한다면 위와 같겠지만 파이썬에선 반올림된 값을 표시한다.

```python
>>> 1 / 10
0.1
```

이런 부동소수점의 한계는 파이썬뿐만 아니라 부동소수점을 지원하는 거의 모든 언어에서 찾아볼 수 있다.

> 각 언어의 부동소수점 처리 방식을 볼 수 있는 [0.30000000000000004.com](https://0.30000000000000004.com/)이란 사이트도 있다.

## 해결책

`decimal.Decimal`, `math.fsum()`, `round()`, `float.as_integer_ratio()`, `math.is_close()` 함수 혹은 다른 방법을 통해서 실수를 방지할 수 있다. 이 중 가장 추천하는 방법은 `decimal` 표준 라이브러리를 사용한 방법이고 그 외에도 존재하는 관련 함수들을 소개한다.

### `decimal.Decimal`

```py
>>> import decimal
>>> decimal.Decimal('0.1') * 3 == decimal.Decimal('0.3')
True
>>> decimal.Decimal('0.3') + 2
Decimal('2.3')
```

[`decimal` 모듈](https://docs.python.org/3/library/decimal.html)을 사용하면 위 문제를 가장 깔끔하게 해결할 수 있다. 파이썬 문서에서도 언급하듯 빠르고 정확한 부동 소수 산술을 지원하며 `float` 자료형을 그대로 사용할 때 보다 여러 이점이 있다고 말한다.

다만 아래와 같이 사용한다면 여전히 문제가 발생하고 이를 처리하는 건 `decimal` 모듈의 책임이 아니기에 사용에 주의해야 한다.

```py
>>> decimal.Decimal(0.1 * 3)
Decimal('0.3000000000000000444089209850062616169452667236328125')
```

### `math.fsum()`

[`math` 모듈의 `fsum()` 함수](https://docs.python.org/3/library/math.html#math.fsum)를 이용해 두 개 이상의 부동소수점 합계와 관련된 반올림 오류 누적을 제거하여 정밀도 손실을 방지할 수 있다.

```python
>>> sum([.1] * 10)
0.9999999999999999
>>> math.fsum([.1] * 10)
1.0
```

다만 `fsum()`은 중간중간 누적된 오류를 해결하기 위함이지 정확한 부동소수점 연산을 위한 게 아니다 보니 유명한 `0.1 + 0.2`처럼 항상 원하는 결과를 기대할 수는 없다.

```python
>>> math.fsum([.1, .2])
0.30000000000000004
```

* [스택오버플로우 : 왜 fsum은 부정확한가 ](http://stackoverflow.com/questions/34650535/python2-math-fsum-not-accurate)

### `round()`

빌트인 함수로 있는 `round()`로 반올림해 해결하는 방법도 있다.

```python
>>> round(0.1 + 0.1 + 0.1, 10) == round(0.3, 10)
True
>>> 0.1 + 0.1 + 0.1 == 0.3
False
# 0.1 + 0.1 + 0.1은 0.3과 다르다.
>>> decimal.Decimal(0.1 + 0.1 + 0.1)
Decimal('0.3000000000000000444089209850062616169452667236328125')
>>> decimal.Decimal(0.3)
Decimal('0.299999999999999988897769753748434595763683319091796875')
```

당연하게도 사전 `round()`는 도움이 되지 않는데 `0.1`은 `round(0.1, 1)` 등과 같기에 각각을 반올림하고 더해주는건 아무 의미 없다.

```python
>>> round(0.1, 1) + round(0.1, 1) + round(0.1, 1) == round(0.3, 1)
False
```

#### 반올림 모드

우리는 반올림을 할 때 5부터는 올림으로 그 밑은 내림으로 한다고 알고 있지만 파이썬에선 여러 가지 반올림 모드 옵션을 제공한다. 기본적으로 설정된 모드 상으론 값에 따라 어떤건 0.5더라도 내림이 되기도 하고 올림이 되기도 한다.

```python
>>> round(0.125, 2)
0.12
>>> round(0.135, 2)
0.14
```

이 반올림 모드엔 여러 가지가 있는데 [기본적으로 `ROUND_HALF_EVEN`이라는 모드로 지정](https://docs.python.org/ko/3/library/decimal.html#decimal.DefaultContext)되어 있고 이는 짝수랑 가까워지는 방향으로 동작한다. 현재 적용된 반올림 방식이 무엇인지는 `deciaml.getcontext()`로 확인해 볼 수 있다.

```python
>>> import decimal
>>> decimal.getcontext()
Context(prec=28, rounding=ROUND_HALF_EVEN, Emin=-999999, Emax=999999, ...)
```

- `ROUND_CEILING`
- `ROUND_DOWN`
- `ROUND_FLOOR`
- `ROUND_HALF_DOWN`
- `ROUND_HALF_UP`
- `ROUND_UP`
- `ROUND_05UP`

위와 같이 [8가지 방식](https://docs.python.org/3/library/decimal.html#rounding-modes)이 존재하며 런타임에 이를 아래처럼 변경할 수 있다.

```python
>>> ctx = decimal.getcontext()
>>> ctx.rounding = decimal.ROUND_UP  # 혹은 'ROUND_UP' 문자열도 사용 가능
```

### `float.as_integer_ratio()`

파이썬 `float` 자료형에는 `as_integer_ratio()` 함수가 내장되어 있다.

```python
>>> x = 3.141592
>>> x.as_integer_ratio()
(3537118140137533, 1125899906842624)
>>> x == 3537118140137533 / 1125899906842624
True
```

연산의 오차 보정용이라기 보다는 원래 값을 손실 없이 다시 만드는 데 유용하다.

### `math.is_close()`

파이썬 3.5에서 새로 추가된 `math` 모듈의 함수다. `isclose(a, b, rel_tol=1e-9, abs_tol=0.0)`같은 형태이며 `a`와 `b`는 비교할 값들, `rel_tol`은 relative tolerance, `abs_tol`은 absolute tolerance다. `decimal`을 사용할 만큼 엄격한 상황이 아니라면 위에 나온 방법들보다 제일 간단하고 직관적이다.

다만 파이썬 3.5 이상부터 내장되어 있으며 그보다 하위 버전에서는 직접 `is_close()` 함수를 만들어 사용해야 한다.

```python
# 간단한 버전
def is_close(a, b, rel_tol=1e-09, abs_tol=0.0):
    return abs(a-b) <= max(rel_tol * max(abs(a), abs(b)), abs_tol)
```

* [`math.is_close` 문서](https://docs.python.org/3/library/math.html#math.isclose)
* [PEP 485 - A Function for testing approximate equality](https://www.python.org/dev/peps/pep-0485/)
* [`math.is_close()`의 원형](https://github.com/PythonCHB/close_pep/blob/master/is_close.py)

### 기타

가장 쉽고 널리 사용되는 방법으로는 아마 `abs(a - b) <= 1e-9` 정도가 아닐까 싶다.

## 정리

`float` 자료형을 다룰 땐 항상 부동소수점 오차를 의식해야 한다. 위에서 나온 해결책 말고도 다양한 해결책이 있을 수 있겠지만 일단 회계나 금융의 엄격함이 요구된다면 `decimal` 모듈을 그렇지 않다면 마지막의 짧은 snippet이나 `math.is_close()`, `round()` 정도만 사용해도 크게 문제는 없으리라 생각한다.

## 참고

* [python3 document - Floating Point Arithmetic: Issues and Limitations](https://docs.python.org/3/tutorial/floatingpoint.html)
* [모든 컴퓨터 과학자가 알아야 할 부동 소수점의 모든것](https://app.box.com/s/vlij64akloz25k0fmk24o1fqxdndg8ie)
* [stackoverflow - What is the best way to compare floats for almost-equality in Python?](http://stackoverflow.com/questions/5595425/what-is-the-best-way-to-compare-floats-for-almost-equality-in-python)
* [udemy blog - Python Round: Problems and Solutions](https://blog.udemy.com/python-round)
