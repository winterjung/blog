---
title: Go에서 메모리 할당 없이 문자열 빠르게 변환하기
---

Go 서버 로직을 구현하다 보면 `string`과 `[]byte` 사이의 변환이 자주 필요하다. 특히 HTTP 요청 처리나 JSON 직렬화, 역직렬화 과정에서 이런 변환이 빈번하게 발생한다. 그럴때 보통 `string(bb)` 혹은 `[]byte(ss)`처럼 기본적인 변환 방법을 사용하는데, 이러면 불필요한 메모리 할당을 동반한다.

## 메모리 할당이 없으면 좋은가?

메모리 할당이 발생하면 두 가지 비용이 발생한다
1. 새로운 메모리를 할당하고 데이터를 복사하는 시간
2. GC가 할당된 메모리를 추적하고 해제하는 오버헤드

특히 고성능이 요구되는 서버에서 이런 비용은 무시할 수 없다.

## `unsafe` 패키지를 활용한 빠른 변환

Go 1.20부터 `unsafe` 패키지에 새로운 함수들이 추가되어 메모리 할당 없이 변환이 가능해졌다

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

## 실제로 얼마나 빠른가?

아래 벤치마크를 실행한 결과다. 벤치마크 과정에서 컴파일 최적화가 발생하지 않도록 작성했다.

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

```shell
goos: darwin
goarch: arm64
cpu: Apple M2
BenchmarkToBytesRaw-8       	89127657	        13.70 ns/op	      16 B/op	       1 allocs/op
BenchmarkToBytesUnsafe-8    	625495320	         1.973 ns/op	       0 B/op	       0 allocs/op
BenchmarkToStringRaw-8      	100000000	        12.34 ns/op	      16 B/op	       1 allocs/op
BenchmarkToStringUnsafe-8   	519000744	         2.019 ns/op	       0 B/op	       0 allocs/op
PASS
ok  	playground/unsafe-string	9.979s
```

기본 변환 방식과 비교하면
- 약 6-7배 더 빠른 실행 속도
- 메모리 할당이 전혀 없음

## 주의사항

이 방식이 항상 좋은 것은 아니다. 몇 가지 주의할 점이 있다

1. 변환된 `[]byte`를 직접 수정하면 원본 문자열도 변경될 수 있다
2. `unsafe` 패키지를 사용하므로 Go 버전 업그레이드시 호환성 문제가 발생할 수 있다
3. 코드의 안전성과 이식성이 떨어질 수 있다

일부 블로그에서 140배까지 성능이 향상된다고 하는데, 이는 대부분 컴파일러 최적화로 인한 결과다. 실제 상황에서는 5-10배 정도의 성능 향상이 일반적이다.

## 결론

이 최적화 기법은 매우 특수한 경우에만 필요하다. 다음과 같은 경우에 고려해보자:

1. 프로파일링을 통해 `string`, `[]byte` 변환이 실제 병목으로 확인된 경우
2. 변환된 데이터를 읽기만 하고 수정하지 않는 경우
3. 성능이 매우 중요한 핫패스인 경우

일반적인 상황에서는 기본 변환 방식을 사용하는 것이 더 안전하고 유지보수하기 좋다.

```go
func ToStringRaw(b []byte) string {
	return string(b)
}

func ToBytesRaw(s string) []byte {
	return []byte(s)
}
```
