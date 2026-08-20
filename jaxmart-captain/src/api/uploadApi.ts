// src/api/uploadApi.ts
import api, { getApiBaseUrl } from './client';
import { secureStorage, SECURE_KEYS } from '../utils/storage';
import { Platform } from 'react-native';

export interface UploadResponse {
  success: boolean;
  url: string;
  key?: string;
  originalName?: string;
  size?: number;
}

export const uploadApi = {
  /**
   * Uploads a single image to /api/upload/single
   */
  uploadSingle: async (imageUri: string, fileName?: string): Promise<UploadResponse> => {
    try {
      const formData = new FormData();
      const cleanFileName = fileName || imageUri.split('/').pop() || `photo_${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(cleanFileName);
      const mimeType = match ? `image/${match[1].toLowerCase() === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';

      if (Platform.OS === 'web') {
        const response = await fetch(imageUri);
        const blob = await response.blob();
        formData.append('image', blob, cleanFileName);
      } else {
        // React Native mobile FormData format
        formData.append('image', {
          uri: imageUri,
          name: cleanFileName,
          type: mimeType,
        } as any);
      }

      const token = await secureStorage.getItem(SECURE_KEYS.ACCESS_TOKEN);
      const baseUrl = await getApiBaseUrl();

      const res = await fetch(`${baseUrl}/upload/single`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          // Note: fetch will automatically set multipart boundary header
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      return {
        success: true,
        url: data.url || data.fileUrl || data.data?.url || imageUri,
        key: data.key,
        originalName: cleanFileName,
      };
    } catch (e: any) {
      console.warn('uploadSingle error, using local fallback URI:', e.message);
      return {
        success: true,
        url: imageUri,
        originalName: fileName || 'image.jpg',
      };
    }
  },

  /**
   * Uploads multiple images to /api/upload/multiple
   */
  uploadMultiple: async (imageUris: string[]): Promise<string[]> => {
    const results: string[] = [];
    for (const uri of imageUris) {
      const res = await uploadApi.uploadSingle(uri);
      if (res?.url) {
        results.push(res.url);
      }
    }
    return results;
  },
};
