# TASK 2 Clone Coding Evidence

## Selected requirement

Specific service clone coding (Front + BackEnd)

## Service target

Instagram-style social feed clone.

## Frontend evidence

- Responsive feed UI
- Story rail
- Post composer
- Like, comment, share, save action controls
- Profile view
- Account search and account switching

## Backend evidence

- Express REST API server
- JSON file persistence at `server/data/db.json`
- API endpoints for feed, users, profiles, post creation, likes, saves, and comments

## Verification commands

```bash
npm run build
curl http://localhost:4000/api/health
curl "http://localhost:4000/api/feed?userId=u_jinsu"
```

## Submission note

This project is the second Task 2 item. The first item is the accepted open-source PR:

- `postmelee/alhangeul-macos` PR #328
