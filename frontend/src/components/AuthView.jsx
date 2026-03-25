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
  authError,
  setAuthError,
  authSuccess,
  setAuthSuccess
}) {
  const isLogin = currentView === 'login';

  // ==================== SUCCESS SCREEN ====================
  if (authSuccess && !isLogin) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] fade-in">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center slide-up">
          <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
            {/* Clean Mail SVG */}
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-3 text-white">Check your inbox</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">
            We've sent a secure verification link to <span className="text-gray-200 font-medium">{email}</span>. 
            Please verify your email to access your dashboard.
          </p>
          <button 
            onClick={() => {
              setAuthSuccess(false);
              setCurrentView('login');
            }}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-3 rounded-xl transition-all"
          >
            Return to Sign In
          </button>
        </div>
      </div>
    );
  }

  // ==================== FORM SCREEN ====================
  return (
    <div className="flex items-center justify-center min-h-[70vh] fade-in">
      <div className="bg-[#0f1115] border border-white/5 shadow-2xl rounded-2xl p-8 max-w-md w-full">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2 text-white">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin 
              ? 'Enter your details to access your analysis history.' 
              : 'Sign up to track and manage your AI detections.'}
          </p>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="name@company.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-300" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Clean Error State */}
          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
              <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-sm text-red-400 leading-tight">{authError}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={authLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center h-12 mt-4"
          >
            {authLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-400">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button"
            onClick={() => {
              setAuthError(null);
              setEmail('');
              setPassword('');
              setCurrentView(isLogin ? 'register' : 'login');
            }}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors focus:outline-none"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default AuthView;