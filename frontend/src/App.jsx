import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import ResumeUpload from './pages/ResumeUpload.jsx';
import JobSearch from './pages/JobSearch.jsx';
import AutoFill from './pages/AutoFill.jsx';
import ApplicationTracker from './pages/ApplicationTracker.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { ResumeProvider } from './context/ResumeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

function AppShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/resume"    element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
          <Route path="/jobs"      element={<ProtectedRoute><JobSearch /></ProtectedRoute>} />
          <Route path="/autofill"  element={<ProtectedRoute><AutoFill /></ProtectedRoute>} />
          <Route path="/tracker"   element={<ProtectedRoute><ApplicationTracker /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ResumeProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*"        element={<AppShell />} />
          </Routes>
        </BrowserRouter>
      </ResumeProvider>
    </AuthProvider>
  );
}
