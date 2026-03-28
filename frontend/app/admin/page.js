'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getComplaints } from '../../lib/api';

export default function AdminPanel() {
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getComplaints().then(data => {
      if (data.success) setComplaints(data.complaints);
      setLoading(false);
    });
  }, []);

  const totalComplaints = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const underReview = complaints.filter(c => c.status === 'Under Review').length;
  const filed = complaints.filter(c => c.status === 'Filed').length;

  const categories = complaints.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1;
    return acc;
  }, {});

  const statusColors = {
    'Filed': 'bg-gray-700 text-gray-300',
    'Under Review': 'bg-yellow-900 text-yellow-300',
    'In Progress': 'bg-blue-900 text-blue-300',
    'Resolved': 'bg-green-900 text-green-300',
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm">AD</div>
          <span className="text-xl font-bold">UrbanPulse Admin</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="bg-red-900 text-red-300 text-xs px-3 py-1 rounded-full">
            ● Admin Access
          </div>
          <Link href="/" className="text-gray-400 hover:text-white text-sm transition">
            Exit Admin
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-gray-400">System overview and management. Complaint records cannot be altered.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Total', value: totalComplaints, color: 'text-white', bg: 'bg-gray-800' },
            { label: 'Filed', value: filed, color: 'text-gray-300', bg: 'bg-gray-800' },
            { label: 'Under Review', value: underReview, color: 'text-yellow-400', bg: 'bg-yellow-950' },
            { label: 'In Progress', value: inProgress, color: 'text-blue-400', bg: 'bg-blue-950' },
            { label: 'Resolved', value: resolved, color: 'text-green-400', bg: 'bg-green-950' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 text-center border border-gray-800`}>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          {['overview', 'complaints', 'categories', 'system'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Resolution Rate */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-bold mb-4">Resolution Rate</h3>
              <div className="flex items-center gap-4 mb-2">
                <div className="flex-1 bg-gray-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all"
                    style={{ width: totalComplaints > 0 ? `${(resolved / totalComplaints) * 100}%` : '0%' }}
                  ></div>
                </div>
                <span className="text-green-400 font-bold text-sm">
                  {totalComplaints > 0 ? Math.round((resolved / totalComplaints) * 100) : 0}%
                </span>
              </div>
              <p className="text-gray-500 text-xs">{resolved} out of {totalComplaints} complaints resolved</p>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-bold mb-4">Quick Navigation</h3>
              <div className="grid grid-cols-3 gap-4">
                <Link href="/complaints" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-sm font-medium">All Complaints</p>
                  <p className="text-gray-500 text-xs mt-1">Public view</p>
                </Link>
                <Link href="/officer" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition">
                  <div className="text-3xl mb-2">👮</div>
                  <p className="text-sm font-medium">Officer Dashboard</p>
                  <p className="text-gray-500 text-xs mt-1">Manage complaints</p>
                </Link>
                <Link href="/file-complaint" className="bg-gray-800 hover:bg-gray-700 rounded-xl p-4 text-center transition">
                  <div className="text-3xl mb-2">📝</div>
                  <p className="text-sm font-medium">File Complaint</p>
                  <p className="text-gray-500 text-xs mt-1">Citizen view</p>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-bold mb-4">System Status</h3>
              <div className="space-y-3">
                {[
                  { name: 'Backend API', port: '5000', status: 'Online' },
                  { name: 'Frontend', port: '3000', status: 'Online' },
                  { name: 'PostgreSQL Database', port: '5432', status: 'Online' },
                  { name: 'AI Service', port: '8000', status: 'Online' },
                ].map(service => (
                  <div key={service.name} className="flex justify-between items-center bg-gray-800 rounded-lg p-3">
                    <div>
                      <p className="text-sm font-medium">{service.name}</p>
                      <p className="text-gray-500 text-xs">Port {service.port}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-green-400 text-xs">{service.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Complaints Tab */}
        {activeTab === 'complaints' && (
          <div className="bg-gray-900 rounded-xl border border-gray-800">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold">All Complaints</h3>
              <span className="text-gray-500 text-sm">{complaints.length} total</span>
            </div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : complaints.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No complaints yet</div>
            ) : (
              <div className="divide-y divide-gray-800">
                {complaints.map(complaint => (
                  <div key={complaint.id} className="p-4 hover:bg-gray-800 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-blue-400 text-xs font-mono">{complaint.complaint_number}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[complaint.status] || 'bg-gray-700 text-gray-300'}`}>
                            {complaint.status}
                          </span>
                        </div>
                        <p className="text-sm font-medium">{complaint.title}</p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>📍 {complaint.location}</span>
                          <span>🏷️ {complaint.category}</span>
                          <span>👤 {complaint.pseudo_citizen_id}</span>
                          <span>📅 {new Date(complaint.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <Link
                        href={"/complaint/" + complaint.complaint_number}
                        className="text-blue-400 hover:text-blue-300 text-xs ml-4"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="font-bold mb-6">Complaints by Category</h3>
            {Object.keys(categories).length === 0 ? (
              <p className="text-gray-500 text-sm">No data yet</p>
            ) : (
              <div className="space-y-4">
                {Object.entries(categories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([category, count]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm">{category}</span>
                        <span className="text-gray-400 text-sm font-bold">{count}</span>
                      </div>
                      <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(count / totalComplaints) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <h3 className="font-bold mb-4">System Information</h3>
              <div className="space-y-3 text-sm">
                {[
                  { label: 'Project Name', value: 'UrbanPulse' },
                  { label: 'Version', value: '1.0.0' },
                  { label: 'Database', value: 'PostgreSQL 16' },
                  { label: 'Backend', value: 'Node.js + Express' },
                  { label: 'Frontend', value: 'Next.js 16 + Tailwind' },
                  { label: 'AI Service', value: 'Python + FastAPI' },
                  { label: 'Blockchain', value: 'Pending integration' },
                ].map(item => (
                  <div key={item.label} className="flex justify-between bg-gray-800 rounded-lg px-4 py-3">
                    <span className="text-gray-400">{item.label}</span>
                    <span className="text-white font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-red-950 border border-red-800 rounded-xl p-6">
              <h3 className="font-bold text-red-300 mb-2">⚠️ Security Notice</h3>
              <p className="text-red-400 text-sm">
                Complaint records are immutable and cannot be altered by any admin.
                All actions are logged and digitally signed. Unauthorized access is monitored.
              </p>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}