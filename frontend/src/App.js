import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'login', 'register', 'history'
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Detection state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Auth state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // History state
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      // Decode token to get user info (simple version)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, user_id: payload.user_id });
      } catch (e) {
        localStorage.removeItem('token');
        setToken(null);
      }
    }
  }, [token]);

  // ==================== AUTH FUNCTIONS ====================

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password
      });

      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setCurrentView('home');
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });

      const { token: newToken, user: newUser } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      setCurrentView('home');
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setCurrentView('home');
  };

  // ==================== DETECTION FUNCTIONS ====================

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
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await axios.post(`${API_URL}/detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...headers
        }
      });

      setResult(response.data.result);
    } catch (err) {
      setError(err.response?.data?.error || 'Detection failed');
    } finally {
      setLoading(false);
    }
  };

  // ==================== HISTORY FUNCTIONS ====================

  const fetchHistory = async () => {
    if (!token) return;

    setHistoryLoading(true);
    try {
      const response = await axios.get(`${API_URL}/history`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setHistory(response.data.history);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (currentView === 'history' && token) {
      fetchHistory();
    }
  }, [currentView, token]);

  // ==================== RENDER ====================

  return (
    <div className="App">
      <header className="App-header">
        <h1>🔍 AI Image Detection System</h1>
        
        {/* Navigation */}
        <nav className="nav">
          <button onClick={() => setCurrentView('home')} className={currentView === 'home' ? 'active' : ''}>
            Home
          </button>
          {user ? (
            <>
              <button onClick={() => setCurrentView('history')} className={currentView === 'history' ? 'active' : ''}>
                History
              </button>
              <button onClick={handleLogout}>
                Logout ({user.email})
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentView('login')} className={currentView === 'login' ? 'active' : ''}>
                Login
              </button>
              <button onClick={() => setCurrentView('register')} className={currentView === 'register' ? 'active' : ''}>
                Register
              </button>
            </>
          )}
        </nav>

        {/* HOME VIEW */}
        {currentView === 'home' && (
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
          </div>
        )}

        {/* LOGIN VIEW */}
        {currentView === 'login' && (
          <div className="auth-section">
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={authLoading}>
                {authLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            {authError && <p className="error">{authError}</p>}
          </div>
        )}

        {/* REGISTER VIEW */}
        {currentView === 'register' && (
          <div className="auth-section">
            <h2>Register</h2>
            <form onSubmit={handleRegister}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="submit" disabled={authLoading}>
                {authLoading ? 'Registering...' : 'Register'}
              </button>
            </form>
            {authError && <p className="error">{authError}</p>}
          </div>
        )}

        {/* HISTORY VIEW */}
        {currentView === 'history' && (
          <div className="history-section">
            <h2>Detection History</h2>
            {historyLoading ? (
              <p>Loading history...</p>
            ) : history.length === 0 ? (
              <p>No detections yet. Upload an image to get started!</p>
            ) : (
              <div className="history-list">
                {history.map((item) => (
                  <div key={item.detection_id} className={`history-item ${item.classification === 'Real' ? 'real' : 'fake'}`}>
                    <p><strong>{item.classification}</strong></p>
                    <p>Confidence: {(item.confidence_score * 100).toFixed(1)}%</p>
                    <p><small>{new Date(item.created_at).toLocaleString()}</small></p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;