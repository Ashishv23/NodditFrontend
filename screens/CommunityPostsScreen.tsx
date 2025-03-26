import React, { useEffect, useState } from "react";
import { View, FlatList, ActivityIndicator } from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { getPostsByCommunityId } from "../services/api";
import tw from "../tailwind";
import PostItem from "../components/PostItem";
import { Post } from "../index.d";

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

  const reloadPosts = () => {
    setReload((prev) => !prev);
  };
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
  }, [communityId, reload]);

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
        key={communityId}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => PostItem({ post: item, reloadPosts })}
      />
    </View>
  );
};

export default CommunityPostsScreen;
