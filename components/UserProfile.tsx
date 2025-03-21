import React from "react";
import { View, Text } from "react-native";
import tw from "../tailwind";

interface User {
  _id: string; // ✅ Change `id` to `_id`
  username: string;
}

const UserProfile = ({ user }: { user: User }) => {
  return (
    <View style={tw`flex-1 p-4`}>
      <Text style={tw`text-lg font-bold`}>{user.username}</Text>
      <Text style={tw`text-sm text-gray-600`}>User ID: {user._id}</Text>{" "}
      {/* ✅ Display `_id` */}
    </View>
  );
};

export default UserProfile;
