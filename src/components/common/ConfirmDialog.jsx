import React from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Memory',
  message = 'Are you sure you want to delete this memory? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDeleting = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md" showClose={!isDeleting}>
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h4>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {message}
          </p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors focus:ring-2 focus:ring-rose-500 shadow-sm disabled:opacity-50"
        >
          {isDeleting ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          <span>{isDeleting ? 'Deleting...' : confirmText}</span>
        </button>
      </div>
    </Modal>
  );
}
