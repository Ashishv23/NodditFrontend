import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import tw from "../tailwind"; 

interface Post {
  id: number;
  title: string;
  body: string;
}

type RootStackParamList = {
  Home: undefined;
  Post: { postId: number };
  CreatePost: undefined;
  User: { userId: number };
  Login: undefined;
  Register: undefined;
};

const PostItem = ({ post }: { post: Post }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("Post", { postId: post.id })}
    >
      <View style={tw`mb-4 p-4 bg-white rounded-lg shadow`}>
        <Text style={tw`text-lg font-bold`}>{post.title}</Text>
        <Text style={tw`mt-2 text-base`}>{post.body}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default PostItem;
