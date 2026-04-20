import React, { useState, useEffect } from 'react';
import { Toaster } from 'sonner';
import InputView from './components/InputView';
import DashboardView from './components/DashboardView';
import PatientDetailView from './components/PatientDetailView';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('new'); // 'new', 'dashboard', 'patientDetail'
  const [currentPatient, setCurrentPatient] = useState(null);
  const [selectedPatientDetail, setSelectedPatientDetail] = useState(null);
  const [theme, setTheme] = useState('dark');

  // Apply theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handlePatientSubmit = (resultData) => {
    setCurrentPatient(resultData);
    // Remain on the current page to allow the 2-step InputView flow to show results
  };

  return (
    <div className="app-canvas">
      <Toaster position="top-center" theme={theme} richColors />
      
      {/* Background ambient blobs for depth */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>

      <div className="app-container">
        <header className="app-header page-transition" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          
          {/* LEFT: Logo */}
          <div className="brand-logo">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
              <circle cx="18" cy="18" r="18" fill="#ef4444" fillOpacity="0.12"/>
              <path d="M18 27s-9-6.5-9-12a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 12-9 12z" fill="#ef4444"/>
              <polyline points="10,18 13.5,14 16.5,20 19.5,16 22,18 26,18" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div className="brand-text">
              <h1 className="font-heading">CardioInsight</h1>
            </div>
          </div>
          
          {/* RIGHT: Primary Navigation */}
          <div className="header-actions" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <nav className="header-nav" style={{ display: 'flex', gap: '8px' }}>
              <button 
                className={`nav-btn ${currentPage === 'new' ? 'active' : ''}`}
                onClick={() => setCurrentPage('new')}
              >
                New Check
              </button>
              <button 
                className={`nav-btn ${(currentPage === 'dashboard' || currentPage === 'patientDetail') ? 'active' : ''}`}
                onClick={() => setCurrentPage('dashboard')}
              >
                Dashboard
              </button>
            </nav>
            <button className="theme-toggle-btn ml-3" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
            </button>
          </div>
        </header>

        <main className="pt-4 page-transition">
          {currentPage === 'new' && <InputView onSubmit={handlePatientSubmit} onViewDetail={() => {
            setSelectedPatientDetail(currentPatient);
            setCurrentPage('patientDetail');
          }} />}
          
          {currentPage === 'dashboard' && <DashboardView currentPatient={currentPatient} onViewDetail={(patient) => {
            if (!patient) return;
            setSelectedPatientDetail(patient);
            setCurrentPage('patientDetail');
          }} />}
          
          {currentPage === 'patientDetail' && <PatientDetailView selectedPatientDetail={selectedPatientDetail} onBack={() => setCurrentPage('dashboard')} />}
        </main>
      </div>
    </div>
  );
}

export default App;
