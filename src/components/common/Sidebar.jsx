import React from 'react';
import {
  LayoutDashboard,
  Library,
  PlusCircle,
  Settings,
  Maximize2,
  Image as ImageIcon,
  FileText,
  StickyNote,
  Link as LinkIcon,
  Code as CodeIcon,
  ChevronLeft,
  ChevronRight,
  Database,
} from 'lucide-react';
import { MEMORY_TYPES } from '../../utils/formatters';

export default function Sidebar({
  currentPage = 'dashboard',
  onNavigate = () => {},
  selectedType = 'all',
  onSelectType = () => {},
  onOpenAddModal = () => {},
  onOpenConfigModal = () => {},
  isCollapsed = false,
  onToggleCollapse = () => {},
  isMobileOpen = false,
  onCloseMobile = () => {},
  typeCounts = {},
}) {
  const TYPE_ICONS = {
    all: Library,
    screenshot: Maximize2,
    image: ImageIcon,
    pdf: FileText,
    note: StickyNote,
    url: LinkIcon,
    code: CodeIcon,
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'library', label: 'Memory Library', icon: Library },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (pageId) => {
    onNavigate(pageId);
    onCloseMobile();
  };

  const handleTypeClick = (typeId) => {
    onSelectType(typeId);
    if (currentPage !== 'library') {
      onNavigate('library');
    }
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between py-4 select-none">
      <div className="space-y-6 px-3">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 shadow-sm border border-brand-200/50 dark:border-brand-800/50 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800/60'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-400'}`} />
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Quick Add CTA Button in Sidebar */}
        <div className="pt-1">
          <button
            onClick={() => {
              onOpenAddModal();
              onCloseMobile();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-xs text-brand-700 dark:text-brand-300 bg-brand-50/70 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/40 border border-brand-200/60 dark:border-brand-800/60 transition-colors ${
              isCollapsed ? 'px-0' : 'px-3'
            }`}
            title="Create New Memory"
          >
            <PlusCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
            {!isCollapsed && <span>Quick Capture</span>}
          </button>
        </div>

        {/* Memory Types Filter Section */}
        <div>
          {!isCollapsed && (
            <p className="px-3 text-[11px] font-bold tracking-wider uppercase text-gray-400 dark:text-gray-500 mb-2">
              Categories
            </p>
          )}
          <div className="space-y-1">
            {MEMORY_TYPES.map((type) => {
              const Icon = TYPE_ICONS[type.id] || Library;
              const isSelected = selectedType === type.id;
              const count = type.id === 'all'
                ? Object.values(typeCounts).reduce((a, b) => a + b, 0)
                : (typeCounts[type.id] || 0);

              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeClick(type.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isSelected && currentPage === 'library'
                      ? 'bg-gray-200/70 dark:bg-slate-800 text-gray-900 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-slate-800/40'
                  }`}
                  title={isCollapsed ? `${type.label} (${count})` : undefined}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-gray-400 dark:text-gray-500" />
                    {!isCollapsed && <span className="truncate">{type.label}</span>}
                  </div>
                  {!isCollapsed && (
                    <span className="text-[11px] font-normal text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="px-3 pt-4 border-t border-gray-100 dark:border-slate-800/80 space-y-2">
        <button
          onClick={onOpenConfigModal}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Appwrite TablesDB Info' : undefined}
        >
          <Database className="w-4 h-4 text-indigo-500 shrink-0" />
          {!isCollapsed && <span>TablesDB Backend</span>}
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center gap-2 py-2 rounded-xl text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-slate-900 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
