import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  BackHandler,
  Alert,
} from "react-native";
import { loginUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StackScreenProps } from "@react-navigation/stack";
import tw from "../tailwind";

type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
  User: { userId: string };
};

type LoginScreenProps = StackScreenProps<RootStackParamList, "Login">;

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          navigation.replace("Home");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();

    // Prevent going back to login after authentication
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        BackHandler.exitApp();
        return true;
      }
    );

    return () => backHandler.remove();
  }, [navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // Removes the back button
    });
  }, [navigation]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoggingIn(true);

    try {
      const response = await loginUser({ email, password });

      if (response?.token && response?.data?.user?._id) {
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("userId", response.data.user._id);

        Alert.alert("Success", "Login successful!", [
          { text: "OK", onPress: () => navigation.replace("Home") },
        ]);
      } else {
        Alert.alert("Error", "Login failed. Please check your credentials.");
      }
    } catch (error) {
      Alert.alert("Error", "Invalid credentials. Try again.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <View style={tw`flex-1 justify-center items-center`}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={tw`flex-1 justify-center px-6 bg-gray-100`}>
      <View style={tw`bg-white p-6 rounded-lg shadow-lg`}>
        <Text style={tw`text-sm text-gray-600`}>Email</Text>
        <TextInput
          style={tw`border border-gray-300 p-3 rounded-lg mb-4`}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={tw`text-sm text-gray-600`}>Password</Text>
        <TextInput
          style={tw`border border-gray-300 p-3 rounded-lg mb-4`}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={handleLogin}
          style={tw`bg-blue-500 py-3 rounded-lg mt-4`}
          disabled={isLoggingIn}
        >
          {isLoggingIn ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-semibold`}>
              Login
            </Text>
          )}
        </TouchableOpacity>

        <View style={tw`mt-4 items-center`}>
          <Text style={tw`text-gray-600`}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={tw`text-blue-500 font-bold mt-1 text-lg`}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
