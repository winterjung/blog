---
title: Go에서 메모리 할당 없이 문자열 빠르게 변환하기
---

Go 서버 로직을 구현하다 보면 `string`과 `[]byte` 사이의 변환이 자주 필요하다. `json.Marshal`한 결과로 나온 `[]byte`를 response로 내려주거나, db에 저장하거나, 이벤트로 발행하거나, 로깅하기 위해 `string`으로 변환하고, 어디선가 갖고온 `string`을 다시 `json.Unmarshal`를 통해 struct로 매핑하기 위해 `[]byte`로 변환하는 일이 늘상 있다. 그럴때 `string(bb)` 혹은 `[]byte(s)`처럼 기본적인 변환 방법을 사용하곤 하고 보통은 이 정도로도 충분하다.

다만 자주 사용하는 방법은 힙 메모리 할당을 발생시키다 보니 트래픽이 많아져 변환이 매우 잦고 성능에 영향을 주기 시작한다면, `unsafe` 패키지를 이용해 zero allocation convert 로직으로 조금 더 최적화해볼 여지가 있다.

## 메모리 할당이 없으면 좋은가?

메모리 할당이 발생하면 두 가지 비용이 발생한다.

1. 새로운 메모리를 할당하고 데이터를 복사하는 시간
1. gc가 할당된 메모리를 추적하고 해제하는 오버헤드

보통의 경우 빈번한 메모리 할당으로 인한 gc도, 변환 시간도 문제가 되지 않으나 높은 성능이 요구된다면 이런 로직 또한 최적화의 대상이 될 수 있겠다.

## `unsafe` 패키지를 활용한 빠른 변환

`unsafe` 패키지를 이용해 빠르게 변환하더라도 예전에는 `reflect.SliceHeader`, `reflect.StringHeader`, `unsafe.Pointer`같은 타입을 사용해야 했었는데, [Go 1.17 버전에 `unsafe.Slice` 함수가 추가](https://github.com/golang/go/issues/19367)되고 [Go 1.20 버전엔 `unsafe` 패키지에 `StringData`, `String`, `SliceData` 함수들이 추가](https://github.com/golang/go/issues/53003)되어 조금 더 깔끔한 방식으로 메모리 할당 없는 변환이 가능해졌다.

```go
func ToStringUnsafe(b []byte) string {
	if len(b) == 0 {
		return ""
	}
	return unsafe.String(unsafe.SliceData(b), len(b))
}

func ToBytesUnsafe(s string) []byte {
	if s == "" {
		return nil
	}
	return unsafe.Slice(unsafe.StringData(s), len(s))
}
```

위 구현에 사용된 unsafe 함수들은 빈 값이 들어와도 아래 주석처럼 동작하기에 대부분의 사용 사례에선 안전하나, [`"go"[:0]`처럼 사용하는 등의 특정 엣지케이스에서 동작의 차이](https://github.com/golang/go/issues/53003#issuecomment-1772195663)가 있기에 위처럼 zero value를 분기처리 해주는게 좋다.

```go
// SliceData returns a pointer to the underlying array of the argument
// slice.
//   - If cap(slice) > 0, SliceData returns &slice[:1][0].
//   - If slice == nil, SliceData returns nil.
//   - Otherwise, SliceData returns a non-nil pointer to an
//     unspecified memory address.
func SliceData(slice []ArbitraryType) *ArbitraryType

// StringData returns a pointer to the underlying bytes of str.
// For an empty string the return value is unspecified, and may be nil.
//
// Since Go strings are immutable, the bytes returned by StringData
// must not be modified.
func StringData(str string) *byte
```

## 실제로 얼마나 빠른가?

아래는 벤치마크를 위한 코드다. 벤치마크 과정에서 컴파일 최적화가 발생하지 않도록 작성했다.

```go
var s string
var bb []byte

func BenchmarkToBytesRaw(b *testing.B) {
	s := "Hello, World!"
	var result []byte
	for i := 0; i < b.N; i++ {
		result = ToBytesRaw(s)
	}
	bb = result
}

func BenchmarkToBytesUnsafe(b *testing.B) {
	s := "Hello, World!"
	var result []byte
	for i := 0; i < b.N; i++ {
		result = ToBytesUnsafe(s)
	}
	bb = result
}

func BenchmarkToStringRaw(b *testing.B) {
	bb := []byte("Hello, World!")
	var result string
	for i := 0; i < b.N; i++ {
		result = ToStringRaw(bb)
	}
	s = result
}

func BenchmarkToStringUnsafe(b *testing.B) {
	bb := []byte("Hello, World!")
	var result string
	for i := 0; i < b.N; i++ {
		result = ToStringUnsafe(bb)
	}
	s = result
}
```

그 결과는 아래와 같다.

```shell
$ go test -bench=^Benchmark -benchmem -cpu=1 . | tee result.txt
goos: darwin
goarch: arm64
cpu: Apple M2
BenchmarkToBytesRaw-8       	89127657	        13.70 ns/op	      16 B/op	       1 allocs/op
BenchmarkToBytesUnsafe-8    	625495320	         1.973 ns/op	       0 B/op	       0 allocs/op
BenchmarkToStringRaw-8      	100000000	        12.34 ns/op	      16 B/op	       1 allocs/op
BenchmarkToStringUnsafe-8   	519000744	         2.019 ns/op	       0 B/op	       0 allocs/op
PASS
ok  	playground/unsafe-string	9.979s

$ benchstat result.txt
               │   sec/op    │
ToBytesRaw       14.56n ± 3%
ToBytesUnsafe    1.937n ± 1%
ToStringRaw      11.81n ± 0%
ToStringUnsafe   1.917n ± 0%
```

기본 변환 방식과 비교하면 `unsafe` 버전이 **6–7배 더 빠른 실행 속도**를 보여주고 **메모리 할당이 없음**을 보여준다.

## 그러면 항상 이 방법을 써도 될까?

`unsafe` 패키지를 사용함으로서 따라오는 몇 가지 주의할 점이 있다

1. 변환된 `[]byte`를 직접 수정하면 원본 문자열도 변경될 수 있다

```go
func main() {
	bb := []byte("hello!")
	s := ToStringUnsafe(bb)
	fmt.Println(s)
	bb[0] = 'w'
	fmt.Println(s)
}
// Output:
//   hello!
//   wello!
```

2. `unsafe` 패키지를 사용하므로 Go 버전 업그레이드시 호환성 문제가 발생할 수 있다
3. 코드의 안전성과 이식성이 떨어질 수 있다

## 결론

이 최적화 기법은 정말 필요한 경우에만 사용하길 권장한다. 다음과 같은 경우에 고려해보자

1. 프로파일링을 통해 `string`, `[]byte` 변환이 실제 병목으로 확인된 경우
2. 변환된 데이터를 읽기만 하고 수정하지 않는 경우
3. 성능이 매우 중요한 핫패스인 경우

일반적인 상황에서는 아래처럼 기본 변환 방식을 사용하는 것도 충분히 좋은 선택이다.

```go
func ToStringRaw(b []byte) string {
	return string(b)
}

func ToBytesRaw(s string) []byte {
	return []byte(s)
}
```

## 덧붙인 말

"golang zero allocation string convert" 이런 키워드로 검색하다보면 [Boosting String and Bytes Conversions Speed by 140x with Zero Allocation in Go](https://www.josestg.com/posts/golang/boosting-string-and-bytes-conversions-speed-by-140x-with-zero-allocation-in-go/) 블로그 글 처럼 140배 빠르게 변환할 수 있다는 블로그 글도 보이는데 이는 [잘못된 벤치마크 코드](https://github.com/josestg/zerocast/blob/44a4ab3d5e731c3716032d33504693df9ea6f75b/zerocast_test.go#L34)를 수행한 결과다. `string` ⇄ `[]byte` 변환이 워낙 빠르다보니 결과가 1ns에 가깝게 나오는게 정상일 수 있었겠으나, 보통 1ns보다 적게 나오는 경우 컴파일 단계에서 인라인 최적화된 결과고 위 블로그에서 언급한 테스트 코드 또한 그렇다.

이는 비슷하게 [As of go 1.22, there's no need to use the unsafe package for string to bytes conversion · Issue #124656 · kubernetes/kubernetes](https://github.com/kubernetes/kubernetes/issues/124656) 이슈에서도 똑같이 벤치마크 실수로 인한 결과임을 볼 수 있다.
