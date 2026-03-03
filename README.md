# 겨우내 (GyeowooNae)

스키/스노보드 중고 거래 및 운영을 위한 Next.js 기반 서비스입니다.

## 기술 스택
- 프런트엔드: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- 백엔드: Next.js Server Actions, Route Handlers
- 데이터베이스: MariaDB
- 설계/아키텍처: DDD 스타일의 엔티티/유스케이스/리포지토리 계층
- UI/UX: 글로벌 Toast 시스템, 모달 기반 관리자 액션 UX

## 개발 완료 사항 총정리
- 거래 상태 관리: AVAILABLE/RESERVED/SOLD 상태, 배지 표시, 판매자/관리자 권한 제어
- 게시물 권한/가시성: 숨김/삭제 게시물 접근 제한 및 한국어 안내 페이지 처리
- 관리자 기능 고도화: 사유/메모 필수 모달, moderation_actions 기록, 트랜잭션 기반 처리
- 문의(Inquiry) 흐름 완성: PENDING/REPLIED/CLOSED 상태, 관리자 답변/상태 변경, 사용자 답변 조회
- 댓글 시스템: 댓글/답글(1단계), 수정/삭제(소프트 삭제), 신고 및 관리자 처리
- 관심/조회수 집계: 이벤트 기반 view/favorite, 댓글/찜/조회수 카드 및 관리자 목록 표시
- 부츠 발치수 일치도: 퍼센트 기반 알고리즘, 총 일치도 강조, 안내/CTA 제공
- 리스트/검색 필터 안정화: URL 파라미터 단일 소스, 유효하지 않은 필터 자동 정리
- 즉시 반영 UX: Result 패턴 통일, 성공/실패 토스트, revalidatePath/revalidateTag 적용
- 이미지 개선: 카드 object-contain, 상세 갤러리 + 라이트박스 뷰어
- 성능 최적화: 집계 쿼리로 N+1 방지, 필요한 화면은 force-dynamic 적용

## 사용 라이브러리 총정리
- 런타임 의존성
  - next: Next.js 프레임워크
  - react, react-dom: UI 렌더링
  - mysql2: MariaDB 드라이버
  - sharp: 이미지 처리(Next Image 최적화)
- 개발 의존성
  - typescript: 타입 시스템
  - @types/node, @types/react, @types/react-dom: 타입 정의
  - tailwindcss, postcss, autoprefixer: 스타일링 및 빌드 파이프라인

## 서비스 구조/흐름
- 사용자: 목록/상세 조회, 찜/댓글/신고, 문의 작성, 내 게시물 관리
- 판매자: 게시물 등록/수정/상태 변경, 내 게시물 관리
- 관리자: 게시물/유저/문의/광고/댓글 신고 관리, 사유/메모 기반 제재 기록

## 권한/역할 정책
- 일반 사용자: 공개 게시물만 열람, 본인 댓글/문의만 수정 가능
- 판매자(본인): 본인 게시물 상태 변경 및 삭제 가능
- 관리자: 숨김/삭제 게시물 접근 가능, 모든 제재/처리 수행 가능

## 미들웨어
- `/admin` 경로는 인증/권한 미들웨어로 보호
- 세션 쿠키 검증 → 약관/개인정보 동의 여부 확인 → 관리자/모더레이터 역할 확인
- 조건 미충족 시 `/auth`, `/terms`, `/`로 리다이렉트

## 상태 관리
- 게시물 거래 상태: `AVAILABLE | RESERVED | SOLD`
- 상태 변경 권한: 본인 판매자 또는 관리자
- UI/서버는 동일 상태 값을 단일 소스로 사용

## 운영 환경 설정
- 로컬 업로드는 `public/uploads/`에 저장
- 운영 환경에서 업로드 스토리지(S3/R2)로 전환 가능 구조

## 로깅/에러 처리
- UI는 전역 Toast로 성공/실패 피드백 제공
- 관리자 처리/제재는 moderation_actions에 기록

## 테스트
- 별도 테스트 스크립트는 아직 구성되지 않음
- 핵심 시나리오는 수동 테스트로 검증

## 마이그레이션/백업
- 스키마/시드 변경은 `infra/db/schema.sql`, `infra/db/seed.sql` 기준
- 백업/복구 절차는 운영 환경에 맞게 추가 필요

## 개발 환경 준비
```bash
npm install
```

### 환경 변수
`.env.local`에 아래 값을 설정하세요.
```
MARIADB_HOST=localhost
MARIADB_PORT=3306
MARIADB_USER=your_user
MARIADB_PASSWORD=your_password
MARIADB_DATABASE=gyeowoo_nae
```

### DB 초기화
```bash
mysql -u your_user -p gyeowoo_nae < infra/db/schema.sql
mysql -u your_user -p gyeowoo_nae < infra/db/seed.sql
```

## 실행
```bash
npm run dev
```

## 참고
- 로컬 업로드 파일은 `public/uploads/`에 저장됩니다. (Git 추적 제외)
- 운영 환경 배포 시 업로드 스토리지(S3/R2)로 전환 가능하도록 구성되어 있습니다.
