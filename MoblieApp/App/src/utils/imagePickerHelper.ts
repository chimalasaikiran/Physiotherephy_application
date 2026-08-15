import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export interface ImagePickerOptions {
  aspect?: [number, number];
  quality?: number;
}

/**
 * Prompts user to choose between Camera ("Take Photo") and Gallery ("Choose from Gallery"),
 * requests necessary permissions, and returns the selected image URI (or null if canceled).
 */
export const promptAndPickImage = async (
  options: ImagePickerOptions = { aspect: [1, 1], quality: 0.8 }
): Promise<string | null> => {
  return new Promise((resolve) => {
    Alert.alert(
      'Profile Photo',
      'Choose an option to update your photo:',
      [
        {
          text: '📷 Take Photo',
          onPress: async () => {
            const uri = await takePhotoFromCamera(options);
            resolve(uri);
          },
        },
        {
          text: '🖼️ Choose from Gallery',
          onPress: async () => {
            const uri = await selectPhotoFromGallery(options);
            resolve(uri);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => resolve(null),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(null) }
    );
  });
};

/**
 * Launches device camera to capture a new profile photo.
 */
export const takePhotoFromCamera = async (
  options: ImagePickerOptions = { aspect: [1, 1], quality: 0.8 }
): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Camera permission is required to take a profile photo. Please enable camera permissions in settings.'
      );
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error taking photo from camera:', error);
    Alert.alert('Error', 'Failed to open camera. Please try again.');
    return null;
  }
};

/**
 * Launches photo gallery picker to choose an existing profile photo.
 */
export const selectPhotoFromGallery = async (
  options: ImagePickerOptions = { aspect: [1, 1], quality: 0.8 }
): Promise<string | null> => {
  try {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        'Permission Required',
        'Photo library permission is required to select a photo. Please enable gallery permissions in settings.'
      );
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: options.aspect || [1, 1],
      quality: options.quality || 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      return result.assets[0].uri;
    }

    return null;
  } catch (error) {
    console.error('Error picking photo from gallery:', error);
    Alert.alert('Error', 'Failed to open photo gallery. Please try again.');
    return null;
  }
};
