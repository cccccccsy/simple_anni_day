import React, { useMemo } from 'react';
import './TagStats.css';

const CATEGORY_CONFIG = {
  birthday: { label: '🎂 Birthday', color: '#FFB6C1' },
  wedding: { label: '💒 Wedding', color: '#FF69B4' },
  work: { label: '💼 Work', color: '#87CEEB' },
  other: { label: '🎈 Other', color: '#DDA0DD' },
};

function TagStats({ anniversaries, trashCount }) {
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const key of Object.keys(CATEGORY_CONFIG)) {
      counts[key] = 0;
    }
    for (const a of anniversaries) {
      const cat = a.category || 'other';
      if (counts[cat] !== undefined) {
        counts[cat]++;
      } else {
        counts.other++;
      }
    }
    return counts;
  }, [anniversaries]);

  const total = anniversaries.length;

  return (
    <footer className="tag-stats">
      <div className="tag-stats-inner">
        <div className="tag-stats-header">
          <span className="tag-stats-title">Statistics</span>
          <span className="tag-stats-total">{total} total</span>
        </div>
        <div className="tag-stats-tags">
          {Object.entries(CATEGORY_CONFIG).map(([key, { label, color }]) => (
            <div className="tag-stats-item" key={key}>
              <span className="tag-stats-badge" style={{ backgroundColor: color }}>
                {label}
              </span>
              <span className="tag-stats-count">{categoryCounts[key]}</span>
            </div>
          ))}
          <div className="tag-stats-item">
            <span className="tag-stats-badge tag-stats-badge-trash">
              🗑️ Trash
            </span>
            <span className="tag-stats-count">{trashCount}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default TagStats;
