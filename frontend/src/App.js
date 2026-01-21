import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('Connecting to backend...');
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    axios.get('http://127.0.0.1:5000/')
      .then(res => {
        setMessage(res.data.message);
        setStatus('success');
      })
      .catch(err => {
        setMessage('Backend connection failed');
        setStatus('error');
        console.error(err);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Image Detection System</h1>
        <p className={status}>Backend Status: {message}</p>
        {status === 'success' && <p>✅ System Ready</p>}
        {status === 'error' && <p>❌ Check if Flask is running</p>}
      </header>
    </div>
  );
}

export default App;