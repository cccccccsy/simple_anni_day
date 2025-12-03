import React from 'react';
import { useCountdown } from '../hooks/useCountdown';
import { formatDate } from '../services/DateService';
import './AnniversaryCard.css';

const CATEGORY_COLORS = {
  birthday: '#FFB6C1',
  wedding: '#FF69B4',
  work: '#87CEEB',
  other: '#DDA0DD'
};

const CATEGORY_LABELS = {
  birthday: '🎂 Birthday',
  wedding: '💒 Wedding',
  work: '💼 Work',
  other: '🎈 Other'
};

function AnniversaryCard({ anniversary, onEdit, onDelete }) {
  const { daysUntil, countdownText, isToday, isApproaching } = useCountdown(anniversary.date);

  const categoryColor = CATEGORY_COLORS[anniversary.category] || CATEGORY_COLORS.other;
  const categoryLabel = CATEGORY_LABELS[anniversary.category] || CATEGORY_LABELS.other;

  // Determine card state class
  let stateClass = '';
  if (isToday) {
    stateClass = 'card-today';
  } else if (isApproaching) {
    stateClass = 'card-approaching';
  }

  return (
    <div className={`anniversary-card ${stateClass}`}>
      <div className="card-header">
        <div
          className="card-category"
          style={{ backgroundColor: categoryColor }}
        >
          {categoryLabel}
        </div>
        <div className="card-actions">
          <button
            className="card-action-btn"
            onClick={() => onEdit(anniversary)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="card-action-btn card-action-delete"
            onClick={() => onDelete(anniversary)}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{anniversary.title}</h3>
        <div className="card-date">{formatDate(anniversary.date)}</div>

        {anniversary.description && (
          <p className="card-description">{anniversary.description}</p>
        )}

        <div className="card-countdown">
          <div className="countdown-number">{Math.abs(daysUntil)}</div>
          <div className="countdown-text">{countdownText}</div>
        </div>

        {isToday && (
          <div className="card-badge card-badge-today">
            🎉 Today!
          </div>
        )}
        {isApproaching && !isToday && (
          <div className="card-badge card-badge-approaching">
            ⏰ Coming Soon
          </div>
        )}
      </div>
    </div>
  );
}

export default AnniversaryCard;
