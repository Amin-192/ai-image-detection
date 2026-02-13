import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check backend health on mount
  useEffect(() => {
    axios.get('http://127.0.0.1:5000/health')
      .then(res => {
        setBackendStatus('✅ Connected');
      })
      .catch(err => {
        setBackendStatus('❌ Disconnected');
      });
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setError(null);
    }
  };

  const handleDetect = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      const response = await axios.post('http://127.0.0.1:5000/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 AI Image Detection System</h1>
        <p className="status">Backend: {backendStatus}</p>

        <div className="upload-section">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            id="file-input"
          />
          <label htmlFor="file-input" className="file-label">
            Choose Image
          </label>

          {imagePreview && (
            <div className="preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          {selectedImage && (
            <button
              onClick={handleDetect}
              disabled={loading}
              className="detect-btn"
            >
              {loading ? 'Analyzing...' : 'Detect'}
            </button>
          )}
        </div>

        {error && (
          <div className="error">
            <p>❌ {error}</p>
          </div>
        )}

        {result && (
          <div className={`result ${result.classification === 'Real' ? 'real' : 'fake'}`}>
            <h2>Result: {result.classification}</h2>
            <p>Confidence: {(result.confidence * 100).toFixed(1)}%</p>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${result.confidence * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;