import React, { useState } from 'react';
import Header from './components/Header';
import AnniversaryList from './components/AnniversaryList';
import AnniversaryForm from './components/AnniversaryForm';
import ConfirmDialog from './components/ConfirmDialog';
import useLocalStorage from './hooks/useLocalStorage';
import useNotifications from './hooks/useNotifications';
import './App.css';

function App() {
  // State management
  const [anniversaries, setAnniversaries] = useLocalStorage('anniversaries', []);
  const [showForm, setShowForm] = useState(false);
  const [editingAnniversary, setEditingAnniversary] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
  React.useEffect(() => {
    if (isGranted) {
      checkAndFire();
    }
  }, [isGranted, checkAndFire]);

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
      const updatedAnniversaries = anniversaries.filter(
        a => a.id !== deleteConfirm.id
      );
      setAnniversaries(updatedAnniversaries);
      setDeleteConfirm(null);
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

  return (
    <div className="app">
      <Header onAddClick={handleAddClick} />

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
          title="Delete Anniversary?"
          message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}
    </div>
  );
}

export default App;
