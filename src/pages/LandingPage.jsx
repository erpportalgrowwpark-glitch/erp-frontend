// frontend/src/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* INTERNAL CSS: Clean, GitHub-inspired Glassmorphism Theme */}
      <style>
        {`
          /* 1. Global Reset to permanently remove the white border around the browser */
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
            /* GitHub Dark background with subtle glowing orbs for the glass effect */
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
            background: rgba(22, 27, 34, 0.4); /* Frosted GitHub dark card color */
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

          /* Styling for your local GrowwPark JPG Logo */
          .brand-logo {
            width: 85px;
            height: 85px;
            border-radius: 16px; /* Smooth rounded square look */
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

          .glass-card p {
            color: #8b949e; /* GitHub secondary text */
            font-size: 0.95rem;
            margin: 0 0 2.5rem 0;
            line-height: 1.5;
          }

          .button-group {
            display: flex;
            flex-direction: column;
            gap: 1rem;
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
          }

          /* Main Action Button */
          .btn-primary {
            background-color: #0052CC;
            color: #ffffff;
            border: 1px solid transparent;
            box-shadow: 0 4px 14px rgba(0, 82, 204, 0.3);
          }

          .btn-primary:hover {
            background-color: #2684FF; /* Secondary lighter shade */
            box-shadow: 0 6px 20px rgba(38, 132, 255, 0.4);
            transform: translateY(-2px);
          }

          /* Secondary Action Button */
          .btn-secondary {
            background-color: rgba(255, 255, 255, 0.05);
            color: #c9d1d9;
            border: 1px solid rgba(255, 255, 255, 0.1);
          }

          .btn-secondary:hover {
            background-color: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            transform: translateY(-2px);
          }

          .admin-link {
            display: inline-block;
            margin-top: 2.5rem;
            color: #58a6ff; /* GitHub accent blue */
            font-size: 0.85rem;
            text-decoration: none;
            cursor: pointer;
            transition: color 0.2s;
          }

          .admin-link:hover {
            color: #79c0ff;
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
          
          {/* Using your local public image */}
          <img 
            src="/growwpark_logo.jpg" 
            alt="GrowwPark Logo" 
            className="brand-logo" 
          />

          <h1>ERP System Portal</h1>
          <p>Sign in to access your secure enterprise workspace</p>
          
          <div className="button-group">
            {/* Primary Action */}
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/employee-login')}
            >
              Employee Login
            </button>
            
            {/* Secondary Action */}
            
          </div>

          {/* Clean GitHub-style link at the bottom for Admins */}
          

        </div>
      </div>
    </>
  );
};

export default LandingPage;