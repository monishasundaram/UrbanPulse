/* eslint-disable @next/next/no-img-element */
'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { getComplaint, getActions } from '../../../lib/api';

const statusColors = {
  'Filed': 'bg-gray-700 text-gray-300',
  'Under Review': 'bg-yellow-900 text-yellow-300',
  'In Progress': 'bg-blue-900 text-blue-300',
  'Resolved': 'bg-green-900 text-green-300',
};

export default function ComplaintDetail({ params }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState(null);
  const [actions, setActions] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getComplaint(id);
      if (data.success) {
        setComplaint(data.complaint);
        setEvidence(data.evidence || []);
        const actionsData = await getActions(data.complaint.id);
        if (actionsData.success) setActions(actionsData.actions);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const getPhotoFromDescription = (description) => {
    if (!description) return null;
    const parts = description.split('||PHOTO:');
    return parts.length > 1 ? parts[1] : null;
  };

  const getCleanDescription = (description) => {
    if (!description) return '';
    return description.split('||PHOTO:')[0];
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading complaint...</p>
        </div>
      </main>
    );
  }

  if (!complaint) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <p className="text-gray-400">Complaint not found</p>
          <Link href="/complaints" className="text-blue-400 mt-4 block">
            ← Back to complaints
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">UP</div>
          <span className="text-xl font-bold text-white">UrbanPulse</span>
        </Link>
        <Link href="/complaints" className="text-gray-400 hover:text-white text-sm transition">
          ← All Complaints
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Complaint Header */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 mb-8">
          <div className="flex justify-between items-start mb-4">
            <span className="text-blue-400 font-mono text-sm">{complaint.complaint_number}</span>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[complaint.status] || 'bg-gray-700 text-gray-300'}`}>
              {complaint.status}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4">{complaint.title}</h1>
          <p className="text-gray-400 mb-6">{complaint.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm mb-6">
            <div className="bg-gray-800 rounded-xl p-4">
              <span className="text-gray-500 text-xs">Location</span>
              <p className="text-white mt-1">📍 {complaint.location}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <span className="text-gray-500 text-xs">Category</span>
              <p className="text-white mt-1">🏷️ {complaint.category}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <span className="text-gray-500 text-xs">Filed By</span>
              <p className="text-white mt-1">👤 {complaint.pseudo_citizen_id}</p>
            </div>
            <div className="bg-gray-800 rounded-xl p-4">
              <span className="text-gray-500 text-xs">Date Filed</span>
              <p className="text-white mt-1">📅 {new Date(complaint.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Blockchain Notice */}
          <div className="bg-blue-950 border border-blue-800 rounded-xl p-4">
            <p className="text-blue-300 text-sm">
              🔐 <strong>Blockchain Verified:</strong> This complaint is permanently recorded.
              Hash: <span className="font-mono text-xs break-all">{complaint.blockchain_hash || 'Pending...'}</span>
            </p>
          </div>

          {/* Evidence Section */}
          {evidence.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold mb-3 text-gray-300">📎 Submitted Evidence</h3>
              <div className="grid grid-cols-2 gap-3">
                {evidence.map((ev, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700">
                    {ev.file_type?.startsWith('image') ? (
                      <img
                        src={"http://localhost:5000" + ev.file_path}
                        alt="Evidence"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="h-40 flex items-center justify-center">
                        <p className="text-gray-400 text-sm">📹 Video Evidence</p>
                      </div>
                    )}
                    <div className="p-2">
                      <p className="text-xs text-gray-500">
                        {ev.ai_authentic ? '✅ AI Verified' : '⚠️ Unverified'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Timeline */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
          <h2 className="text-xl font-bold mb-6">
            Action Timeline
            <span className="text-gray-500 text-sm font-normal ml-2">
              {actions.length} action{actions.length !== 1 ? 's' : ''}
            </span>
          </h2>

          {actions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-gray-500">No actions taken yet</p>
              <p className="text-gray-600 text-sm mt-1">Officials will update this complaint soon</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-700"></div>
              <div className="space-y-6">
                {actions.map((a, index) => (
                  <div key={a.id} className="flex gap-4 relative">
                    <div className={`w-10 h-10 rounded-full border-4 border-gray-900 flex items-center justify-center text-sm z-10 shrink-0 ${index === 0 ? 'bg-blue-600' : 'bg-gray-700'}`}>
                      {index === 0 ? '⚡' : '✅'}
                    </div>
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
    </main>
  );
}
