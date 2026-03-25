import { useState, useEffect } from 'react';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';

// Components
import HomeView from './components/Home/HomeView';
import AuthView from './components/AuthView';
import History from './History';

const API_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000';

// Initialize Supabase
// Initialize Supabase
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY      
);

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [backendStatus, setBackendStatus] = useState('Checking...');
const [authSuccess, setAuthSuccess] = useState(false); // Add this line
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // 1. Check Supabase Session on Load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      }
    });

    // Listen for auth changes (like token refreshes)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
      } else {
        setUser(null);
        setToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Health Check
  useEffect(() => {
    axios.get(`${API_URL}/health`)
      .then(res => setBackendStatus(`Connected`))
      .catch(err => setBackendStatus('Disconnected'));
  }, []);

  // 3. Supabase Registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthSuccess(false); // Reset on attempt
    
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      if (data.session) {
        setCurrentView('home');
        setEmail('');
        setPassword('');
      } else {
        // PROPER SUCCESS STATE, NOT AN ERROR
        setAuthSuccess(true); 
      }
    } catch (err) {
      setAuthError(err.message || 'Registration failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // 4. Supabase Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      setCurrentView('home');
      setEmail('');
      setPassword('');
    } catch (err) {
      setAuthError(err.message || 'Login failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // 5. Supabase Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
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

  // 6. Detection (Passes the Supabase token to Flask)
  const handleDetect = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    setMetadata(null);
    
    const formData = new FormData();
    formData.append('image', selectedImage);
    
    try {
      // Get the freshest token directly from Supabase right before the request
      const { data: { session } } = await supabase.auth.getSession();
      const currentToken = session?.access_token;
      
      const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
      const response = await axios.post(`${API_URL}/detect`, formData, {
        headers: { 'Content-Type': 'multipart/form-data', ...headers }
      });
      
      setResult(response.data.result);
      
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

  // 7. Fetch History (Passes the Supabase token to Flask)
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      setHistoryLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const response = await axios.get(`${API_URL}/history`, {
          headers: { Authorization: `Bearer ${session?.access_token}` }
        });
        setHistory(response.data.history);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory(); 
  }, [user]);

  return (
    <Router>
      <div className="app-container">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-[#030712]/70 backdrop-blur-2xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="flex items-center gap-3 no-underline group">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-all">
                {/* Clean Status Indicator instead of a dot */}
                <div className={`w-2 h-2 rounded-full ${backendStatus.includes('Connected') ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'}`}></div>
              </div>
              <h1 className="text-white font-semibold tracking-tight text-lg">AI Image Detector</h1>
            </Link>
            
            <div className="flex items-center gap-6">
              {user ? (
                <>
                  <Link to="/history" className="text-sm font-medium text-gray-400 hover:text-white transition-colors no-underline">Archive</Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-rose-400/80 hover:text-rose-400 transition-colors">Sign Out</button>
                </>
              ) : (
                <Link to="/login" className="text-sm font-medium bg-white text-black px-5 py-2 rounded-full hover:bg-gray-200 transition-transform hover:scale-105 active:scale-95 no-underline">
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Routes */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={
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
            } />

            <Route path="/login" element={
              user ? <Navigate to="/" /> : (
                <AuthView 
                  currentView="login"
                  setCurrentView={() => {}} // Remove this state toggle logic from AuthView later if you want
                  handleLogin={handleLogin}
                  handleRegister={handleRegister}
                  email={email}
                  setEmail={setEmail}
                  password={password}
                  setPassword={setPassword}
                  authLoading={authLoading}
                  authError={authError}
                  setAuthError={setAuthError}
                  authSuccess={authSuccess}
                  setAuthSuccess={setAuthSuccess}
                />
              )
            } />

            <Route path="/history" element={
              !user ? <Navigate to="/login" /> : (
                <History 
                  history={history} 
                  setHistory={setHistory} 
                  historyLoading={historyLoading} 
                />
              )
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;