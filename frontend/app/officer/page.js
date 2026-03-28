/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getComplaints, logAction, getActions } from '../../lib/api';

const statusColors = {
  'Filed': 'bg-gray-700 text-gray-300',
  'Under Review': 'bg-yellow-900 text-yellow-300',
  'In Progress': 'bg-blue-900 text-blue-300',
  'Resolved': 'bg-green-900 text-green-300',
};

export default function OfficerDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [actionList, setActionList] = useState([]);
  const [status, setStatus] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionPhoto, setActionPhoto] = useState(null);
  const [actionPhotoPreview, setActionPhotoPreview] = useState(null);

  useEffect(() => {
    getComplaints().then(data => {
      if (data.success) setComplaints(data.complaints);
    });
  }, []);

  const handleSelectComplaint = async (complaint) => {
    setSelected(complaint);
    setStatus(complaint.status);
    setAction('');
    setSubmitted(false);
    setActionPhoto(null);
    setActionPhotoPreview(null);
    const data = await getActions(complaint.id);
    if (data.success) setActionList(data.actions);
  };

  const handleLogAction = async () => {
    if (!action.trim()) return;
    setLoading(true);
    const result = await logAction({
      complaint_id: selected.id,
      officer_id: 'OFF2026',
      action_type: 'Update',
      description: action,
      status: status,
    }, actionPhoto);
    if (result.success) {
      setActionList([result.action, ...actionList]);
      setAction('');
      setActionPhoto(null);
      setActionPhotoPreview(null);
      setSubmitted(true);
      setComplaints(complaints.map(c =>
        c.id === selected.id ? { ...c, status: status } : c
      ));
      setTimeout(() => setSubmitted(false), 3000);
    }
    setLoading(false);
  };

  const getPhotoFromDescription = (description) => {
    if (!description) return null;
    const parts = description.split('||PHOTO:');
    return parts.length > 1 ? parts[1] : null;
  };

  const getCleanDescription = (description) => {
    if (!description) return '';
    return description.split('||PHOTO:')[0];
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">UP</div>
          <span className="text-xl font-bold">UrbanPulse</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-green-900 text-green-300 text-xs px-3 py-1 rounded-full">
            ● Officer Online
          </div>
          <div className="text-gray-400 text-sm">Officer #OFF2026</div>
        </div>
      </nav>

      <div className="flex" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Left Panel */}
        <div className="w-96 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-bold text-lg">Complaints</h2>
            <p className="text-gray-500 text-xs mt-1">{complaints.length} total</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-800">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {complaints.filter(c => c.status === 'Under Review').length}
              </div>
              <div className="text-xs text-gray-500">Review</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-400">
                {complaints.filter(c => c.status === 'In Progress').length}
              </div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-400">
                {complaints.filter(c => c.status === 'Resolved').length}
              </div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
          </div>

          {/* Complaint Cards */}
          <div className="p-3 space-y-3">
            {complaints.length === 0 ? (
              <p className="text-gray-600 text-sm text-center py-8">No complaints yet</p>
            ) : (
              complaints.map(complaint => (
                <div
                  key={complaint.id}
                  onClick={() => handleSelectComplaint(complaint)}
                  className={`rounded-xl p-4 cursor-pointer border transition ${
                    selected?.id === complaint.id
                      ? 'border-blue-500 bg-gray-800'
                      : 'border-gray-800 hover:border-gray-600 bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-blue-400 text-xs font-mono">{complaint.complaint_number}</span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{complaint.title}</h3>
                  <p className="text-gray-500 text-xs mb-2">📍 {complaint.location}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[complaint.status] || 'bg-gray-700 text-gray-300'}`}>
                    {complaint.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl">Select a complaint to view details</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">

              {/* Complaint Header */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-blue-400 text-sm font-mono">{selected.complaint_number}</span>
                    <h2 className="text-2xl font-bold mt-1">{selected.title}</h2>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColors[selected.status] || 'bg-gray-700 text-gray-300'}`}>
                    {selected.status}
                  </span>
                </div>
                <p className="text-gray-400 mb-4">{selected.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Location</span>
                    <p className="text-white">📍 {selected.location}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Category</span>
                    <p className="text-white">🏷️ {selected.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Filed By</span>
                    <p className="text-white">👤 {selected.pseudo_citizen_id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date</span>
                    <p className="text-white">📅 {new Date(selected.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                <h3 className="font-bold mb-4">Update Status</h3>
                <div className="flex gap-3 flex-wrap">
                  {['Filed', 'Under Review', 'In Progress', 'Resolved'].map(s => (
                    <button
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                        status === s
                          ? 'border-blue-500 bg-blue-600 text-white'
                          : 'border-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Log Action */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                <h3 className="font-bold mb-2">Log Action</h3>
                <p className="text-gray-500 text-xs mb-4">
                  Every action is digitally signed and saved to database permanently.
                </p>
                <textarea
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  rows={3}
                  placeholder="Describe the action taken..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-4"
                />

                {/* Photo Upload */}
                <div
                  className="border-2 border-dashed border-gray-700 rounded-xl p-4 text-center hover:border-blue-500 transition cursor-pointer mb-4"
                  onClick={() => document.getElementById('actionPhoto').click()}
                >
                  {actionPhotoPreview ? (
                    <div>
                      <img
                        src={actionPhotoPreview}
                        alt="Action proof"
                        className="max-h-40 mx-auto rounded-lg mb-2 object-cover"
                      />
                      <p className="text-green-400 text-xs">✅ Photo attached — click to change</p>
                    </div>
                  ) : (
                    <div>
                      <div className="text-3xl mb-2">📷</div>
                      <p className="text-gray-400 text-sm">Click to attach proof photo</p>
                      <p className="text-gray-600 text-xs mt-1">Optional but recommended</p>
                    </div>
                  )}
                  <input
                    id="actionPhoto"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setActionPhoto(file);
                        setActionPhotoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>

                <button
                  onClick={handleLogAction}
                  disabled={!action.trim() || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
                >
                  {submitted ? '✅ Action Saved!' : loading ? 'Saving...' : 'Log Action'}
                </button>
              </div>

              {/* Action History */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="font-bold mb-6">Action History</h3>
                {actionList.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-600 text-sm">No actions logged yet</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                    <div className="space-y-6">
                      {actionList.map((a, index) => (
                        <div key={a.id} className="flex gap-4 relative">
                          {/* Icon Circle */}
                          <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-gray-900 flex items-center justify-center text-sm z-10 shrink-0">
                            {index === 0 ? '⚡' : '✅'}
                          </div>
                          {/* Content Card */}
                          <div className="flex-1 bg-gray-800 rounded-xl p-4 border border-gray-700">
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-blue-400 text-xs font-medium">
                                Officer #{a.officer_id}
                              </span>
                              <span className="text-gray-500 text-xs">
                                {new Date(a.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white text-sm mb-3">
                              {getCleanDescription(a.description)}
                            </p>
                            {/* Show photo if attached */}
                            {getPhotoFromDescription(a.description) && (
                              <img
                                src={"http://localhost:5000" + getPhotoFromDescription(a.description)}
                                alt="Action proof"
                                className="w-full max-h-48 object-cover rounded-lg mb-3"
                              />
                            )}
                            <div className="flex gap-2 flex-wrap">
                              <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                                🏷️ {a.action_type}
                              </span>
                              <span className="bg-gray-900 text-gray-500 text-xs px-2 py-1 rounded-full font-mono">
                                🔐 {a.digital_signature?.slice(0, 16)}...
                              </span>
                              <span className="bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full">
                                🕐 {new Date(a.created_at).toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </main>
  );
}