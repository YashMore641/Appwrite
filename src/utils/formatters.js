/**
 * Formatting and Helper Utilities for RecallX
 */

/**
 * Format date string into human-readable representation
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay === 0) {
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      return `${diffHour}h ago`;
    }
    if (diffDay === 1) return 'Yesterday';
    if (diffDay < 7) return `${diffDay} days ago`;

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

/**
 * Format bytes into readable string (e.g. 1.2 MB)
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Supported Memory Types metadata
 */
export const MEMORY_TYPES = [
  { id: 'all', label: 'All Types', icon: 'Layers' },
  { id: 'screenshot', label: 'Screenshot', icon: 'Maximize2', color: 'indigo' },
  { id: 'image', label: 'Image', icon: 'Image', color: 'purple' },
  { id: 'pdf', label: 'PDF Document', icon: 'FileText', color: 'rose' },
  { id: 'note', label: 'Note', icon: 'StickyNote', color: 'amber' },
  { id: 'url', label: 'URL / Link', icon: 'Link', color: 'cyan' },
  { id: 'code', label: 'Code Snippet', icon: 'Code', color: 'emerald' },
];

/**
 * Get visual badge styles for a memory type
 */
export function getTypeBadgeInfo(type) {
  switch (type) {
    case 'screenshot':
      return {
        label: 'Screenshot',
        bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        bgDark: 'dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800',
        iconName: 'Maximize2',
      };
    case 'image':
      return {
        label: 'Image',
        bgLight: 'bg-purple-50 text-purple-700 border-purple-200',
        bgDark: 'dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800',
        iconName: 'Image',
      };
    case 'pdf':
      return {
        label: 'PDF',
        bgLight: 'bg-rose-50 text-rose-700 border-rose-200',
        bgDark: 'dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        iconName: 'FileText',
      };
    case 'note':
      return {
        label: 'Note',
        bgLight: 'bg-amber-50 text-amber-700 border-amber-200',
        bgDark: 'dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        iconName: 'StickyNote',
      };
    case 'url':
      return {
        label: 'URL',
        bgLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        bgDark: 'dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800',
        iconName: 'Link',
      };
    case 'code':
      return {
        label: 'Code',
        bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bgDark: 'dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        iconName: 'Code',
      };
    default:
      return {
        label: 'Memory',
        bgLight: 'bg-gray-100 text-gray-700 border-gray-200',
        bgDark: 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        iconName: 'Bookmark',
      };
  }
}

/**
 * Truncate long strings
 */
export function truncate(str, maxLength = 120) {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}
