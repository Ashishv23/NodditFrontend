import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { TouchableOpacity, Text } from "react-native";
import HomeScreen from "./screens/HomeScreen";
import UserScreen from "./screens/UserScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import CreatePostScreen from "./screens/CreatePostScreen";
import PostScreen from "./screens/PostScreen";
import CommunityPostsScreen from "./screens/CommunityPostsScreen";
import tw from "twrnc";

type RootStackParamList = {
  Home: undefined;
  Post: { postId: number };
  CreatePost: { communityId: string };
  User: { userId: string };
  CommunityPosts: { communityId: string };
  Login: undefined;
  Register: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Post" component={PostScreen} />
        <Stack.Screen name="CreatePost" component={CreatePostScreen} />
        <Stack.Screen
          name="User"
          component={UserScreen}
          options={{ title: "User Profile" }}
        />
        <Stack.Screen
          name="CommunityPosts"
          component={CommunityPostsScreen}
          options={({ navigation, route }) => ({
            title: "Community Posts",
            headerRight: () => {
              const { communityId } = route.params; 

              return (
                <TouchableOpacity
                  onPress={
                    () => navigation.navigate("CreatePost", { communityId }) 
                  }
                  style={tw`mr-4`}
                >
                  <Text style={tw`text-blue-500`}>Create Post</Text>
                </TouchableOpacity>
              );
            },
          })}
        />

        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
