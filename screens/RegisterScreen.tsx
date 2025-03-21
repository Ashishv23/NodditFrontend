import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { registerUser } from "../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import tw from "../tailwind";
import { StackScreenProps } from "@react-navigation/stack";

type RootStackParamList = {
  Home: undefined;
  Register: undefined;
  Login: undefined;
};

type RegisterScreenProps = StackScreenProps<RootStackParamList, "Register">;

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null, // ✅ Removes back button
    });
  }, [navigation]);

  const handleRegister = async () => {
    if (!username || !email || !password) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({ username, email, password });

      if (response?.token && response?.data?.user) {
        await AsyncStorage.setItem("signupResponse", JSON.stringify(response));
        await AsyncStorage.setItem("authToken", response.token);
        await AsyncStorage.setItem("userId", response.data.user._id.toString());

        Alert.alert("Success", "Registration successful!", [
          { text: "OK", onPress: () => navigation.replace("Home") },
        ]);
      } else {
        Alert.alert("Error", "Failed to register. Please try again.");
      }
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={tw`flex-1 justify-center px-6 bg-gray-100`}>
      <View style={tw`bg-white p-6 rounded-lg shadow-lg`}>
        <Text style={tw`text-sm text-gray-600`}>Username</Text>
        <TextInput
          style={tw`border border-gray-300 p-3 rounded-lg mb-4`}
          value={username}
          onChangeText={setUsername}
        />

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
          onPress={handleRegister}
          style={tw`bg-blue-500 py-3 rounded-lg mt-4`}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={tw`text-white text-center text-lg font-semibold`}>
              Register
            </Text>
          )}
        </TouchableOpacity>

        <View style={tw`mt-4 items-center flex-row justify-center`}>
          <Text style={tw`text-gray-800`}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={tw`text-blue-500 font-bold ml-1`}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RegisterScreen;
