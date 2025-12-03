import React from 'react';
import AnniversaryCard from './AnniversaryCard';
import EmptyState from './EmptyState';
import { sortByDaysUntil } from '../services/DateService';
import './AnniversaryList.css';

function AnniversaryList({ anniversaries, onEdit, onDelete, onAddClick }) {
  if (!anniversaries || anniversaries.length === 0) {
    return <EmptyState onAddClick={onAddClick} />;
  }

  // Sort by days until next occurrence
  const sortedAnniversaries = sortByDaysUntil([...anniversaries]);

  return (
    <div className="anniversary-list">
      <div className="list-header">
        <h2 className="list-title">Your Anniversaries ({anniversaries.length})</h2>
      </div>
      <div className="list-grid">
        {sortedAnniversaries.map(anniversary => (
          <AnniversaryCard
            key={anniversary.id}
            anniversary={anniversary}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default AnniversaryList;
