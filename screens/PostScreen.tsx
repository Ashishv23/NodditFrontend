import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getPostById, getCommentsByPostId } from "../services/api";
import CommentItem from "../components/CommentItem";
import tw from "../tailwind";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

interface Post {
  id: string;
  title: string;
  content: string;
}

interface Comment {
  id: string; // Ensuring 'id' exists
  body: string;
}

type RootStackParamList = {
  Home: undefined;
  Post: { postId: string };
  CreatePost: undefined;
  User: { userId: string };
  Login: undefined;
  Register: undefined;
};

interface PostScreenProps {
  route: RouteProp<RootStackParamList, "Post">;
  navigation: StackNavigationProp<RootStackParamList, "Post">;
}

const PostScreen: React.FC<PostScreenProps> = ({ route }) => {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        // Fetch Post Data
        const postResponse = await getPostById(postId);
        if (postResponse?.data) {
          setPost({
            id: postResponse.data._id, // Ensure id is assigned correctly
            title: postResponse.data.title,
            content: postResponse.data.content,
          });
        } else {
          console.error("Invalid post response structure:", postResponse);
        }

        // Fetch Comments
        const commentsResponse = await getCommentsByPostId(postId);
        if (commentsResponse?.data) {
          const formattedComments = commentsResponse.data.map(
            (comment: any) => ({
              id: comment._id,
              body: comment.body,
            })
          );
          setComments(formattedComments);
        } else {
          console.error(
            "Invalid comments response structure:",
            commentsResponse
          );
        }
      } catch (error) {
        console.error(
          `Error fetching post or comments for postId ${postId}:`,
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [postId]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg font-bold text-red-500`}>Post not found</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 p-4`}>
      {/* Post Title & Content */}
      <Text style={tw`text-2xl font-bold text-gray-800`}>{post.title}</Text>
      <Text style={tw`mt-2 text-base text-gray-700`}>{post.content}</Text>

      {/* Comments Section */}
      <Text style={tw`mt-4 text-lg font-semibold text-gray-800`}>Comments</Text>
      {comments.length === 0 ? (
        <Text style={tw`text-gray-500 mt-2`}>No comments yet.</Text>
      ) : (
        <FlatList
          data={comments}
          renderItem={({ item }) => <CommentItem comment={item} />}
          keyExtractor={(item) => item.id} // Use corrected 'id'
        />
      )}
    </View>
  );
};

export default PostScreen;
