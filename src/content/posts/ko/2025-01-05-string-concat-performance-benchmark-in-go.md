---
title: Go 문자열 연결 성능 최적화, 15가지 방법 비교
image: images/20250105/fixed_sec.png
---

Golang을 쓰다 보면 struct의 필드를 이용해 캐시키를 만든다거나, sql 쿼리를 만들거나, 출력을 위한 문자열 포매팅을 할 때 등 종종 문자열을 이어 붙여야 할 때가 있다. 그럴 때마다 `pk := row.ID + "#" + row.Name`처럼 바로 이어버리거나 혹은 `pk := fmt.Sprintf("%s#%s", row.ID, row.Name)` 같이 포매팅 함수를 사용하는 식으로 기존에 관성적으로 썼던 방식을 쓰곤 했다.
사실 막연히 어떤 방법을 써도 그렇게 느리진 않겠지 생각했던 면도 있고, 빈번하게 사용되는 로직이라 성능에 대한 막연한 우려가 있다면 한두 가지 방법 정도만 마이크로 벤치마크로 비교 해보고 빠른 방법을 사용하곤 했다.
그러다 string concat 마저도 줄여야 해 여러 방법을 비교해 볼 필요가 있었고, 그동안의 사용 사례를 생각해 보니 크게 캐시키를 만들 때처럼 **인자 개수가 고정된 상황**과, 쿼리의 조건문이나 저장소에서 가져온 값을 이용하느라 **인자 개수가 변할 수 있는 상황**으로 나눌 수 있었다.
이 글에선 벤치마크를 통해 위 상황마다 여러 방법의 성능과 메모리 사용량을 비교해 봤다.

## 비교해 볼 방법들

경험적으로 사용했거나 혹은 널리 알려진 방법들을 간추려 보니 대략 아래와 같았다.

1. `+` 연산자: 이어 붙일 string이 고정된 개수일 때 종종 사용했다.
2. `+=` 연산자: 그렇게 많이 사용해 본 적은 없는 방법이다.
3. `fmt.Sprintf()`: 어렴풋이 느릴 거란 생각은 있으나 코드 정렬이 이쁘게 되는 경향이 있어 자주 쓰곤 했다.
4. `fmt.Sprint()`: `fmt.Sprintf`의 template interpolation이 느리지 않을까 해 비교군으로 넣었다.
5. `strings.Join()`: 성능을 고려했다기보단 join을 쓰면 코드가 간결해지는 경우가 있어 선호하곤 했다.
6. `bytes.Buffer`: buffer를 만들고 `WriteString`하는 방식이고 라이브러리 내부 구현에서 종종 보인다.
7. `strings.Builder`: 1.10 버전부터 생겨 `bytes.Buffer`를 대체한다고 한다.
    - 위 두 방식은 모두 내부적으로 `.Grow()` 메서드가 있어 pre allocating이 가능하기에 두 경우를 구분해 테스트해 봤다.

참고로 전체 개수를 미리 알 수 있는 경우 `ids := make([]string, len(users))`처럼 len 혹은 cap을 설정해 slice나 map의 크기를 미리 늘려주는 pre allocation을 권장한다.
예전에 작성한 [뱅크샐러드 Go 코딩 컨벤션 – Slice 선언 시 len, cap 설정](https://blog.banksalad.com/tech/go-best-practice-in-banksalad/#slice-선언-시-len-cap-설정) 단락과 [Known length slice initialization speed - Golang Benchmark Wednesday](https://simon-frey.com/blog/known-length-slice-initialization-speed-golang-benchmark-wednesday/) 글을 참고하자.

## ⚡️ 결과만 먼저 보기

1. `.Grow()` 메서드를 사용한 `strings.Builder` 혹은 `strings.Join()` 방법이 모든 상황에서 가장 빠르고 효율적인 방법이다.
2. 인자 개수가 고정된 상황에선 `+`로 이어 쓰는 방법도 충분히 좋다.

## 각 방법의 함수 구현

누군가 재현할 수 있도록 최대한 코드 원문을 담고자 했다.

### 인자 개수가 고정된 상황

```go
// concat.go
package concat

import (
	"bytes"
	"fmt"
	"strings"
)

const (
	delimiter = "#"
)

func FixedPlusOp(a, b, c string) string {
	return a + delimiter + b + delimiter + c
}
```

인자 개수가 고정된 상황에서 흔히 구현해 사용하는 로직이다.
이 테스트에선 고정된 상황인 경우 임의로 3개의 인자를 받는다고 가정했는데, 경험상 어느 정도 평균 수치를 반영했기도 하고 인자가 많아져도 벤치마크의 상대적 결과에 큰 영향을 주지 못했다.

```go
func FixedAssignOp(a, b, c string) string {
	var s string
	s += a
	s += delimiter
	s += b
	s += delimiter
	s += c
	return s
}

func FixedSprintf(a, b, c string) string {
	return fmt.Sprintf("%s%s%s%s%s", a, delimiter, b, delimiter, c)
}

func FixedSprint(a, b, c string) string {
	return fmt.Sprint(a, delimiter, b, delimiter, c)
}

func FixedJoin(a, b, c string) string {
	return strings.Join([]string{a, b, c}, delimiter)
}

func FixedBuilder(a, b, c string) string {
	var builder strings.Builder
	builder.WriteString(a)
	builder.WriteString(delimiter)
	builder.WriteString(b)
	builder.WriteString(delimiter)
	builder.WriteString(c)
	return builder.String()
}

func FixedBuilderPreAlloc(a, b, c string) string {
	var builder strings.Builder
	builder.Grow(len(a) + len(b) + len(c) + len(delimiter)*2)
	builder.WriteString(a)
	builder.WriteString(delimiter)
	builder.WriteString(b)
	builder.WriteString(delimiter)
	builder.WriteString(c)
	return builder.String()
}
```

`.Grow()` 메서드를 통해 내부 버퍼의 cap을 미리 늘려둘 수 있다.

```go
func FixedBuffer(a, b, c string) string {
	var buf bytes.Buffer
	buf.WriteString(a)
	buf.WriteString(delimiter)
	buf.WriteString(b)
	buf.WriteString(delimiter)
	buf.WriteString(c)
	return buf.String()
}

func FixedBufferPreAlloc(a, b, c string) string {
	var buf bytes.Buffer
	buf.Grow(len(a) + len(b) + len(c) + len(delimiter)*2)
	buf.WriteString(a)
	buf.WriteString(delimiter)
	buf.WriteString(b)
	buf.WriteString(delimiter)
	buf.WriteString(c)
	return buf.String()
}
```

### 인자 개수가 변할 수 있는 상황

인자 개수가 고정됐을 때와 다르게 비교할 수 있는 방법의 가짓수가 적었다.

```go
func VarPlusOp(ss []string) string {
	if len(ss) == 0 {
		return ""
	}

	result := ss[0]
	for _, s := range ss[1:] {
		result += delimiter + s
	}
	return result
}
```

인자 개수가 변할 수 있는 상황에선 `+` 연산자와 `+=` 연산자의 구분이 의미가 없어 위처럼 하나의 함수로 합쳐 구현했다.
[variadic 함수](https://gobyexample.com/variadic-functions)로 구현할 수도 있었으나 큰 차이가 없어 불필요한 변환이 없는 `[]string` 인자를 받는 형태로 구현했다.

```go
func VarJoin(ss []string) string {
	return strings.Join(ss, delimiter)
}

func VarBuilder(ss []string) string {
	if len(ss) == 0 {
		return ""
	}

	var builder strings.Builder
	builder.WriteString(ss[0])
	for _, s := range ss[1:] {
		builder.WriteString(delimiter)
		builder.WriteString(s)
	}
	return builder.String()
}

const (
	delimiterLen = len(delimiter)
)

func VarBuilderPreAlloc(ss []string) string {
	if len(ss) == 0 {
		return ""
	}

	var length int
	for _, s := range ss {
		length += delimiterLen
		length += len(s)
	}

	var builder strings.Builder
	builder.Grow(length)

	builder.WriteString(ss[0])
	for _, s := range ss[1:] {
		builder.WriteString(delimiter)
		builder.WriteString(s)
	}
	return builder.String()
}
```

`.Grow()`를 위해 전체 길이를 알아야 해서 for loop를 2번 도는 코드가 됐다.

```go
func VarBuffer(ss []string) string {
	if len(ss) == 0 {
		return ""
	}

	var buf bytes.Buffer
	buf.WriteString(ss[0])
	for _, s := range ss[1:] {
		buf.WriteString(delimiter)
		buf.WriteString(s)
	}
	return buf.String()
}

func VarBufferPreAlloc(ss []string) string {
	if len(ss) == 0 {
		return ""
	}

	var length int
	for _, s := range ss {
		length += delimiterLen
		length += len(s)
	}

	var buf bytes.Buffer
	buf.Grow(length)

	buf.WriteString(ss[0])
	for _, s := range ss[1:] {
		buf.WriteString(delimiter)
		buf.WriteString(s)
	}
	return buf.String()
}
```

## 벤치마크 코드

먼저 아래 테스트로 모든 함수의 결과가 동일함을 확인했다.

```go
// concat_test.go
package concat

import (
	"fmt"
	"math/rand/v2"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestAllFuncsAreSame(t *testing.T) {
	cases := []struct {
		a, b, c string
	}{
		{randString(1), randString(1), randString(1)},
		{randString(10), randString(10), randString(10)},
	}

	funcs := []func(a, b, c string) string{
		FixedPlusOp,
		FixedAssignOp,
		FixedSprintf,
		FixedSprint,
		FixedJoin,
		FixedBuilder,
		FixedBuffer,
		FixedBuilderPreAlloc,
		FixedBufferPreAlloc,
	}
	for _, tc := range cases {
		result := make([]string, len(funcs))
		for i, f := range funcs {
			result[i] = f(tc.a, tc.b, tc.c)
		}

		for i := range result {
			assert.Equal(t, result[0], result[i])
		}
	}
}

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func randString(n int) string {
	b := make([]byte, n)
	for i := range b {
		b[i] = charset[rand.IntN(len(charset))]
	}
	return string(b)
}
```

```go
var result string

func BenchmarkFixed(b *testing.B) {
	funcs := []struct {
		name string
		do   func(a, b, c string) string
	}{
		{name: "PlusOp", do: FixedPlusOp},
		{name: "AssignOp", do: FixedAssignOp},
		{name: "Sprintf", do: FixedSprintf},
		{name: "Sprint", do: FixedSprint},
		{name: "Join", do: FixedJoin},
		{name: "Builder", do: FixedBuilder},
		{name: "Buffer", do: FixedBuffer},
		{name: "BuilderPreAlloc", do: FixedBuilderPreAlloc},
		{name: "BufferPreAlloc", do: FixedBufferPreAlloc},
	}

	cases := []struct {
		name    string
		a, b, c string
	}{
		{"1 length", randString(1), randString(1), randString(1)},
		{"10 length", randString(10), randString(10), randString(10)},
		{"100 length", randString(100), randString(100), randString(100)},
	}

	for _, tc := range cases {
		for _, f := range funcs {
			var r string
			b.Run(fmt.Sprintf("%s/%s", f.name, tc.name), func(b *testing.B) {
				b.ReportAllocs()
				b.ResetTimer()
				for i := 0; i < b.N; i++ {
					// escape compiler optimization
					r = f.do(tc.a, tc.b, tc.c)
				}
				b.StopTimer()
				result = r
			})
		}
	}
}
```

보통의 경우 string concat을 할 시점이면 이미 인자로 넘길 데이터는 준비되어 있기에 위 벤치마크에선 인자로 들어갈 데이터의 준비 시간을 제외했다.
그리고 전역변수와 함수 실행의 결과값을 적절히 사용하지 않으면 컴파일 단계에서 코드가 임의로 처리될 수 있기에 위처럼 작성했다. ([Dave Cheney의 2013년 How to write benchmarks in Go 글](https://dave.cheney.net/2013/06/30/how-to-write-benchmarks-in-go)을 참고하자)

```go
func BenchmarkVar(b *testing.B) {
	funcs := []struct {
		name string
		do   func([]string) string
	}{
		{name: "PlusOp", do: VarPlusOp},
		{name: "Join", do: VarJoin},
		{name: "Builder", do: VarBuilder},
		{name: "Buffer", do: VarBuffer},
		{name: "BuilderPreAlloc", do: VarBuilderPreAlloc},
		{name: "BufferPreAlloc", do: VarBufferPreAlloc},
	}

	cases := []struct {
		name string
		ss   []string
	}{
		{"4 args", randStringSlice(4)},
		{"16 args", randStringSlice(16)},
		{"256 args", randStringSlice(256)},
	}

	for _, tc := range cases {
		for _, f := range funcs {
			var r string
			b.Run(fmt.Sprintf("%s/%s", f.name, tc.name), func(b *testing.B) {
				b.ReportAllocs()
				b.ResetTimer()
				for i := 0; i < b.N; i++ {
					r = f.do(tc.ss)
				}
				b.StopTimer()
				result = r
			})
		}
	}
}

func randStringSlice(n int) []string {
	s := make([]string, n)
	for i := range s {
		s[i] = randString(rand.IntN(10))
	}
	return s
}
```

인자 개수가 고정되어 있지 않은 상황에선 인자의 개수를 적절히 늘려가며 테스트해 줬는데 각 인자의 길이는 임의로 10으로 지정해 테스트했다. 이는 벤치마크 결과에 큰 영향을 주지 않았다.

## 벤치마크

벤치마크는 로컬 맥북 랩탑에서 진행했으며 아래 커맨드를 사용했다.

```sh
$ system_profiler SPHardwareDataType
Hardware:
    Model Name: MacBook Air
    Chip: Apple M2
    Total Number of Cores: 8 (4 performance and 4 efficiency)
    Memory: 8 GB

$ go version
go version go1.22.5 darwin/arm64

$ go test -bench=^Benchmark$ -benchmem -cpu=1 -count=5 . | tee result.txt
$ benchstat result.txt
```

<details>
<summary>결과 raw 데이터</summary>

고정된 인자 개수 벤치마크 결과

```sh
goos: darwin
goarch: arm64
pkg: playground/concat
                          │  result.txt  │
                          │    sec/op    │
Fixed/PlusOp/1              53.18n ±  0%
Fixed/AssignOp/1            138.0n ±  1%
Fixed/Sprintf/1             277.6n ±  1%
Fixed/Sprint/1              269.9n ±  0%
Fixed/Join/1                54.80n ±  1%
Fixed/Builder/1             39.70n ±  1%
Fixed/Buffer/1              88.43n ±  0%
Fixed/BuilderPreAlloc/1     40.41n ±  2%
Fixed/BufferPreAlloc/1      86.49n ±  0%
Fixed/PlusOp/10             61.40n ±  0%
Fixed/AssignOp/10           169.8n ±  0%
Fixed/Sprintf/10            286.8n ±  0%
Fixed/Sprint/10             278.6n ±  1%
Fixed/Join/10               65.14n ±  0%
Fixed/Builder/10            75.61n ±  0%
Fixed/Buffer/10             95.29n ±  0%
Fixed/BuilderPreAlloc/10    49.04n ±  0%
Fixed/BufferPreAlloc/10     93.21n ±  0%
Fixed/PlusOp/100            89.20n ±  0%
Fixed/AssignOp/100          249.7n ±  0%
Fixed/Sprintf/100           336.3n ±  0%
Fixed/Sprint/100            321.8n ±  0%
Fixed/Join/100              98.55n ±  2%
Fixed/Builder/100           203.6n ±  3%
Fixed/Buffer/100            352.6n ±  3%
Fixed/BuilderPreAlloc/100   86.54n ±  0%
Fixed/BufferPreAlloc/100    177.6n ± 19%
geomean                          121.0n

                           │  result.txt  │
                           │     B/op     │
Fixed/PlusOp/1                5.000 ± 0%
Fixed/AssignOp/1              16.00 ± 0%
Fixed/Sprintf/1               53.00 ± 0%
Fixed/Sprint/1                53.00 ± 0%
Fixed/Join/1                  5.000 ± 0%
Fixed/Builder/1               8.000 ± 0%
Fixed/Buffer/1                69.00 ± 0%
Fixed/BuilderPreAlloc/1       5.000 ± 0%
Fixed/BufferPreAlloc/1        69.00 ± 0%
Fixed/PlusOp/10               32.00 ± 0%
Fixed/AssignOp/10             96.00 ± 0%
Fixed/Sprintf/10              80.00 ± 0%
Fixed/Sprint/10               80.00 ± 0%
Fixed/Join/10                 32.00 ± 0%
Fixed/Builder/10              48.00 ± 0%
Fixed/Buffer/10               96.00 ± 0%
Fixed/BuilderPreAlloc/10      32.00 ± 0%
Fixed/BufferPreAlloc/10       96.00 ± 0%
Fixed/PlusOp/100              320.0 ± 0%
Fixed/AssignOp/100            848.0 ± 0%
Fixed/Sprintf/100             368.0 ± 0%
Fixed/Sprint/100              368.0 ± 0%
Fixed/Join/100                320.0 ± 0%
Fixed/Builder/100             784.0 ± 0%
Fixed/Buffer/100            1.078Ki ± 0%
Fixed/BuilderPreAlloc/100     320.0 ± 0%
Fixed/BufferPreAlloc/100      640.0 ± 0%
geomean                            81.48

                          │ result.txt │
                          │ allocs/op  │
Fixed/PlusOp/1              1.000 ± 0%
Fixed/AssignOp/1            4.000 ± 0%
Fixed/Sprintf/1             4.000 ± 0%
Fixed/Sprint/1              4.000 ± 0%
Fixed/Join/1                1.000 ± 0%
Fixed/Builder/1             1.000 ± 0%
Fixed/Buffer/1              2.000 ± 0%
Fixed/BuilderPreAlloc/1     1.000 ± 0%
Fixed/BufferPreAlloc/1      2.000 ± 0%
Fixed/PlusOp/10             1.000 ± 0%
Fixed/AssignOp/10           4.000 ± 0%
Fixed/Sprintf/10            4.000 ± 0%
Fixed/Sprint/10             4.000 ± 0%
Fixed/Join/10               1.000 ± 0%
Fixed/Builder/10            2.000 ± 0%
Fixed/Buffer/10             2.000 ± 0%
Fixed/BuilderPreAlloc/10    1.000 ± 0%
Fixed/BufferPreAlloc/10     2.000 ± 0%
Fixed/PlusOp/100            1.000 ± 0%
Fixed/AssignOp/100          4.000 ± 0%
Fixed/Sprintf/100           4.000 ± 0%
Fixed/Sprint/100            4.000 ± 0%
Fixed/Join/100              1.000 ± 0%
Fixed/Builder/100           3.000 ± 0%
Fixed/Buffer/100            4.000 ± 0%
Fixed/BuilderPreAlloc/100   1.000 ± 0%
Fixed/BufferPreAlloc/100    2.000 ± 0%
geomean                          2.030
```

가변 인자 개수 벤치마크 결과

```sh
goos: darwin
goarch: arm64
pkg: playground/concat
                          │ result_var.txt │
                          │     sec/op     │
Var/PlusOp/4                 145.3n ± 4%
Var/Join/4                   78.26n ± 1%
Var/Builder/4                115.4n ± 0%
Var/Buffer/4                 110.9n ± 0%
Var/BuilderPreAlloc/4        59.25n ± 0%
Var/BufferPreAlloc/4         112.6n ± 3%
Var/PlusOp/16                742.9n ± 0%
Var/Join/16                  199.7n ± 3%
Var/Builder/16               273.1n ± 3%
Var/Buffer/16                331.2n ± 1%
Var/BuilderPreAlloc/16       165.7n ± 6%
Var/BufferPreAlloc/16        287.4n ± 1%
Var/PlusOp/256               37.34µ ± 0%
Var/Join/256                 2.810µ ± 1%
Var/Builder/256              2.490µ ± 2%
Var/Buffer/256               4.471µ ± 2%
Var/BuilderPreAlloc/256      2.638µ ± 1%
Var/BufferPreAlloc/256       4.119µ ± 1%
geomean                           520.5n

                          │ result_var.txt │
                          │      B/op      │
Var/PlusOp/4                  64.00 ± 0%
Var/Join/4                    24.00 ± 0%
Var/Builder/4                 56.00 ± 0%
Var/Buffer/4                  88.00 ± 0%
Var/BuilderPreAlloc/4         24.00 ± 0%
Var/BufferPreAlloc/4          88.00 ± 0%
Var/PlusOp/16                 616.0 ± 0%
Var/Join/16                   80.00 ± 0%
Var/Builder/16                248.0 ± 0%
Var/Buffer/16                 272.0 ± 0%
Var/BuilderPreAlloc/16        80.00 ± 0%
Var/BufferPreAlloc/16         160.0 ± 0%
Var/PlusOp/256              185.6Ki ± 0%
Var/Join/256                1.375Ki ± 0%
Var/Builder/256             3.242Ki ± 0%
Var/Buffer/256              5.312Ki ± 0%
Var/BuilderPreAlloc/256     1.375Ki ± 0%
Var/BufferPreAlloc/256      2.750Ki ± 0%
geomean                            364.7

                           │ result_var.txt │
                           │   allocs/op    │
Var/PlusOp/4                  3.000 ± 0%
Var/Join/4                    1.000 ± 0%
Var/Builder/4                 3.000 ± 0%
Var/Buffer/4                  2.000 ± 0%
Var/BuilderPreAlloc/4         1.000 ± 0%
Var/BufferPreAlloc/4          2.000 ± 0%
Var/PlusOp/16                 15.00 ± 0%
Var/Join/16                   1.000 ± 0%
Var/Builder/16                5.000 ± 0%
Var/Buffer/16                 3.000 ± 0%
Var/BuilderPreAlloc/16        1.000 ± 0%
Var/BufferPreAlloc/16         2.000 ± 0%
Var/PlusOp/256                255.0 ± 0%
Var/Join/256                  1.000 ± 0%
Var/Builder/256               9.000 ± 0%
Var/Buffer/256                7.000 ± 0%
Var/BuilderPreAlloc/256       1.000 ± 0%
Var/BufferPreAlloc/256        2.000 ± 0%
geomean                            3.050
```

</details>

## 결과

### 그래프로 비교해 보기 – 고정 인자

![고정된 인자 개수에서 실행 시간 비교](/images/20250105/fixed_sec.png)

인자의 길이 별로 실행 시간을 비교해 빠른 순서로 정렬했으며 pre allocated `strings.Builder` > `+` 연산자 > `strings.Join()` 순으로 빨랐음을 알 수 있다.
길이에 따라 빠른 방법이 바뀌기도 했으나 여기선 길이가 10일 때를 기준으로 정렬했다.

![고정된 인자 개수에서 메모리 사용량 비교](/images/20250105/fixed_memory.png)

로그 스케일이며 메모리 사용량은 위의 세 방식이 그대로 top 3였고 똑같이 사용량이 적었다.

![고정된 인자 개수에서 메모리 할당 횟수 비교](/images/20250105/fixed_allocs.png)

메모리 할당 횟수도 세 방식 모두 주어진 인자와 관계없이 최소한의 할당으로 수행했다.

### 그래프로 비교해 보기 – 가변 인자

![가변 인자 개수에서 실행 시간 비교](/images/20250105/var_sec.png)

실행 시간은 pre allocated `strings.Builder` > `strings.Join()` 순으로 top2 결과를 보여준다.
로그 스케일임을 감안했을 때 `+=` 연산자 방식은 사용할 수 없는 수준이었다.

![가변 인자 개수에서 메모리 사용량 비교](/images/20250105/var_memory.png)

메모리 사용량도 top2가 똑같았다.

![가변 인자 개수에서 메모리 할당 횟수 비교](/images/20250105/var_allocs.png)

메모리 할당 횟수도 마찬가지며 로그 스케일임을 감안했을 때 `+=` 연산자를 사용하는 방식의 비효율이 눈에 띈다.

## 정리

결과를 정리해 보자면

1. `.Grow()` 메서드를 사용해 capacity를 미리 할당한 `strings.Builder` 혹은 `strings.Join()` 방법이 모든 상황에서 가장 빠르고 효율적인 방법이었다.
    - 생각보다 `strings.Join()`도 빠른 방법이었다는 게 의외였다.
2. 인자 개수가 고정된 상황에선 `+`로 이어 쓰는 방법도 충분히 좋았다.
3. 느린 방법이 왜 느리고 빠른 방법은 왜 빠른가 알아보는 것도 의미 있겠으나 그 부분은 글을 읽는 분들의 재미로 남겨두고자 한다.

## 참고해 볼만한 글

* 2024년 [Max Hoffman](https://github.com/max-hoffman)의 글: [fmt.Sprintf vs String Concat](https://www.dolthub.com/blog/2024-11-08-sprintf-vs-concat/)
    * 왜 `fmt.Sprintf`는 느리고 `+`는 빠른지 설명해준다.
* 2020년 [cloudrain21](https://github.com/cloudrain21)의 글: [Go – String 을 어떻게 빠르게 이어붙일까?(String Concatenation)](http://cloudrain21.com/go-how-to-concatenate-strings)
    * "golang string concat" 키워드로 검색했을 때 한국어 상위 결과로 나오는 글
    * `bytes.Buffer`와 `strings.Join` 내부 동작을 설명해준다.
    * 이 글에선 인자의 고정 여부를 엄밀히 구분하진 않았고, 벤치마크로 수행된 결과가 아니라 결과 해석에 한계가 있다.
