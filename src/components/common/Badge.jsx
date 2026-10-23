import React from 'react';
import {
  Maximize2,
  Image as ImageIcon,
  FileText,
  StickyNote,
  Link as LinkIcon,
  Code as CodeIcon,
  Bookmark,
} from 'lucide-react';
import { getTypeBadgeInfo } from '../../utils/formatters';

const TYPE_ICONS = {
  screenshot: Maximize2,
  image: ImageIcon,
  pdf: FileText,
  note: StickyNote,
  url: LinkIcon,
  code: CodeIcon,
  default: Bookmark,
};

export default function Badge({ type, size = 'sm', className = '' }) {
  const badgeInfo = getTypeBadgeInfo(type);
  const IconComponent = TYPE_ICONS[type] || TYPE_ICONS.default;

  const sizeClasses = size === 'xs'
    ? 'text-xs px-2 py-0.5 gap-1'
    : size === 'md'
    ? 'text-sm px-3 py-1 gap-1.5'
    : 'text-xs px-2.5 py-1 gap-1.5';

  const iconSizes = size === 'xs' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${badgeInfo.bgLight} ${badgeInfo.bgDark} ${sizeClasses} ${className}`}
    >
      <IconComponent className={iconSizes} />
      <span>{badgeInfo.label}</span>
    </span>
  );
}
