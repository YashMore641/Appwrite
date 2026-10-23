import React, { useState } from 'react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import CodeViewer from './CodeViewer';
import { formatDate } from '../../utils/formatters';
import { storageService } from '../../appwrite/storage';
import {
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Sparkles,
  Edit2,
  Trash2,
  Download,
  FileText,
  Clock,
} from 'lucide-react';

export default function MemoryDetailModal({
  memory,
  isOpen,
  onClose,
  onEdit = () => {},
  onDelete = () => {},
}) {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedNote, setCopiedNote] = useState(false);

  if (!memory) return null;

  const isImageOrScreenshot = memory.type === 'screenshot' || memory.type === 'image';
  const fileViewUrl = memory.fileId ? storageService.getFileView(memory.fileId) : null;
  const fileDownloadUrl = memory.fileId ? storageService.getFileDownload(memory.fileId) : null;

  const handleCopyExtracted = async () => {
    if (!memory.extractedText) return;
    try {
      await navigator.clipboard.writeText(memory.extractedText);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  const handleCopyNote = async () => {
    const textToCopy = memory.content || memory.description || '';
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch (e) {
      console.warn('Copy failed:', e);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* Header: Type, Dates & Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge type={memory.type} size="md" />
            {memory.isDemo && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-semibold">
                Demo Memory
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(memory);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onDelete(memory);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            {memory.title}
          </h2>

          {/* Timestamps */}
          <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Created {formatDate(memory.createdAt)}</span>
            </span>
            {memory.updatedAt && memory.updatedAt !== memory.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Updated {formatDate(memory.updatedAt)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Media Preview: Image or PDF */}
        {fileViewUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-slate-950 flex flex-col items-center justify-center relative">
            {isImageOrScreenshot ? (
              <img
                src={fileViewUrl}
                alt={memory.title}
                className="max-h-[480px] w-auto max-w-full object-contain"
              />
            ) : memory.type === 'pdf' ? (
              <div className="py-12 px-6 flex flex-col items-center text-center">
                <FileText className="w-16 h-16 text-rose-500 mb-3" />
                <p className="text-sm font-semibold text-white mb-4">
                  Original PDF Document Stored in Appwrite
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href={fileViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 text-white hover:bg-brand-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open in New Tab</span>
                  </a>
                  {fileDownloadUrl && (
                    <a
                      href={fileDownloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            ) : null}

            {/* Quick full view button for images */}
            {isImageOrScreenshot && (
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <a
                  href={fileViewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md text-xs font-medium flex items-center gap-1"
                  title="View full resolution"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        {memory.description && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Description
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-gray-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800/80">
              {memory.description}
            </p>
          </div>
        )}

        {/* Source URL if applicable */}
        {memory.url && (
          <div className="space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Source Link
            </h4>
            <a
              href={memory.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:underline break-all bg-brand-50/50 dark:bg-brand-950/40 p-3 rounded-xl border border-brand-200/50 dark:border-brand-800/50 w-full"
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              <span>{memory.url}</span>
            </a>
          </div>
        )}

        {/* Code Snippet if applicable */}
        {memory.type === 'code' && memory.content && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Code Snippet
            </h4>
            <CodeViewer code={memory.content} language={memory.language} />
          </div>
        )}

        {/* Plain Text Note if applicable */}
        {memory.type === 'note' && memory.content && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Note Content
              </h4>
              <button
                type="button"
                onClick={handleCopyNote}
                className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                {copiedNote ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedNote ? 'Copied' : 'Copy Note'}</span>
              </button>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 text-sm font-sans leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {memory.content}
            </div>
          </div>
        )}

        {/* Extracted Text (OCR from Images / Text from PDF) */}
        {memory.extractedText && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Extracted Text ({isImageOrScreenshot ? 'Tesseract OCR' : 'PDF Text'})</span>
              </div>
              <button
                type="button"
                onClick={handleCopyExtracted}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 text-xs sm:text-sm font-mono leading-relaxed text-gray-800 dark:text-gray-300 whitespace-pre-wrap max-h-60 overflow-y-auto">
              {memory.extractedText}
            </div>
          </div>
        )}

        {/* Tags */}
        {memory.tags && memory.tags.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Tags
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {memory.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
