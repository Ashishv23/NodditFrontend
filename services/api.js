import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "https://2989-135-0-96-34.ngrok-free.app"; // Adjust the base URL as needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return null;
  }
};
// Function to attach Authorization token
const attachAuthToken = async (config) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    if (
      token &&
      !config.url.includes("/api/v1/users/signin") &&
      !config.url.includes("/api/v1/users/signup")
    ) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error attaching auth token:", error);
  }
  return config;
};

// Use interceptor with async storage
api.interceptors.request.use(
  async (config) => {
    return attachAuthToken(config);
  },
  (error) => Promise.reject(error)
);

// Posts
export const getPosts = async () => {
  try {
    const response = await api.get("/api/v1/posts");
    return response.data;
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

export const getPostById = async (id) => {
  try {
    const response = await api.get(`/api/v1/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    throw error;
  }
};

export const createPost = async (post) => {
  try {
    const response = await api.post("/api/v1/posts", post);
    return response.data;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const getPostsByCommunityId = async (communityId) => {
  try {
    console.log("API Request: Fetching posts for Community ID:", communityId);

    const response = await api.get("/api/v1/posts/", {
      params: { community: communityId },
    });

    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching posts for community ID ${communityId}:`,
      error
    );
    throw error;
  }
};

export const updatePost = async (id, post) => {
  try {
    const response = await api.put(`/api/v1/posts/${id}`, post);
    return response.data;
  } catch (error) {
    console.error(`Error updating post with id ${id}:`, error);
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    const response = await api.delete(`/api/v1/posts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting post with id ${id}:`, error);
    throw error;
  }
};

// Communities
export const getCommunities = async () => {
  try {
    const response = await api.get("/api/v1/communities");
    // console.log(response.data.data.documents);
    return response.data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    throw error;
  }
};

// Comments
export const getCommentsByPostId = async (postId) => {
  try {
    const response = await api.get(`/api/v1/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comments for post with id ${postId}:`, error);
    throw error;
  }
};

export const addCommentToPost = async (postId, comment) => {
  try {
    const response = await api.post(
      `/api/v1/posts/${postId}/comments`,
      comment
    );
    return response.data;
  } catch (error) {
    console.error(`Error adding comment to post with id ${postId}:`, error);
    throw error;
  }
};

export const updateComment = async (id, comment) => {
  try {
    const response = await api.put(`/api/v1/comments/${id}`, comment);
    return response.data;
  } catch (error) {
    console.error(`Error updating comment with id ${id}:`, error);
    throw error;
  }
};

export const deleteComment = async (id) => {
  try {
    const response = await api.delete(`/api/v1/comments/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting comment with id ${id}:`, error);
    throw error;
  }
};

export const getUserId = async () => {
  try {
    const signupResponse = await AsyncStorage.getItem("signupResponse");
    if (!signupResponse) return null;

    const parsedResponse = JSON.parse(signupResponse); // ✅ Parse the stored JSON
    return parsedResponse?.data?.user?._id || null; // ✅ Get `userId` safely
  } catch (error) {
    console.error("Error fetching userId from signupResponse:", error);
    return null;
  }
};

// Users
export const getUsers = async () => {
  try {
    const response = await api.get("/api/v1/users");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await api.get(`/api/v1/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

export const createUser = async (user) => {
  try {
    const response = await api.post("/api/v1/users", user);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

export const updateUser = async (id, user) => {
  try {
    const response = await api.put(`/api/v1/users/${id}`, user);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/api/v1/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

// Authentication
export const loginUser = async (credentials) => {
  try {
    const response = await api.post("/api/v1/users/signin", credentials);

    if (response.data.token && response.data.data?.user?._id) {
      const userId = response.data.data.user._id.toString(); // ✅ Ensure userId is stored as a string
      await AsyncStorage.setItem(
        "signupResponse",
        JSON.stringify(response.data)
      );
      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem("userId", userId); // ✅ Always store as string
      console.log("Stored userId:", userId);
    }

    return response.data;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const registerUser = async (user) => {
  try {
    const response = await api.post("/api/v1/users/signup", user);
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Votes
export const upvotePost = async (postId) => {
  try {
    const response = await api.post(`/api/v1/posts/${postId}/upvote`);
    return response.data;
  } catch (error) {
    console.error(`Error upvoting post with id ${postId}:`, error);
    throw error;
  }
};

export const downvotePost = async (postId) => {
  try {
    const response = await api.post(`/api/v1/posts/${postId}/downvote`);
    return response.data;
  } catch (error) {
    console.error(`Error downvoting post with id ${postId}:`, error);
    throw error;
  }
};

export const upvoteComment = async (commentId) => {
  try {
    const response = await api.post(`/api/v1/comments/${commentId}/upvote`);
    return response.data;
  } catch (error) {
    console.error(`Error upvoting comment with id ${commentId}:`, error);
    throw error;
  }
};

export const downvoteComment = async (commentId) => {
  try {
    const response = await api.post(`/api/v1/comments/${commentId}/downvote`);
    return response.data;
  } catch (error) {
    console.error(`Error downvoting comment with id ${commentId}:`, error);
    throw error;
  }
};
