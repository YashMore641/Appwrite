import React, { useState, useEffect, useRef } from 'react';
import Modal from '../common/Modal';
import { extractTextFromImage } from '../../utils/ocrExtractor';
import { extractTextFromPDF } from '../../utils/pdfExtractor';
import { storageService } from '../../appwrite/storage';
import { memoryDatabaseService } from '../../appwrite/database';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatFileSize } from '../../utils/formatters';
import {
  UploadCloud,
  FileText,
  Image as ImageIcon,
  Sparkles,
  X,
  AlertCircle,
  Maximize2,
  StickyNote,
  Link as LinkIcon,
  Code as CodeIcon,
  RefreshCw,
} from 'lucide-react';

const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'html',
  'css',
  'json',
  'sql',
  'bash',
  'go',
  'rust',
  'markdown',
];

export default function AddEditMemoryModal({
  isOpen,
  onClose,
  initialType = 'note',
  editingMemory = null,
  onMemorySaved = () => {},
}) {
  const { user } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState(initialType);
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [extractedText, setExtractedText] = useState('');

  // File & Extraction State
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [existingFileId, setExistingFileId] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [extractionStatus, setExtractionStatus] = useState('');
  const [extractionProgress, setExtractionProgress] = useState(0);
  const [scannedPdfNotice, setScannedPdfNotice] = useState(false);

  // Submission State
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (editingMemory) {
      setTitle(editingMemory.title || '');
      setType(editingMemory.type || 'note');
      setDescription(editingMemory.description || '');
      setContent(editingMemory.content || '');
      setUrl(editingMemory.url || '');
      setLanguage(editingMemory.language || 'javascript');
      setTags(Array.isArray(editingMemory.tags) ? editingMemory.tags : []);
      setExtractedText(editingMemory.extractedText || '');
      setExistingFileId(editingMemory.fileId || '');
      setSelectedFile(null);
      setFilePreview(null);
      setScannedPdfNotice(false);
    } else {
      // Reset for new memory
      setTitle('');
      setType(initialType || 'note');
      setDescription('');
      setContent('');
      setUrl('');
      setLanguage('javascript');
      setTags([]);
      setTagInput('');
      setExtractedText('');
      setSelectedFile(null);
      setFilePreview(null);
      setExistingFileId('');
      setScannedPdfNotice(false);
    }
    setErrorMsg('');
  }, [editingMemory, initialType, isOpen]);

  // Handle Tag Input
  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().toLowerCase().replace(/^#/, '');
      if (cleanTag && !tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Handle File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setScannedPdfNotice(false);

    // Auto set title if blank
    if (!title.trim()) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
    }

    // Generate local preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFilePreview(event.target.result);
      };
      reader.readAsDataURL(file);

      // Perform OCR
      runImageOCR(file);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      setFilePreview(null);
      runPDFExtraction(file);
    }
  };

  // Run OCR on Image
  const runImageOCR = async (file) => {
    setExtracting(true);
    setExtractionProgress(10);
    setExtractionStatus('Starting OCR engine...');
    try {
      const result = await extractTextFromImage(file, ({ status, progress }) => {
        setExtractionStatus(status);
        setExtractionProgress(progress);
      });

      if (result.success && result.text) {
        setExtractedText(result.text);
        toast.info('Text successfully extracted from image! You can review or edit it below.');
      } else {
        toast.info('No readable text was detected in this image.');
      }
    } catch (err) {
      console.warn('OCR error:', err);
    } finally {
      setExtracting(false);
    }
  };

  // Run Text Extraction on PDF
  const runPDFExtraction = async (file) => {
    setExtracting(true);
    setExtractionProgress(10);
    setExtractionStatus('Parsing PDF structure...');
    try {
      const result = await extractTextFromPDF(file, ({ status, progress }) => {
        setExtractionStatus(status);
        setExtractionProgress(progress);
      });

      if (result.success) {
        if (result.isScanned) {
          setScannedPdfNotice(true);
          toast.info('Scanned PDF detected: Selectable text not found. You can add notes manually.');
        } else if (result.text) {
          setExtractedText(result.text);
          toast.info(`Extracted text from ${result.totalPages} page(s)!`);
        }
      }
    } catch (err) {
      console.warn('PDF extraction error:', err);
    } finally {
      setExtracting(false);
    }
  };

  // Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please provide a title for this memory.');
      return;
    }

    if (!user) {
      setErrorMsg('You must be logged in to save memories.');
      return;
    }

    setSaving(true);
    try {
      let finalFileId = existingFileId;

      // 1. Upload new file if selected
      if (selectedFile) {
        setExtractionStatus('Uploading file to Appwrite Storage...');
        const uploadResult = await storageService.uploadFile(selectedFile, user.$id);
        finalFileId = uploadResult.fileId;
      }

      // 2. Prepare payload
      const memoryPayload = {
        title: title.trim(),
        type,
        description: description.trim(),
        content: content.trim(),
        url: url.trim(),
        language: type === 'code' ? language : '',
        tags,
        extractedText: extractedText.trim(),
        fileId: finalFileId,
      };

      // 3. Save to Appwrite TablesDB
      let savedRecord;
      if (editingMemory) {
        savedRecord = await memoryDatabaseService.updateMemory(
          editingMemory.$id || editingMemory.id,
          memoryPayload,
          user.$id
        );
        toast.success('Memory updated successfully!');
      } else {
        savedRecord = await memoryDatabaseService.createMemory(
          memoryPayload,
          user.$id
        );
        toast.success('Memory saved to your vault!');
      }

      onMemorySaved(savedRecord);
      onClose();
    } catch (err) {
      console.error('Error saving memory:', err);
      setErrorMsg(err.message || 'Failed to save memory.');
      toast.error(err.message || 'Failed to save memory.');
    } finally {
      setSaving(false);
    }
  };

  const isFileAllowed = type === 'screenshot' || type === 'image' || type === 'pdf';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMemory ? 'Edit Memory' : 'Capture New Memory'}
      subtitle="Save screenshots, images, PDFs, notes, URLs, and code snippets"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error notification */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Memory Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
            Memory Type
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[
              { id: 'screenshot', label: 'Screenshot', icon: Maximize2 },
              { id: 'image', label: 'Image', icon: ImageIcon },
              { id: 'pdf', label: 'PDF', icon: FileText },
              { id: 'note', label: 'Note', icon: StickyNote },
              { id: 'url', label: 'URL', icon: LinkIcon },
              { id: 'code', label: 'Code', icon: CodeIcon },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-1" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Chocolate Cake Recipe, Appwrite API Setup, Q3 Report"
            required
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* File Upload Zone (Screenshot, Image, PDF) */}
        {isFileAllowed && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              {type === 'pdf' ? 'Upload PDF Document' : 'Upload Image / Screenshot'}
            </label>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={type === 'pdf' ? '.pdf,application/pdf' : 'image/png,image/jpeg,image/webp,image/jpg'}
              className="hidden"
            />

            {!selectedFile && !filePreview && !existingFileId ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-slate-950/40"
              >
                <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                  Click to browse or drag and drop
                </p>
                <p className="text-[11px] text-gray-400 mt-1">
                  {type === 'pdf' ? 'PDF documents up to 50MB' : 'PNG, JPG, or WebP with automated OCR text extraction'}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {filePreview ? (
                    <img
                      src={filePreview}
                      alt="Preview"
                      className="w-12 h-12 rounded-lg object-cover border border-gray-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-500 border border-rose-200/50">
                      <FileText className="w-6 h-6" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {selectedFile ? selectedFile.name : 'Existing uploaded file'}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      {selectedFile ? formatFileSize(selectedFile.size) : 'Stored in Appwrite Storage'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline px-2 py-1"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                      setExistingFileId('');
                    }}
                    className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* OCR / PDF Extraction Status & Progress */}
            {extracting && (
              <div className="mt-2 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
                    <span>{extractionStatus || 'Extracting text...'}</span>
                  </div>
                  <span>{extractionProgress}%</span>
                </div>
                <div className="w-full bg-indigo-200 dark:bg-indigo-900 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${extractionProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Scanned PDF notice */}
            {scannedPdfNotice && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  <strong>Scanned document:</strong> This PDF contains raster image pages without selectable text. You can still save it and manually enter notes below.
                </span>
              </div>
            )}
          </div>
        )}

        {/* Extracted Text (Editable) */}
        {(isFileAllowed || extractedText) && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Extracted Text (OCR / PDF)</span>
              </label>
              <span className="text-[11px] text-gray-400">
                Searchable • Editable
              </span>
            </div>
            <textarea
              rows={3}
              value={extractedText}
              onChange={(e) => setExtractedText(e.target.value)}
              placeholder="Text extracted from image or PDF will appear here automatically. You can edit it if OCR makes any mistakes."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        )}

        {/* Note Content (For 'note' type) */}
        {type === 'note' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              Note Content
            </label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note, recipe, ideas, or reminders here..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        )}

        {/* Code Snippet (For 'code' type) */}
        {type === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                Code Snippet
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-2.5 py-1 text-xs rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-mono"
              >
                {CODE_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="// Paste code snippet here..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-gray-200 dark:border-slate-700 bg-slate-900 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-brand-500 focus:outline-none leading-relaxed"
            />
          </div>
        )}

        {/* URL Link (For 'url' type) */}
        {type === 'url' && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
              URL Address *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              required={type === 'url'}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>
        )}

        {/* Description (Optional) */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Description <span className="text-gray-400 font-normal lowercase">(optional)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief summary or context to help you remember"
            className="w-full px-3.5 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 min-h-[42px]">
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-rose-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={tags.length === 0 ? 'Type tag and press Enter or comma...' : 'Add another tag...'}
              className="flex-1 min-w-[120px] bg-transparent text-xs text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving || extracting}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || extracting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm focus:ring-2 focus:ring-brand-500 transition-all disabled:opacity-50"
          >
            {saving ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Saving to TablesDB...</span>
              </>
            ) : (
              <span>{editingMemory ? 'Update Memory' : 'Save Memory'}</span>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
