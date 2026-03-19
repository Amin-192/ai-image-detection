import React from 'react';

function UploadZone({ handleImageSelect, handleDetect, imagePreview, selectedImage, loading }) {
  return (
    <div className="bg-dark-card border border-white/5 rounded-2xl p-8 shadow-2xl">
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        id="file-input"
        className="hidden"
      />

      {!imagePreview ? (
        <label
          htmlFor="file-input"
          className="block cursor-pointer group"
        >
          <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-accent-primary transition-all hover:bg-accent-primary/5">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h3 className="text-xl font-semibold mb-2">Upload Image for Analysis</h3>
            <p className="text-gray-400 text-sm">
              Click to select or drag and drop<br />
              Supports: PNG, JPG, JPEG, WEBP
            </p>
          </div>
        </label>
      ) : (
        <div className="space-y-6">
          <div className="relative group rounded-xl overflow-hidden">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-[400px] object-cover"
            />
            <label
              htmlFor="file-input"
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <span className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full font-semibold">
                Change Image
              </span>
            </label>
          </div>

          <button
            onClick={handleDetect}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="spinner"></div>
                <span>Analyzing Evidence...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <span>🔬</span>
                <span>Begin Analysis</span>
              </div>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default UploadZone;