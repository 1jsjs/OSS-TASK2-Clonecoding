# OSS-TASK2-Clonecoding

Instagram-style full-stack clone coding project for Open Source Software Development Task 2.

Repository: https://github.com/1jsjs/OSS-TASK2-Clonecoding

## Task 2 target

- Requirement: Specific service clone coding (Front + BackEnd)
- Service target: Instagram-style social feed
- Stack: React, Vite, Express, JSON file persistence

This repository is the clone-coding item for Task 2. The other Task 2 item is an accepted open-source PR:

- `postmelee/alhangeul-macos` PR #328, merged into `devel`

## Implemented features

### Frontend

- Account switching with three seeded users
- Story rail and responsive feed layout
- Instagram-style post cards
- Like, comment, share, and save action controls
- Post composer
- Profile page
- Account search

### Backend

- Express REST API server
- Post creation through backend REST API
- Like/unlike and save/unsave through backend REST API
- Comment creation through backend REST API
- Feed, user list, and profile query APIs
- JSON persistence file generated at `server/data/db.json`

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api/health`

## Verification

```bash
npm run build
```

Build result:

```text
✓ built
```

Backend smoke test:

```bash
curl http://localhost:4000/api/health
```

Expected response:

```json
{"ok":true,"service":"ossgram-api"}
```

Feed API smoke test:

```bash
curl "http://localhost:4000/api/feed?userId=u_jinsu"
```

The API returns the current user, stories, and persisted feed posts.

## API overview

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/feed?userId=u_jinsu` | Load stories and feed posts |
| GET | `/api/users` | Load accounts |
| GET | `/api/users/:username` | Load profile and profile posts |
| POST | `/api/session` | Switch active user |
| POST | `/api/posts` | Create a post |
| POST | `/api/posts/:postId/like` | Toggle like |
| POST | `/api/posts/:postId/save` | Toggle save |
| POST | `/api/posts/:postId/comments` | Add comment |

## Evidence checklist

- Running frontend feed screen
- Post creation screen
- Like/comment/save interaction screen
- Backend API response or terminal output
- GitHub repository URL

## Project structure

```text
server/index.js      Express backend and REST API
src/App.tsx          React frontend and interaction logic
src/styles.css       Responsive Instagram-style UI
src/types.ts         Frontend data types
```
