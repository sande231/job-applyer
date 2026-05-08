import { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Building2, ExternalLink, PlusCircle, Loader2, Filter } from 'lucide-react';

const PORTALS = ['All', 'LinkedIn', 'Indeed', 'Glassdoor'];
const TYPES = ['All', 'Full-time', 'Part-time', 'Contract'];

export default function JobSearch() {
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [portal, setPortal] = useState('All');
  const [type, setType] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState({});

  useEffect(() => {
    const resume = localStorage.getItem('resumeData');
    if (resume) {
      try {
        const data = JSON.parse(resume);
        if (data.suggestedRoles?.length) setRole(data.suggestedRoles[0]);
        if (data.location) setLocation(data.location.split(',')[0].trim());
      } catch {}
    }
  }, []);

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (location) params.set('location', location);
      if (portal !== 'All') params.set('portal', portal);
      if (type !== 'All') params.set('type', type);

      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search failed');
      setJobs(data.jobs);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const quickApply = async (job) => {
    if (saved[job.id]) return;
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          portal: job.portal,
          status: 'Applied',
          date: new Date().toISOString().split('T')[0],
          location: job.location,
          job_type: job.type,
        }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved((prev) => ({ ...prev, [job.id]: true }));
    } catch {}
  };

  const portalColor = (p) => {
    if (p === 'LinkedIn') return 'bg-blue-100 text-blue-700';
    if (p === 'Indeed') return 'bg-purple-100 text-purple-700';
    if (p === 'Glassdoor') return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
        <p className="text-gray-500 mt-1">Search for jobs across multiple portals.</p>
      </div>

      <div className="card mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role / Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="e.g. Software Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                className="input pl-9"
                placeholder="e.g. San Francisco"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Portal</label>
            <div className="flex gap-1">
              {PORTALS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPortal(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    portal === p ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Type</label>
            <div className="flex gap-1">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    type === t ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={search} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          {loading ? 'Searching...' : 'Search Jobs'}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {jobs.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">{jobs.length} job{jobs.length !== 1 ? 's' : ''} found</p>
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge ${portalColor(job.portal)}`}>{job.portal}</span>
                    <span className="badge bg-gray-100 text-gray-600">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    {job.salary && <span className="font-medium text-green-700">{job.salary}</span>}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{job.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {job.skills.slice(0, 5).map((s) => (
                      <span key={s} className="badge bg-gray-100 text-gray-600">{s}</span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary flex items-center gap-1 text-xs py-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </a>
                  <button
                    onClick={() => quickApply(job)}
                    disabled={saved[job.id]}
                    className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-colors ${
                      saved[job.id]
                        ? 'bg-green-100 text-green-700 cursor-default'
                        : 'bg-sky-600 hover:bg-sky-700 text-white'
                    }`}
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    {saved[job.id] ? 'Saved' : 'Track'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-3">Posted {job.postedDate}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && jobs.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <Search className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Search for jobs to get started</p>
          <p className="text-sm mt-1">Use the filters above to find relevant positions</p>
        </div>
      )}
    </div>
  );
}
