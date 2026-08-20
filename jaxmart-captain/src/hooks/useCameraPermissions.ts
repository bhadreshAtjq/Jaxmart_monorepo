// src/hooks/useCameraPermissions.ts
import { useCameraPermissions as useExpoCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';

export const useCameraPermissions = () => {
  const [cameraPermission, requestCameraPermission] = useExpoCameraPermissions();

  const requestAllMediaPermissions = async (): Promise<boolean> => {
    let camGranted = cameraPermission?.granted;
    if (!camGranted) {
      const res = await requestCameraPermission();
      camGranted = res.granted;
    }

    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return Boolean(camGranted && mediaStatus === 'granted');
  };

  return {
    cameraPermission,
    requestCameraPermission,
    requestAllMediaPermissions,
    isCameraGranted: Boolean(cameraPermission?.granted),
  };
};
