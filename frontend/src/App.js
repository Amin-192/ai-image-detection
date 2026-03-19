import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// We will build these next
import HomeView from './components/Home/HomeView';
import AuthView from './components/AuthView';
import HistoryView from './components/history/HistoryView';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

function App() {
  // ----------------------------------------------------
  // EXACT SAME LOGIC - UNTOUCHED
  // ----------------------------------------------------
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [backendStatus, setBackendStatus] = useState('Checking...');

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [heatmap, setHeatmap] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
  const storedToken = localStorage.getItem('token');
  console.log('🔑 Token check:', storedToken ? 'Found' : 'Not found');
  
  if (storedToken) {
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      console.log('✅ Token valid:', payload.email);
      setUser({ email: payload.email, user_id: payload.user_id });
      setToken(storedToken);
    } catch (e) {
      console.error('❌ Invalid token:', e);
      localStorage.removeItem('token');
      setToken(null);
    }
  }
}, []);

  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(res => setBackendStatus(`Connected (${res.data.model_version})`))
      .catch(err => setBackendStatus('Disconnected'));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { email, password });
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
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
      setMetadata(null);
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
  setMetadata(null);
  setHeatmap(null);  // Add this
  
  const formData = new FormData();
  formData.append('image', selectedImage);
  
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.post(`${API_URL}/detect`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', ...headers }
    });
    
    setResult(response.data.result);
    setHeatmap(response.data.heatmap);
    
    // Set metadata with heatmap
    setMetadata({
      heatmap: response.data.heatmap,
      saved: response.data.saved,
      detection_id: response.data.detection_id
    });
    
  } catch (err) {
    setError(err.response?.data?.error || 'Detection failed');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    const fetchHistory = async () => {
      if (!token) return;
      setHistoryLoading(true);
      try {
        const response = await axios.get(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(response.data.history);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (currentView === 'history' && token) {
      fetchHistory();
    }
  }, [currentView, token]);

  
  // ----------------------------------------------------
  // NEW RENDER LOGIC - CLEAN CONTROLLER
  // ----------------------------------------------------
  return (
    <div className="app-container">
      {/* Sleek Floating Header instead of a blocky Nav */}
      <header className="glass-header">
        <div className="logo-area" onClick={() => setCurrentView('home')}>
          <span className="status-dot" data-status={backendStatus.includes('Connected') ? 'online' : 'offline'}></span>
          <h1>AI Image Detector</h1>
        </div>
        
        <div className="header-controls">
          {user ? (
            <>
              <button className={`nav-pill ${currentView === 'history' ? 'active' : ''}`} onClick={() => setCurrentView('history')}>History</button>
              <button className="nav-pill logout" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="nav-pill" onClick={() => setCurrentView('login')}>Sign In</button>
          )}
        </div>
      </header>

      <main className="main-content">
        {currentView === 'home' && (
          <HomeView 
            handleImageSelect={handleImageSelect}
            handleDetect={handleDetect}
            imagePreview={imagePreview}
            selectedImage={selectedImage}
            result={result}
            metadata={metadata}
            loading={loading}
            error={error}
          />
        )}

        {(currentView === 'login' || currentView === 'register') && (
          <AuthView 
            currentView={currentView}
            setCurrentView={setCurrentView}
            handleLogin={handleLogin}
            handleRegister={handleRegister}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            authLoading={authLoading}
            authError={authError}
          />
        )}

        {currentView === 'history' && (
          <HistoryView 
            history={history}
            historyLoading={historyLoading}
          />
        )}
      </main>
    </div>
  );
}

export default App;