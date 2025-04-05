import { List } from "lucide-react-native";
import { number, string } from "prop-types";

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

export interface Comment {
  _id: string;
  text: string;
  postId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  _id: string;
  title: string;
  description: string;
  mediaURLs: string[];
  communityId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  parent: string;
  creator: {
    _id: string;
    username: string;
    about: string;
    createdAt: string;
    karma: number;
    role: string;
    subscribedCommunities: string[];
  };
  createdAt: string;
  upvotes: number;
  downvotes: number;
  community: string;
  parentModel: "Post" | "Comment";
}
