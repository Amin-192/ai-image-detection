import React, { useState } from 'react';
import HistoryGrid from './HistoryGrid';
import HistoryFilters from './HistoryFilters';
import EmptyState from './EmptyState';

function HistoryView({ history, historyLoading }) {
  const [filter, setFilter] = useState('all'); // 'all', 'real', 'fake'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'confidence'

  if (historyLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] fade-in">
        <div className="spinner mb-4"></div>
        <p className="text-gray-400">Loading your detection history...</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return <EmptyState />;
  }

  // Filter logic
  const filteredHistory = history.filter(item => {
    if (filter === 'all') return true;
    return item.classification.toLowerCase() === filter;
  });

  // Sort logic
  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    }
    if (sortBy === 'confidence') {
      return b.confidence_score - a.confidence_score;
    }
    return 0;
  });

  return (
    <div className="fade-in">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Detection History</h2>
        <p className="text-gray-400">Review your past AI image analyses</p>
      </div>

      <HistoryFilters 
        filter={filter}
        setFilter={setFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={history.length}
        filteredCount={sortedHistory.length}
      />

      <HistoryGrid history={sortedHistory} />
    </div>
  );
}

export default HistoryView;