import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useResume } from '../context/ResumeContext.jsx';
import {
  Search, MapPin, Briefcase, Building2, ExternalLink,
  Loader2, Filter, Bookmark, BookmarkCheck,
} from 'lucide-react';

const PORTALS = ['All', 'LinkedIn', 'Indeed', 'Glassdoor', 'Remote'];
const TYPES = ['All', 'Full-time', 'Part-time', 'Contract'];

const PORTAL_COLORS = {
  LinkedIn: 'bg-blue-100 text-blue-700',
  Indeed: 'bg-purple-100 text-purple-700',
  Glassdoor: 'bg-green-100 text-green-700',
};

function MatchBadge({ pct }) {
  if (!pct) return null;
  const color =
    pct >= 70 ? 'bg-green-100 text-green-700'
    : pct >= 40 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {pct}% match
    </span>
  );
}

export default function JobSearch() {
  const [searchParams] = useSearchParams();
  const { resumeData } = useResume();
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');
  const [portal, setPortal] = useState('All');
  const [type, setType] = useState('All');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState({});
  const [savingId, setSavingId] = useState(null);

  const search = useCallback(
    async (overrideRole, overrideLocation, overrideSkills) => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (overrideRole ?? role) params.set('role', overrideRole ?? role);
        if (overrideLocation ?? location) params.set('location', overrideLocation ?? location);
        if (portal !== 'All') params.set('portal', portal);
        if (type !== 'All') params.set('type', type);
        const skills = overrideSkills ?? (resumeData?.skills || []);
        if (skills.length) params.set('skills', skills.join(','));

        const res = await fetch(`/api/jobs?${params}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Search failed');
        setJobs(data.jobs);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [role, location, portal, type, resumeData]
  );

  useEffect(() => {
    if (resumeData) {
      const resumeRole = resumeData.suggestedRoles?.length ? resumeData.suggestedRoles[0] : '';
      const resumeLocation = resumeData.location ? resumeData.location.split(',')[0].trim() : '';
      if (resumeRole) setRole(resumeRole);
      if (resumeLocation) setLocation(resumeLocation);
      if (searchParams.get('autoSearch') === 'true') {
        search(resumeRole, resumeLocation, resumeData.skills || []);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveJob = async (job) => {
    if (saved[job.id]) return;
    setSavingId(job.id);
    try {
      const res = await fetch('/api/jobs/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved((prev) => ({ ...prev, [job.id]: true }));
    } catch {
      // silently ignore
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Job Search</h1>
        <p className="text-gray-500 mt-1">
          Search across LinkedIn, Indeed, Glassdoor and remote boards.
          {resumeData && ' Resume loaded — results ranked by skill match.'}
        </p>
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
                placeholder="e.g. San Francisco or Remote"
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
            <div className="flex gap-1 flex-wrap">
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
            <div className="flex gap-1 flex-wrap">
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

        <button onClick={() => search()} disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
          {loading ? 'Searching…' : 'Search Jobs'}
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {jobs.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
            {resumeData && ' · sorted by skill match'}
          </p>
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className={`badge ${PORTAL_COLORS[job.portal] || 'bg-gray-100 text-gray-700'}`}>
                      {job.portal}
                    </span>
                    <span className="badge bg-gray-100 text-gray-600">{job.type}</span>
                    {job.matchPercent > 0 && <MatchBadge pct={job.matchPercent} />}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-2 flex-wrap">
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
                    className="btn-primary flex items-center gap-1 text-xs py-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Apply Now
                  </a>
                  <button
                    onClick={() => saveJob(job)}
                    disabled={!!saved[job.id] || savingId === job.id}
                    className={`flex items-center gap-1 text-xs py-1.5 px-3 rounded-lg font-medium transition-colors border ${
                      saved[job.id]
                        ? 'bg-green-50 text-green-700 border-green-200 cursor-default'
                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {saved[job.id] ? (
                      <><BookmarkCheck className="w-3.5 h-3.5" />Saved</>
                    ) : savingId === job.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
                    ) : (
                      <><Bookmark className="w-3.5 h-3.5" />Save Job</>
                    )}
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
          <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">Search for jobs to get started</p>
          <p className="text-sm mt-1">Upload your resume first for skill-matched results</p>
        </div>
      )}
    </div>
  );
}
