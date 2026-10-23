import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, duration) => addToast(msg, 'success', duration),
    error: (msg, duration) => addToast(msg, 'error', duration),
    info: (msg, duration) => addToast(msg, 'info', duration),
  };

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      {/* Toast container overlay */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
              item.type === 'success'
                ? 'bg-white dark:bg-slate-900 border-emerald-500/40 text-emerald-950 dark:text-emerald-200'
                : item.type === 'error'
                ? 'bg-white dark:bg-slate-900 border-rose-500/40 text-rose-950 dark:text-rose-200'
                : 'bg-white dark:bg-slate-900 border-indigo-500/40 text-slate-900 dark:text-slate-100'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {item.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
              {item.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500" />}
              {item.type === 'info' && <Info className="w-5 h-5 text-indigo-500" />}
            </div>
            <div className="flex-1 font-medium leading-relaxed break-words">{item.message}</div>
            <button
              onClick={() => removeToast(item.id)}
              className="shrink-0 p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
