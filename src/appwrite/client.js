import { Client, TablesDB, Databases, Account, Storage } from 'appwrite';

// Default / fallback keys from Vite environment variables
const ENV_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const ENV_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const ENV_DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const ENV_TABLE_ID = import.meta.env.VITE_APPWRITE_TABLE_ID || '';
const ENV_BUCKET_ID = import.meta.env.VITE_APPWRITE_BUCKET_ID || '';

const CONFIG_STORAGE_KEY = 'recallx_appwrite_config';

/**
 * Get current Appwrite configuration from localStorage or .env
 */
export function getAppwriteConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        endpoint: parsed.endpoint || ENV_ENDPOINT,
        projectId: parsed.projectId || ENV_PROJECT_ID,
        databaseId: parsed.databaseId || ENV_DATABASE_ID,
        tableId: parsed.tableId || ENV_TABLE_ID,
        bucketId: parsed.bucketId || ENV_BUCKET_ID,
        isCustom: true,
      };
    }
  } catch (e) {
    console.warn('Error reading config from localStorage:', e);
  }

  return {
    endpoint: ENV_ENDPOINT,
    projectId: ENV_PROJECT_ID,
    databaseId: ENV_DATABASE_ID,
    tableId: ENV_TABLE_ID,
    bucketId: ENV_BUCKET_ID,
    isCustom: false,
  };
}

/**
 * Save user custom Appwrite configuration to localStorage
 */
export function saveAppwriteConfig(config) {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    // Reconfigure client singleton
    initAppwriteClient();
    return true;
  } catch (e) {
    console.error('Error saving config:', e);
    return false;
  }
}

/**
 * Clear custom Appwrite configuration and revert to .env
 */
export function resetAppwriteConfig() {
  try {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    initAppwriteClient();
    return true;
  } catch (e) {
    console.error('Error resetting config:', e);
    return false;
  }
}

/**
 * Check if the minimum required configuration is present
 */
export function isAppwriteConfigured() {
  const config = getAppwriteConfig();
  return Boolean(
    config.projectId &&
    config.projectId !== 'your_project_id_here' &&
    config.endpoint
  );
}

// Appwrite SDK instances singletons
export let client = new Client();
export let account = new Account(client);
export let tablesDb = new TablesDB(client);
export let databases = new Databases(client);
export let storage = new Storage(client);

/**
 * Initialize / update client configuration
 */
export function initAppwriteClient() {
  const config = getAppwriteConfig();
  client = new Client();
  
  if (config.endpoint) {
    client.setEndpoint(config.endpoint);
  }
  if (config.projectId && config.projectId !== 'your_project_id_here') {
    client.setProject(config.projectId);
  }

  account = new Account(client);
  tablesDb = new TablesDB(client);
  databases = new Databases(client);
  storage = new Storage(client);

  return { client, account, tablesDb, databases, storage };
}

// Initial initialization
initAppwriteClient();
