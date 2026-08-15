import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function HistoryView({ setSelectedPatientDetail, setCurrentView }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'}/history`);
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="view-container page-transition flex-center-col" style={{ alignItems: 'stretch' }}>
      <div className="panel-layer shadow-depth-1 form-constrained-wrapper" style={{ maxWidth: '1000px', width: '100%', margin: '0 auto' }}>
        <div className="panel-top-bar">
          <h2 className="font-heading panel-title">
            <span className="tiny-icon">📂</span> Patient History
          </h2>
          <span className="entry-status" style={{background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-purple)'}}>Current Archive</span>
        </div>

        {loading ? (
          <div className="flex-center py-4" style={{minHeight: '200px'}}>
            <span className="loader-dots"></span>
          </div>
        ) : history.length === 0 ? (
          <div className="flex-center-col py-4" style={{minHeight: '200px'}}>
            <p className="text-muted">No historical records found in database.</p>
          </div>
        ) : (
          <div className="history-list-container scroll-hidden" style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
            {history.map((record) => {
              const date = new Date(record.timestamp).toLocaleString();
              
              // Construct a simulated dashboard result object from the Mongo record
              const historicalResult = {
                prediction: record.prediction,
                risk_score: record.risk_score,
                risk_level: record.risk_level,
                bmi: record.bmi || 'N/A',
                bmi_category: 'From Archive',
                bp_status: record.bp_status,
                heart_rate_status: record.heart_rate_status,
                recommendation: "Please run a fresh analysis for new preventative lifestyle recommendations."
              };

              // Determine color class locally for styling
              const getRiskColor = (score) => {
                if (score < 40) return 'color-safe';
                if (score < 70) return 'color-warn';
                return 'color-danger';
              };

              return (
                <div key={record._id} 
                     className="history-card hover-lift-slight" 
                     onClick={() => {
                        setSelectedPatientDetail(historicalResult);
                        setCurrentView('patientDetail');
                     }}
                     style={{ 
                       cursor: 'pointer', 
                       background: 'var(--input-bg)', 
                       border: '1px solid var(--border-subtle)', 
                       borderRadius: '16px', 
                       padding: '20px', 
                       marginBottom: '16px', 
                       display: 'flex', 
                       justifyContent: 'space-between', 
                       alignItems: 'center',
                       transition: 'all 0.2s ease'
                     }}>
                  
                  <div style={{ flex: 1 }}>
                    <div className="font-heading text-strong" style={{fontSize: '1.25rem', marginBottom: '6px', letterSpacing: '-0.5px'}}>
                      Age {record.inputs?.age || '--'} • {record.inputs?.sex === 1 ? 'Male' : 'Female'}
                    </div>
                    <div className="text-muted text-sm">{date}</div>
                  </div>

                  <div style={{ padding: '0 24px', textAlign: 'center', borderRight: '1px solid var(--border-subtle)', borderLeft: '1px solid var(--border-subtle)' }}>
                    <div className="text-sm text-muted mb-1" style={{textTransform:'uppercase', fontSize: '0.75rem', letterSpacing: '1px'}}>Risk Index</div>
                    <div className={`font-heading ${getRiskColor(record.risk_score)}`} style={{fontSize: '1.6rem', fontWeight: 700}}>
                      {record.risk_score}%
                    </div>
                  </div>

                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div className="risk-level-tag" style={{ margin: 0, padding: '6px 12px', fontSize: '0.9rem' }}>
                      <span className={`dot ${getRiskColor(record.risk_score)}`}></span>
                      {record.risk_level}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
