// src/api/ocrApi.ts
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';
import { parseGstin } from '../utils/gstParser';

export interface OcrExtractionResult {
  success: boolean;
  gstin?: string;
  rawText?: string;
  confidence?: number;
  message?: string;
}

// Indian GSTIN regular expression
const GSTIN_REGEX = /\b([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1})\b/i;

export const ocrApi = {
  /**
   * Extracts a 15-character Indian GSTIN from an image URI (camera photo or gallery pick)
   */
  extractGstinFromImage: async (imageUri: string): Promise<OcrExtractionResult> => {
    try {
      // 1. Read image as base64 using expo-file-system/legacy
      const base64Data = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 2. Attempt OCR cloud endpoint (OCR.space free engine)
      try {
        const formData = new FormData();
        formData.append('base64Image', `data:image/jpeg;base64,${base64Data}`);
        formData.append('language', 'eng');
        formData.append('isOverlayRequired', 'false');
        formData.append('detectOrientation', 'true');
        formData.append('scale', 'true');
        formData.append('OCREngine', '2');

        const { data } = await axios.post('https://api.ocr.space/parse/image', formData, {
          headers: {
            apikey: 'helloworld',
            'Content-Type': 'multipart/form-data',
          },
          timeout: 12000,
        });

        if (data && data.ParsedResults && data.ParsedResults.length > 0) {
          const rawText = data.ParsedResults.map((r: any) => r.ParsedText).join(' ');
          const match = rawText.match(GSTIN_REGEX);

          if (match && match[1]) {
            const detectedGstin = match[1].toUpperCase();
            const parsed = parseGstin(detectedGstin);
            if (parsed.isValidFormat) {
              return {
                success: true,
                gstin: detectedGstin,
                rawText,
                confidence: 0.95,
                message: `GSTIN ${detectedGstin} successfully detected from document photo.`,
              };
            }
          }
        }
      } catch (cloudErr: any) {
        console.warn('Cloud OCR service unavailable:', cloudErr?.message || cloudErr);
      }

      // 3. Structured fallback
      return {
        success: false,
        message: 'Could not read clear text. Please ensure good lighting and align the GSTIN within the scan box.',
      };
    } catch (e: any) {
      console.error('OCR processing error:', e);
      return {
        success: false,
        message: e?.message || 'Failed to process document image.',
      };
    }
  },

  /**
   * Extracts GSTIN from any raw text string (clipboard, QR payload, or scanned text)
   */
  extractGstinFromText: (text: string): string | null => {
    if (!text) return null;
    const match = text.match(GSTIN_REGEX);
    return match && match[1] ? match[1].toUpperCase() : null;
  },
};
