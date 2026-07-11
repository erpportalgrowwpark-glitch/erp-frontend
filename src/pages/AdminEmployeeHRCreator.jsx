// frontend/src/pages/AdminEmployeeHRCreator.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminEmployeeHRCreator = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('employee');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Professional Messaging State (No Emojis)
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#333');

  // Burst Capture States
  const [referenceFaceImages, setReferenceFaceImages] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const displayMessage = (text, type = 'info') => {
    setMessage(text);
    if (type === 'success') setMessageColor('#28a745');
    else if (type === 'error') setMessageColor('#dc3545');
    else setMessageColor('#333');
  };

  // THE FIX: Use useEffect to safely attach the camera stream AFTER the video element renders
  useEffect(() => {
    let stream = null;

    const startVideo = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        displayMessage('Camera access denied or unavailable.', 'error');
        setIsCameraOpen(false);
      }
    };

    if (isCameraOpen) {
      startVideo();
    }

    // Cleanup: Shut off the camera instantly when modal closes or tab switches
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen]);

  const openCamera = () => {
    setReferenceFaceImages([]);
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
    setIsCapturing(false);
  };

  // MAGIC 1: Camera Burst Capture
  const captureBurst = async () => {
    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const capturedImages = [];
    const brightnessLevels = [100, 85, 70, 55, 40];

    for (let i = 0; i < brightnessLevels.length; i++) {
      ctx.filter = `brightness(${brightnessLevels[i]}%)`;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL('image/jpeg', 0.8);
      capturedImages.push(base64Image);

      setReferenceFaceImages([...capturedImages]);
      await new Promise((resolve) => setTimeout(resolve, 400));
    }

    setIsCapturing(false);
    closeCamera();
  };

  // MAGIC 2: Manual File Upload (Auto-Augments 1 photo into 5)
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        const capturedImages = [];
        const brightnessLevels = [100, 85, 70, 55, 40];

        // Loop through the single uploaded image and apply the same lighting tweaks
        for (let i = 0; i < brightnessLevels.length; i++) {
          ctx.filter = `brightness(${brightnessLevels[i]}%)`;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          capturedImages.push(canvas.toDataURL('image/jpeg', 0.8));
        }

        setReferenceFaceImages(capturedImages);
        displayMessage('Photo uploaded and 5 lighting variations generated successfully.', 'success');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = activeTab === 'employee'
      ? 'https://erp-backend-421d.onrender.com/api/admin/create-employee'
      : 'https://erp-backend-421d.onrender.com/api/admin/create-hr';

    const payload = { name, email, password };

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
        setName('');
        setEmail('');
        setPassword('');
        setReferenceFaceImages([]);
      } else {
        displayMessage(data.message, 'error');
      }
    } catch (error) {
      displayMessage('Server error. Is the backend running?', 'error');
    }
  };

  // --- STYLING (Professional Typography applied) ---
  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: '#e9ecef', padding: '2rem' },
    card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '450px' },
    tabContainer: { display: 'flex', gap: '10px', marginBottom: '1.5rem' },
    tabButton: (isActive) => ({
      flex: 1, padding: '10px', cursor: 'pointer', border: 'none', borderRadius: '4px', fontWeight: 'bold',
      backgroundColor: isActive ? '#343a40' : '#dee2e6',
      color: isActive ? 'white' : '#495057'
    }),
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    input: { padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: 'inherit' },
    submitBtn: { padding: '12px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '10px', fontFamily: 'inherit' },
    backButton: { marginTop: '1.5rem', cursor: 'pointer', color: '#6c757d', textDecoration: 'underline', border: 'none', background: 'none', fontSize: '0.9rem', fontFamily: 'inherit' },

    // Camera & Gallery Styles
    cameraSection: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', border: '1px solid #ced4da', borderRadius: '4px', backgroundColor: '#f8f9fa', alignItems: 'center' },
    video: { width: '100%', borderRadius: '8px', backgroundColor: 'black' },
    actionBtn: { padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'inherit' },
    gallery: { display: 'flex', gap: '5px', overflowX: 'auto', marginTop: '10px', justifyContent: 'center' },
    thumbnail: { width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc' }
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: '#333' }}>Account Creator</h2>
      <div style={styles.card}>

        <div style={styles.tabContainer}>
          <button style={styles.tabButton(activeTab === 'employee')} onClick={() => { setActiveTab('employee'); setReferenceFaceImages([]); setMessage(''); }}>
            New Employee
          </button>
          <button style={styles.tabButton(activeTab === 'hr')} onClick={() => { setActiveTab('hr'); setMessage(''); }}>
            New HR
          </button>
        </div>

        <form style={styles.form} onSubmit={handleCreateAccount}>
          <input style={styles.input} type="text" placeholder="Full Name" required value={name} onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} type="email" placeholder={`${activeTab === 'hr' ? 'HR' : 'Employee'} Email`} required value={email} onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Temporary Password" required value={password} onChange={(e) => setPassword(e.target.value)} />

          {/* BIOMETRIC UI */}
          {activeTab === 'employee' && (
            <div style={styles.cameraSection}>
              <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333' }}>Biometric Reference</label>

              {!isCameraOpen && referenceFaceImages.length === 0 && (
                <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                  <button type="button" style={styles.actionBtn} onClick={openCamera}>
                    Open Camera
                  </button>

                  {/* File Upload Button (Hidden input covering a styled button) */}
                  <div style={{ position: 'relative', flex: 1 }}>
                    <button type="button" style={{ ...styles.actionBtn, backgroundColor: '#6c757d', width: '100%' }}>
                      Upload Photo
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                    />
                  </div>
                </div>
              )}

              {isCameraOpen && (
                <>
                  <video ref={videoRef} autoPlay muted style={styles.video} />
                  <button type="button" style={styles.actionBtn} onClick={captureBurst} disabled={isCapturing}>
                    {isCapturing ? 'Capturing Variations...' : 'Start Burst Capture (5 Shots)'}
                  </button>
                  <button type="button" onClick={closeCamera} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', fontWeight: 'bold' }}>
                    Cancel
                  </button>
                </>
              )}

              {/* Hidden Canvas for drawing/filtering */}
              <canvas ref={canvasRef} style={{ display: 'none' }} />

              {/* Mini Gallery Preview */}
              {referenceFaceImages.length > 0 && (
                <div style={{ textAlign: 'center', width: '100%' }}>
                  <div style={{ fontSize: '0.85rem', color: '#28a745', fontWeight: 'bold' }}>5 AI Variations Ready</div>
                  <div style={styles.gallery}>
                    {referenceFaceImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Capture ${idx + 1}`} style={styles.thumbnail} />
                    ))}
                  </div>
                  <button type="button" onClick={() => setReferenceFaceImages([])} style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px', fontSize: '0.85rem', fontFamily: 'inherit', fontWeight: 'bold' }}>
                    Clear & Retake
                  </button>
                </div>
              )}
            </div>
          )}

          <button style={styles.submitBtn} type="submit">
            Create {activeTab === 'hr' ? 'HR' : 'Employee'} Account
          </button>
        </form>

        {/* Dynamic Professional Error/Success Message */}
        {message && (
          <p style={{ marginTop: '1.2rem', textAlign: 'center', fontWeight: 'bold', color: messageColor }}>
            {message}
          </p>
        )}
      </div>
      <button style={styles.backButton} onClick={() => navigate('/admin')}>
        Back to Admin Dashboard
      </button>
    </div>
  );
};

export default AdminEmployeeHRCreator;