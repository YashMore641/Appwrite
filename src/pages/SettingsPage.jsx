import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getAppwriteConfig } from '../appwrite/client';
import {
  Sun,
  Moon,
  User,
  Mail,
  Shield,
  Database,
  LogOut,
  Info,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { formatDate } from '../utils/formatters';

export default function SettingsPage({ onOpenConfigModal = () => {} }) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const config = getAppwriteConfig();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Manage your vault preferences, theme, and Appwrite TablesDB connection.
        </p>
      </div>

      {/* 1. Theme Preference */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Appearance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Select your preferred display theme. Theme choice is automatically persisted.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              theme === 'light'
                ? 'border-brand-500 bg-brand-50 text-brand-900 font-semibold shadow-sm'
                : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-gray-50/50'
            }`}
          >
            <div className="p-2 rounded-lg bg-white shadow-xs text-amber-500">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Light Mode</p>
              <p className="text-[10px] text-gray-500">Crisp white & soft gray</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              theme === 'dark'
                ? 'border-brand-500 bg-slate-800 text-white font-semibold shadow-sm'
                : 'border-slate-800 hover:border-slate-700 text-gray-400 bg-slate-950/40'
            }`}
          >
            <div className="p-2 rounded-lg bg-slate-900 shadow-xs text-indigo-400">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold">Dark Mode</p>
              <p className="text-[10px] text-gray-400">Deep charcoal & slate</p>
            </div>
          </button>
        </div>
      </div>

      {/* 2. User Profile Information */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Account Profile
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Your authenticated session managed via Appwrite Auth.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 mb-1">
              <User className="w-3.5 h-3.5" />
              <span>Full Name</span>
            </span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 mb-1">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </span>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              {user?.email || 'N/A'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 mb-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Appwrite User ID</span>
            </span>
            <p className="text-xs font-mono font-semibold text-gray-900 dark:text-white truncate">
              {user?.$id || 'N/A'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-[11px] font-medium text-gray-400 flex items-center gap-1.5 mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Account Registration</span>
            </span>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">
              {formatDate(user?.$createdAt) || 'Active'}
            </p>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out of RecallX</span>
          </button>
        </div>
      </div>

      {/* 3. Appwrite TablesDB Backend Integration */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-500" />
              <span>Appwrite TablesDB Configuration</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Live connection status to Appwrite Cloud or self-hosted cluster.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenConfigModal}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-100 dark:hover:bg-brand-900/60 transition-colors"
          >
            Edit Config
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-gray-400 block mb-0.5">Endpoint:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 truncate block">
              {config.endpoint}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-gray-400 block mb-0.5">Project ID:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 truncate block">
              {config.projectId || '(Not configured)'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-gray-400 block mb-0.5">Database ID & Table ID:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 truncate block">
              {config.databaseId} / {config.tableId}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-950/60 border border-gray-200/60 dark:border-slate-800">
            <span className="text-gray-400 block mb-0.5">Storage Bucket ID:</span>
            <span className="font-mono text-gray-800 dark:text-gray-200 truncate block">
              {config.bucketId}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Application Information */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Info className="w-4 h-4 text-brand-500" />
          <span>About RecallX</span>
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          <strong>RecallX</strong> is an open-source personal memory vault submission for the <strong>Appwrite Databases Hackathon</strong>. It utilizes Appwrite's modern TablesDB relational document model, Appwrite Storage with user-level ACLs, Tesseract.js client-side OCR, and PDF.js text parsing.
        </p>
        <div className="pt-2 flex items-center gap-4 text-xs text-gray-400">
          <span>Version: 1.0.0</span>
          <span>•</span>
          <span>License: MIT</span>
          <span>•</span>
          <a
            href="https://appwrite.io"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand-600 dark:hover:text-brand-400 inline-flex items-center gap-1"
          >
            <span>Appwrite.io</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
