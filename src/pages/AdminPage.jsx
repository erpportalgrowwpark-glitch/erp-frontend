// frontend/src/pages/AdminPage.jsx
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", backgroundColor: '#e9ecef' },
    card: { backgroundColor: 'white', padding: '3rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '400px', textAlign: 'center' },
    title: { marginBottom: '1rem', color: '#333' },
    subtitle: { marginBottom: '2rem', color: '#6c757d', fontSize: '1rem' },
    btnContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    actionBtn: { padding: '15px', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', width: '100%', transition: '0.2s', fontFamily: 'inherit' },
    locationBtn: { padding: '15px', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', width: '100%', transition: '0.2s', fontFamily: 'inherit' },
    gridBtn: { padding: '15px', fontSize: '1.1rem', cursor: 'pointer', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', width: '100%', transition: '0.2s', fontFamily: 'inherit' },
    backButton: { marginTop: '2rem', cursor: 'pointer', color: '#6c757d', textDecoration: 'underline', border: 'none', background: 'none', fontSize: '1rem', fontFamily: 'inherit' }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Admin Dashboard</h2>
        <p style={styles.subtitle}>Welcome to the central ERP control panel.</p>
        
        <div style={styles.btnContainer}>
          <button 
            style={styles.actionBtn} 
            onClick={() => navigate('/admin/create-accounts')}
          >
            Manage User Accounts
          </button>

          {/* NEW: Button to route to the Company Attendance Grid */}
          <button 
            style={styles.gridBtn} 
            onClick={() => navigate('/admin/attendance-overview')}
          >
            Company Attendance Grid
          </button>

          <button 
            style={styles.locationBtn} 
            onClick={() => navigate('/admin/location-management')}
          >
            Manage Office Location
          </button>
        </div>

        <button style={styles.backButton} onClick={() => navigate('/')}>
          Back to Main Portal
        </button>
      </div>
    </div>
  );
};

export default AdminPage;