import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ResumeUpload from './pages/ResumeUpload.jsx';
import JobSearch from './pages/JobSearch.jsx';
import AutoFill from './pages/AutoFill.jsx';
import ApplicationTracker from './pages/ApplicationTracker.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
          <Routes>
            <Route path="/" element={<Navigate to="/resume" replace />} />
            <Route path="/resume" element={<ResumeUpload />} />
            <Route path="/jobs" element={<JobSearch />} />
            <Route path="/autofill" element={<AutoFill />} />
            <Route path="/tracker" element={<ApplicationTracker />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
