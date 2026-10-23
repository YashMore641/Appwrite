import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Plus,
  LogOut,
  Settings,
  Database,
  Menu,
  X,
  Layers,
  ChevronDown,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({
  searchTerm = '',
  onSearchChange = () => {},
  onOpenAddModal = () => {},
  onOpenConfigModal = () => {},
  onToggleSidebar = () => {},
  currentPage = 'dashboard',
  onNavigate = () => {},
}) {
  const { user, logout, isConfigured } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu + Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="md:hidden p-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate(user ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                Recall<span className="text-brand-600 dark:text-brand-400">X</span>
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase -mt-1">
                Personal Memory Vault
              </span>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar (Visible when user is logged in and not on landing page) */}
        {user ? (
          <div className="flex-1 max-w-xl mx-2 sm:mx-6">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'library' && currentPage !== 'dashboard') {
                    onNavigate('library');
                  }
                }}
                placeholder="Search memories by keyword, OCR text, tags, code, URLs..."
                className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-950/60 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* Right Section: Actions & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Appwrite Status Pill */}
          {!isConfigured ? (
            <button
              onClick={onOpenConfigModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors animate-pulse"
              title="Click to configure Appwrite TablesDB connection"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Setup Appwrite</span>
            </button>
          ) : (
            <button
              onClick={onOpenConfigModal}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
              title="Appwrite TablesDB active"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>TablesDB Connected</span>
            </button>
          )}

          {/* Quick Add Memory Button */}
          {user && (
            <button
              type="button"
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition-all shadow-sm shadow-brand-500/25"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Memory</span>
            </button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu Dropdown (or Login/Signup if guest) */}
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-2 sm:py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 transition-colors focus:outline-none"
                aria-expanded={dropdownOpen}
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold uppercase shadow-sm">
                  {user.name ? user.name[0] : (user.email ? user.email[0] : 'U')}
                </div>
                <span className="hidden md:block text-xs font-semibold max-w-[120px] truncate text-gray-900 dark:text-white">
                  {user.name || user.email.split('@')[0]}
                </span>
                <ChevronDown className="hidden md:block w-3.5 h-3.5 text-gray-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {user.name || 'User'}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onNavigate('settings');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      <span>Settings & Appwrite</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenConfigModal();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Database className="w-4 h-4 text-gray-400" />
                      <span>TablesDB Settings</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-gray-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => onNavigate('landing')}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-sm"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
