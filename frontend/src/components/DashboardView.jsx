import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid, Label } from 'recharts';
import Heart3D from '../Heart3D';

function useCountUp(endValue, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let startTime = null;
    let animationFrame;

    const tick = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const fraction = Math.min(progress / duration, 1);
      const ease = fraction === 1 ? 1 : 1 - Math.pow(2, -10 * fraction);
      
      setValue(Math.max(0, Math.min(endValue, Math.round(endValue * ease))));
      
      if (progress < duration) {
        animationFrame = requestAnimationFrame(tick);
      }
    };

    if (endValue > 0) {
      animationFrame = requestAnimationFrame(tick);
    } else {
      setValue(0);
    }
    
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);

  return value;
}

const ProgressRing = ({ radius, stroke, progress, riskColor }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)', zIndex: 1, pointerEvents: 'none' }}>
      {/* Track circle */}
      <circle
        stroke="rgba(255,255,255,0.08)"
        fill="transparent"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      {/* Progress circle */}
      <circle
        stroke={riskColor}
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={circumference + ' ' + circumference}
        style={{ strokeDashoffset, transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)', strokeLinecap: 'round', filter: `drop-shadow(0 0 6px ${riskColor})` }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};

const RiskCard = ({ result, onViewDetail }) => {
  const animatedScore = useCountUp(result.risk_score, 1200);
  
  const isHigh = result.risk_score >= 70;
  const isMedium = result.risk_score >= 40 && result.risk_score < 70;

  let riskColor = '#22c55e'; // green default (low)
  let icon = '✔';
  
  if (isHigh) {
    riskColor = '#ef4444';
    icon = '⚠';
  } else if (isMedium) {
    riskColor = '#f59e0b';
    icon = '⚠';
  }

  return (
    <div className={`risk-card insights-view panel-layer shadow-depth-2 hover-lift page-transition`} style={{ padding: '2.5rem', background: `var(--bg-card)`, position: 'relative', overflow: 'hidden' }}>
      
      {/* Hidden SVG gradients no longer needed — using solid riskColor */}

      <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: riskColor, opacity: 0.05, filter: 'blur(80px)', borderRadius: '50%', zIndex: 0 }} />

      <div className="showcase-header" style={{ position: 'relative', zIndex: 2 }}>
        <span className="micro-label">FOCAL PATIENT OUTCOME</span>
        <h3 className="font-heading showcase-title">Calculated Risk Index</h3>
      </div>
      
      <div className="risk-display-flex" style={{ gap: '3rem', alignItems: 'center', marginTop: '1rem', position: 'relative', zIndex: 2 }}>
        {/* Circle ring */}
        <div style={{ position: 'relative', width: '160px', height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div className="circle-bg" style={{
            position: 'absolute', width: '120px', height: '120px',
            borderRadius: '50%',
            background: 'var(--bg-soft)',
            boxShadow: `0 0 20px ${riskColor}18`,
            zIndex: 1
          }} />
          <ProgressRing radius={80} stroke={8} progress={animatedScore} riskColor={riskColor} />
          <div className="circle-text" style={{ zIndex: 2, display: 'flex', alignItems: 'baseline', justifyContent: 'center' }}>
            <span className="font-heading" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-strong)', lineHeight: 1 }}>
              {animatedScore}
            </span>
            <span style={{ fontSize: '16px', opacity: 0.6, color: 'var(--text-strong)', marginLeft: '2px' }}>%</span>
          </div>
        </div>

        <div className="risk-context">
          <div className="risk-level-tag hover-lift-slight" style={{ 
            margin: 0, marginBottom: '12px', 
            background: `${riskColor}18`,
            border: `1px solid ${riskColor}55`,
            color: riskColor,
            fontWeight: 700
          }}>
            <span style={{ marginRight: '6px' }}>{icon}</span> 
            {result.risk_level}
          </div>
          <div className="ai-diagnosis" style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Diagnosis: <strong style={{ color: 'var(--text-strong)' }}>{result.prediction === 'Yes' ? 'Elevated Cardiac Warning' : 'Negative'}</strong>
          </div>
        </div>
      </div>

      <div className="sub-metrics-uneven mt-4" style={{ gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: '1rem', position: 'relative', zIndex: 2 }}>
        <div className="sub-card hover-lift-slight" style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div className="sub-header">BMI</div>
          <div className="sub-value font-heading mt-1" style={{ fontSize: '1.4rem' }}>{result.bmi}</div>
          <div className="sub-status text-sm mt-1">{result.bmi_category}</div>
        </div>
        <div className="sub-card hover-lift-slight" style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div className="sub-header">Sys. BP</div>
          <div className="sub-value font-heading mt-1" style={{ fontSize: '1.4rem' }}>{result.bp_status}</div>
        </div>
        <div className="sub-card hover-lift-slight" style={{ padding: '1rem', background: 'var(--bg-soft)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div className="sub-header">Heart Rate</div>
          <div className="sub-value font-heading mt-1" style={{ fontSize: '1.4rem' }}>{result.heart_rate_status}</div>
        </div>
      </div>
      
      <div className="mt-4 flex-center" style={{ position: 'relative', zIndex: 2 }}>
        <button 
          className="theme-toggle-btn hover-lift" 
          onClick={() => {
            if (!result) { toast.error('No patient selected'); return; }
            onViewDetail(result);
          }} 
          style={{ width: '100%', padding: '14px', background: riskColor, color: '#fff', border: 'none', fontWeight: 600, fontSize: '0.95rem', borderRadius: '12px', cursor: 'pointer' }}
        >
          📋 View Full Clinical Report →
        </button>
      </div>
    </div>
  );
};

export default function DashboardView({ currentPatient, onViewDetail }) {
  const [cohortData, setCohortData] = useState([]);
  const [focusPatient, setFocusPatient] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hoveredId, setHoveredId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Fetch the aggregate history data on component mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'}/history`);
        if (!response.ok) throw new Error('Failed to fetch historical cohort data');
        const data = await response.json();
        setCohortData(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handlePatientClick = (patient) => {
    setFocusPatient(patient);
    setConfirmDeleteId(null); // reset delete state when switching
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setConfirmDeleteId(id);
  };

  const handleCancelDelete = (e) => {
    e.stopPropagation();
    setConfirmDeleteId(null);
  };

  const handleConfirmDelete = async (e, id) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000'}/patients/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete");
      
      setCohortData(prev => prev.filter(p => p._id !== id));
      if (focusPatient && focusPatient._id === id) {
        setFocusPatient(null);
      }
      setConfirmDeleteId(null);
      toast.success("Record deleted");
    } catch (err) {
      toast.error(err.message);
    }
  };


  const filteredHistory = cohortData.filter(p => {
    const q = searchQuery.toLowerCase();
    const pName = (p.name || `Patient #${String(p._id).substring(0, 4)}`).toLowerCase();
    const pPhone = (p.phone || "").toLowerCase();
    return pName.includes(q) || pPhone.includes(q);
  });

  // Recharts Data Aggregation
  const riskCounts = { 'Low Risk': 0, 'Medium Risk': 0, 'High Risk': 0 };
  cohortData.forEach(p => {
    if (riskCounts[p.risk_level] !== undefined) riskCounts[p.risk_level]++;
  });
  const pieData = Object.keys(riskCounts).map(k => ({ name: k, value: riskCounts[k] }));
  const PIE_COLORS = { 'Low Risk': '#34d399', 'Medium Risk': '#fbbf24', 'High Risk': '#f87171' };

  const ageRiskData = [...cohortData]
    .filter(p => (p.inputs && p.inputs.age) || p.age || (p.medicalData && p.medicalData.age))
    .map((p, index) => ({
      id: p._id || index,
      age: p.age || (p.inputs && p.inputs.age) || (p.medicalData && p.medicalData.age),
      risk: p.risk_score
    }))
    .sort((a,b) => a.age - b.age);

  const bpCounts = {};
  cohortData.forEach(p => {
    const st = p.bp_status || 'Unknown';
    bpCounts[st] = (bpCounts[st] || 0) + 1;
  });
  const bpData = Object.keys(bpCounts).map(k => ({ name: k, value: bpCounts[k] }));

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total = cohortData.length;
      const percent = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div style={{ background: 'var(--bg-main)', padding: '10px 14px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
          <p className="font-heading" style={{ color: PIE_COLORS[data.name], margin: '0 0 4px 0', fontSize: '0.9rem' }}>{data.name}</p>
          <div className="text-sm text-muted">Count: <strong className="text-strong" style={{color: '#fff'}}>{data.value}</strong></div>
          <div className="text-sm text-muted">Share: <strong className="text-strong" style={{color: '#fff'}}>{percent}%</strong></div>
        </div>
      );
    }
    return null;
  };

  const result = focusPatient;

  return (
    <div className="page-transition" style={{ display: 'flex', height: 'calc(100vh - 100px)', maxWidth: '1600px', margin: '0 auto', gap: '2rem' }}>
      
      {/* LEFT SIDEBAR: PATIENT NAVIGATION */}
      <div className="panel-layer shadow-depth-1" style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--surface-layer2)' }}>
          <h2 className="font-heading" style={{ fontSize: '1.2rem', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <span>Patients</span>
            <span className="text-muted" style={{ fontSize: '0.9rem' }}>{filteredHistory.length}</span>
          </h2>
          <input 
            type="text" 
            placeholder="Search name or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', padding: '10px 14px', background: 'var(--input-bg)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-strong)', outline: 'none' }}
          />
        </div>

        <div className="history-list-container scroll-hidden" style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {historyLoading ? (
            <div className="flex-center py-4"><span className="loader-dots"></span></div>
          ) : filteredHistory.length === 0 ? (
            <p className="text-muted text-sm text-center mt-4">No patients found.</p>
          ) : (
            filteredHistory.map((record) => {
              // Extract logic
              const pName = record.name || `Patient #${String(record._id).substring(0, 4)}`;
              const pRisk = record.risk_score;
              const isActive = focusPatient && focusPatient._id === record._id;
              
              // Status dot mapping
              let dotColor = 'var(--color-safe-base)';
              if (pRisk >= 40) dotColor = 'var(--color-warn-base)';
              if (pRisk >= 70) dotColor = 'var(--color-danger-base)';

              return (
                <div 
                  key={record._id} 
                  onClick={() => handlePatientClick(record)}
                  onMouseEnter={() => setHoveredId(record._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ 
                    cursor: 'pointer', 
                    background: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent', 
                    border: `1px solid ${isActive ? 'var(--border-highlight)' : 'transparent'}`, 
                    borderRadius: '8px', 
                    padding: '12px 14px', 
                    marginBottom: '4px', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: !isActive ? '1px solid var(--border-subtle)' : undefined,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: dotColor }}></span>
                    <div>
                      <div className="font-heading text-strong" style={{fontSize: '0.95rem', color: isActive ? 'var(--text-strong)' : 'inherit'}}>
                        {pName}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {confirmDeleteId === record._id ? (
                      <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
                        <button onClick={(e) => handleConfirmDelete(e, record._id)} style={{ background: 'var(--color-danger-base)', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>✔</button>
                        <button onClick={handleCancelDelete} style={{ background: 'var(--surface-layer2)', border: '1px solid var(--border-subtle)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', color: 'var(--text-strong)' }}>✖</button>
                      </div>
                    ) : (
                      hoveredId === record._id || isActive ? (
                        <button 
                          onClick={(e) => handleDeleteClick(e, record._id)}
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.6, fontSize: '1rem', padding: '4px' }}
                          title="Delete Patient"
                          className="hover-opacity-1"
                        >
                          🗑️
                        </button>
                      ) : null
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', overflowY: 'auto', paddingRight: '8px' }}>
        
        {/* PATIENT PROFILE HEADER */}
        {result && (
          <div className="panel-layer shadow-depth-1" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '24px', borderLeft: '4px solid #1f2937' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
              👤
            </div>
            <div style={{ flex: 1 }}>
              <div className="micro-label" style={{ marginBottom: '4px' }}>PRIMARY PATIENT FILE</div>
              <h2 className="font-heading" style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-strong)' }}>
                {result.name || "Unknown Patient"}
              </h2>
              <div className="text-muted text-sm mt-2" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <span><strong className="text-strong">Age:</strong> {result.age || result.inputs?.age || result.medicalData?.age || '--'} yrs</span>
                <span><strong className="text-strong">Gender:</strong> {result.gender === "1" || result.gender === 1 ? "Male" : result.gender === "0" || result.gender === 0 ? "Female" : "--"}</span>
                <span><strong className="text-strong">Phone:</strong> {result.phone || "--"}</span>
                <span><strong className="text-strong">Address:</strong> {result.address || "--"}</span>
              </div>
            </div>
          </div>
        )}

        {/* METRICS & 3D SPLIT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* SECTION 1 (TOP) */}
          <div className="dashboard-top page-transition" style={{ display: 'flex', gap: '2rem', alignItems: 'stretch' }}>
            {/* CHARTS OR EMPTY STATE */}
            <div key={result ? result._id : 'charts'} style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
            {!result ? (
              <div className="panel-layer shadow-depth-1 flex-center-col" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <div style={{ fontSize: '4rem', opacity: 0.1, color: '#f9fafb', marginBottom: '20px' }}>♡</div>
                <h3 className="font-heading" style={{ color: '#f9fafb', fontSize: '1.4rem', marginBottom: '8px' }}>No patient selected</h3>
                <p className="text-muted text-center" style={{ fontSize: '0.95rem' }}>Select a patient from the sidebar or run a new check.</p>
              </div>
            ) : (
              <div className="charts-section panel-layer shadow-depth-1 hover-lift-slight" style={{ padding: '20px', height: '100%' }}>
              <h3 className="font-heading text-muted" style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '10px', marginBottom: '20px' }}>
                📊 Clinical Analytics
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '16px' }}>
                  <div className="text-sm font-heading mb-2 text-center text-muted">Cohort Risk</div>
                  <div style={{ height: '160px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <RechartsTooltip content={<PieTooltip />} />
                        <Pie 
                          data={pieData} 
                          cx="50%" cy="50%" 
                          innerRadius={55} 
                          outerRadius={75} 
                          paddingAngle={2} 
                          dataKey="value"
                          isAnimationActive={true}
                        >
                          <Label value={cohortData.length} position="center" fill="var(--text-strong)" style={{fontSize: '22px', fontWeight: 'bold'}} dy={-5} />
                          <Label value="Total Patients" position="center" fill="var(--text-muted)" style={{fontSize: '10px'}} dy={15} />
                          {pieData.map((entry, index) => {
                            const isFocusTarget = result && result.risk_level === entry.name;
                            return (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={PIE_COLORS[entry.name]} 
                                stroke="#ffffff" 
                                strokeWidth={isFocusTarget ? 3 : 1} 
                              />
                            );
                          })}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ background: 'var(--input-bg)', borderRadius: '12px', padding: '16px' }}>
                  <div className="text-sm font-heading mb-2 text-center text-muted">BP Freq</div>
                  <div style={{ height: '160px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bpData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="name" axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <YAxis axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]} activeBar={{ fill: '#fca5a5' }}>
                          {bpData.map((entry, index) => {
                            const isFocusTarget = result && result.bp_status === entry.name;
                            return <Cell key={`cell-${index}`} fill={isFocusTarget ? '#eab308' : 'url(#barGrad)'} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AGE VS RISK CHART */}
                <div style={{ gridColumn: '1 / -1', background: 'var(--input-bg)', borderRadius: '12px', padding: '16px' }}>
                  <div className="text-sm font-heading mb-2 text-center text-muted">Age vs Predicted Risk Index</div>
                  <div style={{ height: '160px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageRiskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGradAge" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" />
                            <stop offset="100%" stopColor="#7f1d1d" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="age" axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <YAxis axisLine={{ stroke: 'rgba(255,255,255,0.2)' }} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
                        <RechartsTooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: 'var(--bg-main)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', color: '#fff' }} />
                        <Bar dataKey="risk" radius={[8, 8, 0, 0]} activeBar={{ fill: '#fca5a5' }}>
                          {ageRiskData.map((entry, index) => {
                            const isFocusTarget = result && result._id && result._id === entry.id;
                            return <Cell key={`cell-${index}`} fill={isFocusTarget ? '#eab308' : 'url(#barGradAge)'} />;
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>
          
          {/* 3D HEART (Fixed 300px Right Column) */}
          <div className="heart-section panel-layer shadow-depth-1 right-column" style={{ width: '300px', flexShrink: 0, padding: '20px' }}>
            <div className="heart-container">
              <Heart3D focusPatient={focusPatient} />
            </div>
            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
              <div className="text-sm font-heading text-muted text-center mb-3">Live Organ Visualization</div>
              <div style={{ background: 'var(--bg-main)', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-xs text-muted" style={{opacity: 0.8}}>Sync Status:</span>
                <span className={`text-xs font-heading`} style={{ color: result ? '#34d399' : '#9ca3af' }}>
                  {result ? 'Active Streaming' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
          </div>

          {/* SECTION 2 (BOTTOM) */}
          {result && (
            <div className="dashboard-bottom page-transition">
              <RiskCard result={result} onViewDetail={onViewDetail} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
