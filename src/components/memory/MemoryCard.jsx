import React, { useState } from 'react';
import Badge from '../common/Badge';
import { formatDate, truncate } from '../../utils/formatters';
import { getHighlightedParts } from '../../utils/searchUtils';
import { storageService } from '../../appwrite/storage';
import {
  Eye,
  Edit2,
  Trash2,
  FileText,
  StickyNote,
  Code as CodeIcon,
  Link as LinkIcon,
  Sparkles,
} from 'lucide-react';

export default function MemoryCard({
  memory,
  viewMode = 'grid',
  searchQuery = '',
  onView = () => {},
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [imageError, setImageError] = useState(false);

  // File preview URL from Appwrite Storage
  const hasFile = Boolean(memory.fileId);
  const isImageOrScreenshot = memory.type === 'screenshot' || memory.type === 'image';
  const previewUrl = hasFile && isImageOrScreenshot && !imageError
    ? storageService.getFilePreview(memory.fileId, 480, 320)
    : null;

  // Render text with search highlighting
  const renderHighlighted = (text) => {
    if (!searchQuery) return text;
    const parts = getHighlightedParts(text, searchQuery);
    return parts.map((part, idx) =>
      part.match ? (
        <mark key={idx} className="search-highlight">
          {part.text}
        </mark>
      ) : (
        <span key={idx}>{part.text}</span>
      )
    );
  };

  // ----------------------------------------------------
  // LIST VIEW
  // ----------------------------------------------------
  if (viewMode === 'list') {
    return (
      <div className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-500/50 dark:hover:border-brand-500/40 transition-all gap-4">
        {/* Left: Thumbnail & Info */}
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Thumbnail / Icon container */}
          <div
            onClick={() => onView(memory)}
            className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-slate-800 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer border border-gray-200/60 dark:border-slate-700/60 relative"
          >
            {previewUrl ? (
              <img
                src={previewUrl}
                alt={memory.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                onError={() => setImageError(true)}
                loading="lazy"
              />
            ) : memory.type === 'pdf' ? (
              <FileText className="w-6 h-6 text-rose-500" />
            ) : memory.type === 'code' ? (
              <CodeIcon className="w-6 h-6 text-emerald-500" />
            ) : memory.type === 'url' ? (
              <LinkIcon className="w-6 h-6 text-cyan-500" />
            ) : (
              <StickyNote className="w-6 h-6 text-amber-500" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge type={memory.type} size="xs" />
              {memory.isDemo && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-medium">
                  Demo
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(memory.createdAt)}
              </span>
            </div>

            <h4
              onClick={() => onView(memory)}
              className="text-sm font-semibold text-gray-900 dark:text-white truncate hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
            >
              {renderHighlighted(memory.title)}
            </h4>

            {memory.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                {renderHighlighted(memory.description)}
              </p>
            )}

            {/* Extracted text snippet preview */}
            {memory.extractedText && (
              <p className="text-[11px] text-gray-400 dark:text-gray-500 line-clamp-1 italic mt-0.5">
                <span className="font-semibold text-indigo-500 dark:text-indigo-400 mr-1">OCR:</span>
                {renderHighlighted(truncate(memory.extractedText, 80))}
              </p>
            )}
          </div>
        </div>

        {/* Center / Right: Tags & Actions */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {/* Tags */}
          <div className="hidden md:flex items-center gap-1.5 max-w-[200px] overflow-hidden">
            {(memory.tags || []).slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onView(memory)}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="View details"
              aria-label="View memory details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(memory)}
              className="p-2 rounded-xl text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit memory"
              aria-label="Edit memory"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(memory)}
              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete memory"
              aria-label="Delete memory"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // GRID VIEW (DEFAULT)
  // ----------------------------------------------------
  return (
    <div className="group flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/90 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-brand-500/50 dark:hover:border-brand-500/40 transition-all overflow-hidden">
      {/* Top Media / Thumbnail Banner */}
      <div
        onClick={() => onView(memory)}
        className="h-40 w-full bg-slate-100 dark:bg-slate-950/70 border-b border-gray-100 dark:border-slate-800 flex items-center justify-center cursor-pointer relative overflow-hidden"
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={memory.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : memory.type === 'pdf' ? (
          <div className="flex flex-col items-center gap-2 text-rose-500 dark:text-rose-400">
            <FileText className="w-10 h-10 stroke-[1.5]" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
              PDF Document
            </span>
          </div>
        ) : memory.type === 'code' ? (
          <div className="w-full h-full p-4 bg-slate-950 font-mono text-[11px] text-slate-300 overflow-hidden relative select-none">
            <div className="flex items-center justify-between text-slate-500 mb-2 border-b border-slate-800 pb-1">
              <span>{memory.language || 'code'}</span>
              <CodeIcon className="w-3.5 h-3.5" />
            </div>
            <pre className="text-slate-400 opacity-90 line-clamp-4 font-mono">
              {memory.content || '// Empty snippet'}
            </pre>
          </div>
        ) : memory.type === 'url' ? (
          <div className="flex flex-col items-center gap-2 text-cyan-600 dark:text-cyan-400 p-4 text-center">
            <LinkIcon className="w-10 h-10 stroke-[1.5]" />
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
              {memory.url || 'Saved URL'}
            </span>
          </div>
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-center bg-amber-50/40 dark:bg-slate-950 text-slate-700 dark:text-slate-300">
            <StickyNote className="w-8 h-8 text-amber-500 mb-1" />
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
              {memory.content || memory.description || 'Note'}
            </p>
          </div>
        )}

        {/* Badge in top corner */}
        <div className="absolute top-2.5 left-2.5">
          <Badge type={memory.type} size="xs" />
        </div>

        {memory.isDemo && (
          <div className="absolute top-2.5 right-2.5">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-semibold shadow-sm">
              Demo
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Date */}
          <div className="text-[11px] text-gray-400 dark:text-gray-500 mb-1">
            {formatDate(memory.createdAt)}
          </div>

          {/* Title */}
          <h4
            onClick={() => onView(memory)}
            className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400 cursor-pointer transition-colors"
          >
            {renderHighlighted(memory.title)}
          </h4>

          {/* Description */}
          {memory.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
              {renderHighlighted(memory.description)}
            </p>
          )}

          {/* OCR / PDF text indicator */}
          {memory.extractedText && (
            <div className="mt-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-950/80 border border-gray-100 dark:border-slate-800 text-[11px] text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>Extracted Text</span>
              </div>
              <p className="line-clamp-2 italic">
                {renderHighlighted(truncate(memory.extractedText, 100))}
              </p>
            </div>
          )}
        </div>

        {/* Card Footer: Tags & Actions */}
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
          {/* Tags */}
          <div className="flex items-center gap-1 overflow-hidden">
            {(memory.tags || []).slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 truncate max-w-[80px]"
              >
                #{tag}
              </span>
            ))}
            {(memory.tags || []).length > 2 && (
              <span className="text-[10px] text-gray-400">
                +{memory.tags.length - 2}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onView(memory)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="View details"
              aria-label="View details"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onEdit(memory)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit memory"
              aria-label="Edit memory"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(memory)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete memory"
              aria-label="Delete memory"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
