// frontend/src/pages/AdminLoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://erp-backend-421d.onrender.com/api/admin-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ ' + data.message);
        localStorage.setItem('admin_token', data.token);
        localStorage.setItem('admin_user', JSON.stringify(data.user));

        // Route straight to the dashboard on success
        setTimeout(() => navigate('/admin'), 1000);
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Server error. Is the backend running?');
    }
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#e9ecef' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', width: '300px' },
    input: { padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ced4da' },
    button: { padding: '12px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' },
    backButton: { marginTop: '1.5rem', cursor: 'pointer', color: '#6c757d', textDecoration: 'underline', border: 'none', background: 'none', fontSize: '0.9rem' }
  };

  return (
    <div style={styles.container}>
      <h2>SuperAdmin Gateway</h2>
      <form style={styles.form} onSubmit={handleLogin}>
        <input
          style={styles.input} type="text" placeholder="Admin Username" required
          value={username} onChange={(e) => setUsername(e.target.value)}
        />
        <input
          style={styles.input} type="password" placeholder="Password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} type="submit">Authenticate</button>
      </form>

      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold', textAlign: 'center' }}>{message}</p>}

      <button style={styles.backButton} onClick={() => navigate('/')}>
        ← Back to Portal
      </button>
    </div>
  );
};

export default AdminLoginPage;