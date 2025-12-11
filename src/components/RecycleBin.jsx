import React from 'react';
import { formatDate } from '../services/DateService';
import './RecycleBin.css';

function RecycleBin({ trash, onRestore, onPermanentDelete, onClearAll, onClose }) {
  if (!trash || trash.length === 0) {
    return (
      <div className="recycle-bin-overlay" onClick={onClose}>
        <div className="recycle-bin-modal" onClick={(e) => e.stopPropagation()}>
          <div className="recycle-bin-header">
            <h2 className="recycle-bin-title">🗑️ Recycle Bin</h2>
            <button className="btn-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="recycle-bin-body">
            <div className="recycle-bin-empty">
              <div className="empty-trash-icon">🎉</div>
              <p className="empty-trash-text">Recycle bin is empty</p>
              <p className="empty-trash-subtext">Deleted items will appear here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="recycle-bin-overlay" onClick={onClose}>
      <div className="recycle-bin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="recycle-bin-header">
          <h2 className="recycle-bin-title">🗑️ Recycle Bin</h2>
          <div className="recycle-bin-actions">
            {trash.length > 0 && (
              <button
                className="btn btn-danger-outline btn-sm"
                onClick={onClearAll}
                title="Empty recycle bin"
              >
                Empty Bin
              </button>
            )}
            <button className="btn-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </div>

        <div className="recycle-bin-body">
          <div className="trash-count">
            {trash.length} {trash.length === 1 ? 'item' : 'items'} in recycle bin
          </div>

          <div className="trash-list">
            {trash.map((item) => (
              <div key={item.id} className="trash-item">
                <div className="trash-item-content">
                  <div className="trash-item-header">
                    <h3 className="trash-item-title">{item.title}</h3>
                    <span className="trash-item-category">{item.category}</span>
                  </div>
                  <p className="trash-item-date">
                    📅 {formatDate(item.date)}
                  </p>
                  {item.description && (
                    <p className="trash-item-description">{item.description}</p>
                  )}
                  <p className="trash-item-deleted">
                    Deleted: {formatDate(item.deletedAt)}
                  </p>
                </div>
                <div className="trash-item-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onRestore(item)}
                    title="Restore this item"
                  >
                    ↶ Restore
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onPermanentDelete(item)}
                    title="Delete permanently"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RecycleBin;
