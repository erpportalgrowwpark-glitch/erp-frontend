// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import EmployeeLoginPage from "./pages/EmployeeLoginPage.jsx";
import EmployeeDetailedDaysReport from './pages/EmployeeDetailedDaysReport';
import HRLoginPage from "./pages/HRLoginPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminEmployeeHRCreator from "./pages/AdminEmployeeHRCreator.jsx";
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx"; // NEW: Imported the dashboard
import AdminLocationManagement from './pages/AdminLocationManagement';

// Import our new bouncer directly from the pages folder
import ProtectedRoute from "./pages/ProtectedRoute.jsx"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/employee-login" element={<EmployeeLoginPage />} />
      <Route path="/employee/detailed-report" element={<EmployeeDetailedDaysReport />} />
      <Route path="/hr-login" element={<HRLoginPage />} />


      {/* Admin Login remains public so people can actually log in */}
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin/location-management" element={<AdminLocationManagement />} />
      
      {/* These routes are now WRAPPED in the ProtectedRoute. 
          If you try to bypass the login by typing /admin in the URL, it kicks you out. */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/create-accounts" 
        element={
          <ProtectedRoute>
            <AdminEmployeeHRCreator />
          </ProtectedRoute>
        } 
      />

      {/* NEW: Added the Employee Dashboard route wrapped in ProtectedRoute */}
      <Route 
        path="/employee-dashboard" 
        element={
          <ProtectedRoute>
            <EmployeeDashboard />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;