import React from 'react';
import './EmptyState.css';

function EmptyState({ onAddClick }) {
  return (
    <div className="empty-state">
      <div className="empty-state-content">
        <div className="empty-state-icon">🎉</div>
        <h2 className="empty-state-title">No Anniversaries Yet</h2>
        <p className="empty-state-text">
          Start tracking your special moments! Add your first anniversary to begin.
        </p>
        <button className="btn btn-primary btn-lg" onClick={onAddClick}>
          <span className="btn-icon">+</span>
          Add Your First Anniversary
        </button>
      </div>
    </div>
  );
}

export default EmptyState;
