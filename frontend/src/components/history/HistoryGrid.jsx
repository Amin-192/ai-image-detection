import React from 'react';
import HistoryCard from './HistoryCard';

function HistoryGrid({ history }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {history.map((item) => (
        <HistoryCard key={item.detection_id} item={item} />
      ))}
    </div>
  );
}

export default HistoryGrid;