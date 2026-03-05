---
title: Converting string ⇄ []byte 7× Faster in Go
date: 2025-02-16
---

When implementing Go server logic, you frequently need to convert between `string` and `[]byte`. It's commonplace to convert the `[]byte` result from `json.Marshal` to a `string` for sending as a response, storing in a database, publishing as an event, or logging — and to convert a `string` fetched from somewhere back to `[]byte` for mapping into a struct via `json.Unmarshal`. In such cases, we typically use the standard conversion — `string(bb)` or `[]byte(s)` — and most of the time, that's perfectly sufficient.

However, since this common approach does trigger heap memory allocation, if traffic increases to the point where conversions become extremely frequent and begin to affect performance, there is room for further optimization using the `unsafe` package to implement zero-allocation conversion logic.

## Is Zero Allocation Better?

When memory allocation occurs, two costs are incurred:

1. The time to allocate new memory and copy data
1. The overhead of the GC tracking and freeing the allocated memory

In most cases, neither the GC pressure from frequent memory allocations nor the conversion time itself poses a problem — but if high performance is required, even this kind of logic can become a target for optimization.

## Fast Conversion Using the `unsafe` Package

Even when using the `unsafe` package for fast conversions, you previously had to use types like `reflect.SliceHeader`, `reflect.StringHeader`, and `unsafe.Pointer`. However, with the [addition of the `unsafe.Slice` function in Go 1.17](https://github.com/golang/go/issues/19367) and the [addition of the `StringData`, `String`, and `SliceData` functions to the `unsafe` package in Go 1.20](https://github.com/golang/go/issues/53003), zero-allocation conversion is now possible in a cleaner way.

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

The `unsafe` functions used above behave as described in the comments below even when given empty values, so they are safe for most use cases. However, since [there are behavioral differences in certain edge cases, such as `"go"[:0]`](https://github.com/golang/go/issues/53003#issuecomment-1772195663), it is advisable to add a guard clause for zero values as shown above.

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

## How Fast Is It, Really?

Below is the benchmark code. It was written to prevent compiler optimization from occurring during the benchmark.

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

The results are as follows.

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

Compared to the standard conversion, the `unsafe` version is **6–7× faster** and incurs **zero memory allocation**.

## Can We Always Use This Approach?

First, the output of the `unsafe` version is identical to that of the standard version shown below.

```go
func ToStringRaw(b []byte) string {
	return string(b)
}

func ToBytesRaw(s string) []byte {
	return []byte(s)
}
```

This can also be verified with [fuzz testing](https://go.dev/doc/security/fuzz/) as shown below.

```go
func FuzzToBytes(f *testing.F) {
	f.Add("")
	f.Add("Hello, World!")
	f.Add("한글도 테스트")
	f.Add("🚀 이모지도")

	f.Fuzz(func(t *testing.T, s string) {
		raw := ToBytesRaw(s)
		unsafe := ToBytesUnsafe(s)

		if string(raw) != string(unsafe) {
			t.Errorf("content mismatch: raw=%q, unsafe=%q", raw, unsafe)
		}
	})
}

func FuzzToString(f *testing.F) {
	f.Add([]byte{})
	var nilCase []byte
	f.Add(nilCase)
	f.Add([]byte("Hello, World!"))
	f.Add([]byte("한글도 테스트"))
	f.Add([]byte("🚀 이모지도"))

	f.Fuzz(func(t *testing.T, b []byte) {
		raw := ToStringRaw(b)
		unsafe := ToStringUnsafe(b)

		if raw != unsafe {
			t.Errorf("content mismatch: raw=%q, unsafe=%q", raw, unsafe)
		}
	})
}
```

```shell
$ go test -fuzz=FuzzToString -fuzztime=20s
fuzz: elapsed: 0s, gathering baseline coverage: 4/4 completed, now fuzzing with 8 workers
fuzz: elapsed: 3s, execs: 975426 (325115/sec), new interesting: 0 (total: 4)
fuzz: elapsed: 12s, execs: 3864940 (321077/sec), new interesting: 0 (total: 4)
fuzz: elapsed: 20s, execs: 6244040 (216995/sec), new interesting: 0 (total: 4)
PASS
```

However, there are a few caveats that come with using the `unsafe` package:

1. Directly modifying the converted `[]byte` can also mutate the original string
    - As shown below, if you modify the source `[]byte`, it can introduce [subtle bugs, such as when used as a map key](https://stackoverflow.com/questions/33952378/what-are-the-possible-consequences-of-using-unsafe-conversion-from-byte-to-str/33953027#33953027). Make sure to thoroughly verify that no mutation occurs before or after the conversion.

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

2. Since this uses the `unsafe` package, compatibility issues may arise when upgrading Go versions
    - The [Go 1 compatibility promise](https://go.dev/doc/go1compat) document explicitly states that compatibility for `unsafe` behavior is not guaranteed:
    > Use of package unsafe. Packages that import unsafe may depend on internal properties of the Go implementation. We reserve the right to make changes to the implementation that may break such programs.

3. Code safety and portability may be reduced
    - The [`unsafe` package specification](https://go.dev/ref/spec#Package_unsafe) warns:
    > A package using unsafe must be vetted manually for type safety and may not be portable.

## Conclusion

This optimization technique should only be used when truly necessary. Consider it in the following situations:

1. When profiling confirms that `string` ↔ `[]byte` conversion is an actual bottleneck
2. When the converted data is only read, never mutated
3. When you are on a performance-critical hot path

In most situations, sticking with the standard conversion is a perfectly good choice.

## Addendum

When searching with keywords like "golang zero allocation string convert", you may come across blog posts claiming conversions up to 140× faster, such as [Boosting String and Bytes Conversions Speed by 140x with Zero Allocation in Go](https://www.josestg.com/posts/golang/boosting-string-and-bytes-conversions-speed-by-140x-with-zero-allocation-in-go/). However, this is the result of [flawed benchmark code](https://github.com/josestg/zerocast/blob/44a4ab3d5e731c3716032d33504693df9ea6f75b/zerocast_test.go#L34). Since `string` ⇄ `[]byte` conversion is inherently very fast, results close to 1ns can be perfectly normal — but when results consistently fall *below* 1ns, that's typically a sign of inline optimization at compile time, and the benchmark code in that post is no exception.

A similar case can be seen in [As of go 1.22, there's no need to use the unsafe package for string to bytes conversion · Issue #124656 · kubernetes/kubernetes](https://github.com/kubernetes/kubernetes/issues/124656), where the results are likewise attributable to a benchmarking mistake.