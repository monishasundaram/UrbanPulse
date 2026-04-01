'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getComplaints } from '../../lib/api';

export default function Profile() {
  const [pseudoId, setPseudoId] = useState('');
  const [myComplaints, setMyComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusColors = {
    'Filed': 'bg-gray-700 text-gray-300',
    'Under Review': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'Resolved': 'bg-green-900 text-green-300',
  };

  useEffect(() => {
    async function loadProfile() {
      const id = localStorage.getItem('pseudoId') || '';
      setPseudoId(id);
      if (id) {
        const data = await getComplaints();
        if (data.success) {
          const mine = data.complaints.filter(
            c => c.pseudo_citizen_id === id
          );
          setMyComplaints(mine);
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!pseudoId) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold mb-4">Not Logged In</h2>
          <p className="text-gray-400 mb-6">Please login to view your profile</p>
          <Link href="/login" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition">
            Login
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
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('pseudoId');
            window.location.href = '/';
          }}
          className="text-gray-400 hover:text-red-400 text-sm transition"
        >
          Logout
        </button>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Profile Header */}
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold">
              {pseudoId.slice(0, 2)}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{pseudoId}</h1>
              <p className="text-gray-400 text-sm mt-1">Verified Citizen</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 text-xs">Identity Protected</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">{myComplaints.length}</div>
              <div className="text-gray-500 text-xs mt-1">Total Filed</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-400">
                {myComplaints.filter(c => c.status === 'Resolved').length}
              </div>
              <div className="text-gray-500 text-xs mt-1">Resolved</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {myComplaints.filter(c => c.status !== 'Resolved').length}
              </div>
              <div className="text-gray-500 text-xs mt-1">Pending</div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="bg-blue-950 border border-blue-800 rounded-xl p-4 mb-8">
          <p className="text-blue-300 text-sm">
            🔐 <strong>Privacy Protected:</strong> Your real name, phone and Aadhaar are encrypted.
            The public only sees your Citizen ID: <strong>{pseudoId}</strong>
          </p>
        </div>

        {/* My Complaints */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">My Complaints</h2>
            <Link href="/file-complaint" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
              + New Complaint
            </Link>
          </div>

          {myComplaints.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📭</div>
              <p className="text-gray-500">No complaints filed yet</p>
              <Link href="/file-complaint" className="text-blue-400 hover:text-blue-300 text-sm mt-2 block">
                File your first complaint →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {myComplaints.map(complaint => (
                <Link
                  key={complaint.id}
                  href={"/complaint/" + complaint.complaint_number}
                  className="block p-6 hover:bg-gray-800 transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-blue-400 text-xs font-mono">{complaint.complaint_number}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[complaint.status] || 'bg-gray-700 text-gray-300'}`}>
                      {complaint.status}
                    </span>
                  </div>
                  <p className="text-white font-medium mb-1">{complaint.title}</p>
                  <div className="flex gap-4 text-xs text-gray-500">
                    <span>📍 {complaint.location}</span>
                    <span>📅 {new Date(complaint.created_at).toLocaleDateString()}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
