import React, { useEffect, useState } from "react";
import { View, Text, Button, ActivityIndicator, Alert } from "react-native";
import { getUserById, getUserId } from "../services/api";
import UserProfile from "../components/UserProfile";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "../tailwind";
import { StackScreenProps } from "@react-navigation/stack";

interface User {
  _id: string;
  username: string;
  email: string;
  about: string;
  role: string;
  subscribedCommunities: string[];
  karma: number;
  upvotedPosts: string[];
  downvotedPosts: string[];
  upvotedComments: string[];
  downvotedComments: string[];
  upvotedReplies: string[];
  downvotedReplies: string[];
}

type RootStackParamList = {
  Home: undefined;
  Post: { postId: number };
  CreatePost: undefined;
  User: { userId: string };
  Login: undefined;
  Register: undefined;
};

type UserScreenProps = StackScreenProps<RootStackParamList, "User">;

const UserScreen: React.FC<UserScreenProps> = ({ navigation }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Fetch userId from AsyncStorage (signupResponse)
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await getUserId();
        if (!storedUserId) {
          Alert.alert("Error", "User ID is missing!", [
            { text: "OK", onPress: () => navigation.replace("Login") },
          ]);
        } else {
          setUserId(storedUserId);
          // console.log("Fetched userId:", storedUserId);
        }
      } catch (error) {
        console.error("Error fetching userId:", error);
      }
    };

    fetchUserId();
  }, []);

  // ✅ Fetch user details after userId is set
  useEffect(() => {
    if (!userId) return; // Prevents unnecessary API calls

    const fetchUser = async () => {
      try {
        // console.log("Fetching user with ID:", userId);
        const response = await getUserById(userId);

        if (response?.data?.user) {
          // console.log("User data received:", response.data.user);
          setUser(response.data.user);
        } else {
          console.error("Invalid user data format", response);
          Alert.alert("Error", "User not found!", [
            { text: "OK", onPress: () => navigation.replace("Login") },
          ]);
        }
      } catch (error) {
        console.error(`Error fetching user with ID ${userId}:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  // ✅ Logout function: Clear AsyncStorage and navigate to Login
  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <Text style={tw`text-lg font-bold text-red-500`}>User not found</Text>
      </View>
    );
  }

  return (
    <View style={tw`flex-1 p-4`}>
      <View style={tw`bg-white p-6 rounded-lg shadow-md`}>
        <Text style={tw`text-2xl font-bold text-gray-800`}>
          {user.username}
        </Text>
        <Text style={tw`text-gray-600 mt-1`}>{user.email}</Text>
        <Text style={tw`text-sm text-gray-500 mt-2`}>Role: {user.role}</Text>
        <Text style={tw`text-sm text-gray-500`}>Karma: {user.karma}</Text>

        {user.about ? (
          <Text style={tw`text-gray-700 mt-4`}>{user.about}</Text>
        ) : (
          <Text style={tw`text-gray-400 mt-4`}>No bio available</Text>
        )}
      </View>

      <View style={tw`mt-6`}>
        <Button title="Logout" onPress={handleLogout} color="red" />
      </View>
    </View>
  );
};

export default UserScreen;
