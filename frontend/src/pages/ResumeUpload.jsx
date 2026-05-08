import { useState, useCallback } from 'react';
import {
  Upload, FileText, CheckCircle, AlertCircle, Loader2, X,
  Building2, MapPin, ExternalLink, Bookmark, BookmarkCheck, Briefcase,
} from 'lucide-react';
import { useResume } from '../context/ResumeContext.jsx';

const PORTAL_COLORS = {
  LinkedIn: 'bg-blue-100 text-blue-700',
  Indeed: 'bg-purple-100 text-purple-700',
  Glassdoor: 'bg-green-100 text-green-700',
};

function MatchBadge({ pct }) {
  const color = pct >= 70 ? 'bg-green-100 text-green-700' : pct >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {pct}% match
    </span>
  );
}

export default function ResumeUpload() {
  const { setResumeData } = useResume();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [saved, setSaved] = useState({});
  const [savingId, setSavingId] = useState(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!['application/pdf', 'text/plain'].includes(f.type)) {
      setError('Only PDF and TXT files are supported.');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
    setRecommendations([]);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  const fetchRecommendations = async (parsed) => {
    setLoadingJobs(true);
    try {
      const skills = (parsed.skills || []).join(',');
      const role = parsed.suggestedRoles?.[0] || '';
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      if (skills) params.set('skills', skills);
      const res = await fetch(`/api/jobs?${params}`);
      const data = await res.json();
      if (data.success) setRecommendations(data.jobs.slice(0, 6));
    } catch {
      // silently ignore
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('resume', file);
      const res = await fetch('/api/parse-resume', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setResumeData(data.data);
      setResult(data.data);
      await fetchRecommendations(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resume Upload</h1>
        <p className="text-gray-500 mt-1">Upload your resume to extract skills and get instant job recommendations.</p>
      </div>

      <div className="card mb-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragging ? 'border-sky-500 bg-sky-50' : 'border-gray-300 hover:border-sky-400 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-700 font-medium mb-1">Drag & drop your resume here</p>
          <p className="text-gray-400 text-sm mb-4">PDF or TXT, up to 10 MB</p>
          <label className="btn-secondary cursor-pointer">
            Browse Files
            <input type="file" accept=".pdf,.txt" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between bg-sky-50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span className="text-sm font-medium text-gray-700">{file.name}</span>
              <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button onClick={() => { setFile(null); setResult(null); setRecommendations([]); }} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-4 py-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Analyzing with AI...</>
          ) : (
            <><Upload className="w-4 h-4" />Parse Resume</>
          )}
        </button>
      </div>

      {result && (
        <div className="card mb-6">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Resume Parsed Successfully</h2>
            <span className="text-xs text-gray-400 ml-auto">Saved to database</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Contact</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">Name:</span> {result.name}</p>
                <p><span className="font-medium">Email:</span> {result.email}</p>
                <p><span className="font-medium">Phone:</span> {result.phone}</p>
                <p><span className="font-medium">Location:</span> {result.location}</p>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Suggested Roles</h3>
              <div className="flex flex-wrap gap-2">
                {(result.suggestedRoles || []).map((r) => (
                  <span key={r} className="badge bg-sky-100 text-sky-700">{r}</span>
                ))}
              </div>
            </div>

            {result.summary && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Summary</h3>
                <p className="text-sm text-gray-600">{result.summary}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(result.skills || []).map((s) => (
                  <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>
                ))}
              </div>
            </div>

            {(result.experience || []).length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Experience</h3>
                <div className="space-y-3">
                  {result.experience.map((exp, i) => (
                    <div key={i} className="border-l-2 border-sky-200 pl-3">
                      <p className="font-medium text-sm">{exp.title} — {exp.company}</p>
                      <p className="text-xs text-gray-400">{exp.duration}</p>
                      {exp.description && <p className="text-xs text-gray-500 mt-0.5">{exp.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(result.education || []).length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Education</h3>
                <div className="space-y-2">
                  {result.education.map((edu, i) => (
                    <div key={i} className="text-sm">
                      <span className="font-medium">{edu.degree}</span>
                      <span className="text-gray-400"> · {edu.school} · {edu.year}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {(loadingJobs || recommendations.length > 0) && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-sky-600" />
            <h2 className="text-lg font-semibold text-gray-900">Recommended Jobs</h2>
            {loadingJobs && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
          </div>

          {loadingJobs && recommendations.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">Finding matching jobs…</div>
          )}

          <div className="space-y-4">
            {recommendations.map((job) => (
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
        </div>
      )}
    </div>
  );
}
