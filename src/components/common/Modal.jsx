import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-2xl',
  showClose = true,
}) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-6">
        <div
          className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-left shadow-2xl transition-all w-full ${maxWidth} animate-in zoom-in-95 duration-200`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          {(title || showClose) && (
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800/80 px-6 py-4">
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-6">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {subtitle}
                  </p>
                )}
              </div>
              {showClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
                  aria-label="Close dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
