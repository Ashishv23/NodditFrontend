import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { getCommunities } from "../services/api";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackNavigationProp } from "@react-navigation/stack";
import tw from "../tailwind";
import MaterialIcons from "react-native-vector-icons/MaterialIcons"; // Import Profile Icon

interface Community {
  _id: string;
  name: string;
  description: string;
}

// Define the navigation parameter list
type RootStackParamList = {
  Home: undefined;
  Post: { postId: string };
  CreatePost: undefined;
  User: { userId: string };
  CommunityPosts: { communityId: string };
  Login: undefined;
  Register: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Use correct navigation type

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        const response = await getCommunities();
        console.log("API Response:", response);

        if (response.data && response.data.documents) {
          setCommunities(response.data.documents);
        } else {
          console.error("Invalid response structure", response);
        }
      } catch (error) {
        console.error("Error fetching communities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Fetch userId and navigate to Profile
  const handleProfilePress = async () => {
    try {
      const userIdString = await AsyncStorage.getItem("userId"); // userId is initially a string
      const userId = userIdString; // Convert to integer

      if (userId) {
        navigation.navigate("User", { userId });
      } else {
        console.error("No userId found in storage");
      }
    } catch (error) {
      console.error("Error fetching userId:", error);
    }
  };

  // Set navigation header options (Disable back button, add profile icon)
  useEffect(() => {
    navigation.setOptions({
      title: "Communities",
      headerLeft: () => null, // Disable back button
      headerRight: () => (
        <TouchableOpacity onPress={handleProfilePress} style={tw`mr-4`}>
          <MaterialIcons name="account-circle" size={28} color="black" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleCommunityPress = (communityId: string) => {
    navigation.navigate("CommunityPosts", { communityId }); // Fixed type issue
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 bg-gray-100 p-4`}>
      <FlatList
        data={communities}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleCommunityPress(item._id)}
            style={tw`bg-white rounded-lg shadow-md p-4 mb-3`}
          >
            <Text style={tw`text-lg font-semibold text-gray-800`}>
              {item.name}
            </Text>
            <Text style={tw`text-sm text-gray-600 mt-1`}>
              {item.description || "No description available"}
            </Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item._id}
      />
    </View>
  );
};

export default HomeScreen;
