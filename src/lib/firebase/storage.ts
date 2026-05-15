// ========================================
// Firebase Storage Service
// ========================================

import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './config';

/** Upload a profile photo. Returns the download URL. */
export async function uploadProfilePhoto(userId: string, file: File): Promise<string> {
  // Resize to max 256x256 before upload to stay within Spark tier limits
  const resized = await resizeImage(file, 256, 256);
  const fileRef = ref(storage, `profiles/${userId}/avatar.jpg`);
  await uploadBytes(fileRef, resized);
  return getDownloadURL(fileRef);
}

/** Delete a profile photo by its download URL. */
export async function deleteProfilePhoto(url: string): Promise<void> {
  const fileRef = ref(storage, url);
  await deleteObject(fileRef);
}

/** Resize image file to max dimensions using Canvas API. */
function resizeImage(file: File, maxWidth: number, maxHeight: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;

      if (width > maxWidth) {
        height *= maxWidth / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width *= maxHeight / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        0.7,
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}
