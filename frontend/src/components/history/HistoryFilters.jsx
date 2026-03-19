import React from 'react';

function HistoryFilters({ filter, setFilter, sortBy, setSortBy, totalCount, filteredCount }) {
  return (
    <div className="bg-dark-card border border-white/5 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-accent-primary text-white'
              : 'bg-dark-input text-gray-400 hover:text-white'
          }`}
        >
          All ({totalCount})
        </button>
        <button
          onClick={() => setFilter('real')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'real'
              ? 'bg-status-real text-white'
              : 'bg-dark-input text-gray-400 hover:text-white'
          }`}
        >
          Real
        </button>
        <button
          onClick={() => setFilter('fake')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            filter === 'fake'
              ? 'bg-status-fake text-white'
              : 'bg-dark-input text-gray-400 hover:text-white'
          }`}
        >
          AI-Generated
        </button>
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-dark-input border border-white/10 text-white px-3 py-2 rounded-lg cursor-pointer focus:outline-none focus:border-accent-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="confidence">Highest Confidence</option>
        </select>
      </div>
    </div>
  );
}

export default HistoryFilters;