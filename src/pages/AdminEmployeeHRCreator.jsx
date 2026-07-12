// frontend/src/pages/AdminEmployeeHRCreator.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminEmployeeHRCreator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employee');
  const [activeSection, setActiveSection] = useState(null); // Accordion state

  // Core Data & The 60+ Excel Fields
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', empId: '', title: '', firstName: '', middleName: '', lastName: '', 
    workEmail: '', gender: '', dateOfBirth: '', maritalStatus: '', marriageDate: '', fatherHusbandName: '', 
    startDate: '', reportsTo: '', reportsToEffectiveDate: '', jobRole: '', grade: '', jobRoleEffectiveDate: '', 
    jobRoleReason: '', company: '', companyEffectiveDate: '', location: '', locationEffectiveDate: '', 
    department: '', departmentEffectiveDate: '', aadharNumber: '', nameAsPerAadhar: '', panNumber: '', 
    nameAsPerPan: '', nationality: '', employmentType: '', employmentTypeEffectiveDate: '', annualLeaveEntitlement: '', 
    earnedLeaveBalanceThisYear: '', earnedLeaveAddedNextYear: '', entitlementType: '', currentAddressLine1: '', 
    currentAddressLine2: '', currentAddressLine3: '', currentState: '', currentCountry: '', currentPostCode: '', 
    permanentAddressLine1: '', permanentAddressLine2: '', permanentAddressLine3: '', permanentState: '', 
    permanentCountry: '', permanentPostCode: '', personalPhoneNumber: '', leavingDate: '', leaveReason: '', 
    probationEndDate: '', noticePeriod: '', workPhone: '', personalEmail: '', mobile: '', nextReviewDate: '', 
    fixedTermEndDate: '', biometricId: '', workPatternName: '', effectiveDate: '', currentWeek: ''
  });

  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#c9d1d9');

  const [referenceFaceImages, setReferenceFaceImages] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const displayMessage = (text, type = 'info') => {
    setMessage(text);
    if (type === 'success') setMessageColor('#3fb950');
    else if (type === 'error') setMessageColor('#f85149');
    else setMessageColor('#58a6ff');
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    let stream = null;
    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        displayMessage('Camera access denied or unavailable.', 'error');
        setIsCameraOpen(false);
      }
    };
    if (isCameraOpen) startVideo();
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [isCameraOpen]);

  const openCamera = () => { setReferenceFaceImages([]); setIsCameraOpen(true); };
  const closeCamera = () => { setIsCameraOpen(false); setIsCapturing(false); };

  const captureBurst = async () => {
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;

    const capturedImages = [];
    const brightnessLevels = [100, 85, 70, 55, 40];

    for (let i = 0; i < brightnessLevels.length; i++) {
      ctx.filter = `brightness(${brightnessLevels[i]}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      capturedImages.push(canvas.toDataURL('image/jpeg', 0.8));
      setReferenceFaceImages([...capturedImages]);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    setIsCapturing(false); closeCamera();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = canvasRef.current; const ctx = canvas.getContext('2d');
        canvas.width = img.width; canvas.height = img.height;
        const capturedImages = [];
        const brightnessLevels = [100, 85, 70, 55, 40];
        for (let i = 0; i < brightnessLevels.length; i++) {
          ctx.filter = `brightness(${brightnessLevels[i]}%)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          capturedImages.push(canvas.toDataURL('image/jpeg', 0.8));
        }
        setReferenceFaceImages(capturedImages);
        displayMessage('5 variations generated successfully.', 'success');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage('');
    
    // NOTE: Make sure this URL matches your live Render URL!
    // If you are testing locally first, change this back to http://localhost:5000/api/...
    const endpoint = activeTab === 'employee' 
      ? 'https://erp-backend-421d.onrender.com/api/admin/create-employee' 
      : 'https://erp-backend-421d.onrender.com/api/admin/create-hr';

    const payload = { ...formData };

    if (activeTab === 'employee') {
      if (referenceFaceImages.length < 5) {
        displayMessage('Please capture or upload the biometric reference first.', 'error');
        return;
      }
      payload.referenceFaceImages = referenceFaceImages;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        displayMessage(data.message, 'success');
        setFormData(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: '' }), {}));
        setReferenceFaceImages([]);
        setActiveSection(null);
      } else {
        displayMessage(data.message, 'error');
      }
    } catch (error) {
      displayMessage('Server error. Is the backend running?', 'error');
    }
  };

  // --- UI FIELD CONFIGURATIONS ---
  const accordionSections = [
    {
      title: "Personal & Contact Information", id: "personal",
      fields: [
        { label: 'Employee ID', name: 'empId' }, { label: 'Title', name: 'title' },
        { label: 'First Name', name: 'firstName' }, { label: 'Middle Name', name: 'middleName' },
        { label: 'Last Name', name: 'lastName' }, { label: 'Gender', name: 'gender' },
        { label: 'Date of Birth (YYYY-MM-DD)', name: 'dateOfBirth', type: 'date' }, { label: 'Nationality', name: 'nationality' },
        { label: 'Marital Status', name: 'maritalStatus' }, { label: 'Marriage Date', name: 'marriageDate', type: 'date' },
        { label: 'Father/Husband Name', name: 'fatherHusbandName' }, { label: 'Work Email', name: 'workEmail' },
        { label: 'Personal Email', name: 'personalEmail' }, { label: 'Work Phone', name: 'workPhone' },
        { label: 'Personal Phone', name: 'personalPhoneNumber' }, { label: 'Mobile', name: 'mobile' }
      ]
    },
    {
      title: "Identity & Verification", id: "identity",
      fields: [
        { label: 'Aadhar Number', name: 'aadharNumber' }, { label: 'Name as per Aadhar', name: 'nameAsPerAadhar' },
        { label: 'PAN Number', name: 'panNumber' }, { label: 'Name as per PAN', name: 'nameAsPerPan' }
      ]
    },
    {
      title: "Employment Details", id: "employment",
      fields: [
        { label: 'Start Date', name: 'startDate', type: 'date' }, { label: 'Company', name: 'company' },
        { label: 'Company Effective Date', name: 'companyEffectiveDate', type: 'date' }, { label: 'Department', name: 'department' },
        { label: 'Department Effective Date', name: 'departmentEffectiveDate', type: 'date' }, { label: 'Job Role', name: 'jobRole' },
        { label: 'Grade', name: 'grade' }, { label: 'Job Role Effective Date', name: 'jobRoleEffectiveDate', type: 'date' },
        { label: 'Job Role Reason', name: 'jobRoleReason' }, { label: 'Reports To', name: 'reportsTo' },
        { label: 'Reports To Effective Date', name: 'reportsToEffectiveDate', type: 'date' }, { label: 'Location', name: 'location' },
        { label: 'Location Effective Date', name: 'locationEffectiveDate', type: 'date' }, { label: 'Employment Type', name: 'employmentType' },
        { label: 'Employment Type Effective Date', name: 'employmentTypeEffectiveDate', type: 'date' }, { label: 'Probation End Date', name: 'probationEndDate', type: 'date' },
        { label: 'Notice Period', name: 'noticePeriod' }, { label: 'Fixed Term End Date', name: 'fixedTermEndDate', type: 'date' },
        { label: 'Next Review Date', name: 'nextReviewDate', type: 'date' }, { label: 'Leaving Date', name: 'leavingDate', type: 'date' },
        { label: 'Leave Reason', name: 'leaveReason' }
      ]
    },
    {
      title: "Leave & Attendance Settings", id: "leave",
      fields: [
        { label: 'Annual Leave Entitlement', name: 'annualLeaveEntitlement' }, { label: 'Earned Leave This Year', name: 'earnedLeaveBalanceThisYear' },
        { label: 'Earned Leave Next Year', name: 'earnedLeaveAddedNextYear' }, { label: 'Entitlement Type', name: 'entitlementType' },
        { label: 'Biometric ID', name: 'biometricId' }, { label: 'Work Pattern Name', name: 'workPatternName' },
        { label: 'Effective Date', name: 'effectiveDate', type: 'date' }, { label: 'Current Week', name: 'currentWeek' }
      ]
    },
    {
      title: "Address Information", id: "address",
      fields: [
        { label: 'Current Address 1', name: 'currentAddressLine1' }, { label: 'Current Address 2', name: 'currentAddressLine2' },
        { label: 'Current Address 3', name: 'currentAddressLine3' }, { label: 'Current State', name: 'currentState' },
        { label: 'Current Country', name: 'currentCountry' }, { label: 'Current PostCode', name: 'currentPostCode' },
        { label: 'Permanent Address 1', name: 'permanentAddressLine1' }, { label: 'Permanent Address 2', name: 'permanentAddressLine2' },
        { label: 'Permanent Address 3', name: 'permanentAddressLine3' }, { label: 'Permanent State', name: 'permanentState' },
        { label: 'Permanent Country', name: 'permanentCountry' }, { label: 'Permanent PostCode', name: 'permanentPostCode' }
      ]
    }
  ];

  const renderFields = (fields) => (
    <div className="grid-form">
      {fields.map(f => (
        <div key={f.name} className="input-group">
          <label>{f.label}</label>
          <input className="glass-input" type={f.type || 'text'} name={f.name} value={formData[f.name]} onChange={handleInputChange} />
        </div>
      ))}
    </div>
  );

  return (
    <>
      <style>
        {`
          body, html { margin: 0; padding: 0; width: 100%; min-height: 100vh; background-color: #0d1117; }
          .page-wrapper { min-height: 100vh; width: 100vw; background-color: #0d1117; background-image: radial-gradient(circle at 15% 20%, rgba(0, 82, 204, 0.15) 0%, transparent 25%), radial-gradient(circle at 85% 80%, rgba(38, 132, 255, 0.15) 0%, transparent 25%); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #c9d1d9; display: flex; flex-direction: column; align-items: center; padding: 2rem; box-sizing: border-box; overflow-y: auto; }
          .glass-card { background: rgba(22, 27, 34, 0.4); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; padding: 2rem; width: 100%; max-width: 800px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2); }
          
          .tab-container { display: flex; gap: 10px; margin-bottom: 2rem; background: rgba(0,0,0,0.2); padding: 5px; border-radius: 10px; }
          .tab-btn { flex: 1; padding: 12px; cursor: pointer; border: none; border-radius: 8px; font-weight: 600; font-size: 1rem; transition: all 0.2s; background: transparent; color: #8b949e; }
          .tab-btn.active { background: #0052CC; color: white; box-shadow: 0 4px 12px rgba(0, 82, 204, 0.4); }
          
          .section-title { font-size: 1.2rem; color: #ffffff; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
          
          .grid-form { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem; margin-bottom: 1.5rem; }
          @media (max-width: 600px) { .grid-form { grid-template-columns: 1fr; } }
          
          .input-group { display: flex; flex-direction: column; gap: 5px; }
          .input-group label { font-size: 0.85rem; color: #8b949e; font-weight: 500; }
          
          .glass-input { width: 100%; padding: 12px; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; color: #ffffff; font-size: 0.95rem; font-family: inherit; box-sizing: border-box; transition: all 0.2s ease; }
          .glass-input:focus { outline: none; border-color: #0052CC; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.25); }
          
          /* Accordion Styles */
          .accordion-item { border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; margin-bottom: 1rem; background: rgba(0,0,0,0.1); overflow: hidden; }
          .accordion-header { padding: 15px 20px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; background: rgba(255,255,255,0.02); transition: background 0.2s; font-weight: 600; color: #e6edf3; user-select: none; }
          .accordion-header:hover { background: rgba(255,255,255,0.05); }
          .accordion-body { padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
          
          .btn-primary { width: 100%; padding: 15px; font-size: 1.1rem; font-weight: 600; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background-color: #3fb950; color: white; border: none; margin-top: 2rem; }
          .btn-primary:hover { background-color: #2ea043; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(46, 160, 67, 0.4); }
          
          .btn-secondary { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #c9d1d9; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: 600; transition: all 0.2s; }
          .btn-secondary:hover { background: rgba(255,255,255,0.1); color: white; }
          
          .camera-box { padding: 1.5rem; background: rgba(0,0,0,0.2); border: 1px dashed rgba(255,255,255,0.2); border-radius: 10px; text-align: center; margin-bottom: 1.5rem; }
        `}
      </style>

      <div className="page-wrapper">
        <h2 style={{ color: '#ffffff', marginBottom: '2rem' }}>Account Provisioning Center</h2>
        
        <div className="glass-card">
          <div className="tab-container">
            <button className={`tab-btn ${activeTab === 'employee' ? 'active' : ''}`} onClick={() => setActiveTab('employee')}>New Employee</button>
            <button className={`tab-btn ${activeTab === 'hr' ? 'active' : ''}`} onClick={() => setActiveTab('hr')}>New HR Admin</button>
          </div>

          <form onSubmit={handleCreateAccount}>
            
            {/* CORE REQUIRED FIELDS */}
            <h3 className="section-title">Core Credentials (Required)</h3>
            <div className="grid-form">
              <div className="input-group">
                <label>Display Name *</label>
                <input className="glass-input" type="text" name="name" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Login Email *</label>
                <input className="glass-input" type="email" name="email" required value={formData.email} onChange={handleInputChange} />
              </div>
              <div className="input-group">
                <label>Temporary Password *</label>
                <input className="glass-input" type="password" name="password" required value={formData.password} onChange={handleInputChange} />
              </div>
            </div>

            {/* BIOMETRICS (EMPLOYEES ONLY) */}
            {activeTab === 'employee' && (
              <div className="camera-box">
                <h4 style={{ margin: '0 0 1rem 0', color: '#e6edf3' }}>Biometric Vault Reference *</h4>
                
                {!isCameraOpen && referenceFaceImages.length === 0 && (
                  <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <button type="button" className="btn-secondary" style={{ background: '#0052CC', border: 'none', color: 'white' }} onClick={openCamera}>Open Web Camera</button>
                    <div style={{ position: 'relative' }}>
                      <button type="button" className="btn-secondary">Upload ID Photo</button>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                    </div>
                  </div>
                )}

                {isCameraOpen && (
                  <div>
                    <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', maxWidth: '400px', borderRadius: '8px', border: '2px solid rgba(255,255,255,0.1)' }} />
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                      <button type="button" className="btn-secondary" style={{ background: '#3fb950', border: 'none', color: 'white' }} onClick={captureBurst} disabled={isCapturing}>
                        {isCapturing ? 'Scanning...' : 'Start Scan Sequence'}
                      </button>
                      <button type="button" className="btn-secondary" onClick={closeCamera}>Cancel</button>
                    </div>
                  </div>
                )}
                
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {referenceFaceImages.length > 0 && (
                  <div>
                    <span style={{ color: '#3fb950', fontWeight: 'bold', fontSize: '0.9rem' }}>✓ Secure Facial Model Generated</span>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                      {referenceFaceImages.map((img, idx) => (
                        <img key={idx} src={img} alt="scan" style={{ width: '50px', height: '50px', borderRadius: '6px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                      ))}
                    </div>
                    <button type="button" style={{ marginTop: '15px', background: 'none', border: 'none', color: '#f85149', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setReferenceFaceImages([])}>
                      Clear & Retake
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* OPTIONAL EXCEL FIELDS (ACCORDION) */}
            {activeTab === 'employee' && (
              <div style={{ marginTop: '2rem' }}>
                <h3 className="section-title">Extended Employee Profile (Optional)</h3>
                <p style={{ fontSize: '0.85rem', color: '#8b949e', margin: '0 0 1rem 0' }}>Click sections below to expand and fill out additional ledger data.</p>
                
                {accordionSections.map((section) => (
                  <div key={section.id} className="accordion-item">
                    <div className="accordion-header" onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}>
                      {section.title}
                      <span>{activeSection === section.id ? '▲' : '▼'}</span>
                    </div>
                    {activeSection === section.id && (
                      <div className="accordion-body">
                        {renderFields(section.fields)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button type="submit" className="btn-primary">
              Provision {activeTab === 'hr' ? 'HR Administrator' : 'Employee'} Access
            </button>
            
            {message && (
              <div style={{ marginTop: '1.5rem', padding: '15px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: messageColor, textAlign: 'center', fontWeight: 'bold' }}>
                {message}
              </div>
            )}

          </form>
        </div>
        
        <button className="btn-secondary" style={{ marginTop: '2rem', border: 'none' }} onClick={() => navigate('/admin')}>
          ← Return to Command Center
        </button>
      </div>
    </>
  );
};

export default AdminEmployeeHRCreator;