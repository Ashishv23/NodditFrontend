import React from "react";
import { View, Text } from "react-native";
import tw from "../tailwind";

export interface Comment {
  id: string;
  body: string;
}

const CommentItem: React.FC<{ comment: Comment }> = ({ comment }) => {
  return (
    <View style={tw`p-4 border-b border-gray-300`}>
      <Text style={tw`text-gray-800`}>{comment.body}</Text>
    </View>
  );
};

export default CommentItem;
