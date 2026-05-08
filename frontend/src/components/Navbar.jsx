import { NavLink, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  FileText, Search, Wand2, ClipboardList, X,
  ChevronDown, LayoutDashboard, LogOut, Menu,
} from 'lucide-react';
import { useResume } from '../context/ResumeContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/resume',    label: 'Resume',    icon: FileText },
  { to: '/jobs',      label: 'Job Search', icon: Search },
  { to: '/autofill',  label: 'Auto-Fill', icon: Wand2 },
  { to: '/tracker',   label: 'Tracker',   icon: ClipboardList },
];

function initials(name) {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();
}

export default function Navbar() {
  const { resumeData, clearResume } = useResume();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const profileRef = useRef(null);

  const handleLogout = () => {
    clearResume();
    logout();
    setMobileOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-sky-50 text-sky-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">JobAssist AI</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass}>
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Profile dropdown (desktop) */}
            <div className="relative hidden md:block" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
                  {initials(resumeData?.name || user?.name)}
                </div>
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {resumeData?.name || user?.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-20">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-bold">
                        {initials(resumeData?.name || user?.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{resumeData?.name || user?.name}</p>
                        <p className="text-xs text-gray-400">{resumeData?.location || user?.email}</p>
                      </div>
                    </div>
                    <button onClick={() => setProfileOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {(resumeData?.suggestedRoles || []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Suggested Roles</p>
                      <div className="flex flex-wrap gap-1">
                        {resumeData.suggestedRoles.map((r) => (
                          <span key={r} className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-medium">{r}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(resumeData?.skills || []).length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Top Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {resumeData.skills.slice(0, 6).map((s) => (
                          <span key={s} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                    <NavLink to="/resume" onClick={() => setProfileOpen(false)} className="text-xs text-sky-600 hover:text-sky-700 font-medium">
                      Update resume
                    </NavLink>
                    <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
                      <LogOut className="w-3 h-3" /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-3">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={() => setMobileOpen(false)}>
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white text-xs font-bold">
                {initials(resumeData?.name || user?.name)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{resumeData?.name || user?.name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
