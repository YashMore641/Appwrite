/**
 * Optional Helper Script for Appwrite Project Administrators
 * Automatically provisions the RecallX database, table attributes, and storage bucket
 *
 * Usage:
 *   APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" \
 *   APPWRITE_PROJECT_ID="your_project_id" \
 *   APPWRITE_API_KEY="your_api_key_with_database_and_storage_scopes" \
 *   node scripts/setup-appwrite.js
 */

import { Client, Databases, Storage } from 'node-appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'recallx_db';
const TABLE_ID = process.env.APPWRITE_TABLE_ID || 'memories';
const BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'memories_vault';

if (!projectId || !apiKey) {
  console.log(`
============================================================
RecallX Schema Provisioning Script
============================================================
Please provide your Appwrite Project ID and API Key to run automated provisioning:

Example:
  export APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
  export APPWRITE_PROJECT_ID="your_project_id"
  export APPWRITE_API_KEY="your_admin_api_key"
  node scripts/setup-appwrite.js

Alternatively, you can manually create the database, table, and bucket
via the Appwrite Console following the schema table in README.md.
============================================================
`);
  process.exit(0);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);
const storage = new Storage(client);

async function setup() {
  console.log('🚀 Setting up RecallX Appwrite Backend...');

  // 1. Create Database
  try {
    await databases.create(DATABASE_ID, 'RecallX Vault Database');
    console.log(`✅ Database created: ${DATABASE_ID}`);
  } catch (e) {
    console.log(`ℹ️  Database (${DATABASE_ID}) already exists or:`, e.message);
  }

  // 2. Create Collection / Table
  try {
    await databases.createCollection(DATABASE_ID, TABLE_ID, 'Memories Table', [
      'read("users")',
      'create("users")',
      'update("users")',
      'delete("users")',
    ], true);
    console.log(`✅ Table created: ${TABLE_ID}`);
  } catch (e) {
    console.log(`ℹ️  Table (${TABLE_ID}) already exists or:`, e.message);
  }

  // 3. Create Attributes
  const attributes = [
    { type: 'string', key: 'userId', size: 36, required: true },
    { type: 'string', key: 'title', size: 255, required: true },
    { type: 'string', key: 'description', size: 1000, required: false },
    { type: 'string', key: 'type', size: 32, required: true },
    { type: 'string', key: 'tags', size: 64, array: true, required: false },
    { type: 'string', key: 'content', size: 10000, required: false },
    { type: 'string', key: 'extractedText', size: 20000, required: false },
    { type: 'string', key: 'url', size: 1024, required: false },
    { type: 'string', key: 'fileId', size: 36, required: false },
    { type: 'string', key: 'language', size: 32, required: false },
    { type: 'string', key: 'createdAt', size: 64, required: false },
    { type: 'string', key: 'updatedAt', size: 64, required: false },
  ];

  for (const attr of attributes) {
    try {
      if (attr.type === 'string') {
        await databases.createStringAttribute(
          DATABASE_ID,
          TABLE_ID,
          attr.key,
          attr.size,
          attr.required,
          undefined,
          attr.array || false
        );
        console.log(`  ➕ Attribute created: ${attr.key}`);
      }
    } catch (e) {
      console.log(`  ℹ️  Attribute (${attr.key}): ${e.message}`);
    }
  }

  // 4. Create Storage Bucket
  try {
    await storage.createBucket(
      BUCKET_ID,
      'RecallX File Storage',
      ['read("users")', 'create("users")', 'update("users")', 'delete("users")'],
      false, // fileSecurity (true for per-file permissions)
      true, // enabled
      50 * 1024 * 1024, // 50MB
      ['png', 'jpg', 'jpeg', 'webp', 'pdf']
    );
    console.log(`✅ Storage bucket created: ${BUCKET_ID}`);
  } catch (e) {
    console.log(`ℹ️  Storage bucket (${BUCKET_ID}):`, e.message);
  }

  console.log('\n🎉 RecallX Backend setup complete!');
}

setup().catch((err) => {
  console.error('Setup error:', err);
});
