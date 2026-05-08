import { useState, useEffect, useCallback } from 'react';
import { ClipboardList, Plus, Trash2, ChevronDown, X, CheckCircle, Clock, XCircle, MessageSquare } from 'lucide-react';

const STATUSES = ['Pending', 'Applied', 'Interview', 'Rejected'];

const statusConfig = {
  Pending:   { color: 'bg-amber-100 text-amber-700',  icon: Clock },
  Applied:   { color: 'bg-blue-100 text-blue-700',    icon: CheckCircle },
  Interview: { color: 'bg-green-100 text-green-700',  icon: MessageSquare },
  Rejected:  { color: 'bg-red-100 text-red-700',      icon: XCircle },
};

const EMPTY_FORM = { title: '', company: '', portal: 'LinkedIn', status: 'Pending', date: new Date().toISOString().split('T')[0], location: '', job_type: 'Full-time', notes: '' };

export default function ApplicationTracker() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [editNotes, setEditNotes] = useState({});

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/applications');
      const data = await res.json();
      setApps(data.applications || []);
    } catch {
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company) return;
    setSaving(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setApps((prev) => [data.application, ...prev]);
      setForm(EMPTY_FORM);
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setApps((prev) => prev.map((a) => (a.id === id ? data.application : a)));
    } catch {}
  };

  const updateNotes = async (id) => {
    const notes = editNotes[id] ?? apps.find((a) => a.id === id)?.notes ?? '';
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (!res.ok) return;
      setApps((prev) => prev.map((a) => (a.id === id ? data.application : a)));
      setEditNotes((prev) => { const n = { ...prev }; delete n[id]; return n; });
    } catch {}
  };

  const deleteApp = async (id) => {
    if (!confirm('Delete this application?')) return;
    try {
      await fetch(`/api/applications/${id}`, { method: 'DELETE' });
      setApps((prev) => prev.filter((a) => a.id !== id));
    } catch {}
  };

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: apps.filter((a) => a.status === s).length }), {});

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-gray-500 mt-1">Track the status of every job you've applied to.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Application
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {STATUSES.map((s) => {
          const { color, icon: Icon } = statusConfig[s];
          return (
            <div key={s} className="card text-center py-4">
              <span className={`badge ${color} mb-2`}>{s}</span>
              <p className="text-2xl font-bold text-gray-900">{counts[s]}</p>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Add Application</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Job Title *</label>
                  <input className="input" required value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Company *</label>
                  <input className="input" required value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Portal</label>
                  <select className="input" value={form.portal} onChange={(e) => setForm((p) => ({ ...p, portal: e.target.value }))}>
                    {['LinkedIn', 'Indeed', 'Glassdoor', 'Other'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                  <select className="input" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Location</label>
                  <input className="input" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Date Applied</label>
                  <input type="date" className="input" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                <textarea rows={2} className="input resize-none" value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? 'Saving...' : 'Save Application'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading...</div>
      ) : apps.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No applications yet</p>
          <p className="text-sm mt-1">Add your first application or track one from Job Search</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map((app) => {
            const { color } = statusConfig[app.status] || statusConfig.Pending;
            const isEditingNotes = app.id in editNotes;
            return (
              <div key={app.id} className="card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-gray-900">{app.title}</p>
                      <span className="text-gray-400">·</span>
                      <p className="text-gray-600 text-sm">{app.company}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>{app.portal}</span>
                      {app.location && <><span>·</span><span>{app.location}</span></>}
                      {app.job_type && <><span>·</span><span>{app.job_type}</span></>}
                      <span>·</span>
                      <span>{app.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <select
                          value={app.status}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className={`appearance-none pl-2.5 pr-7 py-1 rounded-full text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500 ${color}`}
                        >
                          {STATUSES.map((s) => <option key={s}>{s}</option>)}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-60" />
                      </div>
                    </div>

                    <div className="mt-3">
                      {isEditingNotes ? (
                        <div className="flex gap-2">
                          <textarea
                            rows={2}
                            autoFocus
                            className="input resize-none flex-1 text-xs"
                            value={editNotes[app.id]}
                            onChange={(e) => setEditNotes((p) => ({ ...p, [app.id]: e.target.value }))}
                          />
                          <div className="flex flex-col gap-1">
                            <button onClick={() => updateNotes(app.id)} className="btn-primary text-xs py-1">Save</button>
                            <button onClick={() => setEditNotes((p) => { const n = { ...p }; delete n[app.id]; return n; })} className="btn-secondary text-xs py-1">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditNotes((p) => ({ ...p, [app.id]: app.notes || '' }))}
                          className="text-xs text-gray-400 hover:text-sky-600 transition-colors"
                        >
                          {app.notes ? <span className="text-gray-500">{app.notes}</span> : '+ Add notes'}
                        </button>
                      )}
                    </div>
                  </div>

                  <button onClick={() => deleteApp(app.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
