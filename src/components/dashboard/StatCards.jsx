import React from 'react';
import {
  Layers,
  Image as ImageIcon,
  StickyNote,
  FileText,
  Code2,
} from 'lucide-react';

export default function StatCards({ memories = [] }) {
  // Compute genuine statistics directly from actual saved records
  const total = memories.length;
  const imageCount = memories.filter((m) => m.type === 'screenshot' || m.type === 'image').length;
  const noteCount = memories.filter((m) => m.type === 'note').length;
  const docCount = memories.filter((m) => m.type === 'pdf').length;
  const codeAndUrlCount = memories.filter((m) => m.type === 'code' || m.type === 'url').length;

  const stats = [
    {
      title: 'Total Memories',
      value: total,
      label: 'Saved in vault',
      icon: Layers,
      color: 'brand',
      bgLight: 'bg-indigo-50 text-brand-600 border-indigo-100',
      bgDark: 'dark:bg-indigo-950/50 dark:text-brand-300 dark:border-indigo-900/50',
    },
    {
      title: 'Images & Screenshots',
      value: imageCount,
      label: 'OCR scanned',
      icon: ImageIcon,
      color: 'purple',
      bgLight: 'bg-purple-50 text-purple-600 border-purple-100',
      bgDark: 'dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-900/50',
    },
    {
      title: 'Quick Notes',
      value: noteCount,
      label: 'Plain-text notes',
      icon: StickyNote,
      color: 'amber',
      bgLight: 'bg-amber-50 text-amber-600 border-amber-100',
      bgDark: 'dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50',
    },
    {
      title: 'PDF Documents',
      value: docCount,
      label: 'Text extracted',
      icon: FileText,
      color: 'rose',
      bgLight: 'bg-rose-50 text-rose-600 border-rose-100',
      bgDark: 'dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900/50',
    },
    {
      title: 'Code & URLs',
      value: codeAndUrlCount,
      label: 'Snippets & links',
      icon: Code2,
      color: 'emerald',
      bgLight: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      bgDark: 'dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${
              idx === 0 ? 'col-span-2 lg:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                {stat.title}
              </span>
              <div className={`p-2 rounded-xl border ${stat.bgLight} ${stat.bgDark}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {stat.value}
              </span>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
