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
  upvoteComment,
  downvoteComment,
  getUserById,
} from "../services/api";
import tw from "../tailwind";
import PostItem from "../components/PostItem";
import { Post, Comment } from "../index.d";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons"; // Import icons for upvote/downvote

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
        // Reload posts from the server
        reloadPosts();
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
  const [newComment, setNewComment] = useState(""); // State for new comment
  const [userVotes, setUserVotes] = useState<{
    [key: string]: "upvoted" | "downvoted" | null;
  }>({});
  const [showAllComments, setShowAllComments] = useState(false); // Track whether to show all comments

  const fetchCommentsAndUserVotes = async () => {
    try {
      const response = await getCommentsByPostId(postId);
      let commentsData = response.data.documents;

      // Sort comments by createdAt in descending order
      commentsData = commentsData.sort(
        (a: Comment, b: Comment) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in AsyncStorage");
        return;
      }

      const userResponse = await getUserById(userId);
      const upvotedComments = userResponse?.data?.user?.upvotedComments || [];
      const downvotedComments =
        userResponse?.data?.user?.downvotedComments || [];

      const userVotesData: { [key: string]: "upvoted" | "downvoted" | null } =
        {};
      commentsData.forEach((comment: Comment) => {
        if (upvotedComments.includes(comment._id)) {
          userVotesData[comment._id] = "upvoted";
        } else if (downvotedComments.includes(comment._id)) {
          userVotesData[comment._id] = "downvoted";
        } else {
          userVotesData[comment._id] = null;
        }
      });

      setComments(commentsData);
      setUserVotes(userVotesData);
    } catch (error) {
      console.error(
        `Error fetching comments or user data for post with id ${postId}:`,
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommentsAndUserVotes();
  }, [postId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert("Error", "Comment cannot be empty!");
      return;
    }

    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.error("User ID not found in AsyncStorage");
        return;
      }

      const comment = {
        content: newComment,
        parent: postId, // The post ID
        creator: userId, // The user ID
      };

      const response = await addCommentToPost(comment);

      if (response?.data) {
        // Option 1: Reload all comments from the server
        await fetchCommentsAndUserVotes();

        // Option 2: Update the comments state directly (if the API returns the full comment object)
        // setComments((prevComments) => [response.data, ...prevComments]);
      }

      setNewComment(""); // Clear the input field
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleUpvote = async (commentId: string) => {
    if (userVotes[commentId] === "upvoted") {
      // If already upvoted, do nothing
      return;
    }

    try {
      // If the user has downvoted, adjust the downvote count
      if (userVotes[commentId] === "downvoted") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  upvotes: comment.upvotes + 1,
                  downvotes: comment.downvotes - 1,
                }
              : comment
          )
        );
      } else {
        // Otherwise, just increase the upvote count
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, upvotes: comment.upvotes + 1 }
              : comment
          )
        );
      }

      // Call the API to upvote the comment
      await upvoteComment(commentId);

      // Update the userVotes state
      setUserVotes((prevVotes) => ({
        ...prevVotes,
        [commentId]: "upvoted",
      }));
    } catch (error) {
      console.error(`Error upvoting comment with id ${commentId}:`, error);
    }
  };

  const handleDownvote = async (commentId: string) => {
    if (userVotes[commentId] === "downvoted") {
      // If already downvoted, do nothing
      return;
    }

    try {
      // If the user has upvoted, adjust the upvote count
      if (userVotes[commentId] === "upvoted") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? {
                  ...comment,
                  upvotes: comment.upvotes - 1,
                  downvotes: comment.downvotes + 1,
                }
              : comment
          )
        );
      } else {
        // Otherwise, just increase the downvote count
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId
              ? { ...comment, downvotes: comment.downvotes + 1 }
              : comment
          )
        );
      }

      // Call the API to downvote the comment
      await downvoteComment(commentId);

      // Update the userVotes state
      setUserVotes((prevVotes) => ({
        ...prevVotes,
        [commentId]: "downvoted",
      }));
    } catch (error) {
      console.error(`Error downvoting comment with id ${commentId}:`, error);
    }
  };

  const visibleComments = showAllComments ? comments : comments.slice(0, 2); // Show all or first 2 comments

  if (loading) {
    return <ActivityIndicator size="small" color="#0000ff" />;
  }

  return (
    <View style={tw`mt-2`}>
      {comments.length > 0 ? (
        <>
          {visibleComments.map((comment) => (
            <View key={comment._id} style={tw`mb-2`}>
              <Text style={tw`text-gray-800 font-semibold`}>
                {comment.creator?.username || "Anonymous"}:
              </Text>
              <Text style={tw`text-gray-700 ml-4`}>{comment.content}</Text>
              <View style={tw`flex-row items-center mt-2`}>
                {/* Upvote Button */}
                <TouchableOpacity
                  onPress={() => handleUpvote(comment._id)}
                  style={tw`mr-4 flex-row items-center`}
                >
                  <FontAwesome
                    name="thumbs-up"
                    size={20}
                    color={
                      userVotes[comment._id] === "upvoted" ? "green" : "gray"
                    }
                  />
                  <Text style={tw`ml-2 text-gray-800`}>{comment.upvotes}</Text>
                </TouchableOpacity>

                {/* Downvote Button */}
                <TouchableOpacity
                  onPress={() => handleDownvote(comment._id)}
                  style={tw`mr-4 flex-row items-center`}
                >
                  <FontAwesome
                    name="thumbs-down"
                    size={20}
                    color={
                      userVotes[comment._id] === "downvoted" ? "red" : "gray"
                    }
                  />
                  <Text style={tw`ml-2 text-gray-800`}>
                    {comment.downvotes}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
        </>
      ) : (
        <Text style={tw`text-gray-600 italic`}>No comments yet.</Text>
      )}

      {/* Add Comment Section */}
      <View style={tw`mt-4`}>
        <TextInput
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          style={tw`border border-gray-300 rounded-lg p-2`}
        />
        <TouchableOpacity
          onPress={handleAddComment}
          style={tw`bg-blue-500 p-2 rounded-lg mt-2`}
        >
          <Text style={tw`text-white text-center`}>Post Comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommunityPostsScreen;
