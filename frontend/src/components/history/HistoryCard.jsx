import React, { useState } from 'react';

function HistoryCard({ item }) {
  const [imageError, setImageError] = useState(false);
  const isReal = item.classification === 'Real';

  const dateObj = new Date(item.created_at);
  const formattedDate = dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div 
      className={`bg-dark-card rounded-xl overflow-hidden border-l-4 transition-all hover:transform hover:-translate-y-1 hover:shadow-xl ${
        isReal ? 'border-status-real' : 'border-status-fake'
      }`}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-dark-input overflow-hidden group">
        {item.image_url && !imageError ? (
          <>
            <img 
              src={item.image_url} 
              alt={`${item.classification} detection`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              onError={() => setImageError(true)}
            />
            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-semibold">Click to expand</span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <span className="text-4xl">🖼️</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
              isReal 
                ? 'bg-status-real/20 text-status-real' 
                : 'bg-status-fake/20 text-status-fake'
            }`}
          >
            {item.classification}
          </span>
          <span className="text-xs text-gray-400">
            {formattedDate} • {formattedTime}
          </span>
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Confidence</span>
            <span className="font-bold text-white">
              {(item.confidence_score * 100).toFixed(1)}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-dark-input rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                isReal ? 'bg-status-real' : 'bg-status-fake'
              }`}
              style={{ width: `${item.confidence_score * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistoryCard;