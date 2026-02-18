import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import AnniversaryList from './components/AnniversaryList';
import AnniversaryForm from './components/AnniversaryForm';
import ConfirmDialog from './components/ConfirmDialog';
import RecycleBin from './components/RecycleBin';
import TagStats from './components/TagStats';
import useLocalStorage from './hooks/useLocalStorage';
import useNotifications from './hooks/useNotifications';
import {
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
  loadTrash,
  clearTrash
} from './services/StorageService';
import './App.css';

function App() {
  // State management
  const [anniversaries, setAnniversaries] = useLocalStorage('anniversaries', []);
  const [trash, setTrash] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showRecycleBin, setShowRecycleBin] = useState(false);
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState(null);

  // Notifications
  const {
    permission,
    requestPermission,
    checkAndFire,
    isGranted
  } = useNotifications(anniversaries);

  // Request notification permission on first load if not set
  React.useEffect(() => {
    if (permission === 'default' && anniversaries.length > 0) {
      // Delay to not overwhelm user on first visit
      const timer = setTimeout(() => {
        requestPermission();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [permission, anniversaries.length, requestPermission]);

  // Check notifications periodically
  useEffect(() => {
    if (isGranted) {
      checkAndFire();
    }
  }, [isGranted, checkAndFire]);

  // Load trash on mount
  useEffect(() => {
    setTrash(loadTrash());
  }, []);

  // Handlers
  const handleAddClick = () => {
    setEditingAnniversary(null);
    setShowForm(true);
  };

  const handleEdit = (anniversary) => {
    setEditingAnniversary(anniversary);
    setShowForm(true);
  };

  const handleDelete = (anniversary) => {
    setDeleteConfirm(anniversary);
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      try {
        const result = moveToTrash(deleteConfirm.id);
        setAnniversaries(result.anniversaries);
        setTrash(result.trash);
        setDeleteConfirm(null);
      } catch (error) {
        console.error('Error moving to trash:', error);
        alert('Failed to delete anniversary. Please try again.');
      }
    }
  };

  const handleSave = (savedAnniversary) => {
    if (editingAnniversary) {
      // Update existing
      const updatedAnniversaries = anniversaries.map(a =>
        a.id === savedAnniversary.id ? savedAnniversary : a
      );
      setAnniversaries(updatedAnniversaries);
    } else {
      // Add new
      setAnniversaries([...anniversaries, savedAnniversary]);
    }

    setShowForm(false);
    setEditingAnniversary(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAnniversary(null);
  };

  // Recycle bin handlers
  const handleTrashClick = () => {
    setShowRecycleBin(true);
  };

  const handleRestore = (item) => {
    try {
      const result = restoreFromTrash(item.id);
      setAnniversaries(result.anniversaries);
      setTrash(result.trash);
    } catch (error) {
      console.error('Error restoring from trash:', error);
      alert('Failed to restore anniversary. Please try again.');
    }
  };

  const handlePermanentDelete = (item) => {
    setPermanentDeleteConfirm(item);
  };

  const confirmPermanentDelete = () => {
    if (permanentDeleteConfirm) {
      try {
        const updatedTrash = permanentDelete(permanentDeleteConfirm.id);
        setTrash(updatedTrash);
        setPermanentDeleteConfirm(null);
      } catch (error) {
        console.error('Error permanently deleting:', error);
        alert('Failed to permanently delete anniversary. Please try again.');
      }
    }
  };

  const handleClearTrash = () => {
    if (trash.length === 0) return;

    if (window.confirm(`Are you sure you want to permanently delete all ${trash.length} items from the recycle bin? This action cannot be undone.`)) {
      try {
        clearTrash();
        setTrash([]);
      } catch (error) {
        console.error('Error clearing trash:', error);
        alert('Failed to clear recycle bin. Please try again.');
      }
    }
  };

  return (
    <div className="app">
      <Header
        onAddClick={handleAddClick}
        onTrashClick={handleTrashClick}
        trashCount={trash.length}
      />

      <main className="main-content">
        {/* Notification Banner */}
        {anniversaries.length > 0 && permission === 'default' && (
          <div className="notification-banner">
            <div className="notification-banner-content">
              <span className="notification-icon">🔔</span>
              <div className="notification-text">
                <strong>Enable Notifications</strong>
                <p>Get reminded about your upcoming anniversaries</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={requestPermission}>
                Enable
              </button>
            </div>
          </div>
        )}

        {permission === 'denied' && anniversaries.length > 0 && (
          <div className="notification-banner notification-banner-warning">
            <div className="notification-banner-content">
              <span className="notification-icon">⚠️</span>
              <div className="notification-text">
                <strong>Notifications Blocked</strong>
                <p>Please enable notifications in your browser settings to get reminders</p>
              </div>
            </div>
          </div>
        )}

        <AnniversaryList
          anniversaries={anniversaries}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddClick={handleAddClick}
        />

        <TagStats anniversaries={anniversaries} trashCount={trash.length} />
      </main>

      {/* Form Modal */}
      {showForm && (
        <AnniversaryForm
          anniversary={editingAnniversary}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <ConfirmDialog
          title="Move to Recycle Bin?"
          message={`Are you sure you want to move "${deleteConfirm.title}" to the recycle bin? You can restore it later.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Permanent Delete Confirmation Dialog */}
      {permanentDeleteConfirm && (
        <ConfirmDialog
          title="Permanently Delete?"
          message={`Are you sure you want to permanently delete "${permanentDeleteConfirm.title}"? This action cannot be undone.`}
          onConfirm={confirmPermanentDelete}
          onCancel={() => setPermanentDeleteConfirm(null)}
        />
      )}

      {/* Recycle Bin Modal */}
      {showRecycleBin && (
        <RecycleBin
          trash={trash}
          onRestore={handleRestore}
          onPermanentDelete={handlePermanentDelete}
          onClearAll={handleClearTrash}
          onClose={() => setShowRecycleBin(false)}
        />
      )}
    </div>
  );
}

export default App;
