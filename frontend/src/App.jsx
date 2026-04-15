import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ReportIssue from './pages/ReportIssue';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import ResetPassword from './pages/ResetPassword';
import ForgotPasswordOTP from './pages/ForgotPasswordOTP';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const userRole = localStorage.getItem('userRole');
  const location = useLocation();

  const isDashboard = ['/citizen', '/authority', '/report', '/login', '/signup'].includes(location.pathname);
  const shouldLockHeight = ['/citizen', '/authority'].includes(location.pathname);

  return (
    <div className="page" style={shouldLockHeight ? { height: '100vh', overflow: 'hidden' } : { minHeight: '100vh' }}>
      {!isDashboard && <Navbar />}
      <main className={isDashboard ? "" : "main-content"} style={shouldLockHeight ? { padding: 0, margin: 0, flex: 1, height: '100%' } : { padding: 0, margin: 0, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPasswordOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/citizen"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/authority"
            element={
              <ProtectedRoute allowedRoles={['authority']}>
                <AuthorityDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute allowedRoles={['citizen']}>
                <ReportIssue />
              </ProtectedRoute>
            }
          />

          {/* Fallback for authenticated users */}
          <Route path="*" element={<Navigate to={userRole === 'authority' ? "/authority" : "/citizen"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
