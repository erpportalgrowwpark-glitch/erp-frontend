// frontend/src/App.jsx
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/LandingPage.jsx";
import EmployeeLoginPage from "./pages/EmployeeLoginPage.jsx";
import EmployeeDetailedDaysReport from './pages/EmployeeDetailedDaysReport.jsx';
import HRLoginPage from "./pages/HRLoginPage.jsx";
import AdminLoginPage from "./pages/AdminLoginPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import AdminEmployeeHRCreator from "./pages/AdminEmployeeHRCreator.jsx";
import AdminEmployeeModifier from "./pages/AdminEmployeeModifier.jsx"; // NEW: Imported the modifier page
import EmployeeDashboard from "./pages/EmployeeDashboard.jsx";
import AdminEmployeeAttendanceManagement from "./pages/AdminEmployeeAttendanceManagement.jsx"; 
import AdminLocationManagement from './pages/AdminLocationManagement.jsx';

// Import our bouncer directly from the pages folder
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
      
      {/* Protected Admin Routes */}
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
      
      {/* NEW: Protected route for modifying and deleting employees */}
      <Route 
        path="/admin/modify-employees" 
        element={
          <ProtectedRoute>
            <AdminEmployeeModifier />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/admin/attendance-overview" 
        element={
          <ProtectedRoute>
            <AdminEmployeeAttendanceManagement />
          </ProtectedRoute>
        } 
      />

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