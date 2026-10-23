import React from 'react';
import {
  Camera,
  Image as ImageIcon,
  FileText,
  StickyNote,
  Link as LinkIcon,
  Code as CodeIcon,
} from 'lucide-react';

export default function QuickActions({ onOpenAddWithType = () => {} }) {
  const actions = [
    {
      type: 'screenshot',
      label: 'Screenshot',
      desc: 'OCR auto-extract',
      icon: Camera,
      color: 'indigo',
      border: 'hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400',
    },
    {
      type: 'image',
      label: 'Image',
      desc: 'PNG, JPG, WebP',
      icon: ImageIcon,
      color: 'purple',
      border: 'hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-950/30',
      iconBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400',
    },
    {
      type: 'pdf',
      label: 'PDF Document',
      desc: 'Text parse & search',
      icon: FileText,
      color: 'rose',
      border: 'hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-950/30',
      iconBg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
    },
    {
      type: 'note',
      label: 'Quick Note',
      desc: 'Ideas & recipes',
      icon: StickyNote,
      color: 'amber',
      border: 'hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/30',
      iconBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
    },
    {
      type: 'url',
      label: 'Web Link',
      desc: 'Bookmarks & refs',
      icon: LinkIcon,
      color: 'cyan',
      border: 'hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-cyan-950/30',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400',
    },
    {
      type: 'code',
      label: 'Code Snippet',
      desc: 'Syntax & language',
      icon: CodeIcon,
      color: 'emerald',
      border: 'hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">
            Quick Capture
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Save any type of information into your personal memory vault
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.type}
              type="button"
              onClick={() => onOpenAddWithType(action.type)}
              className={`p-3 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-950/40 text-left transition-all ${action.border} group`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.iconBg} mb-2 group-hover:scale-110 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {action.label}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5 truncate">
                {action.desc}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
