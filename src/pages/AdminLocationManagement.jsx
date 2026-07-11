// frontend/src/pages/AdminLocationManagement.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLocationManagement = () => {
  const navigate = useNavigate();

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [allowedRadius, setAllowedRadius] = useState(50); // Default 50 meters

  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#333');
  const [isLoading, setIsLoading] = useState(false);

  const displayMessage = (text, type = 'info') => {
    setMessage(text);
    if (type === 'success') setMessageColor('#28a745');
    else if (type === 'error') setMessageColor('#dc3545');
    else setMessageColor('#333');
  };

  // Fetch existing location on mount
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        const response = await fetch('https://erp-backend-421d.onrender.com/api/location/get-location');
        if (response.ok) {
          const data = await response.json();
          setLatitude(data.officeLocation.latitude);
          setLongitude(data.officeLocation.longitude);
          setAllowedRadius(data.officeLocation.allowedRadius);
        }
      } catch (error) {
        console.error("No existing location found or server error.");
      }
    };
    fetchCurrentLocation();
  }, []);

  // Use Browser API to get exact GPS coordinates
  const handleCheckLocation = () => {
    setMessage('');

    if (!navigator.geolocation) {
      displayMessage('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setIsLoading(true);
    displayMessage('Acquiring GPS coordinates...', 'info');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setIsLoading(false);
        displayMessage('Coordinates acquired successfully. Remember to click Save!', 'success');
      },
      (error) => {
        setIsLoading(false);
        displayMessage('Unable to retrieve location. Please ensure location permissions are enabled in your browser.', 'error');
      },
      { enableHighAccuracy: true }
    );
  };

  // Save to Database
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!latitude || !longitude) {
      displayMessage('Please acquire coordinates before saving.', 'error');
      return;
    }

    try {
      const response = await fetch('https://erp-backend-421d.onrender.com/api/location/set-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          allowedRadius: parseInt(allowedRadius)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        displayMessage(data.message, 'success');
      } else {
        displayMessage(data.message, 'error');
      }
    } catch (error) {
      displayMessage('Server error. Could not connect to backend.', 'error');
    }
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: '#e9ecef', padding: '2rem' },
    card: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '450px' },
    title: { color: '#333', marginTop: 0 },
    text: { color: '#6c757d', fontSize: '0.9rem', marginBottom: '1.5rem' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
    inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
    label: { fontSize: '0.9rem', fontWeight: 'bold', color: '#495057' },
    input: { padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ced4da', fontFamily: 'inherit', backgroundColor: '#f8f9fa' },
    gpsBtn: { padding: '12px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', fontFamily: 'inherit' },
    submitBtn: { padding: '12px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', marginTop: '10px', fontFamily: 'inherit' },
    backButton: { marginTop: '1.5rem', cursor: 'pointer', color: '#6c757d', textDecoration: 'underline', border: 'none', background: 'none', fontSize: '0.9rem', fontFamily: 'inherit' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Office Location Manager</h2>
        <p style={styles.text}>Configure the geographical boundaries for employee Tap In. Employees must be within the allowed radius of this location.</p>

        <form style={styles.form} onSubmit={handleSaveLocation}>

          <button type="button" style={styles.gpsBtn} onClick={handleCheckLocation} disabled={isLoading}>
            {isLoading ? 'Acquiring...' : 'Check & Fix Current Location'}
          </button>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Latitude</label>
            <input style={styles.input} type="number" step="any" value={latitude} readOnly placeholder="Wait for GPS..." required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Longitude</label>
            <input style={styles.input} type="number" step="any" value={longitude} readOnly placeholder="Wait for GPS..." required />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Allowed Radius (Meters)</label>
            <input
              style={{ ...styles.input, backgroundColor: 'white' }}
              type="number"
              value={allowedRadius}
              onChange={(e) => setAllowedRadius(e.target.value)}
              min="10"
              required
            />
          </div>

          <button style={styles.submitBtn} type="submit">
            Save Office Location
          </button>
        </form>

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

export default AdminLocationManagement;