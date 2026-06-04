# OSS-TASK2

Instagram-style clone coding project for Open Source Software Development Task 2.

## Task 2 target

- Specific service clone coding: Instagram-style social feed
- Scope: Frontend + Backend
- Stack: React, Vite, Express, JSON file persistence

## Implemented features

- Account switching with three seeded users
- Story rail and responsive feed layout
- Post creation through backend REST API
- Like/unlike and save/unsave through backend REST API
- Comment creation through backend REST API
- Profile page and account search
- Persistent data file at `server/data/db.json`

## Run locally

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:4000/api/health`

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

- Screenshot of running frontend feed
- Screenshot of post/comment/like interaction
- Screenshot or terminal output showing backend API response
- GitHub repository URL
