import React, { useState } from 'react';
import Modal from '../common/Modal';
import { getAppwriteConfig, saveAppwriteConfig, resetAppwriteConfig } from '../../appwrite/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Database, Server, Key, Folder, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function AppwriteConfigModal({ isOpen, onClose }) {
  const currentConfig = getAppwriteConfig();
  const { refreshConfig } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    endpoint: currentConfig.endpoint || 'https://cloud.appwrite.io/v1',
    projectId: currentConfig.projectId || '',
    databaseId: currentConfig.databaseId || 'recallx_db',
    tableId: currentConfig.tableId || 'memories',
    bucketId: currentConfig.bucketId || 'memories_vault',
  });

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      // Validate endpoint URL
      new URL(formData.endpoint);
      
      const res = await fetch(`${formData.endpoint.replace(/\/$/, '')}/health/version`, {
        headers: {
          'X-Appwrite-Project': formData.projectId || 'console',
        },
      });

      if (res.ok || res.status === 401 || res.status === 403) {
        // Endpoint responded
        setTestResult({
          success: true,
          message: 'Successfully reached Appwrite server! Endpoint is valid and responding.',
        });
      } else {
        setTestResult({
          success: false,
          message: `Endpoint responded with HTTP ${res.status}. Please check endpoint URL and project ID.`,
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message}. If using self-hosted, ensure CORS is enabled.`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.projectId || formData.projectId.trim() === '') {
      toast.error('Project ID is required.');
      return;
    }

    saveAppwriteConfig(formData);
    refreshConfig();
    toast.success('Appwrite configuration updated successfully!');
    onClose();
  };

  const handleResetToEnv = () => {
    resetAppwriteConfig();
    const envConfig = getAppwriteConfig();
    setFormData({
      endpoint: envConfig.endpoint || 'https://cloud.appwrite.io/v1',
      projectId: envConfig.projectId || '',
      databaseId: envConfig.databaseId || 'recallx_db',
      tableId: envConfig.tableId || 'memories',
      bucketId: envConfig.bucketId || 'memories_vault',
    });
    refreshConfig();
    toast.info('Configuration reset to environment defaults.');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Appwrite TablesDB Configuration"
      subtitle="Configure your backend connection parameters for the Hackathon"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner about TablesDB */}
        <div className="p-3.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2 font-semibold mb-1">
            <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Appwrite TablesDB Architecture</span>
          </div>
          <p className="leading-relaxed">
            RecallX stores memory metadata in an Appwrite TablesDB table (<code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">memories</code>) and files in Storage (<code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">memories_vault</code>).
          </p>
        </div>

        {/* Endpoint */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Appwrite Endpoint
          </label>
          <div className="relative">
            <Server className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="url"
              name="endpoint"
              value={formData.endpoint}
              onChange={handleChange}
              placeholder="https://cloud.appwrite.io/v1"
              required
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Project ID */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Project ID *
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              name="projectId"
              value={formData.projectId}
              onChange={handleChange}
              placeholder="e.g. 66f... or your_project_id"
              required
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Database ID & Table ID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Database ID
            </label>
            <input
              type="text"
              name="databaseId"
              value={formData.databaseId}
              onChange={handleChange}
              placeholder="recallx_db"
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Table / Collection ID
            </label>
            <input
              type="text"
              name="tableId"
              value={formData.tableId}
              onChange={handleChange}
              placeholder="memories"
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Storage Bucket ID */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Storage Bucket ID
          </label>
          <div className="relative">
            <Folder className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              name="bucketId"
              value={formData.bucketId}
              onChange={handleChange}
              placeholder="memories_vault"
              required
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Test Result Message */}
        {testResult && (
          <div
            className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            )}
            <span className="leading-relaxed">{testResult.message}</span>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'Testing...' : 'Test Connection'}</span>
            </button>
            <button
              type="button"
              onClick={handleResetToEnv}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-2 py-1 underline"
            >
              Reset to .env
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-colors focus:ring-2 focus:ring-brand-500"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
