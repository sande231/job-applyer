import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Search, ClipboardList, Wand2, Upload, TrendingUp, CheckCircle, Clock, XCircle, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useResume } from '../context/ResumeContext.jsx';

const STATUS_COLORS = {
  Applied:    'bg-blue-100 text-blue-700',
  Interview:  'bg-yellow-100 text-yellow-700',
  Offer:      'bg-green-100 text-green-700',
  Rejected:   'bg-red-100 text-red-700',
  Pending:    'bg-gray-100 text-gray-600',
};

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, authFetch } = useAuth();
  const { resumeData } = useResume();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch('/api/applications')
      .then((r) => r.json())
      .then((d) => { if (d.success) setApplications(d.applications); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [authFetch]);

  const total = applications.length;
  const counts = applications.reduce((acc, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  const recent = applications.slice(0, 5);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your job search progress.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={ClipboardList} label="Total Applied"  value={total}                      color="bg-sky-100 text-sky-600" />
        <StatCard icon={CheckCircle}  label="Interviews"      value={counts.Interview || 0}       color="bg-yellow-100 text-yellow-600" />
        <StatCard icon={TrendingUp}   label="Offers"          value={counts.Offer || 0}           color="bg-green-100 text-green-600" />
        <StatCard icon={XCircle}      label="Rejected"        value={counts.Rejected || 0}        color="bg-red-100 text-red-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Applications</h2>
            <Link to="/tracker" className="text-xs text-sky-600 hover:text-sky-700 font-medium flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <p className="text-sm text-gray-400">Loading...</p>
          ) : recent.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardList className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No applications yet</p>
              <Link to="/jobs" className="text-xs text-sky-600 mt-1 inline-block">Search for jobs →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((app) => (
                <div key={app.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{app.title}</p>
                    <p className="text-xs text-gray-400">{app.company} · {app.portal}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status] || STATUS_COLORS.Pending}`}>
                    {app.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Resume</h2>
          {resumeData ? (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white text-sm font-bold">
                  {resumeData.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-900">{resumeData.name}</p>
                  <p className="text-xs text-gray-400">{resumeData.location}</p>
                </div>
              </div>
              {(resumeData.suggestedRoles || []).length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-gray-400 mb-1.5">Suggested Roles</p>
                  <div className="flex flex-wrap gap-1">
                    {resumeData.suggestedRoles.map((r) => (
                      <span key={r} className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs">{r}</span>
                    ))}
                  </div>
                </div>
              )}
              {(resumeData.skills || []).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-1.5">Top Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {resumeData.skills.slice(0, 5).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Link to="/resume" className="btn-secondary text-xs py-1.5 flex-1 text-center">Update</Link>
                <Link to="/jobs?autoSearch=true" className="btn-primary text-xs py-1.5 flex-1 text-center">Find Jobs</Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Upload className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-500 mb-3">No resume uploaded yet</p>
              <Link to="/resume" className="btn-primary text-xs py-1.5 px-4 inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Upload Resume
              </Link>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { to: '/resume',  icon: FileText,      label: 'Upload Resume',  desc: 'Parse your resume with AI',       color: 'text-sky-600 bg-sky-50' },
            { to: '/jobs',    icon: Search,         label: 'Search Jobs',    desc: 'Find matching positions',          color: 'text-purple-600 bg-purple-50' },
            { to: '/autofill',icon: Wand2,          label: 'Auto-Fill',      desc: 'Generate cover letters',          color: 'text-amber-600 bg-amber-50' },
            { to: '/tracker', icon: ClipboardList,  label: 'Tracker',        desc: 'Manage your applications',        color: 'text-green-600 bg-green-50' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className="card hover:shadow-md transition-shadow flex flex-col gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-sm text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
