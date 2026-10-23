import React from 'react';
import StatCards from '../components/dashboard/StatCards';
import QuickActions from '../components/dashboard/QuickActions';
import MemoryCard from '../components/memory/MemoryCard';
import {
  Plus,
  ArrowRight,
  Inbox,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage({
  memories = [],
  loading = false,
  onRefresh = () => {},
  onOpenAddModal = () => {},
  onOpenAddWithType = () => {},
  onViewMemory = () => {},
  onEditMemory = () => {},
  onDeleteMemory = () => {},
  onNavigate = () => {},
  searchTerm = '',
}) {
  const { user } = useAuth();

  const userName = user?.name ? user.name.split(' ')[0] : 'there';
  const recentMemories = memories.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Your personal memory vault is synced with Appwrite TablesDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            title="Refresh memories"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:ring-2 focus:ring-brand-500"
          >
            <Plus className="w-4 h-4" />
            <span>Add Memory</span>
          </button>
        </div>
      </div>

      {/* Real Statistics Cards */}
      <StatCards memories={memories} />

      {/* Quick Actions Bar */}
      <QuickActions onOpenAddWithType={onOpenAddWithType} />

      {/* Recently Added Memories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Recently Saved
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Latest items committed to your Appwrite vault
            </p>
          </div>

          {memories.length > 4 && (
            <button
              onClick={() => onNavigate('library')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              <span>View all ({memories.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && memories.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Fetching memories from Appwrite TablesDB...
            </p>
          </div>
        ) : memories.length === 0 ? (
          /* Empty State for New Users */
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center mx-auto mb-4">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              Your memory vault is empty
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto mt-1 leading-relaxed">
              Start by saving a screenshot, image, PDF, note, URL, or code snippet. Tesseract.js will automatically extract text so you can search it anytime.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save Your First Memory</span>
              </button>
            </div>
          </div>
        ) : (
          /* Recent Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentMemories.map((memory) => (
              <MemoryCard
                key={memory.$id || memory.id}
                memory={memory}
                viewMode="grid"
                searchQuery={searchTerm}
                onView={onViewMemory}
                onEdit={onEditMemory}
                onDelete={onDeleteMemory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
