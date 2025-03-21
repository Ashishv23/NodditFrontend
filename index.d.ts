export interface User {
  _id: string;
  username: string;
  about: string;
  role: string;
  subscribedCommunities: string[];
  karma: number;
}

export interface Community {
  _id: string;
  creator: User;
  name: string;
  moderators: User[];
  avatar: string;
  cover: string;
  description: string;
  userFlairs: string[];
  postFlairs: string[];
  score: number;
}

export interface Post {
  _id: string;
  creator: User;
  title: string;
  community: Community;
  description: string;
  mediaURLs: string[];
  score: number;
  upvotes: number;
  downvotes: number;
}