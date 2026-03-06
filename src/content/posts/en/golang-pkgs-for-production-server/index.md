---
title: Go Package Recommendations for Production Server Development
date: 2026-03-04
image: ./golang-pkgs.png
---

I started using Go at my previous job and have continued using it at my current job — about five years of active use in total.
Compared to the early days, the Go ecosystem has grown increasingly rich: communities like [GopherCon Korea](https://gophercon.kr/ko) have emerged, and reference material keeps expanding.
That said, well-organized Korean-language resources are still relatively scarce (not that Go is unique in this regard), and there's still a fair amount of trial and error involved. To share what I've learned alongside colleagues over the years, I previously wrote up our trial and error and best practices in two posts: [Golang and gRPC in Production](https://blog.banksalad.com/tech/production-ready-grpc-in-golang/) and [Banksalad Go Coding Conventions](https://blog.banksalad.com/tech/go-best-practice-in-banksalad/).
In a similar vein, this post is a roundup of the packages<sub>libraries</sub> I've found most useful and frequently reached for while doing server development in Go.
Go's standard library certainly has plenty of reliable, well-crafted packages — [`net/http/httptest`](https://pkg.go.dev/net/http/httptest) and [`crypto/rand`](https://pkg.go.dev/crypto/rand) come to mind — but this post focuses on third-party packages.

> Every time I write something like this, I second-guess myself: "Anyone could find this by just searching 'golang xxx package' — is there even a point?" Still, I hope this saves someone the decision-making overhead and the guesswork, and that the responses from readers help make it even better over time.
>
> Update: In the [2025 Go Developer Survey](https://go.dev/blog/survey2025#challenges), 26% of respondents said "finding reliable Go modules and packages" was one of the biggest challenges they face as Go developers — so hopefully this post pulls its weight.

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
- Makes Go's already powerful testing capabilities richer and more enjoyable to write.
  - Instead of `if got != expected { t.Errorf("...") }`, you can write `assert.Equal(t, expected, got)`, which is a bit easier to read.
- The packages you'll reach for most are [assert](https://pkg.go.dev/github.com/stretchr/testify/assert) and [require](https://pkg.go.dev/github.com/stretchr/testify/require).
  - `require` is nearly identical to `assert`, except that a failure immediately stops the test.
  - If you're coming to Go from another language, `require`'s behavior will probably feel more familiar.
  - Using `assert` lets subsequent assertions in the same test still run, so you can see multiple failures at once — which can be a real help when debugging.
  - In a given/when/then structure, `require` is great for the *given* phase — client initialization and any setup steps that simply must succeed.
* testify comes with a wide variety of assertion functions, so it's worth exploring and making the most of them.
* The [suite package is designed for people coming from object-oriented languages](https://github.com/stretchr/testify#suite-package), so if you're just getting started, the `assert` package alone is more than enough.
  * Keep in mind that as of v1, parallel tests are not supported.
* Pairs well with the [Antonboom/testifylint](https://github.com/Antonboom/testifylint) linter.

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
- Both logging packages support contextual and structured logging.
  - For server-side logging, one-line JSON logging is always recommended.
- zerolog is said to have better performance, but both are solid packages for production use.
  - logrus is in maintenance mode, but keep in mind that it's already feature-rich and continues to receive security patches.
  - Personally, I found logrus more ergonomic than zerolog thanks to its `WithFields` method.
- Both support hooks, which makes them great for recording metrics alongside logs or injecting stack traces.
- `log/slog`, included in the standard library since Go 1.21, is also a worthwhile alternative to consider.
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
- Adds context and stack traces to errors.
- Born out of the limitations of the `errors` standard library before Go 1.13, it remains a de-facto standard even [after `Unwrap`, `Is`, and `As` were introduced](https://go.dev/blog/go1.13-errors).

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
- I often reach for this when validating configs or requests, since it lets you surface richer error information all at once.
- `multierror.Group` (included in the package) also comes in handy when you need to fan out goroutines and collect each of their errors.
- A similar option is the semi-standard library package [golang.org/x/sync/errgroup](https://pkg.go.dev/golang.org/x/sync/errgroup).
  - Keep in mind that with this package, if one goroutine errors, the error propagates to the others and cancels their work — so choose based on your situation.
  - multierror, by contrast, runs all goroutines to completion and then merges the errors.

## [samber/lo](https://github.com/samber/lo)

```go
names := lo.Uniq([]string{"Samuel", "John", "Samuel"})
// []string{"Samuel", "John"}
```

> A Lodash-style Go library based on Go 1.18+ Generics (map, filter, contains, find...)
- Leverages generics (Go 1.18+) to help you write less boilerplate without any performance penalty.
- Personally used `Map`, `SliceToMap`, and `Keys` the most.
  - Unlike before, the [maps](https://pkg.go.dev/maps) and [slices](https://pkg.go.dev/slices) packages introduced in Go 1.21 now cover a lot of the same ground — worth checking out.
- The same maintainer has two other packages: [samber/do](https://github.com/samber/do) for dependency injection and [samber/mo](https://github.com/samber/mo) for monads — but I didn't end up using either, as they don't align with my preferred Go code conventions.

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
- Another decimal package, [ericlagergren/decimal](https://github.com/ericlagergren/decimal), also exists, but `shopspring/decimal` was significantly more ergonomic to use.
- Maps well with the decimal types in ORM libraries.
- If performance is a concern, I'd recommend running benchmarks against the other packages mentioned in the readme.

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
- A solid choice when you need a high-performance in-memory local cache in production.
  - For background on why this package was built and what it prioritizes, check out the [Introducing Ristretto blog post](https://web.archive.org/web/20250207211235/https://dgraph.io/blog/post/introducing-ristretto-high-perf-go-cache/).
  - Optimal configuration varies by situation, so it's recommended to determine your settings through metrics and benchmarking.
- Generics are supported.
  - The [patrickmn/go-cache](https://github.com/patrickmn/go-cache) package does not support generics and is no longer maintained, so it's not recommended.
- If you need further performance tuning under high traffic, [creativecreature/sturdyc](https://github.com/creativecreature/sturdyc) and [maypok86/otter](https://github.com/maypok86/otter) are worth looking into.
  - For a deeper dive into what matters most in a local cache for performance, [Writing a very fast cache service with millions of entries in Go](https://blog.allegro.tech/2016/03/writing-fast-cache-service-in-go.html) is worth a read.

## [coocood/freecache](https://github.com/coocood/freecache)

```go
cacheSize := 100 * 1024 * 1024 // 100MB
cache := freecache.NewCache(cacheSize)

cache.Set([]byte("key"), []byte("value"), 60) // 60 seconds TTL
value, err := cache.Get([]byte("key"))
```

> A cache library for Go with zero GC overhead
- An in-memory local cache that minimizes GC overhead. It uses only 512 pointers regardless of the number of entries.
- It allocates a separate memory block (ring buffer), so the GC has fewer objects to read during mark-and-sweep.
- However, both keys and values must be serialized as `[]byte`. If you're already using protobuf, the migration cost is low.
  - It's most useful when heap GC overhead outweighs serialization overhead.
- If ristretto is a general-purpose local cache, freecache is better suited for large-scale caches where GC tuning matters.

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
- Rather than managing DB models in Go code, it generates Go code that follows your already-existing DB schema.
- The experience of building queries was great too — instead of writing raw strings, you can use the already-generated types directly.
- There are other packages out there, but from personal experience, [sqlc-dev/sqlc](https://github.com/sqlc-dev/sqlc) felt cumbersome to use, and [go-gorm/gorm](https://github.com/go-gorm/gorm) is worth trying if it suits your taste.
- That said, sqlboiler has [entered maintenance mode](https://github.com/aarondl/sqlboiler#maintenance-mode). Only minimal upkeep like security patches is being done, so for new projects it's worth exploring alternatives.
  - [sqlc-dev/sqlc](https://github.com/sqlc-dev/sqlc) generates type-safe code from SQL queries, and [stephenafamo/bob](https://github.com/stephenafamo/bob) is a type-safe query builder that's closer to a spiritual successor to sqlboiler.
  - Reference: [Golang ORM, Which One Is Good?](https://blog.billo.io/devposts/go_orm_recommandation/)

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
- Useful for unit testing whether the intended SQL statements are executed when using mysql, postgresql, etc.
  - The package path feels a bit odd when you use it, but it doesn't cause any real problems.
- Not recommended if you're the type who thinks, "Why do I have to write and verify SQL statements by hand?!"

## [golangci/golangci-lint](https://github.com/golangci/golangci-lint) & [mvdan/gofumpt](https://github.com/mvdan/gofumpt)

```yaml
# .golangci.yml
linters:
  enable:
    - govet
    - errcheck
    - staticcheck

formatters:
  enable:
    - gofumpt
  settings:
    gofumpt:
      extra-rules: true
```

> golangci-lint: Fast linters runner for Go / gofumpt: A stricter gofmt
- golangci-lint is the de facto linter runner for Go. It integrates 100+ linters and runs them in parallel, making it fast enough to use in CI.
- gofumpt is a stricter formatter than gofmt, useful for enforcing a consistent code style across your team.
- By including gofumpt in your golangci-lint config, you can run linting and formatting in a single pass.

## [failsafe-go/failsafe-go](https://github.com/failsafe-go/failsafe-go)

```go
retryPolicy := retrypolicy.NewBuilder[*http.Response]().
	HandleIf(func(r *http.Response, err error) bool {
		return r != nil && r.StatusCode == http.StatusTooManyRequests
	}).
	WithBackoff(time.Second, 30*time.Second).
	WithMaxRetries(3).
	Build()

resp, err := failsafe.With(retryPolicy).Get(func() (*http.Response, error) {
	return http.Get("https://example.com")
})
```

> Fault tolerance and resilience patterns for Go
- A fault tolerance package that provides useful patterns similar to Java's resilience4j.
- You can combine various components and policies including retry, circuit breaker, rate limiter, bulkhead, and adaptive throttler.
- If you only need lightweight retry, go-retryablehttp below is sufficient; if you need comprehensive resilience patterns, failsafe-go is the way to go.

## [hashicorp/go-retryablehttp](https://github.com/hashicorp/go-retryablehttp)

```go
client := retryablehttp.NewClient()
client.RetryMax = 3

resp, err := client.Get("https://example.com/api")
```

> Retryable HTTP client in Go
- A thin retry layer on top of `net/http`.
- It lets you add retry logic while keeping almost the same `http.Client` API, so the adoption cost is low — worth using.

## [twmb/franz-go](https://github.com/twmb/franz-go)

```go
// producer
client, _ := kgo.NewClient(kgo.SeedBrokers("localhost:9092"))
defer client.Close()

ctx := context.Background()
client.Produce(ctx, &kgo.Record{Topic: "my-topic", Value: []byte("hello")}, nil)

// consumer
client, _ := kgo.NewClient(
	kgo.SeedBrokers("localhost:9092"),
	kgo.ConsumeTopics("my-topic"),
	kgo.ConsumerGroup("my-group"),
)
for {
	fetches := client.PollFetches(ctx)
	fetches.EachRecord(func(r *kgo.Record) {
		fmt.Println(string(r.Value))
	})
}
```

> franz-go is a feature complete, pure Go library for Kafka from 0.8.0 through 4.1+. Producing, consuming, transacting, administrating, etc.
- A pure Go Kafka package. I don't recommend [confluent-kafka-go](https://github.com/confluentinc/confluent-kafka-go) — it requires a cgo environment and a librdkafka dependency, which makes the build environment a hassle.
- The package API is ergonomic and the plugins it provides are genuinely useful.
- sarama is the long-standing de facto choice with a wide ecosystem, but for new projects I'd recommend franz-go.

## [go-resty/resty](https://github.com/go-resty/resty) & [dghubble/sling](https://github.com/dghubble/sling)

```go
// resty
client := resty.New()
resp, err := client.R().
	SetHeader("Accept", "application/json").
	SetResult(&ApiResponse{}).
	Get("https://api.example.com/users/1")

// sling
type Issue struct {
	Title string `json:"title"`
	Body  string `json:"body"`
}
issue := new(Issue)
resp, err := sling.New().Base("https://api.github.com/").
	Path("repos/user/repo/").
	Get("issues/1").
	ReceiveSuccess(issue)
```

> go-resty: Simple HTTP, REST, and SSE client library for Go / dghubble/sling: A Go HTTP client library for creating and sending API requests
- `net/http` alone is sufficient in most cases, but these are useful when writing a structured API client.
- resty: Offers a rich feature set including a chaining API, automatic JSON marshaling, and built-in retry.
- sling: A lightweight, composable API builder — more minimal in approach.

## [go-chi/chi](https://github.com/go-chi/chi)

```go
r := chi.NewRouter()
r.Use(middleware.Logger)
r.Use(middleware.Recoverer)

r.Get("/", func(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("hello"))
})
r.Route("/users", func(r chi.Router) {
	r.Get("/", listUsers)
	r.Post("/", createUser)
	r.Get("/{userID}", getUser)
})

http.ListenAndServe(":3000", r)
```

> lightweight, idiomatic and composable router for building Go HTTP services
- While echo is widely known, chi is more go-ish. It's fully compatible with `net/http` handlers and is lightweight.
- If you have a small number of routes, the `net/http` routing improvements in Go 1.22+ may be enough. See: [Routing Enhancements for Go 1.22](https://go.dev/blog/routing-enhancements)
- [Don't use gin](https://eblog.fly.dev/ginbad.html).

## Miscellaneous
- If you need to send something via Slack, use [slack-go/slack](https://github.com/slack-go/slack).
- If you need the GitHub API, use [google/go-github](https://github.com/google/go-github).
  - It releases updates frequently, so keep it up to date regularly.
- If you need Sentry, refer to the official docs and use [getsentry/sentry-go](https://github.com/getsentry/sentry-go).
  - Note that out of the box, error grouping doesn't work well and requires some tuning — I plan to cover that in a separate post.
- If you need to write to a map concurrently from goroutines, use [syncmap](https://pkg.go.dev/golang.org/x/sync/syncmap).
  - Keep in mind that concurrent writes to a map will cause a panic (which is at least easy to catch), but the same is not true for slices — those fail silently, so be careful.
- If you need to work with semantic versioning, use [Masterminds/semver](https://github.com/Masterminds/semver).
- If you need UUIDs, use [google/uuid](https://github.com/google/uuid).
  - It supports UUID v7 as well.
  - If you need shorter IDs, consider something like [matoous/go-nanoid](https://github.com/matoous/go-nanoid).
  - [oklog/ulid](https://github.com/oklog/ulid): a shorter ID that sorts by timestamp — we use it in production. UUID v7 also supports timestamp-based sorting, but it's a minor annoyance that you can't copy it with a double-click in one shot.
- If you're deploying to Kubernetes, use [uber-go/automaxprocs](https://github.com/uber-go/automaxprocs) to properly configure your CPU settings.
  - Without it, you might end up with 32 `GOMAXPROCS` when the pod is only allocated 1 CPU — that kind of thing.
- If you're recording StatsD metrics, use [smira/go-statsd](https://github.com/smira/go-statsd).
  - I recommend declaring a separate interface on the consumer side and using it alongside a noop client implementation. It makes testing much easier.
- If you're using Redis, use [redis/rueidis](https://github.com/redis/rueidis).
  - The builder pattern may be polarizing, but the performance is solid.
  - rueidis shares the same maintainer and codebase as [valkey-go](https://github.com/valkey-io/valkey-go), so it supports both Valkey and Redis.
  - [redis/go-redis](https://github.com/redis/go-redis) is perfectly usable as a baseline, but [there are known issues connecting to ElastiCache cluster mode at large scale](https://github.com/redis/go-redis/issues/2046), so I'd recommend rueidis for high-traffic environments.
  - If you want to write unit tests, pair it with [alicebob/miniredis](https://github.com/alicebob/miniredis).
- For integration testing, [testcontainers/testcontainers-go](https://github.com/testcontainers/testcontainers-go) is worth considering.
  - There are many approaches to integration testing depending on your team's setup, but Testcontainers is a solid option to have in the mix.
- If you need internationalization support, check out [biter777/countries](https://github.com/biter777/countries) and [nyaruka/phonenumbers](https://github.com/nyaruka/phonenumbers).
  - countries handles country codes, currencies, languages, and more; phonenumbers is a Go port of Google's libphonenumber. You won't need these often, but they're invaluable when internationalization is a requirement.
- If you're building container images for a CGO-free Go app, [ko-build/ko](https://github.com/ko-build/ko) is worth experimenting with.
  - It builds and pushes your Go app as a distroless image — no Dockerfile needed. Consider it when you need a lightweight alternative to GoReleaser.

---
That wraps up my collection of frequently used and genuinely useful packages. The list skews toward server-side development, and I've left out highly niche packages (e.g., one for computing Levenshtein distance). If there are other packages worth recommending, I'll keep adding to this list over time.

## Other Resources Worth Checking Out
- [mingrammer/go-web-framework-stars](https://github.com/mingrammer/go-web-framework-stars)
- [Which Go router should I use?](https://www.alexedwards.net/blog/which-go-router-should-i-use)
- [Go Libraries/Packages I Like | Ben E. C. Boyter](https://boyter.org/posts/go-libraries-i-like/)