export type User = {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio: string;
  website: string;
  followers: number;
  following: number;
  verified: boolean;
  posts: number;
};

export type Story = {
  id: string;
  label: string;
  imageUrl: string;
  seen: boolean;
  author: User;
};

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  author: User;
};

export type Post = {
  id: string;
  imageUrl: string;
  caption: string;
  location: string;
  createdAt: string;
  author: User;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  comments: Comment[];
};
