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
    - 위 두 방식은 모두 내부적으로 `.Grow()` 메서드가 있어 pre allocating이 가능했다. 

## 앞서보는 결과

![](/images/20250105/fixed_sec.png)
![](/images/20250105/fixed_memory.png)
![](/images/20250105/fixed_allocs.png)

- 성능: pre allocated `strings.Builder` > `+` 연산자 > `strings.Join()` 순으로 빨랐다.
- 메모리 사용량: pre allocated `strings.Builder` = `+` 연산자 = `strings.Join()`으로 세 방식의 사용량이 똑같이 적었다.
- 메모리 할당 횟수: pre allocated `strings.Builder` = `+` 연산자 = `strings.Join()`으로 세 방식 모두 주어진 인자와 관계없이 최소한의 할당으로 수행했다.

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

$ go test -bench=^BenchmarkFixed$ -benchmem -cpu=1 -count=5 . | tee result.txt
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
Fixed/FixedPlusOp/1              53.18n ±  0%
Fixed/FixedAssignOp/1            138.0n ±  1%
Fixed/FixedSprintf/1             277.6n ±  1%
Fixed/FixedSprint/1              269.9n ±  0%
Fixed/FixedJoin/1                54.80n ±  1%
Fixed/FixedBuilder/1             39.70n ±  1%
Fixed/FixedBuffer/1              88.43n ±  0%
Fixed/FixedBuilderPreAlloc/1     40.41n ±  2%
Fixed/FixedBufferPreAlloc/1      86.49n ±  0%
Fixed/FixedPlusOp/10             61.40n ±  0%
Fixed/FixedAssignOp/10           169.8n ±  0%
Fixed/FixedSprintf/10            286.8n ±  0%
Fixed/FixedSprint/10             278.6n ±  1%
Fixed/FixedJoin/10               65.14n ±  0%
Fixed/FixedBuilder/10            75.61n ±  0%
Fixed/FixedBuffer/10             95.29n ±  0%
Fixed/FixedBuilderPreAlloc/10    49.04n ±  0%
Fixed/FixedBufferPreAlloc/10     93.21n ±  0%
Fixed/FixedPlusOp/100            89.20n ±  0%
Fixed/FixedAssignOp/100          249.7n ±  0%
Fixed/FixedSprintf/100           336.3n ±  0%
Fixed/FixedSprint/100            321.8n ±  0%
Fixed/FixedJoin/100              98.55n ±  2%
Fixed/FixedBuilder/100           203.6n ±  3%
Fixed/FixedBuffer/100            352.6n ±  3%
Fixed/FixedBuilderPreAlloc/100   86.54n ±  0%
Fixed/FixedBufferPreAlloc/100    177.6n ± 19%
geomean                          121.0n

                               │  result.txt  │
                               │     B/op     │
Fixed/FixedPlusOp/1                5.000 ± 0%
Fixed/FixedAssignOp/1              16.00 ± 0%
Fixed/FixedSprintf/1               53.00 ± 0%
Fixed/FixedSprint/1                53.00 ± 0%
Fixed/FixedJoin/1                  5.000 ± 0%
Fixed/FixedBuilder/1               8.000 ± 0%
Fixed/FixedBuffer/1                69.00 ± 0%
Fixed/FixedBuilderPreAlloc/1       5.000 ± 0%
Fixed/FixedBufferPreAlloc/1        69.00 ± 0%
Fixed/FixedPlusOp/10               32.00 ± 0%
Fixed/FixedAssignOp/10             96.00 ± 0%
Fixed/FixedSprintf/10              80.00 ± 0%
Fixed/FixedSprint/10               80.00 ± 0%
Fixed/FixedJoin/10                 32.00 ± 0%
Fixed/FixedBuilder/10              48.00 ± 0%
Fixed/FixedBuffer/10               96.00 ± 0%
Fixed/FixedBuilderPreAlloc/10      32.00 ± 0%
Fixed/FixedBufferPreAlloc/10       96.00 ± 0%
Fixed/FixedPlusOp/100              320.0 ± 0%
Fixed/FixedAssignOp/100            848.0 ± 0%
Fixed/FixedSprintf/100             368.0 ± 0%
Fixed/FixedSprint/100              368.0 ± 0%
Fixed/FixedJoin/100                320.0 ± 0%
Fixed/FixedBuilder/100             784.0 ± 0%
Fixed/FixedBuffer/100            1.078Ki ± 0%
Fixed/FixedBuilderPreAlloc/100     320.0 ± 0%
Fixed/FixedBufferPreAlloc/100      640.0 ± 0%
geomean                            81.48

                               │ result.txt │
                               │ allocs/op  │
Fixed/FixedPlusOp/1              1.000 ± 0%
Fixed/FixedAssignOp/1            4.000 ± 0%
Fixed/FixedSprintf/1             4.000 ± 0%
Fixed/FixedSprint/1              4.000 ± 0%
Fixed/FixedJoin/1                1.000 ± 0%
Fixed/FixedBuilder/1             1.000 ± 0%
Fixed/FixedBuffer/1              2.000 ± 0%
Fixed/FixedBuilderPreAlloc/1     1.000 ± 0%
Fixed/FixedBufferPreAlloc/1      2.000 ± 0%
Fixed/FixedPlusOp/10             1.000 ± 0%
Fixed/FixedAssignOp/10           4.000 ± 0%
Fixed/FixedSprintf/10            4.000 ± 0%
Fixed/FixedSprint/10             4.000 ± 0%
Fixed/FixedJoin/10               1.000 ± 0%
Fixed/FixedBuilder/10            2.000 ± 0%
Fixed/FixedBuffer/10             2.000 ± 0%
Fixed/FixedBuilderPreAlloc/10    1.000 ± 0%
Fixed/FixedBufferPreAlloc/10     2.000 ± 0%
Fixed/FixedPlusOp/100            1.000 ± 0%
Fixed/FixedAssignOp/100          4.000 ± 0%
Fixed/FixedSprintf/100           4.000 ± 0%
Fixed/FixedSprint/100            4.000 ± 0%
Fixed/FixedJoin/100              1.000 ± 0%
Fixed/FixedBuilder/100           3.000 ± 0%
Fixed/FixedBuffer/100            4.000 ± 0%
Fixed/FixedBuilderPreAlloc/100   1.000 ± 0%
Fixed/FixedBufferPreAlloc/100    2.000 ± 0%
geomean                          2.030
```
</details>

## 참고해볼만한 글

* 2024년 [Max Hoffman](https://github.com/max-hoffman)의 글: [fmt.Sprintf vs String Concat](https://www.dolthub.com/blog/2024-11-08-sprintf-vs-concat/)
    * 왜 `fmt.Sprintf`는 느리고 `+`는 빠른지 설명해준다.
* 2020년 [cloudrain21](https://github.com/cloudrain21)의 글 [Go – String 을 어떻게 빠르게 이어붙일까?(String Concatenation)](http://cloudrain21.com/go-how-to-concatenate-strings)
    * "golang string concat" 키워드로 검색했을 때 한국어 상위 결과로 나오는 글
    * 엄밀한 벤치마크 결과는 아니라 결과 해석에 한계가 있다.
    * `bytes.Buffer`와 `strings.Join` 내부 동작을 설명해준다.
