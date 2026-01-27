# 겨우내 (GyeowooNae)

스키/스노보드 중고 거래 및 운영을 위한 Next.js 기반 서비스입니다.

## 기술 스택
- Next.js 14 (App Router)
- React 18
- TypeScript
- MariaDB
- Tailwind CSS

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
