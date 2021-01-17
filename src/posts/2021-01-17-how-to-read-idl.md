---
title: IDL 읽는 법 (Protocol Buffers)
---

클라이언트와 서버간 api 명세를 [protocol buffers](이하 protobuf)로 idl<sub>Interface Description Language</sub> 삼아 개발할 때, 이 idl을 어떻게 읽어야 하는지 간단하게 알아보자.

> 서버는 grpc를 지원하지만 클라이언트가 json api 통신을 한다는 가정하에 [grpc-gateway]를 사용한다.

## user 서비스를 예로

사용자 생성, 조회, 수정을 하는 간단한 유저 관리 서비스가 있다고 할 때 아래처럼 protobuf를 source of truth삼아 api 명세를 소통하려한다.
아래같은 protobuf 파일은 해당 유저 서비스 레포에 존재하거나 조직의 공통 protobuf 관리 레포에 있거나 할텐데 그래서 어느 endpoint에 어떤 요청을 보내야 하는지 헷갈릴 수 있다.

파트를 나눠 어떤 요청 응답이 오고가는지 보기에 앞서 서비스에 어떤 api들이 있는지 읽어보자.

```protobuf
syntax = "proto3";

package user;

import "google/api/annotations.proto";
import "google/protobuf/field_mask.proto";
import "google/protobuf/wrappers.proto";

service User {
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse) {
    option (google.api.http) = {
      post: "/v1/users"
      body: "*"
    };
  }
  rpc GetUser(GetUserRequest) returns (GetUserResponse) {
    option (google.api.http) = {
      get: "/v1/users/{user_id}"
    };
  }
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse) {
    option (google.api.http) = {
      patch: "/v1/users/{user_id}"
      body: "update_spec"
    };
  }
}
```

### 읽어보기

#### meta 정보

```protobuf
syntax = "proto3";

package user;

import "google/api/annotations.proto";
import "google/protobuf/field_mask.proto";
import "google/protobuf/wrappers.proto";
```

크게 중요하진 않다. 주로 이 protobuf를 가지고 python, golang, java, swagger 등 다양한 output으로 generate할 때 필요한 정보다.

#### 서비스와 rpc

```protobuf
service User {
  rpc CreateUser;
  rpc GetUser;
  rpc UpdateUser;
}
```

예제로 나온 유저 관리 서비스처럼 특정 서버는 여러 api를 가진다.
여기선 `User` 서비스에 사용자 생성, 조회, 업데이트 api가 있음을 알려준다. rpc 하나하나가 api에 대응된다.

#### `rpc Xxx(Yyy) returns (Zzz)`

```
rpc CreateUser(CreateUserRequest) returns (CreateUserResponse) {
```

rpc의 형태는 `rpc Xxx(Yyy) returns (Zzz)`처럼 생겼는데 마치 우리가 함수를 만들어 쓰듯 "Xxx rpc는 Yyy를 input으로 받고 Zzz를 output으로 준다"는 의미다.
위 예시 rpc는 `CreateUser`라는 사용자 생성을 위한 rpc고 `CreateUserRequest`를 input으로 받아 `CreateUserResponse`를 반환하는 api라고 볼 수 있다.
이 때 `CreateUserRequest`, `CreateUserResponse`라는건 `{...}`처럼 json body라고 생각할 수 있다.

> 그래서 이 rpc를 어떤 endpoint로 호출해야하는지, 실제로 주고받는 body 내용은 뭔지는 후술한다.

<figure style="text-align: center;">
  <pre>
  ┌──────────────────┐                          ┌──────────────────┐
  │CreateUserRequest │   ┌──────────────────┐   │CreateUserResponse│
  │                  │   │                  │   │                  │
  │{                 │──▶│  CreateUser rpc  │──▶│{                 │
  │  // fields       │   │                  │   │  // fields       │
  │}                 │   └──────────────────┘   │}                 │
  └──────────────────┘                          └──────────────────┘
  </pre>
  <figcaption>
    rpc 호출 구조
  </figcaption>
</figure>

#### rpc option

<pre>
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse) {
    option (google.api.http) = {
      <b>post: "/v1/users"</b>
      body: "*"
    };
  }
  rpc GetUser(GetUserRequest) returns (GetUserResponse) {
    option (google.api.http) = {
      <b>get: "/v1/users/{user_id}"</b>
    };
  }
  rpc UpdateUser(UpdateUserRequest) returns (UpdateUserResponse) {
    option (google.api.http) = {
      <b>patch: "/v1/users/{user_id}"</b>
      body: "update_spec"
    };
  }
</pre>

여기서 `post: "/v1/users"`처럼 생긴 부분이 http api로 rpc를 호출할 때 어떤 endpoint를 어떤 method로 호출해야하는지 알려준다.

* `CreateUser` rpc는 `POST /v1/users`를 호출하면 된다.
* `GetUser` rpc는 `GET /v1/users/123`처럼 호출하면 된다.
* `UpdateUser` rpc는 `PATCH /v1/users/123`처럼 호출하면 된다.

`body: "*"`, `body: "update_spec"` 부분은 `XxxRequest` message 안에 있는 필드 중 무엇을 실제 요청으로 보내는 json body로 간주할거냐는 의미다. `"*"`면 모든 필드가 body에 들어가고 `"update_spec"`처럼 있으면 뒤에 나올 `XxxRequest` message 안에서 `update_spec`라는 이름을 가진 필드의 내용만 보내면 된다는 뜻이다.

> hostname(e.g. `https://api.winterjung.dev`)까지 protobuf로 나타내진 않고 주석처럼 다른 방법으로 합의한다고 알고있다.

## 주고받는 api 명세

message를 통해 실제로 어떤 값을 보내야하고 어떤 값을 반환해주는지 정의해둔다.

```protobuf
enum UserRole {
  USER_ROLE_UNKNOWN = 0;
  USER_ROLE_ADMIN = 1;
}

message CreateUserRequest {
  string name = 1;
  google.protobuf.StringValue memo = 2;
  UserRole role = 3;
  int64 joined_at_ms = 4;
}

message User {
  string id = 1;
  string name = 2;
  google.protobuf.StringValue memo = 3;
  UserRole role = 4;
}

message CreateUserResponse {
  User user = 1;
}

message GetUserRequest {
  string user_id = 1;
  bool should_include_id = 2;
}

message GetUserResponse {
  User user = 1;
}

message UpdateUserRequest {
  message UserUpdateSpec {
    string name = 1;
    google.protobuf.StringValue memo = 2;
    UserRole role = 3;
  }
  string user_id = 1;
  UserUpdateSpec update_spec = 2;
  google.protobuf.FieldMask update_mask = 3;
}

message UpdateUserResponse {}
```

뭔가 많지만 하나씩 보면 json과 그리 다를바 없다.

### 읽어보기

#### 각종 타입

```protobuf
message CreateUserRequest {
  string name = 1;
  google.protobuf.StringValue memo = 2;
  UserRole role = 3;
  int64 joined_at_ms = 4;
}
```

아까 말했던 `POST /v1/users`의 json body로 들어가는 message다. 오른쪽에 붙어있는 1, 2, 3, 4 같은 숫자는 protobuf의 field number인데 grpc 동작 방식상 중요하나 실제로 json api 명세상 무시해도 되는 부분이다.
실제로 json body를 보낼 땐 아래처럼 생겼다.

```json
{
  "name": "john",
  "memo": null,
  "role": "USER_ROLE_ADMIN",
  "joined_at_ms": "1612137600000"
}
```

* string 타입인 `name` 필드가 있다.
* `google.protobuf.StringValue` 타입은 optional 필드를 의미한다. `google.protobuf.XxxValue`처럼 생긴 애들이 여럿 있는데(e.g. `BoolValue`, `Int64Value`) 모두 해당 필드는 `null`이 올 수 있다는 의미다.
* `UserRole`은 enum 타입이다. `1`을 보내든 `"USER_ROLE_ADMIN"`을 보내든 동일하게 처리한다.
* int64 타입은 numeric value라는 것을 알려주지만 [json은 64bit 정수형 타입을 처리하지 못하기에] string으로 주고받는다. (정확한 동작은 http 라이브러리마다 다를 수 있다)

여기서 나와있진 않지만 필드 중 타입 앞에 `repeated`가 붙은 필드가 있다. (e.g. `repeated int32 values = 1;`)
이런 필드는 array 타입이고 `{"values": []}`, `{"values": [1, 2, 3]}`처럼 주고받을 수 있다.

#### message는 object

```protobuf
message User {
  string id = 1;
  string name = 2;
  google.protobuf.StringValue memo = 3;
  UserRole role = 4;
}

message CreateUserResponse {
  User user = 1;
}
```

`CreateUser` rpc(`POST /v1/users` api)를 호출한 후 응답으로 `CreateUserResponse` message가 오는데 위와 같이 해석할 수 있다.

```json
{
  "user": {
    "id": "1",
    "name": "john",
    "memo": null,
    "role": "USER_ROLE_ADMIN"
  }
}
```

* `User` 같은 message 타입은 `{...}` 처럼 object라고 해석할 수 있다.
* 기본적으로 message 타입은 모두 `null`이 올 수 있다. 그래서 위 api의 응답으로 아래처럼 오는게 가능은 하다.
    ```json
    {
    "user": null
    }
    ```

#### path와 query parameter

```protobuf
message GetUserRequest {
  string user_id = 1;
  bool should_include_id = 2;
}

message GetUserResponse {
  User user = 1;
}
```

`GetUserRequest` message에 있는 `user_id`는 json body로 들어가는게 아니라 아까 봤던 `get: "/v1/users/{user_id}"` 여기처럼 path에 들어간다.
path에 있는 필드 이외의 필드(e.g. `should_include_id` boolean 필드)는 모두 쿼리파라미터로 들어간다.
결국 위 사용자 조회 api는 `GET /v1/users/123?should_include_id=true`처럼 사용할 수 있다.

만약 `repeated` 필드가 있고 이를 쿼리파라미터로 보내고 싶다면 `GET /v1/users?keys=1&keys=2` 처럼 같은 쿼리파라미터 key를 여러번 사용하면 된다.

#### body option

```protobuf
message UpdateUserRequest {
  message UserUpdateSpec {
    string name = 1;
    google.protobuf.StringValue memo = 2;
    UserRole role = 3;
  }
  string user_id = 1;
  UserUpdateSpec update_spec = 2;
  google.protobuf.FieldMask update_mask = 3;
}

message UpdateUserResponse {}
```

뭔가 조금 복잡해 보이지만 결국 클라이언트에선 아래처럼 보내주면 된다.

* 이름만 업데이트할 때
    ```json
    {
    "name": "Bob"
    }
    ```
* 메모를 추가할 때
    ```json
    {
    "memo": "I'm admin user"
    }
    ```
* 메모를 지울 때
    ```json
    {
    "memo": null
    }
    ```

위에서 언급했듯 `UpdateUser` rpc는 `body: "update_spec"` option이 있는데 이때문에 실제로 클라이언트에서 보내야 할 body는 `update_spec` 필드에 해당하는 `UserUpdateSpec` message 내용만 보내주면된다.

[protocol buffers]: https://developers.google.com/protocol-buffers
[grpc-gateway]: https://github.com/grpc-ecosystem/grpc-gateway
[json은 64bit 정수형 타입을 처리하지 못하기에]: https://tqdev.com/2016-javascript-cannot-handle-64-bit-integers
[swagger editor]: https://editor.swagger.io/
