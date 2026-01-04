import { put, del, head, list } from '@vercel/blob';

export { put, del, head, list };

export interface BlobUploadResult {
  url: string;
  size: number;
  pathname: string;
  storage: 'blob';
}

// Helper functions for blob storage operations
export const blobHelpers = {
  // Upload event images/metadata
  async uploadEventImage(file: File, eventId: string): Promise<BlobUploadResult> {
    const filename = `events/${eventId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    return {
      url: blob.url,
      size: file.size, // Use file.size instead of blob.size
      pathname: blob.pathname,
      storage: 'blob'
    };
  },

  // Upload user avatars
  async uploadUserAvatar(file: File, userId: string): Promise<BlobUploadResult> {
    const filename = `avatars/${userId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    return {
      url: blob.url,
      size: file.size,
      pathname: blob.pathname,
      storage: 'blob'
    };
  },

  // Upload general files
  async uploadFile(file: File, folder: string = 'uploads'): Promise<BlobUploadResult> {
    const filename = `${folder}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    return {
      url: blob.url,
      size: file.size,
      pathname: blob.pathname,
      storage: 'blob'
    };
  },

  // Delete file
  async deleteFile(url: string) {
    await del(url);
  },

  // List files in a folder
  async listFiles(prefix: string) {
    const { blobs } = await list({ prefix });
    return blobs;
  },

  // Get file metadata
  async getFileInfo(url: string) {
    return await head(url);
  }
};