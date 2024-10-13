---
title: 프로덕션 서버 개발을 위한 golang 패키지 추천
image: images/golang-pkgs.png
---

전 직장에서 go 언어를 처음 쓰기 시작해 현 직장에서도 계속 쓰며 약 5년간 활발히 사용하고 있다.
예전과 비교하면 go 생태계는 점점 풍부해지고, [고퍼콘 코리아](https://gophercon.kr/ko)를 비롯한 다양한 커뮤니티도 늘어나고, 레퍼런스도 많아지고 있다.
그럼에도 여전히 (비단 go 언어만 그런 건 아니지만) 잘 정리된 한국어 자료는 적고 시행착오를 겪어봐야 하는 부분이 많아 그동안 여러 동료와 함께 개발하며 겪었던 시행착오와 권장 사항을 [프로덕션 환경에서 사용하는 golang과 gRPC](https://blog.banksalad.com/tech/production-ready-grpc-in-golang/), [뱅크샐러드 Go 코딩 컨벤션](https://blog.banksalad.com/tech/go-best-practice-in-banksalad/) 두 편의 글로 정리하기도 했다.
그와 비슷한 결로 이번엔 주로 go 언어로 서버 개발을 하며 자주 사용하고 유용했던 패키지<sub>라이브러리</sub>를 정리해 봤다.
go 언어에서 기본으로 제공하는 내장 패키지에도 [`net/http/httptest`](https://pkg.go.dev/net/http/httptest), [`crypto/rand`](https://pkg.go.dev/crypto/rand) 패키지처럼 믿고 쓸 수 있고 잘 만들어진 패키지는 많으나 이 글에선 서드 파티 패키지에 집중했다.

> 글을 쓸 때 마다 항상 드는 고민이 '이 정도면 "golang xxx package" 같은 키워드로 검색해도 금방 나올 텐데 괜히 적는 거 아닌가?'라는 부분이다. 그럼에도 누군가의 의사결정 비용과 고민을 줄여주길 바라며, 또 이 글을 읽은 다양한 사람들이 얹어주는 한마디씩을 통해 이 글이 더 발전되길 바라며 소개해 본다.

## [stretchr/testify](https://github.com/stretchr/testify)
```go
func TestSomething(t *testing.T) {
  assert.Equal(t, expected, got, "they should be equal")
  assert.NoError(t, err)
  assert.Len(t, result, 1)
  assert.JSONEq(t, `{"name": "hello"}`, msg)
}
```
> A toolkit with common assertions and mocks that plays nicely with the standard library
- go 언어의 강력한 테스트 기능을 더 풍부하고 작성하기 즐겁게 만들어 준다.
  - `if got != expected { t.Errorf("...") }` 대신 `assert.Equal(t, expected, got)` 코드로 쓸 수 있어 좀 더 읽기 쉬워지는 측면도 있다.
- 주로 [assert](https://pkg.go.dev/github.com/stretchr/testify/assert), [require](https://pkg.go.dev/github.com/stretchr/testify/require) 패키지를 적극 사용한다.
  - require 패키지는 assert와 거의 같은데 실패하면 그 테스트가 그대로 종료되는 점이 다르다.
  - 아마 다른 언어를 쓰다 go 언어로 넘어왔다면 require 패키지의 동작이 좀 더 익숙할 수 있다.
  - assert 패키지를 사용하면 이후 라인의 assertion까지 실행되기에 한 번에 여러 실패를 볼 수 있어 좀 더 디버깅을 도와주는 측면이 있다.
  - given, when, then으로 나뉘어진 구조에서 client 초기화나 성공해야만 하는 given 부분에선 require를 애용하기도 한다.
* testify엔 다양한 assertion 함수가 있으니 이를 최대한 활용해보길 추천한다.
* [suite 패키지는 객체 지향 언어가 익숙했던 사람을 위해 제공되는 패키지](https://github.com/stretchr/testify#suite-package)라 처음 시작하는 사람은 assert 패키지만으로도 충분하다.
  * 현재 v1 기준으로 병렬 테스트를 지원하지 않아 이 점은 참고해야한다.
* [Antonboom/testifylint](https://github.com/Antonboom/testifylint) 린터와 같이 사용해도 좋다.

## [rs/zerolog](https://github.com/rs/zerolog) & [sirupsen/logrus](https://github.com/sirupsen/logrus)
```go
import (
    "github.com/rs/zerolog"
    "github.com/rs/zerolog/log"
	"github.com/rs/zerolog/pkgerrors"
)

func main() {
	zerolog.ErrorStackMarshaler = pkgerrors.MarshalStack
	// ...
	log.Error().Stack().Err(err).Msg("failed to insert row to db")
}
```
> rs/zerolog: Zero Allocation JSON Logger

```go
import (
	log "github.com/sirupsen/logrus"
)

func main() {
	log.WithFields(log.Fields{
		"animal": "walrus",
	}).Info("A walrus appears")
}
```
> sirupsen/logrus: Structured, pluggable logging for Go.
- 두 로깅 패키지 모두 contextual하고 structed한 로깅을 지원한다.
  - 서버에서 로깅을 할 땐 언제나 one line json logging을 하길 권장한다.
- zerolog가 좀 더 성능이 좋다고 하나 둘 다 프로덕션 레벨에서 사용하기 좋은 패키지다.
  - logrus는 메인테넨스 모드이나 이미 기능이 풍부하고 보안 패치는 계속 이루어지는 점은 참고해야한다.
  - 개인적으론 logrus가 `WithFields` 메서드 때문에 zerolog 대비 사용성이 좋았다.
- 둘 다 hook을 지원해 로그와 함께 메트릭을 찍을 때나 스택트레이스를 주입해주는 용도로 쓰기 좋았다.
- go 1.21 이상 버전부터 표준 라이브러리로 포함된 `log/slog`도 사용해볼만한 대안이다.
  - [Structured Logging with slog - The Go Programming Language](https://go.dev/blog/slog)
  - [Logging in Go with Slog: The Ultimate Guide](https://betterstack.com/community/guides/logging/logging-in-go/)

## [pkg/errors](https://github.com/pkg/errors)
```go
resp, err := userSvc.GetUser(ctx, &GetUserRequest{...})
if err != nil {
	return errors.Wrap(err, "user.GetUser")
}
```
> Simple error handling primitives
- 에러에 컨텍스트와 스택트레이스를 추가해준다.
- go 1.13 이전 시절 `errors` 표준 라이브러리의 기능 부족으로 생겼으나 [Unwrap, Is, As가 편입된 이후](https://go.dev/blog/go1.13-errors)에도 de-facto로 사용된다.

## [hashicorp/go-multierror](https://github.com/hashicorp/go-multierror)
```go
var errs *multierror.Error
if err := step1(); err != nil {
	errs = multierror.Append(errs, err)
}
if err := step2(); err != nil {
	errs = multierror.Append(errs, err)
}
return errs.ErrorOrNil()
// Output:
// 2 errors occurred:
//	* error 1
//	* error 2
```
> A Go (golang) package for representing a list of errors as a single error.
- config나 요청의 유효성을 검사할 때 한 번에 좀 더 풍부한 에러 정보를 얻을 수 있어 종종 사용한다.
- 해당 패키지에 들어있는 `multierror.Group`도 고루틴을 fanout해 실행하고 각각의 에러를 취합해야 할 때 사용하곤한다.
- 비슷하게 준 표준 라이브러리인 [golang.org/x/sync/errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup) 패키지도 존재한다.
  - 해당 패키지는 고루틴 중 하나에서 에러가 발생하면 다른 고루틴으로 에러가 전파되어 작업이 취소되니 상황에 맞게 취사선택하자.
  - multierror는 모든 고루틴을 실행한 뒤 에러를 병합한다.

## [samber/lo](https://github.com/samber/lo)
```go
names := lo.Uniq([]string{"Samuel", "John", "Samuel"})
// []string{"Samuel", "John"}
```
> A Lodash-style Go library based on Go 1.18+ Generics (map, filter, contains, find...)
- go 1.18 이상에서 제네릭을 사용해 성능 손해 없이 좀 더 보일러플레이트 없는 코드를 짤 수 있게 도와준다.
- 주로 `Map`, `SliceToMap`, `Keys` 함수를 많이 사용했다.
  - 예전과 달리 go 1.21부터 생긴 [maps](https://pkg.go.dev/maps), [slices 패키지](https://pkg.go.dev/slices)가 담당해 주는 부분이 많아졌으니 참고해 보면 좋겠다.
- 메인테이너의 다른 패키지로 의존성 주입을 위한 [samber/do](https://github.com/samber/do), 모나드를 위한 [samber/mo](https://github.com/samber/mo) 패키지가 있는데 개인적으로 선호하는 go 코드 컨벤션과 맞지 않아 사용하진 않았다.

## [shopspring/decimal](https://github.com/shopspring/decimal)
```go
func main() {
	price, err := decimal.NewFromString("136.02")
	quantity := decimal.NewFromInt(3)
	subtotal := price.Mul(quantity)

	fmt.Println("Subtotal:", subtotal) // Subtotal: 408.06
}
```
> Arbitrary-precision fixed-point decimal numbers in Go
- 다른 decimal 패키지로 [ericlagergren/decimal](https://github.com/ericlagergren/decimal)도 존재하나 사용성은 `shopspring/decimal`가 훨씬 좋았다.
- orm 라이브러리의 decimal 타입과 잘 매핑된다.
- 성능이 중요하다면 readme에서 소개하는 다른 패키지와 함께 벤치마크를 돌려보길 권장한다.

## [dgraph-io/ristretto](https://github.com/dgraph-io/ristretto)
```go
func main() {
	cache, _ := ristretto.NewCache(&ristretto.Config[string,string]{
		NumCounters: 1e7,     // number of keys to track frequency of (10M).
		MaxCost:     1 << 30, // maximum cost of cache (1GB).
		BufferItems: 64,      // number of keys per Get buffer.
	})
	cache.Set("key", "value", 1)
	value, found := cache.Get("key")
	fmt.Println(value)
}
```
> A high performance memory-bound Go cache
- 프로덕션에서 고성능 로컬 캐시가 필요할 때 무난히 쓸 수 있다.
  - 패키지의 탄생 배경과 주안점은 [Introducing Ristretto 블로그 글](https://dgraph.io/blog/post/introducing-ristretto-high-perf-go-cache/)을 참고하자.
  - 최적의 설정은 상황에 따라 다르므로 여러 메트릭과 벤치마크를 통해 결정하길 권장한다.
- 제네릭도 지원한다.
  - [patrickmn/go-cache](https://github.com/patrickmn/go-cache) 패키지는 제네릭을 지원하지 않고 유지보수 되지 않고 있어 추천하지 않는다.
- 대용량 트래픽에서 좀 더 성능 튜닝이 필요하다면 [creativecreature/sturdyc](https://github.com/creativecreature/sturdyc), [maypok86/otter](https://github.com/maypok86/otter) 패키지도 참고해 볼 수 있다.
  - 성능을 위해선 로컬 캐시에서 무엇이 중요한지 [Writing a very fast cache service with millions of entries in Go](https://blog.allegro.tech/2016/03/writing-fast-cache-service-in-go.html) 블로그 글에서 다루고 있으니 읽어볼 만하다.

## [volatiletech/sqlboiler](https://github.com/volatiletech/sqlboiler)
```go
import (
	"github.com/volatiletech/sqlboiler/v4"
)
func main() {
	users, err := model.Users().All(ctx, db)
	token, err := model.Tokens(model.TokenWhere.AccessToken.EQ(accessToken)).One(ctx, db)
}
	token.Update(ctx, db, boil.Whitelist(
        model.TokenColumns.AccessToken,
        model.TokenColumns.AccessTokenExpiredAt,
    ))
```
> Generate a Go ORM tailored to your database schema.
- go 코드로 db 모델을 관리하는게 아닌, 이미 존재하는 db 모델을 따르는 go 코드를 생성해 준다.
- 쿼리를 만들 때도 string을 직접 사용하지 않고 이미 생성된 타입을 그대로 사용할 수 있어 경험이 좋았다.
- 다른 패키지도 많은데 개인적인 경험으론 [sqlc-dev/sqlc](https://github.com/sqlc-dev/sqlc)는 사용하기가 불편했고, [go-gorm/gorm](https://github.com/go-gorm/gorm)는 취향에 맞다면 사용해볼만 하다 느껴졌다.

## [DATA-DOG/go-sqlmock](https://github.com/DATA-DOG/go-sqlmock)
```go
func TestShouldUpdateStats(t *testing.T) {
	db, mockDB, err := sqlmock.New()
	require.NoError(t, err)
	t.Cleanup(db.Close)

	mockDB.ExpectQuery(regexp.QuoteMeta(
		"SELECT * FROM `token` WHERE (`user_id` = ?);"
	)).WithArgs("some-valid-user-id").WillReturnRows(...)
}
```
> Sql mock driver for golang to test database interactions
- mysql, postgresql 등을 쓸 때 의도한 sql 문이 수행되는지 유닛테스트 하는 용도로 쓸만하다.
  - 쓰다 보면 패키지 경로가 이상한데 싶긴 한데 그래도 별 문제는 없다.
- '왜 사람이 직접 sql 문을 쓰고 검사해야하지?!' 싶은 사람에겐 추천하지 않는다.

## 그 외
- 슬랙으로 뭔가를 보내야 한다면 [slack-go/slack](https://github.com/slack-go/slack)을 쓰자.
- github api가 필요하다면 [google/go-github](https://github.com/google/go-github)을 쓰자.
  - 버전업이 잦으니 틈틈이 업데이트 해주자.
- sentry가 필요하다면 공식 문서를 참고해 [getsentry/sentry-go](https://github.com/getsentry/sentry-go)를 쓰자.
  - 참고로 그냥 쓰면 에러 그룹화가 잘 안돼 튜닝이 필요한데 이 부분은 별도의 블로그 글로 다루고자 한다.
- 고루틴에서 map에 동시에 써야 한다면 [syncmap](https://pkg.go.dev/golang.org/x/sync/syncmap)을 쓰자.
  - 참고로 map은 동시 쓰기를 시도하면 panic이 나서 알아채기가 쉬운데 slice는 그렇지 않아 감지하기 어려우니 주의하자.
- 시맨틱 버저닝으로 뭔갈 해야 한다면 [Masterminds/semver](https://github.com/Masterminds/semver)를 쓰자.
- uuid가 필요하다면 [google/uuid](https://github.com/google/uuid)를 쓰자.
  - uuid v7도 지원한다.
- kubernetes에 배포한다면 [uber-go/automaxprocs](https://github.com/uber-go/automaxprocs)로 cpu 세팅을 맞춰주자.
  - 안 그러면 pod에 할당된 cpu 리소스는 1인데 32가 들어가 있고 그런다.
- statsd 메트릭을 찍는다면 [smira/go-statsd](https://github.com/smira/go-statsd) 를 쓰자.
  - 쓰는 쪽에서 별도의 인터페이스를 선언해 noop client 구현과 함께쓰길 추천한다. 그래야 테스트가 편하다.
- redis를 쓴다면 [redis/rueidis](https://github.com/redis/rueidis)를 쓰자.
  - 빌더 패턴이 호불호가 갈릴 수 있는데 성능이 좋다.
  - 그냥 [redis/go-redis](https://github.com/redis/go-redis)를 써도 기본은 한다.
  - 유닛테스트를 하고 싶다면 [alicebob/miniredis](https://github.com/alicebob/miniredis)와 같이 쓰자.
- 통합 테스트를 한다면 [testcontainers/testcontainers-go](https://github.com/testcontainers/testcontainers-go)도 쓸만하다.
  - 통합 테스트 방법은 조직마다 상황에 따라 많은 방법이 있겠으나 테스트컨테이너도 옵션 중 하나로 고려해보기 좋다.

---
이렇게 그 동안 자주 사용하고 유용한 패키지를 정리해봤다. 위 내용은 서버 개발에 치중되어 있고, 너무 지엽적인 패키지(e.g. 레벤슈타인 거리 구하는 패키지)는 제외했는데 이 외에도 추천할만한 패키지가 있다면 계속 업데이트 할 예정이다.
