# OSSgram

OSSgram is a full-stack Instagram-style social feed clone built with React and Express. It includes a responsive feed UI, profile views, post creation, likes, saves, comments, and a small REST API with JSON-file persistence.

## Features

- Responsive Instagram-style feed layout
- Story rail with user avatars
- Account switching between seeded users
- Create posts with image URL, location, and caption
- Like/unlike and save/unsave posts
- Add comments to posts
- Search accounts
- View user profiles and profile posts

## Tech Stack

- Frontend: React, Vite, TypeScript
- Backend: Express
- Styling: CSS
- Persistence: JSON file storage
- Icons: lucide-react

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm

### Installation

```sh
npm install
```

### Development

```sh
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

### Production Build

```sh
npm run build
npm start
```

## Verification

```sh
npm run build
```

```sh
curl http://localhost:4000/api/health
```

Expected response:

```json
{"ok":true,"service":"ossgram-api"}
```

## API Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/api/feed?userId=u_jinsu` | Load stories and feed posts |
| GET | `/api/users` | Load accounts |
| GET | `/api/users/:username` | Load profile and profile posts |
| POST | `/api/session` | Switch active user |
| POST | `/api/posts` | Create a post |
| POST | `/api/posts/:postId/like` | Toggle like |
| POST | `/api/posts/:postId/save` | Toggle save |
| POST | `/api/posts/:postId/comments` | Add comment |

## Project Structure

```txt
.
├── server/
│   └── index.js      Express API server
├── src/
│   ├── App.tsx       Main React app
│   ├── main.tsx      React entry point
│   ├── styles.css    UI styles
│   └── types.ts      Shared frontend types
├── index.html
├── package.json
└── vite.config.ts
```

## Data Persistence

The backend creates `server/data/db.json` automatically on first run. The file is ignored by Git, so local posts, likes, saves, and comments do not get committed.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Run frontend and backend development servers |
| `npm run dev:web` | Run Vite frontend only |
| `npm run dev:api` | Run Express backend only |
| `npm run build` | Build the frontend |
| `npm start` | Run the backend server |

## License

This project is for educational clone-coding practice.
