/**
 * Utility functions for uploading images to Bubble.io
 */

import { getBubbleEndpoint } from '@/config/bubbleEndpoints';

export interface ImageUploadResponse {
  success: boolean;
  imgUrl?: string;
  error?: string;
}

/**
 * Detect if test mode is enabled from URL parameters
 */
function isTestMode(): boolean {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('version-test') === 'true';
}

/**
 * Convert a base64 image to a permanent URL via Bubble.io API
 * @param base64Image - The base64 string of the image (with or without data:image prefix)
 * @returns Promise with the uploaded image URL or error
 */
export async function convertBase64ToUrl(base64Image: string): Promise<ImageUploadResponse> {
  try {
    const testMode = isTestMode();
    const endpoint = getBubbleEndpoint('createFile', testMode);

    console.log(`📤 Converting base64 image to URL (${testMode ? 'TEST' : 'PRODUCTION'})...`);
    console.log(`   Endpoint: ${endpoint}`);

    // Remove data:image prefix if present to get only the base64 string
    const base64Data = base64Image.includes(',')
      ? base64Image.split(',')[1]
      : base64Image;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64: base64Data,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Image upload failed:', response.status, errorText);
      throw new Error(`Image upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.imgUrl) {
      console.error('❌ No imgUrl in response:', data);
      throw new Error('No image URL returned from server');
    }

    console.log('✅ Image uploaded successfully:', data.imgUrl);
    
    return {
      success: true,
      imgUrl: data.imgUrl,
    };
  } catch (error) {
    console.error('❌ Error converting base64 to URL:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if a string is a base64 image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith('data:image/') || /^[A-Za-z0-9+/=]+$/.test(str);
}

/**
 * Check if a string is a URL
 */
export function isUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

