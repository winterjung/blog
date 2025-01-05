---
title: Go에서 문자열 빠르게 이어붙이는 방법
image: images/20250105/fixed_sec.png
---

Go에서 문자열을 이어 붙여야 할 때 `pk := row.ID + "#" + row.Name` 혹은 `pk := fmt.Sprintf("%s#%s", row.ID, row.Name)` 같이 관성적으로 썼던 방식을 쓰거나, 한두 가지 방법 정도만 마이크로 벤치마크를 통해 비교해보고 빠른 방법을 사용하곤 했다.
그 때 마다 인자 개수가 고정되어 있는지, 변수를 통해 바뀌는지, 인자로 주어진 문자열들의 길이가 어떤지 등 상황이 다양하곤 했는데, 이 글에선 각 상황별 여러 방법들을 벤치마크를 통해 성능과 메모리 사용량을 비교해 봤다.

## 비교할 방법들

경험적으로 사용했거나 혹은 널리 알려진 방법들을 간추려 보니 대략 아래와 같았다.

1. `+` 연산자: 이어 붙일 string이 고정된 개수일 때 종종 썼다.
2. `+=` 연산자: 사실 그렇게 많이 사용해본 적은 없는데 한 번 넣어봤다.
3. `fmt.Sprintf()`: 어렴풋이 느릴거란 생각은 있으나 자주 쓰곤했다.
4. `fmt.Sprint()`: `fmt.Sprintf`의 template interpolation이 느리지 않을까하여 넣어봤다.
5. `strings.Join()`: 이어 붙여야 할 문자열이 꽤 되는 경우 코드가 간결해 선호하곤 했다.
6. `bytes.Buffer`: buffer를 만들고 `WriteString`하는 방식인데 직접 쓴 적은 없고 라이브러리 내부 구현에서 종종 봤다.
7. `strings.Builder`: 1.10 버전에 생겨 `bytes.Buffer`를 대체한다고 한다.
    - 위 두 방식은 모두 내부적으로 `.Grow()` 메서드가 있어 pre allocating이 가능하기에 두 경우를 구분해 테스트해봤다. 

### 함수 구현 코드

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

const (
	delimiterLen = len(delimiter)
)

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

### 벤치마크 코드

```go
// concat_test.go
package concat

import (
	"fmt"
	"math/rand/v2"
	"testing"
)

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
					r = f.do(tc.a, tc.b, tc.c)
				}
				b.StopTimer()
				result = r
			})
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

	// 다양한 입력 개수 테스트를 위한 케이스들
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

### 테스트

벤치마크는 로컬 맥북 랩탑에서 진행했으며 아래 커맨드를 통해 재현해볼 수 있다.

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

> tl;dr 주어진 인자만큼 미리 capacity를 할당한 pre allocated `strings.Builder` 혹은 `strings.Join()`을 쓰자.

![고정된 인자 개수에서 실행 시간 비교](/images/20250105/fixed_sec.png)
![고정된 인자 개수에서 메모리 사용량 비교](/images/20250105/fixed_memory.png)
![고정된 인자 개수에서 메모리 할당 횟수 비교](/images/20250105/fixed_allocs.png)

- 성능: pre allocated `strings.Builder` > `+` 연산자 > `strings.Join()` 순으로 빨랐다.
- 메모리 사용량: pre allocated `strings.Builder` = `+` 연산자 = `strings.Join()`으로 세 방식의 사용량이 똑같이 적었다.
- 메모리 할당 횟수: pre allocated `strings.Builder` = `+` 연산자 = `strings.Join()`으로 세 방식 모두 주어진 인자와 관계없이 최소한의 할당으로 수행했다.

![가변 인자 개수에서 실행 시간 비교](/images/20250105/var_sec.png)
![가변 인자 개수에서 메모리 사용량 비교](/images/20250105/var_memory.png)
![가변 인자 개수에서 메모리 할당 횟수 비교](/images/20250105/var_allocs.png)

- 성능: pre allocated `strings.Builder` > `strings.Join()` 순으로 탑2 결과를 보여준다.
- 메모리 사용량: pre allocated `strings.Builder` = `strings.Join()`
- 메모리 할당 횟수: pre allocated `strings.Builder` = `strings.Join()`
- 로그 스케일임을 감안했을 때 `+=` 연산자를 사용하는 방식의 비효율이 눈에 띈다.

## 참고해볼만한 글

* 2024년 [Max Hoffman](https://github.com/max-hoffman)의 글: [fmt.Sprintf vs String Concat](https://www.dolthub.com/blog/2024-11-08-sprintf-vs-concat/)
    * 왜 `fmt.Sprintf`는 느리고 `+`는 빠른지 설명해준다.
* 2020년 [cloudrain21](https://github.com/cloudrain21)의 글 [Go – String 을 어떻게 빠르게 이어붙일까?(String Concatenation)](http://cloudrain21.com/go-how-to-concatenate-strings)
    * "golang string concat" 키워드로 검색했을 때 한국어 상위 결과로 나오는 글
    * 엄밀한 벤치마크 결과는 아니라 결과 해석에 한계가 있다.
    * `bytes.Buffer`와 `strings.Join` 내부 동작을 설명해준다.
