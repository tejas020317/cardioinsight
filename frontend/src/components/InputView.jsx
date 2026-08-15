import React, { useState } from 'react';
import { toast } from 'sonner';
import DashboardView from './DashboardView';

export default function InputView({ onSubmit, onViewDetail }) {
  const [step, setStep] = useState('patientInfo');
  const [localResult, setLocalResult] = useState(null);
  
  const [patientInfo, setPatientInfo] = useState({
    name: '', age: '', gender: '', phone: '', address: ''
  });
  
  const [formData, setFormData] = useState({
    age: '', sex: '', cp: '', trestbps: '', chol: '', fbs: '',
    restecg: '', thalach: '', exang: '', oldpeak: '', slope: '',
    ca: '', thal: '', height: '', weight: '', heart_rate: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePatientInfoChange = (e) => {
    setPatientInfo({ ...patientInfo, [e.target.name]: e.target.value });
  };

  const processPatientInfo = (e) => {
    e.preventDefault();
    // Pre-hydrate medical form with collected age and sex fields securely
    setFormData(prev => ({
      ...prev,
      age: patientInfo.age,
      sex: patientInfo.gender
    }));
    setStep('medicalForm');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        ...patientInfo
      };

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Diagnostic server error');
      }

      const finalObject = {
        ...patientInfo,
        medicalData: formData,
        ...data
      };

      setTimeout(() => {
        toast.success("Analysis complete.");
        setLocalResult(finalObject);
        setStep('result');
        onSubmit(finalObject);
      }, 700); 

    } catch (err) {
      toast.error(`Analysis Failed: ${err.message}`);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('patientInfo');
    setLocalResult(null);
    setLoading(false);
    setPatientInfo({ name: '', age: '', gender: '', phone: '', address: '' });
    setLoading(false);
    setFormData({
      age: '', sex: '', cp: '', trestbps: '', chol: '', fbs: '',
      restecg: '', thalach: '', exang: '', oldpeak: '', slope: '',
      ca: '', thal: '', height: '', weight: '', heart_rate: ''
    });
  };

  if (step === 'result' && localResult) {
    return (
      <div className="view-container page-transition" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <DashboardView currentPatient={localResult} onViewDetail={onViewDetail} />
        
        <div className="mt-4" style={{ width: '100%', maxWidth: '800px', display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={handleReset} 
            className="action-btn" 
            style={{ 
              maxWidth: '300px', 
              background: 'transparent',
              border: '1px solid var(--border-highlight)',
              boxShadow: 'none'
            }}
          >
            ← Analyze New Patient
          </button>
        </div>
      </div>
    );
  }

  if (step === 'medicalForm') {
    return (
    <div className="view-container page-transition">
      <div className="panel-layer shadow-depth-1 form-constrained-wrapper">
        <div className="panel-top-bar">
          <h2 className="font-heading panel-title">
            <span className="tiny-icon">👤</span> Patient Vitals Input
          </h2>
          <span className="entry-status">Input Required</span>
        </div>

        <form onSubmit={handleSubmit} className="vitals-form">
          <div className="fieldset-wrapper">
            <div className="fieldset-label font-heading">Demographics</div>
            <div className="input-group-row">
              <div className="input-box width-flex-1">
                <label>Age <span className="label-sub">(yrs)</span></label>
                <input type="number" name="age" value={formData.age} onChange={handleChange} required />
              </div>
              <div className="input-box width-flex-1">
                <label>Sex</label>
                <select name="sex" value={formData.sex} onChange={handleChange} required>
                  <option value="">--</option>
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>
            </div>
          </div>

          <div className="fieldset-wrapper">
            <div className="fieldset-label font-heading">Cardiovascular</div>
            <div className="input-grid-uneven">
              <div className="input-box">
                <label className="tooltip" data-title="Chest Pain Type: Typical, Atypical, Non-anginal, or Asymptomatic">Chest Pain</label>
                <select name="cp" value={formData.cp} onChange={handleChange} required>
                  <option value="">Type (0-3)</option>
                  <option value="0">0 - Typical</option>
                  <option value="1">1 - Atypical</option>
                  <option value="2">2 - Non-anginal</option>
                  <option value="3">3 - Asymptomatic</option>
                </select>
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Resting Systolic Blood Pressure. Ideal is < 120.">BP <span className="label-sub">(Sys)</span></label>
                <input type="number" name="trestbps" value={formData.trestbps} onChange={handleChange} required />
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Serum Cholesterol in mg/dl. Ideal is < 200.">Cholesterol</label>
                <input type="number" name="chol" value={formData.chol} onChange={handleChange} required />
              </div>
              <div className="input-box width-span-2">
                <label className="tooltip" data-title="Thalach: Maximum heart rate achieved during exercise.">Max Heart Rate <span className="label-sub">(bpm)</span></label>
                <input type="number" name="thalach" value={formData.thalach} onChange={handleChange} required />
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Fasting Blood Sugar > 120 mg/dl is a diabetic indicator.">Fasting Sugar</label>
                <select name="fbs" value={formData.fbs} onChange={handleChange} required>
                  <option value="">&gt;120mg</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Resting Electrocardiographic results (0: Normal, 1: ST-T abn, 2: LVH)">Resting ECG</label>
                <select name="restecg" value={formData.restecg} onChange={handleChange} required>
                  <option value="">(0-2)</option>
                  <option value="0">Normal</option>
                  <option value="1">ST-T Abn</option>
                  <option value="2">LVH</option>
                </select>
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Exercise-induced angina (chest pain upon exertion).">Angina</label>
                <select name="exang" value={formData.exang} onChange={handleChange} required>
                  <option value="">Exercise</option>
                  <option value="1">Yes</option>
                  <option value="0">No</option>
                </select>
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Oldpeak: ST depression induced by exercise relative to rest.">ST Depr.</label>
                <input type="number" step="0.1" name="oldpeak" value={formData.oldpeak} onChange={handleChange} required />
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="The slope of the peak exercise ST segment.">Slope</label>
                <select name="slope" value={formData.slope} onChange={handleChange} required>
                  <option value="">(0-2)</option>
                  <option value="0">Up</option>
                  <option value="1">Flat</option>
                  <option value="2">Down</option>
                </select>
              </div>
              <div className="input-box">
                <label className="tooltip" data-title="Number of major vessels (0-3) colored by fluoroscopy.">Vessels</label>
                <select name="ca" value={formData.ca} onChange={handleChange} required>
                  <option value="">(0-3)</option>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="input-box width-span-2">
                <label className="tooltip" data-title="Thalassemia: A genetic blood disorder impacting hemoglobin.">Thalassemia</label>
                <select name="thal" value={formData.thal} onChange={handleChange} required>
                  <option value="">Type (0-2)</option>
                  <option value="0">Normal</option>
                  <option value="1">Fixed</option>
                  <option value="2">Reversible</option>
                </select>
              </div>
            </div>
          </div>

          <div className="fieldset-wrapper">
            <div className="fieldset-label font-heading">Biometrics</div>
            <div className="input-grid-3">
              <div className="input-box">
                <label>Height <span className="label-sub">(cm)</span></label>
                <input type="number" name="height" value={formData.height} onChange={handleChange} required />
              </div>
              <div className="input-box">
                <label>Weight <span className="label-sub">(kg)</span></label>
                <input type="number" name="weight" value={formData.weight} onChange={handleChange} required />
              </div>
              <div className="input-box">
                <label>Resting HR</label>
                <input type="number" name="heart_rate" value={formData.heart_rate} onChange={handleChange} required />
              </div>
            </div>
          </div>

          <div className="form-action-row pt-3" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="action-btn" 
              onClick={() => setStep('patientInfo')}
              disabled={loading}
              style={{ background: 'transparent', border: '1px solid var(--border-highlight)', boxShadow: 'none' }}
            >
              ← Back
            </button>
            <button type="submit" className="action-btn font-heading glow-hover" disabled={loading}>
              {loading ? (
                <span className="flex-center">
                  <span className="loader-dots"></span> Processing
                </span>
              ) : (
                <>Analyze Patient <span className="btn-arrow">→</span></>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    );
  }

  // STEP 1: PATIENT REGISTRATION FORM
  return (
    <div className="view-container page-transition">
      <div className="panel-layer shadow-depth-1 form-constrained-wrapper" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Colored header stripe */}
        <div style={{
          background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
          padding: '28px 36px 24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* subtle circle decoration */}
          <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'120px', height:'120px', borderRadius:'50%', background:'rgba(255,255,255,0.08)' }} />
          <div style={{ position:'absolute', bottom:'-20px', right:'60px', width:'80px', height:'80px', borderRadius:'50%', background:'rgba(255,255,255,0.05)' }} />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', position:'relative', zIndex:2 }}>
            <div>
              <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'2px', color:'rgba(255,255,255,0.7)', marginBottom:'6px', fontWeight:600 }}>Step 1 of 2</div>
              <h2 className="font-heading" style={{ fontSize:'1.6rem', color:'#fff', margin:0 }}>Patient Registration</h2>
              <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.88rem', marginTop:'6px', margin:'6px 0 0' }}>Enter basic patient details to begin the cardiac analysis</p>
            </div>
            <div style={{ background:'rgba(255,255,255,0.15)', borderRadius:'8px', padding:'6px 14px', fontSize:'0.75rem', color:'#fff', fontWeight:600, letterSpacing:'1px', textTransform:'uppercase', backdropFilter:'blur(4px)' }}>
              Intake Required
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ marginTop:'20px', background:'rgba(255,255,255,0.2)', borderRadius:'4px', height:'4px', position:'relative', zIndex:2 }}>
            <div style={{ width:'50%', background:'#fff', borderRadius:'4px', height:'100%', transition:'width 0.4s ease' }} />
          </div>
        </div>

        {/* Form body */}
        <form onSubmit={processPatientInfo} style={{ padding: '32px 36px 28px' }}>

          <div style={{ marginBottom:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
            <div style={{ fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'1.5px', color:'var(--text-muted)', fontWeight:600, marginBottom:'16px' }}>Personal Details</div>

            {/* Full Name */}
            <div className="input-box">
              <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', fontWeight:600, color:'var(--text-dark)', marginBottom:'6px' }}>
                <span>👤</span> Full Legal Name
              </label>
              <input
                type="text" name="name"
                value={patientInfo.name}
                onChange={handlePatientInfoChange}
                required
                placeholder="e.g. Tejas Tambe"
                style={{ padding:'12px 16px', borderRadius:'10px', fontSize:'0.93rem' }}
              />
            </div>

            {/* Age + Gender in a row */}
            <div className="input-group-row">
              <div className="input-box width-flex-1">
                <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', fontWeight:600, color:'var(--text-dark)', marginBottom:'6px' }}>
                  <span>🎂</span> Age <span className="label-sub">(yrs)</span>
                </label>
                <input
                  type="number" name="age"
                  value={patientInfo.age}
                  onChange={handlePatientInfoChange}
                  required min="1" max="120"
                  placeholder="e.g. 20"
                  style={{ padding:'12px 16px', borderRadius:'10px', fontSize:'0.93rem' }}
                />
              </div>
              <div className="input-box width-flex-1">
                <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', fontWeight:600, color:'var(--text-dark)', marginBottom:'6px' }}>
                  <span>⚧</span> Assigned Gender
                </label>
                <select
                  name="gender"
                  value={patientInfo.gender}
                  onChange={handlePatientInfoChange}
                  required
                  style={{ padding:'12px 16px', borderRadius:'10px', fontSize:'0.93rem' }}
                >
                  <option value="">Select…</option>
                  <option value="1">Male</option>
                  <option value="0">Female</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div className="input-box">
              <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', fontWeight:600, color:'var(--text-dark)', marginBottom:'6px' }}>
                <span>📞</span> Contact Number
              </label>
              <input
                type="tel" name="phone"
                value={patientInfo.phone}
                onChange={handlePatientInfoChange}
                required
                placeholder="e.g. +91 86258 33379"
                style={{ padding:'12px 16px', borderRadius:'10px', fontSize:'0.93rem' }}
              />
            </div>

            {/* Address */}
            <div className="input-box">
              <label style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'0.82rem', fontWeight:600, color:'var(--text-dark)', marginBottom:'6px' }}>
                <span>📍</span> Residential Address
              </label>
              <input
                type="text" name="address"
                value={patientInfo.address}
                onChange={handlePatientInfoChange}
                required
                placeholder="e.g. Bharti Vihar Society, Dhankawadi, Pune"
                style={{ padding:'12px 16px', borderRadius:'10px', fontSize:'0.93rem' }}
              />
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop:'1px solid var(--border-subtle)', margin:'4px 0 24px' }} />

          {/* Submit */}
          <button
            type="submit"
            className="font-heading"
            style={{
              width:'100%', padding:'15px 24px',
              background:'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
              color:'#fff', border:'none', borderRadius:'12px',
              fontSize:'1rem', fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
              boxShadow:'0 4px 20px rgba(239,68,68,0.35)',
              transition:'all 0.25s ease'
            }}
            onMouseOver={e => e.currentTarget.style.transform='translateY(-2px)'}
            onMouseOut={e => e.currentTarget.style.transform='translateY(0)'}
          >
            Continue to Clinical Data
            <span style={{ fontSize:'1.1rem' }}>→</span>
          </button>

          <p style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'14px' }}>
            All data is encrypted and used solely for diagnostic purposes.
          </p>
        </form>
      </div>
    </div>
  );
}
