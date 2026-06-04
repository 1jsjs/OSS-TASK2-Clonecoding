import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "db.json");
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = Number(process.env.PORT || 4000);

const seedData = {
  users: [
    {
      id: "u_jinsu",
      username: "ossgram.dev",
      name: "OSSgram Demo",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=160&q=80",
      bio: "Full-stack social feed prototype.",
      website: "github.com/1jsjs/OSS-TASK2-Clonecoding",
      followers: 1328,
      following: 260,
      verified: true
    },
    {
      id: "u_mina",
      username: "metro.frame",
      name: "Metro Frame",
      avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=160&q=80",
      bio: "City snapshots and layout notes.",
      website: "metroframe.example",
      followers: 842,
      following: 188,
      verified: false
    },
    {
      id: "u_campus",
      username: "daily.build",
      name: "Daily Build",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
      bio: "Small product updates every day.",
      website: "dailybuild.example",
      followers: 2201,
      following: 342,
      verified: true
    },
    {
      id: "u_noon",
      username: "noon.archive",
      name: "Noon Archive",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
      bio: "Saved references and quiet scenes.",
      website: "noonarchive.example",
      followers: 1540,
      following: 208,
      verified: false
    },
    {
      id: "u_luma",
      username: "luma.studio",
      name: "Luma Studio",
      avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=160&q=80",
      bio: "Visual direction for web products.",
      website: "lumastudio.example",
      followers: 4901,
      following: 319,
      verified: true
    },
    {
      id: "u_byte",
      username: "byte.garden",
      name: "Byte Garden",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
      bio: "Backend notes, APIs, and tiny tools.",
      website: "bytegarden.example",
      followers: 705,
      following: 155,
      verified: false
    }
  ],
  stories: [
    { id: "s1", userId: "u_jinsu", label: "prototype", imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=300&q=80", seenBy: [] },
    { id: "s2", userId: "u_mina", label: "city", imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=300&q=80", seenBy: ["u_jinsu"] },
    { id: "s3", userId: "u_campus", label: "release", imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=300&q=80", seenBy: [] },
    { id: "s4", userId: "u_noon", label: "archive", imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=300&q=80", seenBy: [] },
    { id: "s5", userId: "u_luma", label: "studio", imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=300&q=80", seenBy: ["u_jinsu"] },
    { id: "s6", userId: "u_byte", label: "api", imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=300&q=80", seenBy: [] }
  ],
  posts: [
    {
      id: "p1",
      userId: "u_campus",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
      caption: "Feed, comments, likes, saves, and profile data are all served by the Express API.",
      location: "Product desk",
      createdAt: "2026-06-04T00:35:00.000Z",
      likes: ["u_jinsu", "u_mina"],
      saves: ["u_jinsu"],
      comments: [
        { id: "c1", userId: "u_jinsu", text: "The backend state updates immediately in the feed.", createdAt: "2026-06-04T01:02:00.000Z" }
      ]
    },
    {
      id: "p2",
      userId: "u_mina",
      imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
      caption: "A cleaner home layout with a narrow icon rail, story row, and right-side suggestions.",
      location: "Layout study",
      createdAt: "2026-06-03T14:12:00.000Z",
      likes: ["u_jinsu"],
      saves: [],
      comments: [
        { id: "c2", userId: "u_luma", text: "This feels much closer to the current desktop feed.", createdAt: "2026-06-03T14:28:00.000Z" }
      ]
    },
    {
      id: "p3",
      userId: "u_luma",
      imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80",
      caption: "Prototype images and usernames are fictional demo data, not copied from a real following list.",
      location: "Studio board",
      createdAt: "2026-06-02T09:18:00.000Z",
      likes: ["u_jinsu", "u_campus", "u_byte"],
      saves: ["u_mina"],
      comments: [
        { id: "c3", userId: "u_byte", text: "Good call keeping the sample identities synthetic.", createdAt: "2026-06-02T10:05:00.000Z" }
      ]
    }
  ],
  updatedAt: "2026-06-04T00:35:00.000Z"
};

function ensureDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(seedData, null, 2));
  }
}

function readDatabase() {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeDatabase(db) {
  db.updatedAt = new Date().toISOString();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

function getUser(db, userId) {
  return db.users.find((user) => user.id === userId) || db.users[0];
}

function publicUser(user, db) {
  return {
    ...user,
    posts: db.posts.filter((post) => post.userId === user.id).length
  };
}

function serializePost(post, db, viewerId = "u_jinsu") {
  const author = publicUser(getUser(db, post.userId), db);
  return {
    ...post,
    author,
    likeCount: post.likes.length,
    commentCount: post.comments.length,
    likedByMe: post.likes.includes(viewerId),
    savedByMe: post.saves.includes(viewerId),
    comments: post.comments.map((comment) => ({
      ...comment,
      author: publicUser(getUser(db, comment.userId), db)
    }))
  };
}

function sortedPosts(posts) {
  return posts.toSorted((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "ossgram-api" });
});

app.get("/api/users", (_req, res) => {
  const db = readDatabase();
  res.json({ users: db.users.map((user) => publicUser(user, db)) });
});

app.post("/api/session", (req, res) => {
  const db = readDatabase();
  const user = db.users.find((item) => item.id === req.body.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ user: publicUser(user, db) });
});

app.get("/api/feed", (req, res) => {
  const db = readDatabase();
  const viewerId = String(req.query.userId || "u_jinsu");
  const stories = db.stories.map((story) => ({
    ...story,
    author: publicUser(getUser(db, story.userId), db),
    seen: story.seenBy.includes(viewerId)
  }));
  res.json({
    currentUser: publicUser(getUser(db, viewerId), db),
    stories,
    posts: sortedPosts(db.posts).map((post) => serializePost(post, db, viewerId))
  });
});

app.get("/api/users/:username", (req, res) => {
  const db = readDatabase();
  const viewerId = String(req.query.userId || "u_jinsu");
  const user = db.users.find((item) => item.username === req.params.username);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({
    user: publicUser(user, db),
    posts: sortedPosts(db.posts.filter((post) => post.userId === user.id)).map((post) => serializePost(post, db, viewerId))
  });
});

app.post("/api/posts", (req, res) => {
  const db = readDatabase();
  const user = getUser(db, req.body.userId);
  const caption = String(req.body.caption || "").trim();
  const imageUrl = String(req.body.imageUrl || "").trim();
  const location = String(req.body.location || "").trim();

  if (!caption || !imageUrl) {
    return res.status(400).json({ message: "caption and imageUrl are required" });
  }

  const post = {
    id: randomUUID(),
    userId: user.id,
    imageUrl,
    caption,
    location,
    createdAt: new Date().toISOString(),
    likes: [],
    saves: [],
    comments: []
  };
  db.posts.unshift(post);
  writeDatabase(db);
  res.status(201).json({ post: serializePost(post, db, user.id) });
});

app.post("/api/posts/:postId/like", (req, res) => {
  const db = readDatabase();
  const user = getUser(db, req.body.userId);
  const post = db.posts.find((item) => item.id === req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.likes = post.likes.includes(user.id) ? post.likes.filter((id) => id !== user.id) : [...post.likes, user.id];
  writeDatabase(db);
  res.json({ post: serializePost(post, db, user.id) });
});

app.post("/api/posts/:postId/save", (req, res) => {
  const db = readDatabase();
  const user = getUser(db, req.body.userId);
  const post = db.posts.find((item) => item.id === req.params.postId);
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  post.saves = post.saves.includes(user.id) ? post.saves.filter((id) => id !== user.id) : [...post.saves, user.id];
  writeDatabase(db);
  res.json({ post: serializePost(post, db, user.id) });
});

app.post("/api/posts/:postId/comments", (req, res) => {
  const db = readDatabase();
  const user = getUser(db, req.body.userId);
  const post = db.posts.find((item) => item.id === req.params.postId);
  const text = String(req.body.text || "").trim();
  if (!post) {
    return res.status(404).json({ message: "Post not found" });
  }
  if (!text) {
    return res.status(400).json({ message: "comment text is required" });
  }
  post.comments.push({
    id: randomUUID(),
    userId: user.id,
    text,
    createdAt: new Date().toISOString()
  });
  writeDatabase(db);
  res.status(201).json({ post: serializePost(post, db, user.id) });
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === "GET" && !req.path.startsWith("/api")) {
      return res.sendFile(path.join(DIST_DIR, "index.html"));
    }
    return next();
  });
}

app.listen(PORT, () => {
  ensureDatabase();
  console.log(`OSSgram API listening on http://localhost:${PORT}`);
});
