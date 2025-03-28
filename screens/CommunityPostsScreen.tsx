import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import {
  getPostsByCommunityId,
  getCommentsByPostId,
  addCommentToPost,
  deletePost,
  createPost,
} from "../services/api";
import tw from "../tailwind";
import PostItem from "../components/PostItem";
import { Post, Comment } from "../index.d";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";

type RootStackParamList = {
  Home: undefined;
  Post: { postId: string };
  CreatePost: { communityId: string };
  User: { userId: string };
  CommunityPosts: { communityId: string };
  Login: undefined;
  Register: undefined;
};

type CommunityPostsScreenProps = StackScreenProps<
  RootStackParamList,
  "CommunityPosts"
>;

const CommunityPostsScreen: React.FC<CommunityPostsScreenProps> = ({
  route,
}) => {
  const { communityId } = route.params;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);

  const reloadPosts = () => {
    setReload((prev) => !prev);
  };

  useEffect(() => {
    const fetchLoggedInUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        setLoggedInUserId(userId);
      } catch (error) {
        console.error("Error fetching logged-in user ID:", error);
      }
    };

    fetchLoggedInUserId();
  }, []);

  useEffect(() => {
    if (!communityId) {
      console.error("Error: communityId is missing!");
      return;
    }

    const fetchPosts = async () => {
      try {
        const response = await getPostsByCommunityId(communityId);
        if (response?.data?.documents) {
          setPosts(response.data.documents);
        } else {
          console.error("Invalid response structure:", response);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [communityId, reload]);

  useFocusEffect(
    React.useCallback(() => {
      reloadPosts();
    }, [])
  );

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePost(postId);
      reloadPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const confirmDeletePost = (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeletePost(postId),
        },
      ]
    );
  };

  const handleAddPost = async (newPost: Post) => {
    try {
      // Call the API to create the post
      const response = await createPost(newPost);

      if (response?.data) {
        // Option 1: Reload posts from the server
        reloadPosts();

        // Option 2: Update the posts state directly (optional)
        // setPosts((prevPosts) => [response.data, ...prevPosts]);
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 p-4 bg-gray-100`}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={tw`bg-white rounded-lg shadow-md p-4 mb-4`}>
            {/* Post Header with Name and Delete Button */}
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-gray-800 font-bold`}>
                {item.creator.username || "Anonymous"}
              </Text>
              {item.creator._id === loggedInUserId && (
                <TouchableOpacity
                  onPress={() => confirmDeletePost(item._id)}
                  style={tw`p-2`}
                >
                  <Text style={tw`text-red-500 font-bold`}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Post Content */}
            <View style={tw`mt-2`}>
              <PostItem post={item} reloadPosts={reloadPosts} />
            </View>

            {/* Comments Section */}
            <View style={tw`border-t border-gray-300 mt-4 pt-4`}>
              <CommentsSection postId={item._id} />
            </View>
          </View>
        )}
      />
    </View>
  );
};

const CommentsSection: React.FC<{ postId: string }> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await getCommentsByPostId(postId);
        setComments(response.data.documents.reverse());
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setComments([]);
        } else {
          console.error(
            `Error fetching comments for post with id ${postId}:`,
            error
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      return;
    }

    try {
      await addCommentToPost({
        parent: postId,
        content: newComment,
      });
      setNewComment("");

      const response = await getCommentsByPostId(postId);
      setComments(response.data.documents.reverse());
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return <ActivityIndicator size="small" color="#0000ff" />;
  }

  const visibleComments = showAllComments ? comments : comments.slice(0, 2);

  return (
    <View style={tw`mt-2`}>
      {comments.length > 0 ? (
        visibleComments.map((comment) => (
          <View key={comment._id} style={tw`mb-2`}>
            <Text style={tw`text-gray-800 font-semibold`}>
              {comment.creator?.username || "Anonymous"}:
            </Text>
            <Text style={tw`text-gray-700 ml-4`}>{comment.content}</Text>
          </View>
        ))
      ) : (
        <Text style={tw`text-gray-600 italic`}>No comments yet.</Text>
      )}
      {comments.length > 2 && (
        <TouchableOpacity
          onPress={() => setShowAllComments((prev) => !prev)}
          style={tw`mt-2`}
        >
          <Text style={tw`text-blue-500`}>
            {showAllComments ? "Show Less" : "Show More"}
          </Text>
        </TouchableOpacity>
      )}
      <View style={tw`mt-4`}>
        <Text style={tw`text-gray-800 font-semibold`}>Add a Comment:</Text>
        <TextInput
          style={tw`border border-gray-400 p-2 rounded-lg bg-white mt-1`}
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Write your comment..."
        />
        <TouchableOpacity
          onPress={handleAddComment}
          style={tw`bg-blue-500 p-3 rounded-lg mt-2`}
        >
          <Text style={tw`text-white text-center font-semibold`}>
            Add Comment
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommunityPostsScreen;
