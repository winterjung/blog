---
title: 파이썬으로 Reactivity 따라하기
---

JavaScript의 Vue, React 등에서 쓰이는 Reactivity 개념을 간단하게 구현해보는 [The Best Explanation of JavaScript Reactivity 🎆](https://medium.com/vue-mastery/the-best-explanation-of-javascript-reactivity-fea6112dd80d)라는 게시글을 보고 파이썬으로 따라 구현해봤다.

<figure>
  <a href="https://cdn-images-1.medium.com/max/800/1*t8enMn6h0gjY6HNKoSVC1g.jpeg">
    <img src="https://cdn-images-1.medium.com/max/800/1*t8enMn6h0gjY6HNKoSVC1g.jpeg" alt="Vue updates">
  </a>
</figure>

## JavaScript

아래 코드사진은 원문에서 가져왔다. `target` 전역변수를 사용하고 `Object.defineProerty`로 등록된 `Dep`과 `watcher` 함수를 이용해 값 변동을 추적하고 등록된 함수를 실행한다.

<figure>
  <a href="https://cdn-images-1.medium.com/max/800/1*bM-LGqWYYU3lCaazJ7cAew.png">
    <img src="https://cdn-images-1.medium.com/max/800/1*bM-LGqWYYU3lCaazJ7cAew.png" alt="JavaScript code">
  </a>
</figure>

## Python

JavaScript 코드에 가깝게 파이썬 코드를 작성했다. 다만 `Object.defineProperty`에 대응되는 기능을 구현하기 위해 임의로 `Data` 클래스에 `__setattr__`, `__getattribute__`를 구현하다보니 코드가 장황해졌다. data를 dict로 만들고 `__getitem__`, `__setitem__`을 오버라이딩 하는 방법도 고려했으나 `data['price']`가 아닌 `data.price` 문법을 유지하고 싶어 클래스로 선언했다.

원문 코드에선 data의 프로퍼티를 순회하면서 `dep`을 만들어 주었는데 파이썬 코드에선 이를위해 `deps` 변수를 활용했다.

```python
# main.py
class Dep:
    def __init__(self):
        self.subscribers = []

    def depend(self):
        if target and target not in self.subscribers:
            self.subscribers.append(target)

    def notify(self):
        for sub in self.subscribers:
            sub()


class Data:
    def __init__(self, *args, **kwargs):
        for name in kwargs:
            setattr(self, name, kwargs[name])

    def __setattr__(self, name, value):
        if name not in deps:
            deps[name] = Dep()
        result = super().__setattr__(name, value)
        deps[name].notify()
        return result

    def __getattribute__(self, name):
        deps[name].depend()
        value = super().__getattribute__(name)
        return value


deps = {}
data = Data(price=5, quantity=2)
target = None


def watcher(func):
    global target
    target = func
    target()
    target = None


def total_func():
    data.total = data.price * data.quantity


def sale_price_func():
    data.sale_price = data.price * 0.9


watcher(total_func)
watcher(sale_price_func)


def print_data():
    attrs = ('sale_price', 'price', 'quantity', 'total')
    s = (f'{attr}: {getattr(data, attr)}' for attr in attrs)
    print(', '.join(s))


if __name__ == '__main__':
    print_data()
    data.price = 20
    print_data()
    data.quantity = 3
    print_data()
```

위의 코드를 실행하면 다음과 같은 결과를 확인할 수 있다.

```bash
$ python main.py
sale_price: 4.5, price: 5, quantity: 2, total: 10
sale_price: 18.0, price: 20, quantity: 2, total: 40
sale_price: 18.0, price: 20, quantity: 3, total: 60
```

## 마무리

전역 변수를 활용한다는게 썩 마음에 들진 않는다. 파이썬의 Lambda 함수에선 대입문을 사용할 수 없다보니 Arrow function을 사용한 JavaScript 처럼 깔끔한 코드가 나오지도 않았다. 다만 callback 함수를 어떻게 등록하고 어떤 원리를 통해 자동으로 업데이트 되는지 알아보기엔 적당한 코드였다.
