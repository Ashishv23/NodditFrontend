import React, { useState } from "react";
import {
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Button,
} from "react-native";
import { createPost } from "../services/api";
import tw from "../tailwind";
import { StackScreenProps } from "@react-navigation/stack";
import * as ImagePicker from "expo-image-picker";

// Define RootStackParamList properly
type RootStackParamList = {
  CreatePost: { communityId: string };
};

type CreatePostScreenProps = StackScreenProps<RootStackParamList, "CreatePost">;

const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  navigation,
  route,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaURL, setMediaURL] = useState("");
  const [media, setMedia] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { communityId } = route.params;

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission required",
        "We need camera roll permissions to access your media."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled) {
      setMedia(result.assets[0]);
    }
  };

  const uploadMedia = async () => {
    if (!media) return null;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", {
        uri: media.uri,
        type: media.type || "image/jpeg",
        name: media.fileName || "upload.jpg",
      });

      const response = await fetch("https://your-api-endpoint.com/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const data = await response.json();
      setMediaURL(data.url);
      return data.url;
    } catch (error) {
      console.error("Error uploading media:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      let finalMediaURL = mediaURL;
      if (media && !mediaURL) {
        finalMediaURL = await uploadMedia();
      }

      await createPost({
        title,
        description,
        mediaURL: finalMediaURL,
        community: communityId, // ✅ Now it correctly uses communityId
      });

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
      <Text style={tw`text-lg font-bold mb-2`}>Description</Text>
      <TextInput
        style={tw`border border-gray-300 p-2 mb-4 rounded`}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={tw`text-lg font-bold mb-2`}>Media</Text>
      <TouchableOpacity
        style={tw`border border-gray-300 p-4 mb-4 rounded flex items-center justify-center`}
        onPress={pickMedia}
      >
        {media ? (
          <Image source={{ uri: media.uri }} style={tw`w-full h-40 rounded`} />
        ) : (
          <Text style={tw`text-gray-500`}>Tap to select photo/video</Text>
        )}
      </TouchableOpacity>

      {isUploading && (
        <View style={tw`flex-row items-center justify-center mb-4`}>
          <ActivityIndicator size="small" color="#0000ff" />
          <Text style={tw`ml-2`}>Uploading media...</Text>
        </View>
      )}

      <Button
        title="Create Post"
        onPress={handleSubmit}
        disabled={isUploading}
      />
    </View>
  );
};

export default CreatePostScreen;
