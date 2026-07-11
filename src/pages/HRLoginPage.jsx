// frontend/src/pages/HRLoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HRLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://erp-backend-421d.onrender.com/api/hr-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ ' + data.message);
        localStorage.setItem('hr_token', data.token);
        localStorage.setItem('hr_user', JSON.stringify(data.user));

        // Future step: navigate('/hr-dashboard')
      } else {
        setMessage('❌ ' + data.message);
      }
    } catch (error) {
      setMessage('❌ Server error. Is the backend running?');
    }
  };

  const styles = {
    container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#f4f4f9' },
    form: { display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' },
    input: { padding: '10px', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' },
    button: { padding: '10px', fontSize: '1rem', cursor: 'pointer', backgroundColor: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px' },
    backButton: { marginTop: '1rem', cursor: 'pointer', color: '#007bff', textDecoration: 'underline', border: 'none', background: 'none', fontSize: '0.9rem' }
  };

  return (
    <div style={styles.container}>
      <h2>HR Portal Login</h2>
      <form style={styles.form} onSubmit={handleLogin}>
        <input
          style={styles.input} type="email" placeholder="HR Email" required
          value={email} onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={styles.input} type="password" placeholder="Password" required
          value={password} onChange={(e) => setPassword(e.target.value)}
        />
        <button style={styles.button} type="submit">Access System</button>
      </form>

      {message && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{message}</p>}

      <button style={styles.backButton} onClick={() => navigate('/')}>
        ← Back to Portal
      </button>
    </div>
  );
};

export default HRLoginPage;