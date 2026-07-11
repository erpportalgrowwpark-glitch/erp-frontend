// frontend/src/pages/EmployeeDashboard.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);

  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#ffffff');

  const [isTappedIn, setIsTappedIn] = useState(false);
  const [metrics, setMetrics] = useState({ today: '0h 0m', week: '0h 0m', month: '0h 0m', logs: [], chartData: [] });

  // Chart Toggle State
  const [chartView, setChartView] = useState('weekly');

  const videoRef = useRef(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  // State to hold the pre-calculated face data
  const [referenceDescriptors, setReferenceDescriptors] = useState([]);
  const [isBiometricsReady, setIsBiometricsReady] = useState(false);

  const [pendingAction, setPendingAction] = useState(null);

  const getTodayString = () => new Date().toISOString().split('T')[0];

  const displayMessage = (text, type = 'info') => {
    setMessage(text);
    if (type === 'success') setMessageColor('#3fb950');
    else if (type === 'error') setMessageColor('#f85149');
    else setMessageColor('#58a6ff');
  };

  useEffect(() => {
    const storedEmployee = localStorage.getItem('employee');
    let parsedEmployee = null;

    if (storedEmployee) {
      parsedEmployee = JSON.parse(storedEmployee);
      setEmployee(parsedEmployee);
      fetchDashboardData(parsedEmployee.id);
    } else {
      navigate('/employee-login');
      return;
    }

    const loadModelsAndPrecompute = async () => {
      try {
        // 1. Load the AI Models first
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);

        // 2. Start pre-computing the face vault in the background instantly
        if (parsedEmployee) {
          preloadBiometrics(parsedEmployee.id);
        }
      } catch (err) {
        console.error("Failed to load AI Models", err);
      }
    };
    
    loadModelsAndPrecompute();
  }, [navigate]);

  // Background function to fetch and calculate DB images on login
  const preloadBiometrics = async (empId) => {
    try {
      const res = await fetch(`https://erp-backend-421d.onrender.com/api/employee-login/profile/${empId}`);
      const data = await res.json();

      if (!data.referenceFaceImages || data.referenceFaceImages.length === 0) {
        console.warn("No reference images found in DB.");
        setIsBiometricsReady(true); 
        return;
      }

      const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 });
      const descriptors = [];

      for (let i = 0; i < data.referenceFaceImages.length; i++) {
        const refImg = new Image();
        refImg.crossOrigin = 'anonymous'; 
        refImg.src = data.referenceFaceImages[i];
        
        await new Promise((resolve) => { 
          refImg.onload = resolve;
          refImg.onerror = resolve; 
        });

        const refDetection = await faceapi.detectSingleFace(refImg, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptor();
          
        if (refDetection) {
          descriptors.push(refDetection.descriptor);
        }
      }

      setReferenceDescriptors(descriptors);
      setIsBiometricsReady(true);
      console.log("✅ Biometric vault pre-loaded in the background.");
    } catch (error) {
      console.error("Error pre-loading biometrics:", error);
      setIsBiometricsReady(true);
    }
  };

  const fetchDashboardData = async (empId) => {
    const date = getTodayString();
    try {
      const statusRes = await fetch(`https://erp-backend-421d.onrender.com/api/attendance/status/${empId}?date=${date}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setIsTappedIn(statusData.isTappedIn);
      }
      const metricsRes = await fetch(`https://erp-backend-421d.onrender.com/api/attendance/metrics/${empId}?date=${date}`);
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics({
          ...metricsData,
          chartData: metricsData.chartData || []
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const handleAttendance = async (action) => {
    setMessage('');
    const token = localStorage.getItem('token');
    const endpoint = action === 'in' ? '/api/attendance/tap-in' : '/api/attendance/tap-out';

    try {
      const response = await fetch(`https://erp-backend-421d.onrender.com${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ employeeId: employee.id, date: getTodayString() }),
      });

      const data = await response.json();
      if (response.ok) {
        displayMessage(data.message, 'success');
        fetchDashboardData(employee.id);
      } else {
        displayMessage(`Error: ${data.message}`, 'error');
      }
    } catch (error) {
      displayMessage('Server error. Could not connect to backend.', 'error');
    }
  };

  // REMOVED THE BLOCKING CHECKS HERE - OPENS INSTANTLY NOW
  const initiateTapAction = async (action) => {
    setMessage('');
    setPendingAction(action);
    setIsCameraOpen(true);
    startCamera();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      displayMessage("Camera access denied. Please check browser permissions.", "error");
      setIsCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setIsVerifying(false);
    setPendingAction(null);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const toRad = (value) => (value * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getEmployeeLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
      }
    });
  };

  const verifyFace = async () => {
    setIsVerifying(true);

    if (referenceDescriptors.length === 0) {
      displayMessage('No reference face registered. Contact Admin.', 'error');
      closeCamera();
      return;
    }

    const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.3 });

    try {
      let highestMatch = 0;
      let isVerified = false;
      const maxAttempts = 10;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        displayMessage(`Scanning live feed... (Attempt ${attempt}/${maxAttempts})`, 'info');

        const liveDetections = await faceapi.detectAllFaces(videoRef.current, detectorOptions)
          .withFaceLandmarks()
          .withFaceDescriptors();

        if (liveDetections && liveDetections.length > 0) {
          for (let liveDet of liveDetections) {
            for (let refDesc of referenceDescriptors) {
              const distance = faceapi.euclideanDistance(refDesc, liveDet.descriptor);
              const similarityPercentage = Math.max(0, Math.round(100 - (distance * 100)));

              if (similarityPercentage > highestMatch) highestMatch = similarityPercentage;
              if (similarityPercentage >= 60) {
                isVerified = true;
                break;
              }
            }
            if (isVerified) break;
          }
        }
        if (isVerified) break;
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (!isVerified) {
        displayMessage(`Access Denied. Match: ${highestMatch}%`, 'error');
        setIsVerifying(false);
        return;
      }

      if (pendingAction === 'out') {
        displayMessage(`Identity Verified! Tapping out...`, 'success');
        setTimeout(() => { closeCamera(); handleAttendance('out'); }, 1500);

      } else if (pendingAction === 'in') {
        displayMessage(`Identity Verified! Verifying GPS Location...`, 'info');

        try {
          const locRes = await fetch('https://erp-backend-421d.onrender.com/api/location/get-location');
          if (!locRes.ok) throw new Error("Office location not configured");
          const locData = await locRes.json();
          const office = locData.officeLocation;

          const position = await getEmployeeLocation();
          const distanceInMeters = Math.round(calculateDistance(office.latitude, office.longitude, position.coords.latitude, position.coords.longitude));

          if (distanceInMeters <= office.allowedRadius) {
            displayMessage(`Location Matched! (${distanceInMeters}m). Tapping in...`, 'success');
            setTimeout(() => { closeCamera(); handleAttendance('in'); }, 2000);
          } else {
            displayMessage(`Location Mismatch: You are ${distanceInMeters}m away.`, 'error');
            setIsVerifying(false);
          }
        } catch (gpsError) {
          displayMessage('GPS Error: Enable browser location permissions.', 'error');
          setIsVerifying(false);
        }
      }

    } catch (error) {
      displayMessage('Unexpected error. Please try again.', 'error');
      closeCamera();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('employee');
    navigate('/');
  };

  const formatTime = (isoString) => {
    if (!isoString) return 'Pending...';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const msToFormat = (ms) => {
    if (!ms) return '0h 0m';
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  };

  const getChartData = () => {
    if (!metrics.chartData || metrics.chartData.length === 0) return [];
    if (chartView === 'weekly') {
      return metrics.chartData.slice(-7);
    }
    return metrics.chartData;
  };

  const activeChartData = getChartData();
  const maxMs = 36000000;

  if (!employee) return <div>Loading Profile...</div>;

  // DYNAMIC BUTTON LOGIC
  let scanButtonText = 'Start Scan';
  let isScanDisabled = isVerifying || !modelsLoaded || !isBiometricsReady;

  if (!modelsLoaded) {
    scanButtonText = 'Loading AI Engine...';
  } else if (!isBiometricsReady) {
    scanButtonText = 'Securing Biometric Vault...';
  } else if (isVerifying) {
    scanButtonText = 'Verifying Data...';
  }

  return (
    <>
      <style>
        {`
          body, html { margin: 0 !important; padding: 0 !important; width: 100%; height: 100%; background-color: #0d1117; }
          .layout { display: flex; height: 100vh; height: 100dvh; width: 100vw; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; background-color: #0d1117; color: #c9d1d9; overflow: hidden; }
          
          .sidebar { width: 70px; background: rgba(22, 27, 34, 0.6); border-right: 1px solid rgba(255, 255, 255, 0.08); display: flex; flex-direction: column; align-items: center; justify-content: space-between; padding: 1.5rem 0; box-sizing: border-box; backdrop-filter: blur(10px); z-index: 50; }
          .side-btn { background: none; border: none; color: #8b949e; cursor: pointer; padding: 10px; border-radius: 8px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
          .side-btn:hover { background: rgba(255, 255, 255, 0.1); color: #ffffff; }
          .side-btn.active { color: #58a6ff; background: rgba(88, 166, 255, 0.1); }

          .main-content { flex: 1; padding: 2rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.5rem; box-sizing: border-box; }
          .glass-card { background: rgba(22, 27, 34, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); }

          .header-row { display: flex; justify-content: space-between; align-items: center; }
          .header-row h2 { color: #ffffff; margin: 0 0 0.5rem 0; }
          .header-row p { color: #8b949e; margin: 0; }

          .header-actions { text-align: right; }
          .btn-tap { padding: 12px 30px; font-size: 1.1rem; cursor: pointer; color: white; border: none; border-radius: 8px; font-weight: 600; min-width: 150px; background-color: ${isTappedIn ? '#f85149' : '#3fb950'}; transition: transform 0.2s, box-shadow 0.2s; }
          .btn-tap:hover { transform: translateY(-2px); box-shadow: 0 6px 15px ${isTappedIn ? 'rgba(248, 81, 73, 0.3)' : 'rgba(63, 185, 80, 0.3)'}; }

          .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; }
          .metric-card h4 { color: #8b949e; margin: 0 0 10px 0; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 0.5px; }
          .metric-card .value { font-size: 2rem; font-weight: bold; color: #58a6ff; margin: 0; }

          .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
          .chart-header h3 { margin: 0; color: #ffffff; }
          .toggle-group { display: flex; background: rgba(255,255,255,0.05); border-radius: 8px; padding: 4px; position: relative; z-index: 20; }
          .toggle-btn { background: none; border: none; color: #8b949e; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; touch-action: manipulation; }
          .toggle-btn.active { background: #0052CC; color: white; box-shadow: 0 2px 8px rgba(0, 82, 204, 0.4); }

          .chart-area { display: flex; align-items: flex-end; gap: 12px; height: 230px; padding-top: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); overflow-x: auto; position: relative; z-index: 10; }
          .chart-bar-group { display: flex; flex-direction: column; justify-content: flex-end; align-items: center; flex: 1; min-width: 55px; position: relative; }
          .chart-bars { display: flex; align-items: flex-end; gap: 4px; width: 100%; height: 160px; justify-content: center; }
          .bar-work { width: 22px; background-color: #0052CC; border-radius: 4px 4px 0 0; transition: height 0.4s ease; min-height: 4px; }
          .bar-delay { width: 14px; background-color: #f85149; border-radius: 4px 4px 0 0; transition: height 0.4s ease; min-height: 4px; }
          .chart-value { margin-top: 8px; font-size: 0.7rem; font-weight: 600; color: #e6edf3; white-space: nowrap; }
          .chart-label { margin-top: 4px; font-size: 0.75rem; color: #8b949e; }

          .logs-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem; margin-bottom: 1rem; }
          .logs-header h3 { margin: 0; color: #ffffff; }
          .btn-report { padding: 8px 16px; background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 0.9rem; transition: all 0.2s; }
          .btn-report:hover { background-color: rgba(255,255,255,0.1); color: white; }

          .log-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.05); font-size: 0.95rem; }
          .log-item span strong { color: #8b949e; }

          .modal-overlay { position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: rgba(13, 17, 23, 0.85); backdrop-filter: blur(8px); display: flex; flex-direction: column; justify-content: center; align-items: center; z-index: 1000; }
          .modal-video { width: 400px; height: 300px; background-color: black; border-radius: 12px; object-fit: cover; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.5); }
          .modal-actions { display: flex; flex-direction: column; gap: 15px; align-items: center; width: 100%; max-width: 400px; padding: 0 20px; box-sizing: border-box; }

          @media (max-width: 768px) {
            .layout { flex-direction: column; }
            .sidebar { width: 100%; height: 70px; flex-direction: row; border-right: none; border-top: 1px solid rgba(255, 255, 255, 0.08); padding: 0 2rem; order: 2; }
            .main-content { padding: 1rem; gap: 1.2rem; order: 1; }
            .glass-card { padding: 1.2rem; }
            .header-row { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
            .header-actions { width: 100%; text-align: center; }
            .btn-tap { width: 100%; padding: 16px; }
            .metrics-grid { grid-template-columns: 1fr 1fr; }
            .metric-card:last-child { grid-column: span 2; }
            .chart-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .toggle-group { width: 100%; justify-content: center; }
            .toggle-btn { flex: 1; padding: 10px; }
            .logs-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
            .btn-report { width: 100%; text-align: center; padding: 12px; }
            .log-item { flex-direction: column; gap: 5px; }
            .modal-video { width: 90vw; height: auto; aspect-ratio: 4/3; }
            .modal-actions button { width: 100%; }
          }
        `}
      </style>

      <div className="layout">
        <div className="sidebar">
          <div className="side-top">
            <button className="side-btn active" title="Dashboard">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
            </button>
          </div>
          <div className="side-bottom">
            <button className="side-btn" onClick={handleLogout} title="Log Out">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            </button>
          </div>
        </div>

        <div className="main-content">
          <div className="glass-card header-row">
            <div>
              <h2>Welcome back, {employee.name}</h2>
              <p>Employee Dashboard & Biometric Controls</p>
            </div>
            <div className="header-actions">
              <button className="btn-tap" onClick={() => initiateTapAction(isTappedIn ? 'out' : 'in')}>
                {isTappedIn ? 'Tap Out' : 'Tap In'}
              </button>
              {message && !isCameraOpen && (
                <div style={{ fontSize: '0.85rem', marginTop: '10px', color: messageColor, fontWeight: 'bold' }}>{message}</div>
              )}
            </div>
          </div>

          <div className="metrics-grid">
            <div className="glass-card metric-card">
              <h4>Today's Hours</h4>
              <p className="value">{metrics.today}</p>
            </div>
            <div className="glass-card metric-card">
              <h4>This Week</h4>
              <p className="value">{metrics.week}</p>
            </div>
            <div className="glass-card metric-card">
              <h4>This Month</h4>
              <p className="value">{metrics.month}</p>
            </div>
          </div>

          <div className="glass-card">
            <div className="chart-header">
              <h3>Attendance Analytics</h3>
              <div className="toggle-group">
                <button className={`toggle-btn ${chartView === 'weekly' ? 'active' : ''}`} onClick={() => setChartView('weekly')}>Weekly</button>
                <button className={`toggle-btn ${chartView === 'monthly' ? 'active' : ''}`} onClick={() => setChartView('monthly')}>Monthly</button>
              </div>
            </div>

            <div className="chart-area">
              {activeChartData.length === 0 ? (
                <p style={{ color: '#8b949e', width: '100%', textAlign: 'center', margin: 'auto' }}>No chart data available for this period.</p>
              ) : (
                activeChartData.map((data, idx) => {
                  const safeWorkMs = data.workMs || 0;
                  const safeDelayMs = data.delayMs || 0;
                  const workPercent = Math.min((safeWorkMs / maxMs) * 100, 100);
                  const delayPercent = Math.min((safeDelayMs / maxMs) * 100, 100);

                  return (
                    <div className="chart-bar-group" key={idx} title={`Worked: ${msToFormat(safeWorkMs)} | Delayed: ${msToFormat(safeDelayMs)}`}>
                      <div className="chart-bars">
                        <div className="bar-work" style={{ height: `${Math.max(1, workPercent)}%` }}></div>
                        {safeDelayMs > 0 && <div className="bar-delay" style={{ height: `${Math.max(1, delayPercent)}%` }}></div>}
                      </div>
                      <span className="chart-value">{msToFormat(safeWorkMs)}</span>
                      <span className="chart-label">{data.date.split('-')[2]}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '15px', justifyContent: 'center', fontSize: '0.8rem', color: '#8b949e' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: '#0052CC', borderRadius: '2px' }}></div> Hours Worked</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '10px', height: '10px', background: '#f85149', borderRadius: '2px' }}></div> Arrival Delayed</span>
            </div>
          </div>

          <div className="glass-card">
            <div className="logs-header">
              <h3>Today's Activity</h3>
              <button className="btn-report" onClick={() => navigate('/employee/detailed-report')}>
                View Detailed Days Report
              </button>
            </div>
            {metrics.logs.length === 0 ? (
              <p style={{ color: '#8b949e' }}>No taps recorded yet today.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {metrics.logs.map((log, index) => (
                  <li key={index} className="log-item">
                    <span><strong>In:</strong> {formatTime(log.in)}</span>
                    <span><strong>Out:</strong> {formatTime(log.out)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {isCameraOpen && (
        <div className="modal-overlay">
          <h2 style={{ color: 'white', margin: '0 0 10px 0' }}>Biometric Verification</h2>
          <div style={{ height: '50px', marginBottom: '15px', textAlign: 'center', maxWidth: '80%' }}>
            {message ? (
              <p style={{ color: messageColor, fontWeight: 'bold', margin: 0 }}>{message}</p>
            ) : (
              <p style={{ color: '#8b949e', margin: 0 }}>Please look directly at the camera to {pendingAction === 'in' ? 'Tap In' : 'Tap Out'}.</p>
            )}
          </div>
          <video ref={videoRef} autoPlay muted className="modal-video" />

          <div className="modal-actions">
            {/* The Start Scan button now shows loading states dynamically */}
            <button 
              style={{ 
                marginTop: '20px', 
                padding: '12px 30px', 
                fontSize: '1.1rem', 
                backgroundColor: isScanDisabled ? '#8b949e' : '#3fb950', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: isScanDisabled ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold',
                transition: 'background-color 0.3s'
              }} 
              onClick={verifyFace} 
              disabled={isScanDisabled}
            >
              {scanButtonText}
            </button>
            <button style={{ color: '#8b949e', background: 'none', border: 'none', fontSize: '1rem', cursor: 'pointer', textDecoration: 'underline' }} onClick={closeCamera}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployeeDashboard;