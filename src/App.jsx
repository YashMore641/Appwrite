import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';
import ConfirmDialog from './components/common/ConfirmDialog';
import AppwriteConfigModal from './components/setup/AppwriteConfigModal';
import AddEditMemoryModal from './components/memory/AddEditMemoryModal';
import MemoryDetailModal from './components/memory/MemoryDetailModal';

import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import LibraryPage from './pages/LibraryPage';
import SettingsPage from './pages/SettingsPage';

import { useAuth } from './context/AuthContext';
import { useToast } from './context/ToastContext';
import { memoryDatabaseService } from './appwrite/database';
import { storageService } from './appwrite/storage';

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();

  // Navigation & Layout State
  const [currentPage, setCurrentPage] = useState('dashboard'); // 'dashboard' | 'library' | 'settings' | 'landing'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Global Search & Category Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');

  // Memories Data State
  const [memories, setMemories] = useState([]);
  const [loadingMemories, setLoadingMemories] = useState(false);

  // Modals State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [initialMemoryType, setInitialMemoryType] = useState('note');
  const [editingMemory, setEditingMemory] = useState(null);
  const [viewingMemory, setViewingMemory] = useState(null);
  const [deletingMemory, setDeletingMemory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load Memories from Appwrite TablesDB
  const fetchMemories = useCallback(async () => {
    if (!user) {
      setMemories([]);
      return;
    }

    setLoadingMemories(true);
    try {
      const result = await memoryDatabaseService.listMemories(user.$id);
      setMemories(result.memories || []);
    } catch (err) {
      console.warn('Fetch memories warning:', err);
      // If table does not exist or user has no memories yet
      setMemories([]);
    } finally {
      setLoadingMemories(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMemories();
    } else {
      setMemories([]);
    }
  }, [user, fetchMemories]);

  // Compute category counts for sidebar
  const typeCounts = useMemo(() => {
    const counts = {
      screenshot: 0,
      image: 0,
      pdf: 0,
      note: 0,
      url: 0,
      code: 0,
    };
    memories.forEach((m) => {
      if (counts[m.type] !== undefined) {
        counts[m.type]++;
      }
    });
    return counts;
  }, [memories]);

  // Handlers for Add / Edit
  const handleOpenAddModal = (type = 'note') => {
    setEditingMemory(null);
    setInitialMemoryType(type);
    setIsAddEditModalOpen(true);
  };

  const handleEditMemory = (memory) => {
    setEditingMemory(memory);
    setInitialMemoryType(memory.type || 'note');
    setIsAddEditModalOpen(true);
  };

  const handleMemorySaved = (savedRecord) => {
    // If editing existing, update state
    if (editingMemory) {
      setMemories((prev) =>
        prev.map((m) => (m.id === savedRecord.id || m.$id === savedRecord.$id ? savedRecord : m))
      );
    } else {
      // Add new record at beginning
      setMemories((prev) => [savedRecord, ...prev]);
    }
  };

  // Handler for Delete Confirmation
  const handleDeleteConfirm = async () => {
    if (!deletingMemory) return;

    setIsDeleting(true);
    try {
      const memoryId = deletingMemory.$id || deletingMemory.id;
      // Delete file from Storage if exists
      if (deletingMemory.fileId) {
        await storageService.deleteFile(deletingMemory.fileId);
      }
      // Delete from TablesDB
      await memoryDatabaseService.deleteMemory(memoryId);

      setMemories((prev) => prev.filter((m) => (m.$id || m.id) !== memoryId));
      toast.success('Memory permanently deleted.');
      setDeletingMemory(null);
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.message || 'Failed to delete memory.');
    } finally {
      setIsDeleting(false);
    }
  };

  // If session is loading initially
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading RecallX...</p>
      </div>
    );
  }

  // If user is not logged in: show Landing Page
  if (!user) {
    return (
      <>
        <LandingPage
          onAuthSuccess={() => setCurrentPage('dashboard')}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
        />
        <AppwriteConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
        />
      </>
    );
  }

  // Main Dashboard Layout when user is logged in
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100">
      {/* Top Navbar */}
      <Navbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onOpenAddModal={() => handleOpenAddModal('note')}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          selectedType={selectedType}
          onSelectType={setSelectedType}
          onOpenAddModal={() => handleOpenAddModal('note')}
          onOpenConfigModal={() => setIsConfigModalOpen(true)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          isMobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          typeCounts={typeCounts}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto">
            {currentPage === 'dashboard' && (
              <DashboardPage
                memories={memories}
                loading={loadingMemories}
                onRefresh={fetchMemories}
                onOpenAddModal={() => handleOpenAddModal('note')}
                onOpenAddWithType={handleOpenAddModal}
                onViewMemory={(m) => setViewingMemory(m)}
                onEditMemory={handleEditMemory}
                onDeleteMemory={(m) => setDeletingMemory(m)}
                onNavigate={setCurrentPage}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
              />
            )}

            {currentPage === 'library' && (
              <LibraryPage
                memories={memories}
                loading={loadingMemories}
                onRefresh={fetchMemories}
                selectedType={selectedType}
                onSelectType={setSelectedType}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onOpenAddModal={() => handleOpenAddModal('note')}
                onViewMemory={(m) => setViewingMemory(m)}
                onEditMemory={handleEditMemory}
                onDeleteMemory={(m) => setDeletingMemory(m)}
              />
            )}

            {currentPage === 'settings' && (
              <SettingsPage
                onOpenConfigModal={() => setIsConfigModalOpen(true)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Memory Modal */}
      <AddEditMemoryModal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        initialType={initialMemoryType}
        editingMemory={editingMemory}
        onMemorySaved={handleMemorySaved}
      />

      {/* Memory Details Modal */}
      <MemoryDetailModal
        isOpen={Boolean(viewingMemory)}
        memory={viewingMemory}
        onClose={() => setViewingMemory(null)}
        onEdit={(m) => handleEditMemory(m)}
        onDelete={(m) => setDeletingMemory(m)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingMemory)}
        onClose={() => setDeletingMemory(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        title="Delete Memory"
        message={`Are you sure you want to delete "${deletingMemory?.title || 'this memory'}"? This will remove it from Appwrite TablesDB and delete associated files.`}
      />

      {/* Appwrite TablesDB Config Modal */}
      <AppwriteConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}
