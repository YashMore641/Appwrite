import React, { useState, useMemo } from 'react';
import SearchFilters from '../components/search/SearchFilters';
import MemoryCard from '../components/memory/MemoryCard';
import { filterAndSearchMemories, extractUniqueTags } from '../../src/utils/searchUtils';
import {
  Search,
  Plus,
  RefreshCw,
  X,
} from 'lucide-react';

export default function LibraryPage({
  memories = [],
  loading = false,
  onRefresh = () => {},
  selectedType = 'all',
  onSelectType = () => {},
  searchTerm = '',
  onSearchChange = () => {},
  onOpenAddModal = () => {},
  onViewMemory = () => {},
  onEditMemory = () => {},
  onDeleteMemory = () => {},
}) {
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Extract unique tags and frequencies
  const availableTags = useMemo(() => {
    return extractUniqueTags(memories);
  }, [memories]);

  // Filter and search memories
  const filteredMemories = useMemo(() => {
    return filterAndSearchMemories(memories, searchTerm, {
      type: selectedType,
      tag: selectedTag,
      sortBy,
    });
  }, [memories, searchTerm, selectedType, selectedTag, sortBy]);

  const hasActiveFilters = selectedType !== 'all' || Boolean(selectedTag) || Boolean(searchTerm);

  const clearAllFilters = () => {
    onSelectType('all');
    setSelectedTag('');
    onSearchChange('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Memory Vault
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Search and organize your saved screenshots, notes, documents, and code snippets.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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

      {/* Prominent Search Bar on Library Page */}
      <div className="relative">
        <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by keyword, OCR text, notes, URLs, tags, or code snippets..."
          className="w-full pl-12 pr-12 py-3.5 text-sm sm:text-base rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none transition-all"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            aria-label="Clear search query"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter and View Controls Bar */}
      <SearchFilters
        selectedType={selectedType}
        onSelectType={onSelectType}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        availableTags={availableTags}
        sortBy={sortBy}
        onSortChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalResults={filteredMemories.length}
      />

      {/* Results Header: Count & Active Filter Indicator */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <div>
          <span>Showing </span>
          <strong className="text-gray-900 dark:text-white font-bold">
            {filteredMemories.length}
          </strong>
          <span> {filteredMemories.length === 1 ? 'memory' : 'memories'}</span>
          {searchTerm && (
            <span> matching <strong className="text-brand-600 dark:text-brand-400">"{searchTerm}"</strong></span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            Querying Appwrite TablesDB...
          </p>
        </div>
      ) : filteredMemories.length === 0 ? (
        /* Empty State */
        <div className="p-16 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-400 flex items-center justify-center mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            No matching memories found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto mt-1 leading-relaxed">
            {hasActiveFilters
              ? 'Try modifying your search query, selecting "All Types", or removing active tag filters.'
              : 'You haven\'t saved any memories yet. Start by capturing a screenshot, note, or code snippet.'}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Save New Memory</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results Container (Grid or List) */
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'space-y-3'
          }
        >
          {filteredMemories.map((memory) => (
            <MemoryCard
              key={memory.$id || memory.id}
              memory={memory}
              viewMode={viewMode}
              searchQuery={searchTerm}
              onView={onViewMemory}
              onEdit={onEditMemory}
              onDelete={onDeleteMemory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
