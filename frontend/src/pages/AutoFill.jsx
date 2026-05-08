import { useState, useEffect } from 'react';
import { Wand2, Copy, CheckCheck, AlertCircle, User, Mail, Phone, MapPin, Briefcase, FileText } from 'lucide-react';

const FIELD_CONFIG = [
  { key: 'fullName', label: 'Full Name', icon: User, resumeKey: 'name' },
  { key: 'email', label: 'Email', icon: Mail, resumeKey: 'email' },
  { key: 'phone', label: 'Phone', icon: Phone, resumeKey: 'phone' },
  { key: 'location', label: 'Location', icon: MapPin, resumeKey: 'location' },
  { key: 'currentTitle', label: 'Current / Desired Title', icon: Briefcase, resumeKey: null },
  { key: 'summary', label: 'Professional Summary', icon: FileText, resumeKey: 'summary', multiline: true },
];

export default function AutoFill() {
  const [resume, setResume] = useState(null);
  const [fields, setFields] = useState({});
  const [copied, setCopied] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem('resumeData');
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      setResume(data);

      const initial = {};
      FIELD_CONFIG.forEach(({ key, resumeKey }) => {
        if (resumeKey && data[resumeKey]) {
          initial[key] = data[resumeKey];
        } else if (key === 'currentTitle') {
          initial[key] = data.suggestedRoles?.[0] || data.experience?.[0]?.title || '';
        } else {
          initial[key] = '';
        }
      });
      setFields(initial);
    } catch {}
  }, []);

  const copyField = (key) => {
    const val = fields[key];
    if (!val) return;
    navigator.clipboard.writeText(val).then(() => {
      setCopied((prev) => ({ ...prev, [key]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [key]: false })), 2000);
    });
  };

  const copyAll = () => {
    const text = FIELD_CONFIG.map(({ label, key }) => `${label}: ${fields[key] || ''}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied({ _all: true });
      setTimeout(() => setCopied({}), 2000);
    });
  };

  if (!resume) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Auto-Fill</h1>
          <p className="text-gray-500 mt-1">Pre-filled form data generated from your resume.</p>
        </div>
        <div className="card text-center py-12">
          <AlertCircle className="w-10 h-10 mx-auto text-amber-400 mb-3" />
          <p className="font-medium text-gray-700">No resume data found</p>
          <p className="text-sm text-gray-400 mt-1">
            Upload and parse your resume on the{' '}
            <a href="/resume" className="text-sky-600 underline">Resume page</a> first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Auto-Fill</h1>
        <p className="text-gray-500 mt-1">Copy any field directly into a job application form.</p>
      </div>

      <div className="card mb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-sky-600" />
            <h2 className="font-semibold text-gray-900">Application Fields</h2>
          </div>
          <button onClick={copyAll} className="btn-secondary flex items-center gap-1.5 text-sm py-1.5">
            {copied._all ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied._all ? 'Copied!' : 'Copy All'}
          </button>
        </div>

        <div className="space-y-4">
          {FIELD_CONFIG.map(({ key, label, icon: Icon, multiline }) => (
            <div key={key}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </span>
              </label>
              <div className="flex gap-2">
                {multiline ? (
                  <textarea
                    rows={4}
                    className="input resize-none flex-1"
                    value={fields[key] || ''}
                    onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                ) : (
                  <input
                    className="input flex-1"
                    value={fields[key] || ''}
                    onChange={(e) => setFields((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                )}
                <button
                  onClick={() => copyField(key)}
                  disabled={!fields[key]}
                  title="Copy to clipboard"
                  className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                >
                  {copied[key] ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {resume.skills?.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Skills Snapshot</h2>
          <div className="flex flex-wrap gap-2 mb-3">
            {resume.skills.map((s) => (
              <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>
            ))}
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(resume.skills.join(', '));
              setCopied((p) => ({ ...p, _skills: true }));
              setTimeout(() => setCopied((p) => ({ ...p, _skills: false })), 2000);
            }}
            className="btn-secondary flex items-center gap-1.5 text-sm py-1.5"
          >
            {copied._skills ? <CheckCheck className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
            {copied._skills ? 'Copied!' : 'Copy Skills List'}
          </button>
        </div>
      )}

      {resume.experience?.length > 0 && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Experience Bullets</h2>
          <div className="space-y-3">
            {resume.experience.map((exp, i) => (
              <div key={i} className="flex items-start justify-between gap-3 border-l-2 border-sky-200 pl-3">
                <div className="flex-1">
                  <p className="font-medium text-sm">{exp.title} — {exp.company}</p>
                  <p className="text-xs text-gray-400 mb-0.5">{exp.duration}</p>
                  {exp.description && <p className="text-xs text-gray-600">{exp.description}</p>}
                </div>
                <button
                  onClick={() => {
                    const text = `${exp.title} at ${exp.company} (${exp.duration})${exp.description ? ': ' + exp.description : ''}`;
                    navigator.clipboard.writeText(text);
                    setCopied((p) => ({ ...p, [`exp_${i}`]: true }));
                    setTimeout(() => setCopied((p) => ({ ...p, [`exp_${i}`]: false })), 2000);
                  }}
                  className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  {copied[`exp_${i}`] ? <CheckCheck className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-gray-500" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
