import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import tw from "../tailwind";

import { Post } from "../index.d";
import { WebView } from "react-native-webview";
import { ArrowUp, ArrowDown } from "lucide-react-native"; // Icons for upvote/downvote
import { upvotePost, downvotePost } from "../services/api";

type RootStackParamList = {
  Home: undefined;
  Post: { postId: number };
  CreatePost: undefined;
  User: { userId: number };
  Login: undefined;
  Register: undefined;
};

const PostItem = ({ post, reloadPosts }: { post: Post; reloadPosts: any }) => {
  const url = post.mediaURLs[0];
  const isYouTube = url.includes("youtube.com") || url.includes("youtu.be");

  // State for upvotes and downvotes
  const upvotes = post.upvotes;
  const downvotes = post.downvotes;

  const handleUpvote = async () => {
    await upvotePost(post._id);
    reloadPosts();
  };

  const handleDownvote = async () => {
    await downvotePost(post._id);
    reloadPosts();
  };

  return (
    <View style={tw`bg-white rounded-lg shadow-md p-4 my-4 overflow-hidden`}>
      {/* Creator Info */}
      <View style={tw`flex-row items-center mb-4`}>
        <Text
          style={tw`text-gray-700 font-bold`}
        >{`/u/${post.creator.username}`}</Text>
      </View>

      {/* Post Title */}
      <Text style={tw`text-lg font-bold`}>{post.title}</Text>

      {/* Expandable Description */}
      <Text style={tw`text-gray-600 mt-2`}>{post.description}</Text>

      {/* Media Container with Dynamic Height */}
      <View style={tw`w-full mt-4`}>
        {isYouTube ? (
          <WebView source={{ uri: url }} style={tw`h-64 w-full`} />
        ) : (
          <Image
            source={{ uri: url }}
            style={tw`h-64 w-full`}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Upvote & Downvote Buttons */}
      <View style={tw`flex-row justify-between items-center mt-4`}>
        <TouchableOpacity
          onPress={handleUpvote}
          style={tw`flex-row items-center`}
        >
          <ArrowUp color="green" size={24} />
          <Text style={tw`ml-2 text-gray-700`}>{upvotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownvote}
          style={tw`flex-row items-center`}
        >
          <ArrowDown color="red" size={24} />
          <Text style={tw`ml-2 text-gray-700`}>{downvotes}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PostItem;
