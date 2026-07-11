// frontend/src/pages/EmployeeLoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const EmployeeLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Upgraded professional messaging state (No emojis)
  const [message, setMessage] = useState('');
  const [messageColor, setMessageColor] = useState('#ffffff');

  const displayMessage = (text, type = 'info') => {
    setMessage(text);
    if (type === 'success') setMessageColor('#3fb950'); // GitHub success green
    else if (type === 'error') setMessageColor('#f85149'); // GitHub error red
    else setMessageColor('#ffffff');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('https://erp-backend-421d.onrender.com/api/employee-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        displayMessage(data.message, 'success');
        localStorage.setItem('token', data.token);
        localStorage.setItem('employee', JSON.stringify(data.employee));

        navigate('/employee-dashboard');
      } else {
        displayMessage(data.message, 'error');
      }
    } catch (error) {
      displayMessage('Server error. Is the backend running?', 'error');
    }
  };

  return (
    <>
      {/* INTERNAL CSS: Clean, GitHub-inspired Glassmorphism Theme */}
      <style>
        {`
          /* Global Reset to permanently remove the white border around the browser */
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100%;
            height: 100%;
            background-color: #0d1117;
          }

          .landing-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            width: 100vw;
            background-color: #0d1117;
            background-image: 
              radial-gradient(circle at 15% 20%, rgba(0, 82, 204, 0.15) 0%, transparent 25%),
              radial-gradient(circle at 85% 80%, rgba(38, 132, 255, 0.15) 0%, transparent 25%);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 20px;
            box-sizing: border-box;
          }

          .glass-card {
            background: rgba(22, 27, 34, 0.4); 
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 16px;
            padding: 3rem 2.5rem;
            width: 100%;
            max-width: 420px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            box-sizing: border-box;
          }

          .brand-logo {
            width: 85px;
            height: 85px;
            border-radius: 16px;
            object-fit: cover;
            margin-bottom: 1.5rem;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .glass-card h1 {
            color: #ffffff;
            font-size: 1.8rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.5px;
          }

          .glass-card p.subtitle {
            color: #8b949e; 
            font-size: 0.95rem;
            margin: 0 0 2rem 0;
            line-height: 1.5;
          }

          .form-container {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          /* Frosted Glass Inputs */
          .glass-input {
            width: 100%;
            padding: 14px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            color: #ffffff;
            font-size: 1rem;
            font-family: inherit;
            box-sizing: border-box;
            transition: all 0.2s ease;
          }

          .glass-input::placeholder {
            color: #8b949e;
          }

          .glass-input:focus {
            outline: none;
            border-color: #0052CC;
            background: rgba(255, 255, 255, 0.08);
            box-shadow: 0 0 0 3px rgba(0, 82, 204, 0.25);
          }

          .btn {
            width: 100%;
            padding: 14px;
            font-size: 1rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease-in-out;
            font-family: inherit;
            margin-top: 0.5rem;
          }

          .btn-primary {
            background-color: #0052CC;
            color: #ffffff;
            border: 1px solid transparent;
            box-shadow: 0 4px 14px rgba(0, 82, 204, 0.3);
          }

          .btn-primary:hover {
            background-color: #2684FF; 
            box-shadow: 0 6px 20px rgba(38, 132, 255, 0.4);
            transform: translateY(-2px);
          }

          .back-link {
            display: inline-block;
            margin-top: 2rem;
            color: #8b949e;
            font-size: 0.9rem;
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s;
            background: none;
            border: none;
            padding: 0;
            font-family: inherit;
          }

          .back-link:hover {
            color: #c9d1d9;
            text-decoration: underline;
          }

          /* Mobile Responsiveness */
          @media (max-width: 480px) {
            .glass-card {
              padding: 2rem 1.5rem;
              border-radius: 12px;
            }
            .landing-wrapper {
              padding: 15px;
            }
            .glass-card h1 {
              font-size: 1.5rem;
            }
          }
        `}
      </style>

      <div className="landing-wrapper">
        <div className="glass-card">

          <img
            src="/growwpark_logo.jpg"
            alt="GrowwPark Logo"
            className="brand-logo"
          />

          <h1>Employee Login</h1>
          <p className="subtitle">Sign in to access your dashboard.</p>

          <form className="form-container" onSubmit={handleLogin}>
            <input
              className="glass-input"
              type="email"
              placeholder="Email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="glass-input"
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button className="btn btn-primary" type="submit">
              Sign In
            </button>
          </form>

          {message && (
            <p style={{ marginTop: '1.2rem', fontWeight: 'bold', color: messageColor, fontSize: '0.9rem' }}>
              {message}
            </p>
          )}

          <button className="back-link" onClick={() => navigate('/')}>
            ← Back to Main Portal
          </button>

        </div>
      </div>
    </>
  );
};

export default EmployeeLoginPage;