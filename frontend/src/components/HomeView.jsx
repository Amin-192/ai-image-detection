import React from 'react';

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
    <div className="home-view fade-in">
      <div className="hero-section">
        <h2>Detect AI-Generated Images</h2>
        <p className="subtitle">Upload a photo to verify its authenticity using our ResNet-50 CNN model.</p>
      </div>

      <div className="upload-container">
        {/* The hidden file input and the styled dropzone label */}
        <input
          type="file"
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleImageSelect}
          id="file-input"
          className="hidden-input"
        />
        
        <label htmlFor="file-input" className={`dropzone ${imagePreview ? 'has-image' : ''}`}>
          {!imagePreview ? (
            <div className="dropzone-placeholder">
              <span className="upload-icon">📁</span>
              <h3>Click to upload image</h3>
              <p>Supports PNG, JPG, JPEG, WEBP</p>
            </div>
          ) : (
            <div className="image-preview-wrapper">
              <img src={imagePreview} alt="Preview" className="image-preview" />
              <div className="change-image-overlay">
                <span>Change Image</span>
              </div>
            </div>
          )}
        </label>

        {error && (
          <div className="error-banner">
            <span className="error-icon">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {selectedImage && (
          <button 
            className={`action-btn ${loading ? 'loading' : ''}`} 
            onClick={handleDetect}
            disabled={loading}
          >
            {loading ? (
              <span className="loader-text">Analyzing Image...</span>
            ) : (
              'Analyze Image'
            )}
          </button>
        )}
      </div>

      {/* RESULT CARD */}
      {result && (
        <div className={`result-card slide-up ${result.classification === 'Real' ? 'theme-real' : 'theme-fake'}`}>
          <div className="result-header">
            <h3>{result.classification}</h3>
            <span className="confidence-badge">
              {(result.confidence * 100).toFixed(1)}% Confidence
            </span>
          </div>

          <div className="confidence-track">
            <div 
              className="confidence-fill" 
              style={{ width: `${result.confidence * 100}%` }}
            ></div>
          </div>

          {metadata && (
            <div className="metadata-grid">
              <div className="meta-item">
                <span className="meta-label">Model</span>
                <span className="meta-value">{metadata.model_version}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Processing Time</span>
                <span className="meta-value">{metadata.processing_time_ms}ms</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Dimensions</span>
                <span className="meta-value">{metadata.image_dimensions}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default HomeView;