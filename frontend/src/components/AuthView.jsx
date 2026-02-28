import React from 'react';

function AuthView({
  currentView,
  setCurrentView,
  handleLogin,
  handleRegister,
  email,
  setEmail,
  password,
  setPassword,
  authLoading,
  authError
}) {
  const isLogin = currentView === 'login';

  return (
    <div className="auth-view fade-in">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="subtitle">
            {isLogin 
              ? 'Enter your credentials to access your history.' 
              : 'Sign up to track and manage your AI detections.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={isLogin ? handleLogin : handleRegister}>
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input"
            />
          </div>

          {authError && (
            <div className="error-banner small">
              <span className="error-icon">⚠️</span>
              <p>{authError}</p>
            </div>
          )}

          <button 
            type="submit" 
            className={`action-btn ${authLoading ? 'loading' : ''}`}
            disabled={authLoading}
          >
            {authLoading 
              ? (isLogin ? 'Signing In...' : 'Creating Account...') 
              : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span 
              className="toggle-link" 
              onClick={() => setCurrentView(isLogin ? 'register' : 'login')}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthView;