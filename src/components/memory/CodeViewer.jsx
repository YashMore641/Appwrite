import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CodeViewer({ code = '', language = 'javascript', maxHeight = 'max-h-96' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Clipboard copy failed:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 bg-slate-900 text-slate-100 text-xs">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800">
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className={`p-4 overflow-x-auto ${maxHeight} font-mono leading-relaxed`}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-800/40">
                <td className="w-8 pr-4 select-none text-right text-slate-600 text-[11px]">
                  {idx + 1}
                </td>
                <td className="whitespace-pre text-slate-200">
                  {line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
