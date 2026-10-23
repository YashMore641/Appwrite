import { ID, Permission, Role, Query } from 'appwrite';
import { tablesDb, databases, getAppwriteConfig } from './client';

/**
 * Normalizes a raw row or document returned from Appwrite into a standard Memory object
 */
export function normalizeMemory(item) {
  if (!item) return null;

  // Process tags into an array
  let tags = [];
  if (Array.isArray(item.tags)) {
    tags = item.tags;
  } else if (typeof item.tags === 'string') {
    try {
      const parsed = JSON.parse(item.tags);
      tags = Array.isArray(parsed) ? parsed : item.tags.split(',').map(t => t.trim()).filter(Boolean);
    } catch {
      tags = item.tags.split(',').map(t => t.trim()).filter(Boolean);
    }
  }

  return {
    $id: item.$id,
    id: item.$id,
    userId: item.userId || '',
    title: item.title || 'Untitled Memory',
    description: item.description || '',
    type: item.type || 'note',
    tags,
    content: item.content || '',
    extractedText: item.extractedText || '',
    url: item.url || '',
    fileId: item.fileId || '',
    language: item.language || '',
    createdAt: item.createdAt || item.$createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.$updatedAt || new Date().toISOString(),
  };
}

/**
 * Prepares payload for Appwrite TablesDB storage
 */
function preparePayload(data, userId) {
  const now = new Date().toISOString();
  
  // Format tags: try array, or if stringified required by schema
  const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? String(data.tags).split(',').map(t => t.trim()).filter(Boolean) : []);

  const payload = {
    userId,
    title: data.title ? data.title.trim() : 'Untitled Memory',
    description: data.description ? data.description.trim() : '',
    type: data.type || 'note',
    tags,
    content: data.content || '',
    extractedText: data.extractedText || '',
    url: data.url ? data.url.trim() : '',
    fileId: data.fileId || '',
    language: data.language || '',
    updatedAt: now,
  };

  if (!data.id && !data.$id) {
    payload.createdAt = now;
  }

  return payload;
}

/**
 * Database Service implementing Appwrite TablesDB with fallback to Databases service
 */
export const memoryDatabaseService = {
  /**
   * Create a new memory record in TablesDB
   */
  async createMemory(memoryData, userId) {
    const config = getAppwriteConfig();
    const databaseId = config.databaseId;
    const tableId = config.tableId;

    if (!databaseId || !tableId) {
      throw new Error('Database ID or Table ID is missing. Please configure them in Settings or .env');
    }

    const payload = preparePayload(memoryData, userId);
    const rowId = ID.unique();
    const permissions = [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ];

    // Attempt using official Appwrite TablesDB first
    try {
      const response = await tablesDb.createRow(
        databaseId,
        tableId,
        rowId,
        payload,
        permissions
      );
      return normalizeMemory(response);
    } catch (tablesError) {
      // If schema requires stringified tags (some Appwrite instances don't have array attributes), retry with JSON string
      if (tablesError.message && tablesError.message.includes('tags')) {
        try {
          const stringifiedPayload = { ...payload, tags: JSON.stringify(payload.tags) };
          const retryRes = await tablesDb.createRow(
            databaseId,
            tableId,
            rowId,
            stringifiedPayload,
            permissions
          );
          return normalizeMemory(retryRes);
        } catch {
          // continue to databases fallback
        }
      }

      // If TablesDB route returns 404 (endpoint uses Databases/Collections API on standard Appwrite REST)
      console.warn('TablesDB createRow error, attempting Databases fallback:', tablesError);
      try {
        const docRes = await databases.createDocument(
          databaseId,
          tableId,
          rowId,
          payload,
          permissions
        );
        return normalizeMemory(docRes);
      } catch (docError) {
        // Try with stringified tags on databases as well if array attribute not configured
        if (docError.message && docError.message.includes('tags')) {
          const stringifiedPayload = { ...payload, tags: JSON.stringify(payload.tags) };
          const retryDoc = await databases.createDocument(
            databaseId,
            tableId,
            rowId,
            stringifiedPayload,
            permissions
          );
          return normalizeMemory(retryDoc);
        }
        const combinedMsg = docError.message || tablesError.message || '';
        if (combinedMsg.includes('No permissions provided for action') || combinedMsg.includes('missing scope')) {
          throw new Error(
            `Table Permission Error: In Appwrite Console > Databases > "${databaseId}" > Table "${tableId}" > Settings tab > scroll to "Permissions": click "Add Role", select "All Users" (or "Any"), check "Create", "Read", "Update", "Delete", and click "Update".`
          );
        }
        throw new Error(`Failed to save memory: ${combinedMsg}`);
      }
    }
  },

  /**
   * List memories for the authenticated user with optional filtering
   */
  async listMemories(userId, { type = null, limit = 100, offset = 0 } = {}) {
    const config = getAppwriteConfig();
    const databaseId = config.databaseId;
    const tableId = config.tableId;

    if (!databaseId || !tableId) {
      throw new Error('Database ID or Table ID is not configured.');
    }

    const queries = [
      Query.equal('userId', userId),
      Query.orderDesc('createdAt'),
      Query.limit(limit),
      Query.offset(offset),
    ];

    if (type && type !== 'all') {
      queries.push(Query.equal('type', type));
    }

    // Attempt TablesDB listRows
    try {
      const result = await tablesDb.listRows(databaseId, tableId, queries);
      const rows = result.rows || result.documents || [];
      return {
        total: result.total || rows.length,
        memories: rows.map(normalizeMemory),
      };
    } catch (tablesError) {
      // Fallback to databases.listDocuments
      console.warn('TablesDB listRows failed, attempting Databases.listDocuments fallback:', tablesError);
      try {
        const docResult = await databases.listDocuments(databaseId, tableId, queries);
        const docs = docResult.documents || [];
        return {
          total: docResult.total || docs.length,
          memories: docs.map(normalizeMemory),
        };
      } catch (docError) {
        console.error('Failed to list memories:', docError);
        throw new Error(`Failed to fetch memories: ${docError.message || tablesError.message}`);
      }
    }
  },

  /**
   * Get single memory by ID
   */
  async getMemory(memoryId) {
    const config = getAppwriteConfig();
    const databaseId = config.databaseId;
    const tableId = config.tableId;

    try {
      const result = await tablesDb.getRow(databaseId, tableId, memoryId);
      return normalizeMemory(result);
    } catch {
      const doc = await databases.getDocument(databaseId, tableId, memoryId);
      return normalizeMemory(doc);
    }
  },

  /**
   * Update existing memory record
   */
  async updateMemory(memoryId, memoryData, userId) {
    const config = getAppwriteConfig();
    const databaseId = config.databaseId;
    const tableId = config.tableId;

    const payload = preparePayload(memoryData, userId);
    // Don't overwrite createdAt on update
    delete payload.createdAt;

    try {
      const result = await tablesDb.updateRow(
        databaseId,
        tableId,
        memoryId,
        payload
      );
      return normalizeMemory(result);
    } catch (tablesError) {
      // If schema tags error, try stringified
      if (tablesError.message && tablesError.message.includes('tags')) {
        try {
          const stringified = { ...payload, tags: JSON.stringify(payload.tags) };
          const retryRes = await tablesDb.updateRow(databaseId, tableId, memoryId, stringified);
          return normalizeMemory(retryRes);
        } catch {
          // continue to fallback
        }
      }

      try {
        const docRes = await databases.updateDocument(
          databaseId,
          tableId,
          memoryId,
          payload
        );
        return normalizeMemory(docRes);
      } catch (docError) {
        throw new Error(`Failed to update memory: ${docError.message || tablesError.message}`);
      }
    }
  },

  /**
   * Delete a memory record
   */
  async deleteMemory(memoryId) {
    const config = getAppwriteConfig();
    const databaseId = config.databaseId;
    const tableId = config.tableId;

    try {
      await tablesDb.deleteRow(databaseId, tableId, memoryId);
      return true;
    } catch (tablesError) {
      try {
        await databases.deleteDocument(databaseId, tableId, memoryId);
        return true;
      } catch (docError) {
        throw new Error(`Failed to delete memory: ${docError.message || tablesError.message}`);
      }
    }
  }
};
