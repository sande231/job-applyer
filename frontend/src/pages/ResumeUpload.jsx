import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useResume } from '../context/ResumeContext.jsx';

export default function ResumeUpload() {
  const navigate = useNavigate();
  const { setResumeData } = useResume();
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = useCallback((f) => {
    if (!f) return;
    const allowed = ['application/pdf', 'text/plain'];
    if (!allowed.includes(f.type)) {
      setError('Only PDF and TXT files are supported.');
      return;
    }
    setFile(f);
    setError(null);
    setResult(null);
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      handleFile(f);
    },
    [handleFile]
  );

  const onInputChange = (e) => handleFile(e.target.files[0]);

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
      navigate('/jobs?autoSearch=true');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Resume Upload</h1>
        <p className="text-gray-500 mt-1">Upload your resume to extract and analyze your skills and experience.</p>
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
            <input type="file" accept=".pdf,.txt" onChange={onInputChange} className="hidden" />
          </label>
        </div>

        {file && (
          <div className="mt-4 flex items-center justify-between bg-sky-50 rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span className="text-sm font-medium text-gray-700">{file.name}</span>
              <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button onClick={() => { setFile(null); setResult(null); }} className="text-gray-400 hover:text-gray-600">
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
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing with AI...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Parse Resume
            </>
          )}
        </button>
      </div>

      {result && (
        <div className="card">
          <div className="flex items-center gap-2 mb-6">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h2 className="font-semibold text-gray-900">Resume Parsed Successfully</h2>
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

          <p className="text-xs text-gray-400 mt-6">
            ✓ Resume data saved — use it on the Auto-Fill and Job Search pages.
          </p>
        </div>
      )}
    </div>
  );
}
