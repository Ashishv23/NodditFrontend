import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { getPostsByCommunityId } from "../services/api";
import tw from "../tailwind";

interface Post {
  _id: string;
  title: string;
  description: string;
}

type RootStackParamList = {
  Home: undefined;
  Post: { postId: string };
  CreatePost: undefined;
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

  useEffect(() => {
    if (!communityId) {
      console.error("Error: communityId is missing!");
      return;
    }

    const fetchPosts = async () => {
      try {
        console.log("Fetching posts for communityId:", communityId);

        const response = await getPostsByCommunityId(communityId);
        console.log("API Response:", response);

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
  }, [communityId]);

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 p-4`}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={tw`bg-white p-4 mb-3 rounded-lg shadow-md`}>
            <Text style={tw`text-lg font-bold`}>{item.title}</Text>
            <Text style={tw`text-gray-600 mt-2`}>{item.description}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default CommunityPostsScreen;
