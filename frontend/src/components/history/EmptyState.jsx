import React from 'react';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center fade-in">
      <div className="text-6xl mb-6 opacity-50">📭</div>
      <h2 className="text-2xl font-bold mb-2">No detections yet</h2>
      <p className="text-gray-400 max-w-md">
        Upload and analyze an image on the home screen to see your history here.
      </p>
    </div>
  );
}

export default EmptyState;