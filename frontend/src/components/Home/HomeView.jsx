import React from 'react';
import UploadZone from './UploadZone';
import DetectiveResult from './DetectiveResult';

function HomeView({
  handleImageSelect,
  handleDetect,
  imagePreview,
  selectedImage,
  result,
  metadata,
  loading,
  error
}) {
  return (
    <div className="fade-in">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          AI Image Detective
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Uncover the truth behind any image. Our AI analyzes visual patterns to detect AI-generated content with precision.
        </p>
      </div>

      {/* Upload Zone */}
      <UploadZone
        handleImageSelect={handleImageSelect}
        handleDetect={handleDetect}
        imagePreview={imagePreview}
        selectedImage={selectedImage}
        loading={loading}
      />

      {/* Error Message */}
      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/50 rounded-xl p-4 text-red-400 flex items-center gap-3">
          <span className="text-2xl">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Detective Result */}
      {result && (
        <DetectiveResult
          result={result}
          metadata={metadata}
          imagePreview={imagePreview}
        />
      )}
    </div>
  );
}

export default HomeView;