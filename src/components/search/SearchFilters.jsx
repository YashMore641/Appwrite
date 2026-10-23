import React from 'react';
import {
  LayoutGrid,
  List,
  ArrowUpDown,
  Tag,
  X,
} from 'lucide-react';
import { MEMORY_TYPES } from '../../utils/formatters';

export default function SearchFilters({
  selectedType = 'all',
  onSelectType = () => {},
  selectedTag = '',
  onSelectTag = () => {},
  availableTags = [],
  sortBy = 'newest',
  onSortChange = () => {},
  viewMode = 'grid',
  onViewModeChange = () => {},
  totalResults: _totalResults = 0,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-gray-200/80 dark:border-slate-800">
      {/* Category Filter Pills (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
        {MEMORY_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          return (
            <button
              key={type.id}
              onClick={() => onSelectType(type.id)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-700'
              }`}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      {/* Right Controls: Active Tag pill, Tag Selector, Sort & View Toggle */}
      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-auto">
        {/* Active Tag Filter chip */}
        {selectedTag && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
            <span>#{selectedTag}</span>
            <button
              onClick={() => onSelectTag('')}
              className="hover:text-rose-500"
              title="Clear tag filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Tag Picker Dropdown */}
        {availableTags.length > 0 && (
          <div className="relative">
            <select
              value={selectedTag}
              onChange={(e) => onSelectTag(e.target.value)}
              className="appearance-none pl-7 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              aria-label="Filter by tag"
            >
              <option value="">All Tags</option>
              {availableTags.map((t) => (
                <option key={t.name} value={t.name}>
                  #{t.name} ({t.count})
                </option>
              ))}
            </select>
            <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}

        {/* Sort Select */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-7 pr-7 py-1.5 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            aria-label="Sort memories"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
          <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* View Mode Toggle (Grid vs List) */}
        <div className="flex items-center rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid'
                ? 'bg-gray-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
            title="Grid View"
            aria-label="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'list'
                ? 'bg-gray-100 dark:bg-slate-800 text-brand-600 dark:text-brand-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
            }`}
            title="List View"
            aria-label="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
