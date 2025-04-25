## 프로젝트 실행 방법 (설치, 실행 명령어)

해당 프로젝트를 pull 받으신 후 루트 디렉토리에서 `nest start` 명령어를 사용해주세요.
단발성 프로젝트, Json db 환경이기 때문에 개발, 운영 환경 구분은 하지 않았습니다.

아래와 같은 환경에서 실행한다는 가정입니다.

| 항목 | 내용 |
| --- | --- |
| **프레임워크** | NestJS (`@nestjs/core` ^11.0.1 기반) |
| **언어** | TypeScript (`typescript` ^5.7.3 기반) |
| **런타임 환경** | Node.js (`@types/node` ^22.10.7 기반, NestJS 실행 환경) |
| **패키지 관리자** | npm |

---

## API 사용법 (엔드포인트별 요청/응답 예시)

**기본 경로:** `/jobs`

### `JobDto`

작업 정보를 나타내는 응답 객체입니다.

| 속성 이름 | 타입 | 설명 | 예시 | 제약 조건/설명                                 |
| --- | --- | --- | --- |------------------------------------------|
| `id` | `string` | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` | UUID 형식 예상                               |
| `title` | `string` | 작업 제목 | `데이터베이스 마이그레이션` | 비어있으면 안됨, 문자열                            |
| `description` | `string` | 작업 설명 | `기존 MySQL에서 PostgreSQL로 데이터 마이그레이션` | 비어있으면 안됨, 문자열                             |
| `status` | `JobStatusType` | 작업 상태 | `pending` | `pending`, `completed`, `canceled` 중 하나 |
| `createdAt` | `Date` | 작업 생성 시간 | `2023-04-22T12:34:56.789Z` | ISO 8601 형식                              |
| `updatedAt` | `Date` | 작업 수정 시간 | `2023-04-22T12:34:56.789Z` | ISO 8601 형식                              |

### 1. 새로운 작업 생성

| 항목 | 내용 |
| --- | --- |
| **메서드** | `POST` |
| **경로** | `/jobs` |
| **요약** | 새로운 작업 생성 |

**요청 본문 (`CreateJobDto`)**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 | 제약 조건/설명 |
| --- | --- | --- | --- | --- | --- |
| `title` | `string` | 필수 | 작업 제목 | `데이터베이스 마이그레이션` | 비어있으면 안 됨, 문자열 |
| `description` | `string` | 필수 | 작업 설명 | `기존 MySQL에서 PostgreSQL로 데이터 마이그레이션` | 비어있으면 안 됨, 최소 1자, 문자열 |

응답 예시

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
    "id": "6d360247-bf03-493a-be31-bb1b5f4fed76",
    "title": "데이터베이스 마이그레이션",
    "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
    "status": "pending",
    "createdAt": "2025-04-25T11:00:46.938Z",
    "updatedAt": "2025-04-25T11:00:46.938Z"
  }
}
```

### 2. 작업 목록 조회

| 항목 | 내용 |
| --- | --- |
| **메서드** | `GET` |
| **경로** | `/jobs` |
| **요약** | 작업 목록 조회 |
| **상태 코드** | `200 OK` |

**쿼리 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 기본값 | 설명 | 예시 | 제약 조건/설명 |
| --- | --- | --- | --- | --- | --- | --- |
| `status` | `JobStatusType` | 선택 | 없음 | 작업 상태로 필터링 | `completed` | `pending`, `completed`, `canceled` 중 하나 |
| `title` | `string` | 선택 | 없음 | 작업 제목으로 검색 (부분 일치) | `데이터` | 문자열 |
| `page` | `number` | 선택 | `0` | 페이지 번호 (0부터 시작) | `1` | 정수 |
| `size` | `number` | 선택 | `10` | 페이지 크기 | `20` | 정수 |
| `paginate` | `boolean` | 선택 | `false` | 페이지네이션 사용 여부 (true/false) | `true` | 불리언 |

**응답 본문**

| 속성 이름 | 타입 | 설명 |
| --- | --- | --- |
| `responseCode` | `string` | 응답 코드 (`0000`: 성공) |
| `message` | `string` | 응답 메시지 |
| `data` | `JobDto[]` 또는 `Page<JobDto>` | 조회된 작업 목록 |

**응답 예시 (200 OK, paginate=false)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": [
    {
      "id": "2de95ac9-2ad8-46b3-a0ae-dd42d8dd62db",
      "title": "데이터베이스 마이그레이션",
      "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
      "status": "completed",
      "createdAt": "2025-04-25T09:06:15.521Z",
      "updatedAt": "2025-04-25T09:07:00.018Z"
    },
    {
      "id": "f4577931-a1e1-49d3-b10a-ad16f7bd08bd",
      "title": "데이터베이스 마이그레이션",
      "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
      "status": "completed",
      "createdAt": "2025-04-25T09:07:12.685Z",
      "updatedAt": "2025-04-25T09:08:00.017Z"
    },
    {
      "id": "5a47c8d7-621e-4d7c-a75f-ee251f8be22d",
      "title": "데이터베이스 마이그레이션",
      "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
      "status": "completed",
      "createdAt": "2025-04-25T09:07:12.996Z",
      "updatedAt": "2025-04-25T09:08:00.017Z"
    },
    ...
  ]
}
```

### 3. 특정 작업 조회

| 항목 | 내용 |
| --- | --- |
| **메서드** | `GET` |
| **경로** | `/jobs/:id` |
| **요약** | 특정 작업 조회 |
| **상태 코드** | `200 OK` |

**경로 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 필수 | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

**응답 예시 (200 OK)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "title": "데이터베이스 마이그레이션",
    "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
    "status": "pending",
    "createdAt": "2025-04-25T11:00:46.938Z",
    "updatedAt": "2025-04-25T11:00:46.938Z"
  }
}

```

### 4. 작업 정보 업데이트

| 항목 | 내용 |
| --- | --- |
| **메서드** | `PUT` |
| **경로** | `/jobs/:id` |
| **요약** | 작업 정보 업데이트 |
| **상태 코드** | `200 OK` |

**경로 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 필수 | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

**요청 본문 (`UpdateJobDto`)**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 | 제약 조건/설명 |
| --- | --- | --- | --- | --- | --- |
| `title` | `string` | 필수 | 수정할 작업 제목 | `수정된 데이터베이스 마이그레이션` | 비어있으면 안 됨, 최소 1자, 문자열 |
| `description` | `string` | 필수 | 수정할 작업 설명 | `수정된 마이그레이션 설명` | 비어있으면 안 됨, 최소 1자, 문자열 |

**응답 예시 (200 OK)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "title": "수정된 데이터베이스 마이그레이션",
    "description": "수정된 마이그레이션 설명",
    "status": "pending",
    "createdAt": "2025-04-25T11:00:46.938Z",
    "updatedAt": "2025-04-25T11:05:00.000Z" // 업데이트 시간 변경
  }
}

```

### 5. 작업 완료 처리

| 항목 | 내용 |
| --- | --- |
| **메서드** | `PATCH` |
| **경로** | `/jobs/:id/complete` |
| **요약** | 작업 완료 처리 |
| **상태 코드** | `200 OK` |

**경로 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 필수 | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

**응답 예시 (200 OK)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "title": "데이터베이스 마이그레이션",
    "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
    "status": "completed", // 상태 변경
    "createdAt": "2025-04-25T11:00:46.938Z",
    "updatedAt": "2025-04-25T11:10:00.000Z" // 업데이트 시간 변경
  }
}

```

### 6. 작업 취소 처리

| 항목 | 내용 |
| --- | --- |
| **메서드** | `PATCH` |
| **경로** | `/jobs/:id/cancel` |
| **요약** | 작업 취소 처리 |
| **상태 코드** | `200 OK` |

**경로 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 필수 | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

**응답 예시 (200 OK)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "title": "데이터베이스 마이그레이션",
    "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
    "status": "canceled", // 상태 변경
    "createdAt": "2025-04-25T11:00:46.938Z",
    "updatedAt": "2025-04-25T11:15:00.000Z" // 업데이트 시간 변경
  }
}

```

### 7. 취소된 작업 재개

| 항목 | 내용 |
| --- | --- |
| **메서드** | `PATCH` |
| **경로** | `/jobs/:id/reopen` |
| **요약** | 취소된 작업 재개 |
| **상태 코드** | `200 OK` |

**경로 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 필수 | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

**응답 예시 (200 OK)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
    "id": "a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6",
    "title": "데이터베이스 마이그레이션",
    "description": "기존 MySQL에서 PostgreSQL로 데이터 마이그레이션",
    "status": "pending", // 상태 변경 (재개 시 pending으로 돌아간다고 가정)
    "createdAt": "2025-04-25T11:00:46.938Z",
    "updatedAt": "2025-04-25T11:20:00.000Z" // 업데이트 시간 변경
  }
}

```

### 8. 작업 삭제

| 항목 | 내용 |
| --- | --- |
| **메서드** | `DELETE` |
| **경로** | `/jobs/:id` |
| **요약** | 작업 삭제 |
| **상태 코드** | `204 No Content` |

**경로 매개변수**

| 속성 이름 | 타입 | 필수 여부 | 설명 | 예시 |
| --- | --- | --- | --- | --- |
| `id` | `string` | 필수 | 작업 ID | `a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6` |

**응답 예시 (200 OK)**

```json
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
}
```

---

## 구현 관련 상세 설명 및 코멘트

### API 디자인 및 서빙 전략

- 기본적으로 Controller - Service - Repository 레이어를 사용해 서빙합니다.
- 다음과 같은 공통 응답 구조를 사용합니다

```json
HttpStatus: 200
{
  "responseCode": "0000",
  "message": "정상 처리되었습니다.",
  "data": {
  }
}
```

- http status 로 나타낼 수 있는 것보다 더 자세한 상황을 나타내기 위해 ResponseCode 를 적용했습니다.

```json
HttpStatus : 404
{
  "responseCode": "2001",
  "message": "존재하지 않는 작업입니다."
}
```

- 위와 같은 공통 응답 구조를 적용하기 위해 Nest Filter 와 Interceptor 기능을 사용했습니다.
- Job 의 상태에 cancel 이 추가됨에 따라 요구사항으로 주어졌던 API 이외에 completeJob, cancelJob, reopenJob API 가 추가되었습니다.

### 데이터 처리 전략

- Json db 는 단순 파일로 데이터 관리하기 때문에 그 한계가 명확하여 언제든 Json db 가 대체될 수 있을 것이란 가정을 했습니다. 이를 반영하기 위해 JobRepository 인터페이스와 JsonJobRepository 구현체로 분리해 서비스 로직이 Json db 관련 로직에 의존하지 않게끔 설계했습니다.
- Json Map 자료구조를 이용해 작업의 id 를 키로 작업 데이터를 저장합니다.
- 동시성 제어를 위해 작업의 id 를 키로 애플리케이션 메모리 Map 자료구조를 이용해 Lock 을 구현했습니다.
- 스케줄 작업 같은 경우에는 인덱스를 통해 pending 작업을 모두 찾은 후 작업들의 id 로 락을 모두 잡고 다시 id 들로 작업을 조회합니다. 이는 락을 잡는 과정에서 pending 작업이 변경되었을 수 있기 때문입니다.

### 성능 관리 전략

- status 를 조건으로 조회 후 업데이트하는 기능이 스케줄러에 의해 1분마다 호출되기 때문에 업데이트, 생성 등 처리성 작업에서 발생하는 인덱스 재배치의 리소스 소비보다 조회 성능의 최적화에서 얻을 수 있는 이점이 더 이득이라 판단해 status 를 인덱스 키로 인덱스를 Json db 에 자체 생성했습니다.

### 기타 구현 디테일

- swagger 를 적용했습니다. 로컬에서 구동 시 [localhost:3000/api](http://localhost:3000/api) 로 접근하실 수 있습니다.

### 아쉬운 점

- API 응답 시간은 최대한 빠르게 최적화 라는 요구사항을 충족하기 위해 애플리케이션 메모리로 캐싱을 적용하려 했으나 시간관계 상, 그리고 API 응답속도에 대한 유의미한 사용자 경험을 얻을 수 없어 제외했습니다. 만약 적용한다면 rdb, 클라우드 환경, 많은 양의 더미데이터를 적재한 뒤 실질적인 응답속도를 확인 후에 적용할 수 있을 것 같습니다. 
- 로컬 호스트로 애플리케이션을 구동하고 node json 파일로 데이터 영속화를 관리하다보니 클라우드 환경에 비래 처리 속도에서 차이를 확인하기 어려웠습니다.
- typescript 의 숙련도가 낮아 코드를 깔끔하게 관리하는 것이 어려웠습니다. 특히 json db 관련 코드.
- 테스트 코드 작성이 부족했습니다. 단위 controller, service, repository 각각의 단위 테스트를 진행하진 못하고 핵심 케이스라고 생각한 동시성 부분만 작성했습니다. 