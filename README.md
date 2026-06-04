# OSSgram

OSSgram은 React와 Express로 만든 인스타그램 스타일의 풀스택 소셜 피드 클론입니다. 반응형 피드 UI, 프로필 화면, 게시글 작성, 좋아요, 저장, 댓글 기능을 제공하며, 백엔드는 REST API와 JSON 파일 기반 저장 방식을 사용합니다.

## 주요 기능

- 인스타그램 스타일의 반응형 피드 레이아웃
- 사용자 아바타 기반 스토리 영역
- 시드 사용자 간 계정 전환
- 이미지 URL, 위치, 캡션을 입력한 게시글 작성
- 게시글 좋아요/좋아요 취소
- 게시글 저장/저장 취소
- 댓글 작성
- 계정 검색
- 사용자 프로필 및 프로필 게시글 조회

## 기술 스택

- Frontend: React, Vite, TypeScript
- Backend: Express
- Styling: CSS
- Persistence: JSON file storage
- Icons: lucide-react

## 시작하기

### 사전 요구 사항

- Node.js 20 이상
- npm

### 설치

```sh
npm install
```

### 개발 서버 실행

```sh
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### 프로덕션 빌드

```sh
npm run build
npm start
```

## 동작 확인

```sh
npm run build
```

```sh
curl http://localhost:4000/api/health
```

예상 응답:

```json
{"ok":true,"service":"ossgram-api"}
```

## API 엔드포인트

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/api/feed?userId=u_jinsu` | 스토리와 피드 게시글 조회 |
| GET | `/api/users` | 사용자 목록 조회 |
| GET | `/api/users/:username` | 프로필과 프로필 게시글 조회 |
| POST | `/api/session` | 현재 사용자 전환 |
| POST | `/api/posts` | 게시글 작성 |
| POST | `/api/posts/:postId/like` | 좋아요 토글 |
| POST | `/api/posts/:postId/save` | 저장 토글 |
| POST | `/api/posts/:postId/comments` | 댓글 작성 |

## 프로젝트 구조

```txt
.
├── server/
│   └── index.js      Express API 서버
├── src/
│   ├── App.tsx       메인 React 앱
│   ├── main.tsx      React 엔트리 포인트
│   ├── styles.css    UI 스타일
│   └── types.ts      프론트엔드 타입 정의
├── index.html
├── package.json
└── vite.config.ts
```

## 데이터 저장

백엔드는 최초 실행 시 `server/data/db.json` 파일을 자동으로 생성합니다. 이 파일은 Git 추적 대상에서 제외되어 로컬에서 작성한 게시글, 좋아요, 저장, 댓글 데이터가 커밋되지 않습니다.

## 스크립트

| Command | 설명 |
| --- | --- |
| `npm run dev` | 프론트엔드와 백엔드 개발 서버 동시 실행 |
| `npm run dev:web` | Vite 프론트엔드 서버만 실행 |
| `npm run dev:api` | Express 백엔드 서버만 실행 |
| `npm run build` | 프론트엔드 빌드 |
| `npm start` | 백엔드 서버 실행 |

## 라이선스

이 프로젝트는 클론코딩 학습 목적으로 제작되었습니다.
