import {
  Bookmark,
  CheckCircle2,
  Compass,
  Heart,
  Home,
  ImagePlus,
  Instagram,
  Menu,
  MessageCircle,
  MoreHorizontal,
  PlusSquare,
  Search,
  Send,
  SquarePlay,
  UserRound
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import type { Post, Story, User } from "./types";

const fallbackImage = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(body.message || response.statusText);
  }
  return response.json() as Promise<T>;
}

function timeAgo(value: string) {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

function Avatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
  return <img className={`avatar avatar-${size}`} src={user.avatar} alt={`${user.username} avatar`} />;
}

function Verified() {
  return <CheckCircle2 className="verified" size={14} aria-label="verified" />;
}

export function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<{ user: User; posts: Post[] } | null>(null);
  const [query, setQuery] = useState("");
  const [caption, setCaption] = useState("");
  const [imageUrl, setImageUrl] = useState(fallbackImage);
  const [location, setLocation] = useState("Studio board");
  const [error, setError] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

  const userId = currentUser?.id || localStorage.getItem("ossgram:user") || "u_jinsu";

  async function loadUsers() {
    const data = await requestJson<{ users: User[] }>("/api/users");
    setUsers(data.users);
    const selected = data.users.find((user) => user.id === userId) || data.users[0];
    setCurrentUser(selected);
  }

  async function loadFeed(nextUserId = userId) {
    const data = await requestJson<{ currentUser: User; stories: Story[]; posts: Post[] }>(`/api/feed?userId=${nextUserId}`);
    setCurrentUser(data.currentUser);
    setStories(data.stories);
    setPosts(data.posts);
  }

  useEffect(() => {
    loadUsers().then(() => loadFeed()).catch((event) => setError(event.message));
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = currentUser ? users.filter((user) => user.id !== currentUser.id) : users;
    if (!normalized) return source;
    return source.filter((user) => `${user.username} ${user.name} ${user.bio}`.toLowerCase().includes(normalized));
  }, [currentUser, query, users]);

  async function switchUser(nextUser: User) {
    localStorage.setItem("ossgram:user", nextUser.id);
    const data = await requestJson<{ user: User }>("/api/session", {
      method: "POST",
      body: JSON.stringify({ userId: nextUser.id })
    });
    setCurrentUser(data.user);
    setProfile(null);
    await loadFeed(nextUser.id);
  }

  async function openProfile(username: string) {
    const data = await requestJson<{ user: User; posts: Post[] }>(`/api/users/${username}?userId=${userId}`);
    setProfile(data);
  }

  function replacePost(nextPost: Post) {
    setPosts((items) => items.map((post) => (post.id === nextPost.id ? nextPost : post)));
    setProfile((value) => value && { ...value, posts: value.posts.map((post) => (post.id === nextPost.id ? nextPost : post)) });
  }

  async function toggleLike(post: Post) {
    const data = await requestJson<{ post: Post }>(`/api/posts/${post.id}/like`, {
      method: "POST",
      body: JSON.stringify({ userId })
    });
    replacePost(data.post);
  }

  async function toggleSave(post: Post) {
    const data = await requestJson<{ post: Post }>(`/api/posts/${post.id}/save`, {
      method: "POST",
      body: JSON.stringify({ userId })
    });
    replacePost(data.post);
  }

  async function addComment(post: Post, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const data = await requestJson<{ post: Post }>(`/api/posts/${post.id}/comments`, {
      method: "POST",
      body: JSON.stringify({ userId, text: trimmed })
    });
    replacePost(data.post);
  }

  async function createPost(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const data = await requestJson<{ post: Post }>("/api/posts", {
        method: "POST",
        body: JSON.stringify({ userId, caption, imageUrl, location })
      });
      setPosts((items) => [data.post, ...items]);
      setCaption("");
      setImageUrl(fallbackImage);
      setLocation("Studio board");
      setComposerOpen(false);
    } catch (event) {
      setError(event instanceof Error ? event.message : "Failed to create post");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <button className="brand" type="button" onClick={() => setProfile(null)} title="Home">
          <Instagram size={28} />
          <span>OSSgram</span>
        </button>
        <nav className="nav-list">
          <button className="nav-button active" type="button" onClick={() => setProfile(null)} title="Home">
            <Home size={26} />
            <span>Home</span>
          </button>
          <a className="nav-button" href="#search" title="Search">
            <Search size={26} />
            <span>Search</span>
          </a>
          <button className="nav-button" type="button" title="Explore">
            <Compass size={26} />
            <span>Explore</span>
          </button>
          <button className="nav-button" type="button" title="Reels">
            <SquarePlay size={26} />
            <span>Reels</span>
          </button>
          <button className="nav-button with-badge" type="button" title="Messages">
            <Send size={26} />
            <span>Messages</span>
            <em>2</em>
          </button>
          <button className="nav-button" type="button" title="Notifications">
            <Heart size={26} />
            <span>Notifications</span>
          </button>
          <button className="nav-button" type="button" onClick={() => setComposerOpen((value) => !value)} title="Create post">
            <PlusSquare size={26} />
            <span>Create</span>
          </button>
          <button className="nav-button" type="button" onClick={() => currentUser && openProfile(currentUser.username)} title="Profile">
            {currentUser ? <Avatar user={currentUser} size="sm" /> : <UserRound size={26} />}
            <span>Profile</span>
          </button>
          <button className="nav-button menu-button" type="button" title="More">
            <Menu size={26} />
            <span>More</span>
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="mobile-header">
          <button className="brand compact" type="button" onClick={() => setProfile(null)} title="Home">
            <Instagram size={24} />
            <span>OSSgram</span>
          </button>
          <button className="icon-button" type="button" title="Direct messages" aria-label="Direct messages">
            <Send size={20} />
          </button>
        </header>

        {profile ? (
          <ProfileView profile={profile} onBack={() => setProfile(null)} onLike={toggleLike} onSave={toggleSave} onComment={addComment} />
        ) : (
          <>
            <section className="stories" aria-label="Stories">
              {stories.map((story) => (
                <button className="story" type="button" key={story.id} title={`${story.author.username} story`}>
                  <span className={`story-ring ${story.seen ? "seen" : ""}`}>
                    <img src={story.imageUrl} alt="" />
                  </span>
                  <span>{story.author.username}</span>
                </button>
              ))}
            </section>

            {composerOpen && (
              <section className="composer" id="compose" aria-label="Create post">
                <div className="composer-heading">
                  {currentUser && <Avatar user={currentUser} />}
                  <div>
                    <h2>새 게시글</h2>
                    <p>작성한 게시글은 백엔드 API로 저장됩니다.</p>
                  </div>
                </div>
                <form onSubmit={createPost} className="composer-form">
                  <label>
                    <span>Image URL</span>
                    <input value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} placeholder="https://..." />
                  </label>
                  <label>
                    <span>Location</span>
                    <input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
                  </label>
                  <label className="wide">
                    <span>Caption</span>
                    <textarea value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Write a caption..." rows={3} />
                  </label>
                  <button className="primary-button" type="submit">
                    <ImagePlus size={18} />
                    <span>공유</span>
                  </button>
                </form>
                {error && <p className="error">{error}</p>}
              </section>
            )}

            <section className="feed" aria-label="Feed">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onProfile={openProfile} onLike={toggleLike} onSave={toggleSave} onComment={addComment} />
              ))}
            </section>
          </>
        )}
      </main>

      <aside className="right-rail">
        {currentUser && (
          <section className="account-switcher">
            <Avatar user={currentUser} size="lg" />
            <div>
              <button className="text-link strong" type="button" onClick={() => openProfile(currentUser.username)}>
                {currentUser.username}
              </button>
              <p>{currentUser.name}</p>
            </div>
            <button className="switch-button" type="button">
              전환
            </button>
          </section>
        )}

        <section className="suggestions" id="search">
          <div className="suggestions-header">
            <h2>회원님을 위한 추천</h2>
            <button type="button">모두 보기</button>
          </div>
          <input className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="계정 검색" />
          <div className="user-list">
            {filteredUsers.slice(0, 5).map((user) => (
              <div className="user-row" key={user.id}>
                <button className="profile-button" type="button" onClick={() => openProfile(user.username)}>
                  <Avatar user={user} />
                  <span>
                    <strong>
                      {user.username}
                      {user.verified && <Verified />}
                    </strong>
                    <small>{user.name}</small>
                  </span>
                </button>
                <button className="small-button" type="button" onClick={() => switchUser(user)}>
                  팔로우
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer className="site-footer">소개 · 도움말 · 홍보 센터 · API · 개인정보처리방침 · 위치 · 언어</footer>
      </aside>
    </div>
  );
}

function ProfileView({
  profile,
  onBack,
  onLike,
  onSave,
  onComment
}: {
  profile: { user: User; posts: Post[] };
  onBack: () => void;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  onComment: (post: Post, text: string) => void;
}) {
  return (
    <section className="profile-view">
      <button className="text-link back-link" type="button" onClick={onBack}>
        Back to feed
      </button>
      <div className="profile-header">
        <Avatar user={profile.user} size="lg" />
        <div className="profile-meta">
          <h1>
            {profile.user.username}
            {profile.user.verified && <Verified />}
          </h1>
          <div className="profile-stats">
            <span>
              <strong>{profile.user.posts}</strong> posts
            </span>
            <span>
              <strong>{profile.user.followers.toLocaleString()}</strong> followers
            </span>
            <span>
              <strong>{profile.user.following.toLocaleString()}</strong> following
            </span>
          </div>
          <p className="profile-name">{profile.user.name}</p>
          <p>{profile.user.bio}</p>
          <a href={`https://${profile.user.website}`} target="_blank" rel="noreferrer">
            {profile.user.website}
          </a>
        </div>
      </div>
      <div className="profile-grid">
        {profile.posts.map((post) => (
          <PostCard key={post.id} post={post} compact onProfile={() => undefined} onLike={onLike} onSave={onSave} onComment={onComment} />
        ))}
      </div>
    </section>
  );
}

function PostCard({
  post,
  compact = false,
  onProfile,
  onLike,
  onSave,
  onComment
}: {
  post: Post;
  compact?: boolean;
  onProfile: (username: string) => void;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  onComment: (post: Post, text: string) => void;
}) {
  const [comment, setComment] = useState("");

  function submitComment(event: FormEvent) {
    event.preventDefault();
    onComment(post, comment);
    setComment("");
  }

  return (
    <article className={`post-card ${compact ? "compact-card" : ""}`}>
      <header className="post-header">
        <button className="profile-button" type="button" onClick={() => onProfile(post.author.username)}>
          <Avatar user={post.author} />
          <span>
            <strong>
              {post.author.username}
              {post.author.verified && <Verified />}
              <small className="inline-time"> · {timeAgo(post.createdAt)}</small>
            </strong>
            <small>{post.location || "OSSgram"}</small>
          </span>
        </button>
        <div className="post-header-actions">
          <button className="follow-link" type="button">
            팔로우
          </button>
          <button className="icon-button" type="button" title="More" aria-label="More options">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>
      <img className="post-image" src={post.imageUrl} alt={`${post.author.username} post`} />
      <div className="post-actions">
        <button className={`icon-button ${post.likedByMe ? "liked" : ""}`} type="button" onClick={() => onLike(post)} title="Like" aria-label="Like">
          <Heart size={22} fill={post.likedByMe ? "currentColor" : "none"} />
        </button>
        <button className="icon-button" type="button" title="Comment" aria-label="Comment">
          <MessageCircle size={22} />
        </button>
        <button className="icon-button" type="button" title="Share" aria-label="Share">
          <Send size={21} />
        </button>
        <button className={`icon-button save-button ${post.savedByMe ? "saved" : ""}`} type="button" onClick={() => onSave(post)} title="Save" aria-label="Save">
          <Bookmark size={22} fill={post.savedByMe ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="post-body">
        <p className="likes">{post.likeCount.toLocaleString()} likes</p>
        <p>
          <button className="text-link strong" type="button" onClick={() => onProfile(post.author.username)}>
            {post.author.username}
          </button>{" "}
          {post.caption}
        </p>
        <div className="comments">
          {post.comments.slice(-2).map((item) => (
            <p key={item.id}>
              <button className="text-link strong" type="button" onClick={() => onProfile(item.author.username)}>
                {item.author.username}
              </button>{" "}
              {item.text}
            </p>
          ))}
        </div>
        <time dateTime={post.createdAt}>{timeAgo(post.createdAt)} ago</time>
      </div>
      <form className="comment-form" onSubmit={submitComment}>
        <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment..." />
        <button className="text-link strong" type="submit">
          Post
        </button>
      </form>
    </article>
  );
}
