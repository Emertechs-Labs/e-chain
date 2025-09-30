import { put, del, head, list } from '@vercel/blob';

export { put, del, head, list };

// Helper functions for blob storage operations
export const blobHelpers = {
  // Upload event images/metadata
  async uploadEventImage(file: File, eventId: string) {
    const filename = `events/${eventId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    return {
      url: blob.url,
      size: file.size, // Use file.size instead of blob.size
      pathname: blob.pathname
    };
  },

  // Upload user avatars
  async uploadUserAvatar(file: File, userId: string) {
    const filename = `avatars/${userId}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    return {
      url: blob.url,
      size: file.size,
      pathname: blob.pathname
    };
  },

  // Upload general files
  async uploadFile(file: File, folder: string = 'uploads') {
    const filename = `${folder}/${Date.now()}-${file.name}`;
    const blob = await put(filename, file, {
      access: 'public',
      addRandomSuffix: false
    });
    return {
      url: blob.url,
      size: file.size,
      pathname: blob.pathname
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