import React from 'react';

export default function PatientDetailView({ selectedPatientDetail, onBack }) {
  if (!selectedPatientDetail) {
    return (
      <div className="view-container page-transition flex-center-col">
        <div className="placeholder-card panel-layer">
          <p>No patient record found.</p>
          <button onClick={onBack} className="action-btn mt-3" style={{width: '200px'}}>Return</button>
        </div>
      </div>
    );
  }

  const inputs = selectedPatientDetail.medicalData || selectedPatientDetail.inputs || {};
  const patientName = selectedPatientDetail.name || "Unknown Patient";
  const patientPhone = selectedPatientDetail.phone || "--";
  const patientAddress = selectedPatientDetail.address || "--";

  const mapSex = (val) => val === 1 ? "Male" : val === 0 ? "Female" : "--";
  const mapCP = (val) => {
    switch(val) {
      case 0: return "Typical Angina";
      case 1: return "Atypical Angina";
      case 2: return "Non-anginal Pain";
      case 3: return "Asymptomatic";
      default: return "--";
    }
  };
  const mapECG = (val) => {
    switch(val) {
      case 0: return "Normal";
      case 1: return "ST-T wave abnormality";
      case 2: return "LV Hypertrophy";
      default: return "--";
    }
  };

  return (
    <div className="view-container page-transition">
      <div className="panel-layer shadow-depth-1 form-constrained-wrapper" style={{ padding: '0', overflow: 'hidden' }}>
        
        {/* REPORT HEADER */}
        <div style={{ background: 'var(--surface-layer2)', padding: '2rem 3rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span className="entry-status">Official Record</span>
            <h2 className="font-heading" style={{ fontSize: '1.8rem', marginTop: '0.5rem', color: 'var(--text-strong)'}}>
              {patientName}
            </h2>
            <div className="text-muted text-sm mt-1">Contact: {patientPhone} | Address: {patientAddress}</div>
          </div>
          <button onClick={onBack} className="theme-toggle-btn">
            ← Back to Dashboard
          </button>
        </div>

        <div style={{ padding: '3rem' }}>
          
          {/* SECTION 1: Basic Info */}
          <div className="report-section mb-4">
            <h4 className="font-heading mb-2 text-muted" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="tiny-icon">👤</span> Demographics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0' }}>
              <div><strong>Age:</strong> <span className="text-muted">{selectedPatientDetail.age || inputs.age || '--'} yrs</span></div>
              <div><strong>Sex:</strong> <span className="text-muted">{selectedPatientDetail.gender !== undefined ? (selectedPatientDetail.gender == "1" ? "Male" : "Female") : mapSex(inputs.sex)}</span></div>
            </div>
          </div>

          {/* SECTION 2: Cardiac Data */}
          <div className="report-section mb-4">
            <h4 className="font-heading mb-2 text-muted" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="tiny-icon">🫀</span> Cardiac Telemetry
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0' }}>
              <div><strong>Chest Pain:</strong> <span className="text-muted">{mapCP(inputs.cp)}</span></div>
              <div><strong>Sys Blood Pressure:</strong> <span className="text-muted">{inputs.trestbps || '--'} mmHg</span></div>
              <div><strong>Serum Cholestrol:</strong> <span className="text-muted">{inputs.chol || '--'} mg/dl</span></div>
              <div><strong>Resting ECG:</strong> <span className="text-muted">{mapECG(inputs.restecg)}</span></div>
              <div><strong>Max Heart Rate:</strong> <span className="text-muted">{inputs.thalach || '--'} bpm</span></div>
            </div>
          </div>

          {/* SECTION 3: Health Metrics */}
          <div className="report-section mb-4">
            <h4 className="font-heading mb-2 text-muted" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="tiny-icon">⚖️</span> Biometric Diagnostics
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem 0' }}>
              <div><strong>Body Mass Index:</strong> <span className="text-muted">{selectedPatientDetail.bmi} ({selectedPatientDetail.bmi_category})</span></div>
              <div><strong>Blood Pressure Status:</strong> <span className="text-muted">{selectedPatientDetail.bp_status}</span></div>
              <div><strong>Heart Rate Status:</strong> <span className="text-muted">{selectedPatientDetail.heart_rate_status}</span></div>
            </div>
          </div>

          {/* SECTION 4: Prediction */}
          <div className="report-section mb-4">
            <h4 className="font-heading mb-2 text-muted" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="tiny-icon">🧬</span> Model Assessment
            </h4>
            <div style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '1.1rem' }}><strong>Disease Diagnostic:</strong> <span className={selectedPatientDetail.prediction === 'Yes' ? 'color-danger' : 'color-safe'} style={{fontWeight: 600}}>{selectedPatientDetail.prediction === 'Yes' ? 'Positive Detection' : 'Negative'}</span></div>
              </div>
              <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
                <div><strong>Calculated Risk Score:</strong> <span className="text-strong" style={{fontSize: '1.4rem', marginLeft: '8px'}}>{selectedPatientDetail.risk_score}%</span></div>
                <div><strong>Risk Strata:</strong> <span className="risk-level-tag" style={{marginLeft: '8px', padding: '4px 10px', fontSize: '0.85rem'}}>{selectedPatientDetail.risk_level}</span></div>
              </div>
            </div>
          </div>

          {/* SECTION 5: Recommendation */}
          <div className="report-section">
            <h4 className="font-heading mb-2 text-muted" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem' }}>
              <span className="tiny-icon">📝</span> Clinical Strategy
            </h4>
            <div style={{ padding: '1rem 0', lineHeight: 1.7, color: 'var(--text-strong)' }}>
              {selectedPatientDetail.recommendation}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
