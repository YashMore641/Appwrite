import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Database,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { LANDING_PAGE_DEMO_MEMORIES } from '../utils/mockDemoData';
import MemoryCard from '../components/memory/MemoryCard';
import MemoryDetailModal from '../components/memory/MemoryDetailModal';
import ThemeToggle from '../components/common/ThemeToggle';

export default function LandingPage({
  onAuthSuccess = () => {},
  onOpenConfigModal = () => {},
}) {
  const { login, register, isConfigured } = useAuth();
  const toast = useToast();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  // Interactive demo preview state
  const [demoSearch, setDemoSearch] = useState('');
  const [previewMemory, setPreviewMemory] = useState(null);

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!isConfigured) {
      setFormError('Appwrite is not configured yet. Click "Configure Appwrite" to enter your Project ID.');
      onOpenConfigModal();
      return;
    }

    if (authMode === 'signup' && !name.trim()) {
      setFormError('Please enter your full name.');
      return;
    }

    if (!email.trim() || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      if (authMode === 'signup') {
        const result = await register(name, email, password);
        if (result.success) {
          toast.success('Account created! Welcome to RecallX.');
          onAuthSuccess();
        } else {
          setFormError(result.error);
        }
      } else {
        const result = await login(email, password);
        if (result.success) {
          toast.success('Welcome back!');
          onAuthSuccess();
        } else {
          setFormError(result.error);
        }
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const filteredDemoMemories = LANDING_PAGE_DEMO_MEMORIES.filter((m) => {
    if (!demoSearch.trim()) return true;
    const q = demoSearch.toLowerCase();
    return (
      m.title.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q) ||
      m.tags.some((t) => t.toLowerCase().includes(q)) ||
      m.extractedText.toLowerCase().includes(q) ||
      m.content.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex flex-col">
      {/* Top Banner if Appwrite not configured */}
      {!isConfigured && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-800 dark:text-amber-200">
          <span>Appwrite credentials required to create real accounts. </span>
          <button
            onClick={onOpenConfigModal}
            className="font-bold underline ml-1 hover:text-amber-900 dark:hover:text-amber-100"
          >
            Configure Appwrite TablesDB Connection
          </button>
        </div>
      )}

      {/* Landing Page Top Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-1.5">
                Recall<span className="text-brand-600 dark:text-brand-400">X</span>
              </span>
              <span className="hidden sm:block text-[10px] text-gray-400 dark:text-gray-500 font-medium tracking-wider uppercase -mt-1">
                Personal Memory Vault
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenConfigModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>{isConfigured ? 'TablesDB Config' : 'Setup Appwrite'}</span>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 dark:bg-brand-950/80 border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300">
              <Database className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              <span>Built for Appwrite Databases Hackathon</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
              Save it once. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600">
                Find it anytime.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              <strong>RecallX</strong> is your lightweight personal memory vault. Save screenshots, images, PDFs, notes, URLs, and code snippets and effortlessly search them later without remembering filenames or where you originally found them.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2">
                  <Database className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Appwrite TablesDB
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Structured memory rows & user permissions
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Tesseract.js OCR
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Extracts text from screenshots & images
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <Search className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                  Instant Search
                </h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                  Multi-field keyword search across all content
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Authentication Card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl p-6 sm:p-8">
              {/* Auth Mode Toggle */}
              <div className="flex rounded-xl bg-gray-100 dark:bg-slate-800 p-1 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setFormError('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setFormError('');
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    authMode === 'signup'
                      ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Title */}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {authMode === 'signup' ? 'Create your Memory Vault' : 'Welcome back to RecallX'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {authMode === 'signup'
                    ? 'Register using Appwrite Authentication'
                    : 'Log in with your Appwrite credentials'}
                </p>
              </div>

              {/* Error Box */}
              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {formError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmitAuth} className="space-y-4">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Alex Doe"
                        required={authMode === 'signup'}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-sm focus:ring-2 focus:ring-brand-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'signup' ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Appwrite connection shortcut */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
                <button
                  type="button"
                  onClick={onOpenConfigModal}
                  className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium inline-flex items-center gap-1"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Configure Appwrite TablesDB Endpoint & Keys</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Dashboard Preview Section */}
        <div className="mt-20 pt-10 border-t border-gray-200 dark:border-slate-800">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Interactive Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
              Experience RecallX in Action
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Try searching below with keywords like <strong className="text-brand-600 dark:text-brand-400">"chocolate cake"</strong>, <strong className="text-brand-600 dark:text-brand-400">"appwrite"</strong>, or <strong className="text-brand-600 dark:text-brand-400">"finance"</strong> to test how extracted text is surfaced. Click any card to inspect.
            </p>

            {/* Interactive Demo Search Bar */}
            <div className="mt-5 max-w-lg mx-auto relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={demoSearch}
                onChange={(e) => setDemoSearch(e.target.value)}
                placeholder="Try searching 'chocolate cake' or 'recipe'..."
                className="w-full pl-10 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
              {demoSearch && (
                <button
                  onClick={() => setDemoSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Demo Memories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDemoMemories.map((demo) => (
              <MemoryCard
                key={demo.id}
                memory={demo}
                viewMode="grid"
                searchQuery={demoSearch}
                onView={(m) => setPreviewMemory(m)}
                onEdit={() => toast.info('Log in or sign up to save and edit your real memories!')}
                onDelete={() => toast.info('Demo records cannot be deleted.')}
              />
            ))}
          </div>

          <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
            * Clearly identified demo preview records for testing search and OCR capabilities. Real user data is isolated per account in Appwrite TablesDB.
          </div>
        </div>
      </div>

      {/* Demo Detail Modal */}
      {previewMemory && (
        <MemoryDetailModal
          isOpen={Boolean(previewMemory)}
          memory={previewMemory}
          onClose={() => setPreviewMemory(null)}
          onEdit={() => toast.info('Log in or sign up to edit memories.')}
          onDelete={() => toast.info('Demo preview cannot be deleted.')}
        />
      )}
    </div>
  );
}
