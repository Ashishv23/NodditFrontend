import React, { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { createPost } from "../services/api";
import tw from "../tailwind";
import { NavigationProp } from "@react-navigation/native";

interface CreatePostScreenProps {
  navigation: NavigationProp<any>;
}

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({ navigation }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSubmit = async () => {
    try {
      await createPost({ title, body });
      navigation.goBack();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <View style={tw`flex-1 p-4`}>
      <Text style={tw`text-lg font-bold mb-2`}>Title</Text>
      <TextInput
        style={tw`border border-gray-300 p-2 mb-4 rounded`}
        value={title}
        onChangeText={setTitle}
      />
      <Text style={tw`text-lg font-bold mb-2`}>Body</Text>
      <TextInput
        style={tw`border border-gray-300 p-2 mb-4 rounded`}
        value={body}
        onChangeText={setBody}
        multiline
      />
      <Button title="Create Post" onPress={handleSubmit} />
    </View>
  );
};

export default CreatePostScreen;
