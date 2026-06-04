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
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { Post, Story, User } from "./types";

const fallbackImage = "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=80";
type ActiveView = "feed" | "explore" | "reels" | "messages" | "notifications" | "more";

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
  const [activeView, setActiveView] = useState<ActiveView>("feed");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(() => new Set(["u_mina", "u_luma"]));
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [toast, setToast] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const source = currentUser ? users.filter((user) => user.id !== currentUser.id) : users;
    if (!normalized) return source;
    return source.filter((user) => `${user.username} ${user.name} ${user.bio}`.toLowerCase().includes(normalized));
  }, [currentUser, query, users]);

  const visibleSuggestions = showAllSuggestions ? filteredUsers : filteredUsers.slice(0, 5);

  function notify(message: string) {
    setToast(message);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setToast(""), 2400);
  }

  function goHome() {
    setProfile(null);
    setActiveView("feed");
    setComposerOpen(false);
  }

  function openView(view: ActiveView) {
    setProfile(null);
    setActiveView(view);
    setComposerOpen(false);
  }

  function focusSearch() {
    setProfile(null);
    setActiveView("feed");
    setComposerOpen(false);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function toggleFollow(user: User) {
    setFollowedUsers((previous) => {
      const next = new Set(previous);
      if (next.has(user.id)) {
        next.delete(user.id);
        notify(`${user.username} 팔로우를 취소했습니다.`);
      } else {
        next.add(user.id);
        notify(`${user.username} 계정을 팔로우했습니다.`);
      }
      return next;
    });
  }

  function switchToNextUser() {
    if (!currentUser || users.length < 2) return;
    const index = users.findIndex((user) => user.id === currentUser.id);
    const next = users[(index + 1) % users.length];
    void switchUser(next);
    notify(`${next.username} 계정으로 전환했습니다.`);
  }

  function sharePost(post: Post) {
    const url = `${window.location.origin}/posts/${post.id}`;
    void navigator.clipboard?.writeText(url).catch(() => undefined);
    notify("게시글 링크를 복사했습니다.");
  }

  function openPostMenu(post: Post) {
    notify(`${post.author.username} 게시글 메뉴를 열었습니다.`);
  }

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
        <button className="brand" type="button" onClick={goHome} title="Home">
          <Instagram size={28} />
          <span>OSSgram</span>
        </button>
        <nav className="nav-list">
          <button className={`nav-button ${activeView === "feed" && !profile ? "active" : ""}`} type="button" onClick={goHome} title="Home">
            <Home size={26} />
            <span>Home</span>
          </button>
          <button className="nav-button" type="button" onClick={focusSearch} title="Search">
            <Search size={26} />
            <span>Search</span>
          </button>
          <button className={`nav-button ${activeView === "explore" ? "active" : ""}`} type="button" onClick={() => openView("explore")} title="Explore">
            <Compass size={26} />
            <span>Explore</span>
          </button>
          <button className={`nav-button ${activeView === "reels" ? "active" : ""}`} type="button" onClick={() => openView("reels")} title="Reels">
            <SquarePlay size={26} />
            <span>Reels</span>
          </button>
          <button className={`nav-button with-badge ${activeView === "messages" ? "active" : ""}`} type="button" onClick={() => openView("messages")} title="Messages">
            <Send size={26} />
            <span>Messages</span>
            <em>2</em>
          </button>
          <button className={`nav-button ${activeView === "notifications" ? "active" : ""}`} type="button" onClick={() => openView("notifications")} title="Notifications">
            <Heart size={26} />
            <span>Notifications</span>
          </button>
          <button
            className="nav-button"
            type="button"
            onClick={() => {
              setProfile(null);
              setActiveView("feed");
              setComposerOpen((value) => !value);
            }}
            title="Create post"
          >
            <PlusSquare size={26} />
            <span>Create</span>
          </button>
          <button className="nav-button" type="button" onClick={() => currentUser && openProfile(currentUser.username)} title="Profile">
            {currentUser ? <Avatar user={currentUser} size="sm" /> : <UserRound size={26} />}
            <span>Profile</span>
          </button>
          <button className={`nav-button menu-button ${activeView === "more" ? "active" : ""}`} type="button" onClick={() => openView("more")} title="More">
            <Menu size={26} />
            <span>More</span>
          </button>
        </nav>
      </aside>

      <main className="content">
        <header className="mobile-header">
          <button className="brand compact" type="button" onClick={goHome} title="Home">
            <Instagram size={24} />
            <span>OSSgram</span>
          </button>
          <button className="icon-button" type="button" onClick={() => openView("messages")} title="Direct messages" aria-label="Direct messages">
            <Send size={20} />
          </button>
        </header>

        {profile ? (
          <ProfileView
            profile={profile}
            followedUsers={followedUsers}
            onBack={goHome}
            onProfile={openProfile}
            onFollow={toggleFollow}
            onLike={toggleLike}
            onSave={toggleSave}
            onComment={addComment}
            onShare={sharePost}
            onMore={openPostMenu}
          />
        ) : activeView !== "feed" ? (
          <UtilityView
            currentUser={currentUser}
            followedUsers={followedUsers}
            posts={posts}
            users={users}
            view={activeView}
            onBack={goHome}
            onFollow={toggleFollow}
            onNotify={notify}
            onProfile={openProfile}
          />
        ) : (
          <>
            <section className="stories" aria-label="Stories">
              {stories.map((story) => (
                <button className="story" type="button" key={story.id} onClick={() => setSelectedStory(story)} title={`${story.author.username} story`}>
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
                <PostCard
                  key={post.id}
                  followedUsers={followedUsers}
                  post={post}
                  onComment={addComment}
                  onFollow={toggleFollow}
                  onLike={toggleLike}
                  onMore={openPostMenu}
                  onProfile={openProfile}
                  onSave={toggleSave}
                  onShare={sharePost}
                />
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
            <button className="switch-button" type="button" onClick={switchToNextUser}>
              전환
            </button>
          </section>
        )}

        <section className="suggestions" id="search">
          <div className="suggestions-header">
            <h2>회원님을 위한 추천</h2>
            <button type="button" onClick={() => setShowAllSuggestions((value) => !value)}>
              {showAllSuggestions ? "접기" : "모두 보기"}
            </button>
          </div>
          <input ref={searchInputRef} className="search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="계정 검색" />
          <div className="user-list">
            {visibleSuggestions.map((user) => (
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
                <button className={`small-button ${followedUsers.has(user.id) ? "following" : ""}`} type="button" onClick={() => toggleFollow(user)}>
                  {followedUsers.has(user.id) ? "팔로잉" : "팔로우"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <footer className="site-footer">소개 · 도움말 · 홍보 센터 · API · 개인정보처리방침 · 위치 · 언어</footer>
      </aside>
      {selectedStory && <StoryViewer story={selectedStory} onClose={() => setSelectedStory(null)} onProfile={openProfile} />}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}

function StoryViewer({ story, onClose, onProfile }: { story: Story; onClose: () => void; onProfile: (username: string) => void }) {
  return (
    <div className="story-viewer" role="dialog" aria-modal="true" aria-label={`${story.author.username} story`}>
      <div className="story-viewer-card">
        <header>
          <button
            className="profile-button"
            type="button"
            onClick={() => {
              onClose();
              onProfile(story.author.username);
            }}
          >
            <Avatar user={story.author} />
            <strong>{story.author.username}</strong>
          </button>
          <button className="story-close" type="button" onClick={onClose} aria-label="Close story">
            닫기
          </button>
        </header>
        <img src={story.imageUrl} alt={`${story.author.username} story`} />
        <p>{story.label}</p>
      </div>
    </div>
  );
}

function UtilityView({
  currentUser,
  followedUsers,
  posts,
  users,
  view,
  onBack,
  onFollow,
  onNotify,
  onProfile
}: {
  currentUser: User | null;
  followedUsers: Set<string>;
  posts: Post[];
  users: User[];
  view: ActiveView;
  onBack: () => void;
  onFollow: (user: User) => void;
  onNotify: (message: string) => void;
  onProfile: (username: string) => void;
}) {
  const otherUsers = currentUser ? users.filter((user) => user.id !== currentUser.id) : users;
  const titleMap: Record<ActiveView, string> = {
    feed: "홈",
    explore: "탐색",
    reels: "릴스",
    messages: "메시지",
    notifications: "알림",
    more: "더보기"
  };

  return (
    <section className="utility-view">
      <header className="utility-header">
        <button className="text-link back-link" type="button" onClick={onBack}>
          홈으로
        </button>
        <h1>{titleMap[view]}</h1>
      </header>

      {view === "explore" && (
        <div className="explore-grid">
          {posts.map((post) => (
            <button key={post.id} type="button" onClick={() => onNotify(`${post.author.username} 게시글을 선택했습니다.`)}>
              <img src={post.imageUrl} alt={`${post.author.username} explore`} />
              <span>{post.author.username}</span>
            </button>
          ))}
        </div>
      )}

      {view === "reels" && (
        <div className="reels-list">
          {posts.map((post) => (
            <article className="reel-card" key={post.id}>
              <img src={post.imageUrl} alt={`${post.author.username} reel`} />
              <div>
                <button className="profile-button" type="button" onClick={() => onProfile(post.author.username)}>
                  <Avatar user={post.author} />
                  <strong>{post.author.username}</strong>
                </button>
                <p>{post.caption}</p>
                <button className="small-button" type="button" onClick={() => onNotify("릴스를 재생했습니다.")}>
                  재생
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {view === "messages" && (
        <div className="message-list">
          {otherUsers.map((user) => (
            <article className="message-row" key={user.id}>
              <button className="profile-button" type="button" onClick={() => onProfile(user.username)}>
                <Avatar user={user} />
                <span>
                  <strong>{user.username}</strong>
                  <small>새 메시지를 보낼 수 있습니다.</small>
                </span>
              </button>
              <button className="small-button" type="button" onClick={() => onNotify(`${user.username}에게 메시지를 보냈습니다.`)}>
                보내기
              </button>
            </article>
          ))}
        </div>
      )}

      {view === "notifications" && (
        <div className="notification-list">
          {otherUsers.slice(0, 4).map((user, index) => (
            <article className="notification-row" key={user.id}>
              <button className="profile-button" type="button" onClick={() => onProfile(user.username)}>
                <Avatar user={user} />
                <span>
                  <strong>{user.username}</strong>
                  <small>{index % 2 === 0 ? "회원님의 게시글을 좋아합니다." : "회원님을 팔로우하기 시작했습니다."}</small>
                </span>
              </button>
              <button className={`small-button ${followedUsers.has(user.id) ? "following" : ""}`} type="button" onClick={() => onFollow(user)}>
                {followedUsers.has(user.id) ? "팔로잉" : "팔로우"}
              </button>
            </article>
          ))}
        </div>
      )}

      {view === "more" && (
        <div className="more-menu">
          {["설정", "저장됨", "내 활동", "모양 전환", "문제 신고"].map((label) => (
            <button key={label} type="button" onClick={() => onNotify(`${label} 메뉴를 열었습니다.`)}>
              {label}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function ProfileView({
  followedUsers,
  profile,
  onBack,
  onFollow,
  onMore,
  onProfile,
  onLike,
  onSave,
  onShare,
  onComment
}: {
  followedUsers: Set<string>;
  profile: { user: User; posts: Post[] };
  onBack: () => void;
  onFollow: (user: User) => void;
  onMore: (post: Post) => void;
  onProfile: (username: string) => void;
  onLike: (post: Post) => void;
  onSave: (post: Post) => void;
  onShare: (post: Post) => void;
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
          <PostCard
            key={post.id}
            compact
            followedUsers={followedUsers}
            post={post}
            onComment={onComment}
            onFollow={onFollow}
            onLike={onLike}
            onMore={onMore}
            onProfile={onProfile}
            onSave={onSave}
            onShare={onShare}
          />
        ))}
      </div>
    </section>
  );
}

function PostCard({
  followedUsers,
  post,
  compact = false,
  onFollow,
  onProfile,
  onLike,
  onMore,
  onSave,
  onShare,
  onComment
}: {
  followedUsers: Set<string>;
  post: Post;
  compact?: boolean;
  onFollow: (user: User) => void;
  onProfile: (username: string) => void;
  onLike: (post: Post) => void;
  onMore: (post: Post) => void;
  onSave: (post: Post) => void;
  onShare: (post: Post) => void;
  onComment: (post: Post, text: string) => void;
}) {
  const [comment, setComment] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);

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
          <button className={`follow-link ${followedUsers.has(post.author.id) ? "following" : ""}`} type="button" onClick={() => onFollow(post.author)}>
            {followedUsers.has(post.author.id) ? "팔로잉" : "팔로우"}
          </button>
          <button className="icon-button" type="button" onClick={() => onMore(post)} title="More" aria-label="More options">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </header>
      <img className="post-image" src={post.imageUrl} alt={`${post.author.username} post`} />
      <div className="post-actions">
        <button className={`icon-button ${post.likedByMe ? "liked" : ""}`} type="button" onClick={() => onLike(post)} title="Like" aria-label="Like">
          <Heart size={22} fill={post.likedByMe ? "currentColor" : "none"} />
        </button>
        <button className="icon-button" type="button" onClick={() => commentInputRef.current?.focus()} title="Comment" aria-label="Comment">
          <MessageCircle size={22} />
        </button>
        <button className="icon-button" type="button" onClick={() => onShare(post)} title="Share" aria-label="Share">
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
        <input ref={commentInputRef} value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment..." />
        <button className="text-link strong" type="submit">
          Post
        </button>
      </form>
    </article>
  );
}
