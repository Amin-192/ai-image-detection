import React from 'react';

function HistoryView({ history, historyLoading }) {
  if (historyLoading) {
    return (
      <div className="history-view center-content fade-in">
        <div className="spinner"></div>
        <p className="loading-text">Loading your detection history...</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="history-view center-content fade-in">
        <div className="empty-state-icon">📭</div>
        <h2>No detections yet</h2>
        <p className="subtitle">Upload and analyze an image on the home screen to see your history here.</p>
      </div>
    );
  }

  return (
    <div className="history-view fade-in">
      <div className="view-header">
        <h2>Detection History</h2>
        <p className="subtitle">Review your past AI image analyses.</p>
      </div>

      <div className="history-grid">
        {history.map((item) => {
          // Format date and time nicely
          const dateObj = new Date(item.created_at);
          const formattedDate = dateObj.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
          const formattedTime = dateObj.toLocaleTimeString(undefined, {
            hour: '2-digit',
            minute: '2-digit'
          });
          
          const isReal = item.classification === 'Real';

          return (
            <div key={item.detection_id} className={`history-card ${isReal ? 'glow-real' : 'glow-fake'}`}>
              <div className="card-top">
                <span className={`badge ${isReal ? 'badge-real' : 'badge-fake'}`}>
                  {item.classification}
                </span>
                <span className="timestamp">{formattedDate} • {formattedTime}</span>
              </div>
              
              <div className="card-bottom">
                <div className="score-row">
                  <span className="score-label">Confidence</span>
                  <span className="score-value">{(item.confidence_score * 100).toFixed(1)}%</span>
                </div>
                
                <div className="confidence-track mini">
                  <div 
                    className="confidence-fill"
                    style={{ 
                      width: `${item.confidence_score * 100}%`,
                      backgroundColor: isReal ? '#10b981' : '#ef4444' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default HistoryView;