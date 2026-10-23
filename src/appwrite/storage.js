import { ID, Permission, Role } from 'appwrite';
import { storage, getAppwriteConfig } from './client';

/**
 * Storage Service for managing screenshots, images, and PDF documents in Appwrite Storage
 */
export const storageService = {
  /**
   * Upload a file to Appwrite Storage with user-level read/delete permissions
   * @param {File} file 
   * @param {string} userId 
   * @returns {Promise<{fileId: string, name: string, size: number, mimeType: string}>}
   */
  async uploadFile(file, userId) {
    const config = getAppwriteConfig();
    const bucketId = config.bucketId;

    if (!bucketId) {
      throw new Error('Appwrite Storage Bucket ID is not configured. Please set VITE_APPWRITE_BUCKET_ID or configure it in Settings.');
    }

    try {
      const fileId = ID.unique();
      const permissions = userId ? [
        Permission.read(Role.user(userId)),
        Permission.update(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ] : undefined;

      let result;
      try {
        result = await storage.createFile(
          bucketId,
          fileId,
          file,
          permissions
        );
      } catch (errWithPerms) {
        // If passing specific permissions failed (e.g. File Security disabled on bucket), retry without explicit permissions
        if (permissions) {
          result = await storage.createFile(bucketId, fileId, file);
        } else {
          throw errWithPerms;
        }
      }

      return {
        fileId: result.$id,
        name: result.name,
        size: result.sizeOriginal,
        mimeType: result.mimeType,
      };
    } catch (error) {
      console.error('File upload failed:', error);
      const msg = error.message || '';
      if (msg.includes('No permissions provided for action') || msg.includes('missing scope') || error.code === 401 || error.code === 403) {
        throw new Error(
          `Storage Bucket Permission Error: In Appwrite Console > Storage > "${bucketId}" > Settings tab > scroll to "Permissions": click "Add Role", select "All Users" (or "Any"), check "Create", "Read", "Update", "Delete", and click "Update".`
        );
      }
      throw new Error(`File upload failed: ${error.message || 'Unknown storage error'}`);
    }
  },

  /**
   * Get preview URL for an image file
   */
  getFilePreview(fileId, width = 800, height = 600) {
    if (!fileId) return null;
    const config = getAppwriteConfig();
    const bucketId = config.bucketId;
    if (!bucketId) return null;

    try {
      return storage.getFilePreview(bucketId, fileId, width, height).toString();
    } catch {
      // Fallback to direct view
      return this.getFileView(fileId);
    }
  },

  /**
   * Get direct view URL for a file (image or PDF)
   */
  getFileView(fileId) {
    if (!fileId) return null;
    const config = getAppwriteConfig();
    const bucketId = config.bucketId;
    if (!bucketId) return null;

    try {
      return storage.getFileView(bucketId, fileId).toString();
    } catch (error) {
      console.error('Error getting file view URL:', error);
      return null;
    }
  },

  /**
   * Get download URL for a file
   */
  getFileDownload(fileId) {
    if (!fileId) return null;
    const config = getAppwriteConfig();
    const bucketId = config.bucketId;
    if (!bucketId) return null;

    try {
      return storage.getFileDownload(bucketId, fileId).toString();
    } catch (error) {
      console.error('Error getting file download URL:', error);
      return null;
    }
  },

  /**
   * Delete a file from Appwrite Storage
   */
  async deleteFile(fileId) {
    if (!fileId) return true;
    const config = getAppwriteConfig();
    const bucketId = config.bucketId;
    if (!bucketId) return true;

    try {
      await storage.deleteFile(bucketId, fileId);
      return true;
    } catch (error) {
      console.warn('Error deleting file from storage (may already be deleted):', error);
      return false;
    }
  }
};
