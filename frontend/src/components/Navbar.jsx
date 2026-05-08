import { NavLink } from 'react-router-dom';
import { FileText, Search, Wand2, ClipboardList } from 'lucide-react';

const links = [
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/jobs', label: 'Job Search', icon: Search },
  { to: '/autofill', label: 'Auto-Fill', icon: Wand2 },
  { to: '/tracker', label: 'Tracker', icon: ClipboardList },
];

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">JobAssist AI</span>
          </div>

          <nav className="flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
