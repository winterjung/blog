---
title: 시간에 구애받지 않고 랜덤하게 실패하지 않는 테스트 방법
image: images/deterministic.png
---

지난 7월 [Go To Jeju 2024 행사](https://festa.io/events/5326)와 10월의 [GopherCon Korea 2024 행사](https://festa.io/events/5098)에서 [《Deterministic testing in Go》](https://docs.google.com/presentation/d/1McSu37lwrKIDgd460XAFbTOMD9NH1ik2sYdofNSzbuE/edit?usp=sharing) 주제로 발표를 했다.
발표에서는 코드에서 `time.Now()`를 사용하더라도 어떻게 시간에 구애받지 않고, 랜덤값이 있거나 고루틴을 사용해도 결정론적으로 테스트할 수 있는지 다뤘는데 이를 글로 옮겼다.
만약 발표 영상을 보고 싶다면 [DAY1 GopherCon Korea 2024 라이브 영상](https://www.youtube.com/live/zdMuLvK0pNg&t=16102) 혹은 아래 영상을 참고할 수 있다.

<iframe width="560" height="315" src="https://www.youtube.com/embed/zdMuLvK0pNg?si=XPAY-aAdWVa63eG3&amp;start=16102" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

## Deterministic testing

- 결과를 예측할 수 없는 테스트
- 네트워크 호출에 의존하거나: 언제나 실패할 수 있음
- 파일을 읽고 쓰거나: 실패할 수 있음
- 임의의 값을 사용하거나: 어떤 값이 생성될 지 (정해져 있지만) 우린 예측할 수 없음
- 동시에 실행하거나: 순서가 일관되지 않음

## Flaky testing

- Non-deterministic 요소 때문에 때론 성공, 때론 실패하는 테스트
- 깨진 유리창: ‘원래 종종 ❌ 뜨고 실패하니까’
- 불필요하게 테스트 시간을 늘어뜨림
- 프로덕션 배포의 잠재 위협 요소

## 몽키 패칭

- 예전엔 [bouk/monkey 패키지](https://github.com/bouk/monkey)를 이용할 수 있었지만
- 최신 버전에선 더 이상 동작하지 않고
- 병렬 테스트에서 안되거나
- m1 mac 이상의 arm64 아키텍처에선 안되거나 하는 문제가 존재

## 랜덤 값을 고정하기

- 단순 샘플링 때문에 사용할 수도 있고 다양한 사례에서 랜덤 사용
- `rand.Seed`로 시드를 고정시켜볼 수 있었으나
- 1.20부턴 `rand.New(rand.NewSource(...))`로 반환된 rander를 써야함
- 결국 rander를 주입받아 쓰는게 속 편함

```go
// ❌
func sampling(rate float64) bool {
    // non-deterministic
    return rand.Float64() < rate
}

// ✅
func sampling2(r rand.Rand, rate float64) bool {
    return r.Float64() < rate
}

// ✅
func sampling3(r rand.Rand) func(float64) bool {
    return func(rate float64) bool {
        return r.Float64() < rate
    }
}

// ✅
func sampling4(randFn func() float64, rate float64) bool {
    return randFn() < rate
}
```

- 혹은 아래처럼 단순 샘플링 함수가 아니라 아예 그 역할을 id generator, logging decider처럼 그 역할을 인터페이스로 빼서 주입하는 방법도 권장
- 이러면 역할에 따라 인터페이스를 확장할 수 있어 종종 유용함

```go
// ✅
type sampler interface {
    Sample(float64) bool
}

type randSampler struct {
    randFn func() float64
}

func (s *randSampler) Sample(rate float64) bool {
    return s.randFn() < rate
}

// 항상 샘플링 하지 않는다.
type neverSampler struct {}

func (s *neverSampler) Sample(float64) bool { return false }

// 항상 샘플링한다.
type alwaysSampler struct {}

func (s *alwaysSampler) Sample(float64) bool { return true }
```

## 생성되는 값을 테스트하기

- 해시처럼 input으로 넣었던 인자의 expected를 계산하기 쉬운 경우도 있음
- 처음에 테스트 함수를 실행시켜보고 그 output을 expected로 복사 붙여넣기 하기도 함

```go
func TestHash(t *testing.T) {
    hashed := sha256.Sum256([]byte("hello"))
    s := hex.EncodeToString(hashed[:])
    assert.Equal(t, "...", s)
}

// Error:
//     Not equal:
//     expected: "..."
//     actual  : "2cf24dba5fb0a30e...425e73043362938b9824" // Copied!
```

- 다만 단순 해시값을 생성하는 게 아니라 uuid, nonce 같은 랜던 값을 생성한다면 실행할 때 마다 값이 달라져 예측할 수 없음
- 아까와 마찬가지로 이름이 new func든 factory든 생성 함수를 인자로 받아야 함

```go
// ❌
func TestUUIDEventLogger(t *testing.T) {
    logger := NewEventLogger()

    logger.Log()
    // Output:
    // 8a18ead2-c292-4998-be08-ce0f1b5936c5
    // 2885f037-494e-4910-89fe-c7160ebf5e61
}

// ✅
func TestFixedEventLogger(t *testing.T) {
    logger := NewEventLogger(func() string {
        return "00000000-0000-0000-0000-123456789012"
    })

    logger.Log()
    // Output:
    // 00000000-0000-0000-0000-123456789012
}
```

- 항상 고정된 값이 아니라 로직에 따라 적절히 달라지는 값을 원한다면 클로져를 활용해볼 수 있음

```go
// ✅
func TestAtomicEventLogger(t *testing.T) {
    var cnt int32
    mockUUIDFunc := func() string {
        atomic.AddInt32(&cnt, 1)
        return fmt.Sprintf("00000000-0000-0000-0000-%012d", cnt)
    }
    logger := NewEventLogger(mockUUIDFunc)
    logger.Log()
    // Output:
    // 00000000-0000-0000-0000-000000000001
    // 00000000-0000-0000-0000-000000000002
}
```

- 기존 코드 수정이 어렵다면 값 그 자체보다는 의도된 포맷인지 그 속성을 검사하는 방법도 권장
  - e.g. 특정 문자열이나 알파벳의 조합으로만 되어있는지, 정해진 길이를 만족하는지

```go
// other_pkg.go
const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func NewNonce() string {
    b := make([]byte, 16)
    for i := range b {
        b[i] = charset[rand.Intn(len(charset))]
    }
    return string(b)
}

// my_test.go
func TestNewNonce(t *testing.T) {
    result := NewNonce() // Output: Imq61MBEGBVxXQ2l, eU1XBzYOqUFlTQeL

    assert.Len(t, result, 16)
    for _, r := range result {
        assert.Contains(t, charset, string(r))
    }
}
```

## go 언어 특성상 flaky test가 발생하기 쉬운 지점

1. [map은 순회할 때 순서가 보장되지 않음](https://go.dev/blog/maps#iteration-order)
    - 때문에 map을 순회하며 slice에 저장하고 마지막에 정렬을 하거나

```go
// ❌
func unstableUniq(candidates []string) []string {
    uniq := make(map[string]bool)
    for _, k := range candidates {
        uniq[k] = true
    }

    keys := make([]string, 0)
    for k := range uniq { // unstable
        keys = append(keys, k)
    }

    return keys
}

// ✅
func stableSortUniq(candidates []string) []string {
    uniq := make(map[string]bool)
    for _, k := range candidates {
        uniq[k] = true
    }

    keys := make([]string, 0)
    for k := range uniq {
        keys = append(keys, k)
    }
    sort.Strings(keys) // stable
    return keys
}
```

- 
  - 가능한 경우 slice를 순회하며 map은 룩업 보조용으로만 쓸 수 있음

```go
// ✅
func stableUniq(candidates []string) []string {
    keys := make([]string, 0)
    uniq := make(map[string]bool) // 룩업용 보조 map
    for _, k := range candidates {
        if uniq[k] {
            continue
        }
        uniq[k] = true
        keys = append(keys, k)
    }

    return keys
}
```

2. 고루틴을 쓸 때 실행 순서가 보장되지 않음
3. 값을 모두 수신할 수 있는 채널이 여러개 있다면 랜덤하게 select 됨
    - e.g. quit 시그널 받았을 때 큐 용도로 쓰는 채널이 있다면 해당 채널을 drain 해줘야 함
4. go 언어를 쓰다보면 자주 쓰게되는 protojson, prototext의 특이사항. [marshal된 값이 그때그때 `{“a”: “b”}`일 수도 `{“a”:“b”}`일 수도 있다.](https://github.com/golang/protobuf/issues/1121)
    - 프로세스 안에서는 고정적이기에 문자열을 expected로 쓰는 대신 `assert.JSONEq`같은 함수를 사용하거나 `mustMarshalJSON`같은 헬퍼 함수를 만들어 사용해야함

```go
// marshal_test.go
func mustMarshalJSON(m proto.Message) []byte {
    marshaler := protojson.MarshalOptions{}

    b, err := marshaler.Marshal(m)
    if err != nil {
        panic(err)
    }
    return b
}

func TestPublishedProtoEvent(t *testing.T) {
    event := &proto.Event{
        Name: "hello",
    }
    publishedEvent := publish(event)
    // ❌
    assert.Equal(t, `{"source": {"name": "hello"}}`, publishedEvent)
    // ✅
    assert.JSONEq(t, `{"source": {"name": "hello"}}`, publishedEvent)
    // ✅
    assert.Equal(t, mustMarshalJSON(&proto.PublishedEvent{
        Source: &proto.Event{
            Name: "hello",
        },
    }), publishedEvent)
}
```

## 시간에 구애받지 않는 테스트

- 내부적으로 `time.Now()`를 쓰는 `time.Since(t)`, `time.Until(t)` 사용을 피해야 함
- 코드에서 `time.Now()` 대신 앞서 말한 내용과 마찬가지로 time func, now func 따위의 이름으로 현재 시각을 반환하는 함수를 인자로 전달받아 사용해야함

```go
// ❌
func isExpired(t time.Time) bool {
    return t.Before(time.Now())
}

// ✅
func isExpired(t, now time.Time) bool {
    return t.Before(now)
}

// 아래처럼 선언해두면 용도에 맞게 nowFunc를 주입할 수 있음
func handler(db *sql.DB, nowFunc func() time.Time) handlerFunc {
    return func(ctx context.Context, r http.Request) (http.Response, error) {
        token := getTokenFromDB(db)
        if isExpired(token.Expiry, nowFunc()) {
            // ...
        }
    }
}

// main.go
func main() {
  // ...
  handler(db, time.Now)
}

// handler_test.go
func TestHandler(t *testing.T) {
    // ...
    mockNow := func() time.Time {
        return time.Date(2024, 7, 13, 0, 0, 0, 0, time.UTC)
    }
    resp, err := handler(mockDB, mockNow)(ctx, req)
}
```

- 예를 들면 흔하게 사용하는 exponential backoff 로직도 보다 명시적으로 검증 가능

```go
func TestExponentialBackoff(t *testing.T) {
    // Given
    // 실행 횟수에 따라 의도된 backoff 시간이 나오는지 검증하기 위한 sleep 함수와 카운터
    var count int32
    sleepFunc := func() func(time.Duration) {
        expectedIntervals := []time.Duration{
            1 * time.Second, 2 * time.Second,
            4 * time.Second, 8 * time.Second,
        }
        return func(d time.Duration) {
            assert.Equal(t, expectedIntervals[count], d)
            count++
        }
    }()

    srv := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        assert.Equal(t, "/users/some-user-id", r.URL.Path)
        w.WriteHeader(http.StatusServiceUnavailable)
    }))
    t.Cleanup(srv.Close)

    client := NewUserServiceClient(
        srv.URL,
        sleepFunc,
    )

    // When
    ctx := context.Background()
    resp, err := client.GetUser(ctx, &GetUserRequest{
        UserID: "some-user-id",
    })

    // Then
    assert.EqualError(t, err, "503: Service Unavailable")
    assert.Equal(t, 5, count)
}
```

- sleep, ticker, timer, after 등 좀 더 복잡해지면 [jonboulle/clockwork 패키지](https://github.com/jonboulle/clockwork)를 쓰거나 해당 패키지처럼 clock 인터페이스를 정의해 사용하길 권장함

```go
type Clock interface {
    After(d time.Duration) <-chan time.Time
    Sleep(d time.Duration)
    Now() time.Time
    Since(t time.Time) time.Duration
    NewTicker(d time.Duration) Ticker
    NewTimer(d time.Duration) Timer
    AfterFunc(d time.Duration, f func()) Timer
}
```

## 고루틴 잘 테스트하기

- 고루틴 사용이 쉽다보니 아래처럼 코드를 짜곤 함

```go
func userRegisterHandler(cli emailClient) {
    // ...
    go sendEmail(cli, newUser)
}

func TestIsEmailSent(t *testing.T) {
    cli := &mockEmailClient{/* ... */}
    err := handler(cli)
    assert.NoError(t, err)

    // 고루틴 기다리기
    time.Sleep(100 * time.Millisecond)
    assert.Len(t, cli.sentEmails, 1)
}
```

- 고루틴을 테스트하고 싶다면 단순 fire and forgot보다 더 관리의 영역으로 둬야함
- 다른 고루틴을 트리거하는 [`runtime.Gosched()` 함수](https://pkg.go.dev/runtime#Gosched)로도 해당 고루틴의 실행을 보장할 수 없음
- [stretchr/testify 패키지](https://github.com/stretchr/testify)를 쓴다면 `assert.Eventually` 함수를 사용하거나

```go
func TestIsEmailSent(t *testing.T) {
    cli := &mockEmailClient{}
    handler(cli)

    assert.Eventually(t, func() bool {
        return cli.sentEmails > 0
    }, time.Second, 100*time.Millisecond)
}
```

- 전달한 의존성의 채널을 소비하거나 wait group을 만료시키는 방식으로 테스트해볼 수 있음

```go
func (c *mockEmailClient) SendEmail(title, body string) {
    c.sentEmails = append(c.sentEmails, title)
    c.sent <- struct{}{}
}

func TestIsEmailSent(t *testing.T) {
    cli := &mockEmailClient{sent: make(chan struct{})}
    handler(cli) // go sendEmail(cli, newUser) 수행
    <-cli.sent
    assert.Len(t, cli.sentEmails, 1)
}

// 혹은 mock 객체를 만들어주는 도구에 따라 Do hook의 func에서 해당 로직을 수행할 수도 있음
```

- 고루틴 실행 순서에 민감하다면 go 키워드, `sync/errgroup`, `sync.WaitGroup` 대신 Group같은 인터페이스를 선언해 메커니즘 자체를 의존성으로 사용해볼 수 있음

```go
type Group interface {
    Go(f func() error)
    Wait() error
}

// implemented using sync.WaitGroup, golang.org/x/sync/errgroup
type syncGroup struct {}

// for testing
type sequentialGroup struct {}

func handler(g Group) {
    g.Go(func() error {
        return nil
    })
    if err := g.Wait(); err != nil {
        // ...
    }
}
```
- fanout 결과를 담을 땐 mutex + append, 채널보단 정해진 인덱스에 assign 하는 방식을 권장
    - 로직에 따라 zero value 필터링이 필요해질 수 있음

```go
// ❌
func TestFanOutWrongWay(t *testing.T) {
    var wg sync.WaitGroup
    result := make([]int, 0)
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()

            result = append(result, i) // 단순 append
        }(i)
    }
    wg.Wait()

    assert.Len(t, result, 10) // 10개가 아님
}

// ⚠️
func TestFanOutNonDeterministic(t *testing.T) {
    var mu sync.Mutex
    var wg sync.WaitGroup
    result := make([]int, 0)
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()
            mu.Lock() // lock 후 append
            defer mu.Unlock()
            result = append(result, i)
        }(i)
    }
    wg.Wait()

    // 10개지만 순서가 항상 다름
    assert.Len(t, result, 10) // [1 9 5 6 7 8 0 2 3 4]
}

// ✅
func TestFanOut(t *testing.T) {
    var wg sync.WaitGroup
    result := make([]int, 10)
    for i := 0; i < 10; i++ {
        wg.Add(1)
        go func(i int) {
            defer wg.Done()

            result[i] = i // assign
        }(i)
    }
    wg.Wait()

    assert.Len(t, result, 10) // [0 1 2 3 4 5 6 7 8 9]
}
```

## Flaky test 탐지하기

- 가끔 github actions같은 ci에서 실패했는데 re-run하니 성공하는 식으로 알게됨
- 약간 무식해보이지만 `go test -count 10` 혹은 100 하면 더 쉽게 관측됨
- 1.17부턴 `go test -shuffle on` 옵션으로 테스트 순서를 섞어 좀 더 색출해낼 수 있음
- [gotestyourself/gotestsum](https://github.com/gotestyourself/gotestsum#re-running-failed-tests)같은 도구로 테스트 retry를 자동으로 시도해볼 수 있음
  - 실패해서 재시도해봤는데 성공하면 flaky 하다고 가늠해볼 수 있음
- 테스트에 불안정함을 표시할 수 있는 기능, 자동으로 재시도하는 기능관련 제안([golang/go#62244](https://github.com/golang/go/issues/62244))이 수락되어 미래 릴리즈 버전에 자체 구현될수도 있음 

## 마치며

앞서 말한 내용을 한 줄로 요약해보자면 결국은 의존성을 인자로 잘 넘겨 쓰자는 얘기다. 앞의 코드 예시와 상당 내용이 go 언어와 관련된 내용이긴 하지만 개발할 때 보편적으로 적용해볼 수 있으리라 기대한다.

## 추가 자료

- [권민재님](https://github.com/mingrammer)의 [시간에 의존하는 코드를 위한 테스트 작성하기](https://mingrammer.com/writing-unit-test-for-time-dependent-code/) 블로그 글에서도 비슷한 주제를 다룬다.
