'use client';
import { useEffect, useState } from 'react';
import { getComplaints } from '../../lib/api';
import Link from 'next/link';

const sampleComplaints = [
  {
    id: 'GRV001',
    title: 'Broken road near bus stand',
    category: 'Road & Infrastructure',
    location: 'Anna Nagar, Chennai',
    status: 'Under Review',
    date: '2026-03-25',
    description: 'The road near the main bus stand has large potholes causing accidents daily.',
    filedBy: 'Citizen #A7X92K',
  },
  {
    id: 'GRV002',
    title: 'No water supply for 3 days',
    category: 'Water Supply',
    location: 'Tiruppur, Tamil Nadu',
    status: 'In Progress',
    date: '2026-03-24',
    description: 'Our area has not received water supply for the past 3 days with no explanation.',
    filedBy: 'Citizen #B3K71M',
  },
  {
    id: 'GRV003',
    title: 'Street lights not working',
    category: 'Electricity',
    location: 'Coimbatore, Tamil Nadu',
    status: 'Resolved',
    date: '2026-03-20',
    description: 'All street lights on main road have been non functional for 2 weeks.',
    filedBy: 'Citizen #C9P44R',
  },
];

const statusColors = {
  'Filed': 'bg-gray-700 text-gray-300',
  'Under Review': 'bg-yellow-900 text-yellow-300',
  'In Progress': 'bg-blue-900 text-blue-300',
  'Resolved': 'bg-green-900 text-green-300',
};

export default function Complaints() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [complaints, setComplaints] = useState(sampleComplaints);

useEffect(() => {
  getComplaints().then(data => {
    if (data.success && data.complaints.length > 0) {
      setComplaints(data.complaints);
    }
  });
}, []);

  const statuses = ['All', 'Filed', 'Under Review', 'In Progress', 'Resolved'];

  const filtered = sampleComplaints.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'All' || c.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">UP</div>
          <span className="text-xl font-bold text-white">UrbanPulse</span>
        </Link>
        <Link href="/file-complaint" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
          File Complaint
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Public Complaints</h1>
          <p className="text-gray-400">All complaints are publicly visible. Every action is recorded on blockchain.</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mb-8">
          <input
            type="text"
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', value: sampleComplaints.length, color: 'text-white' },
            { label: 'Under Review', value: sampleComplaints.filter(c => c.status === 'Under Review').length, color: 'text-yellow-400' },
            { label: 'In Progress', value: sampleComplaints.filter(c => c.status === 'In Progress').length, color: 'text-blue-400' },
            { label: 'Resolved', value: sampleComplaints.filter(c => c.status === 'Resolved').length, color: 'text-green-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-gray-900 rounded-xl p-4 text-center border border-gray-800">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-gray-500 text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Complaints List */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No complaints found
            </div>
          ) : (
            filtered.map(complaint => (
              <div key={complaint.id} className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-gray-600 transition">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-blue-400 text-sm font-mono">{complaint.id}</span>
                    <h3 className="text-lg font-semibold mt-1">{complaint.title}</h3>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[complaint.status]}`}>
                    {complaint.status}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{complaint.description}</p>
                <div className="flex gap-6 text-xs text-gray-500">
                  <span>📍 {complaint.location}</span>
                  <span>🏷️ {complaint.category}</span>
                  <span>📅 {complaint.date}</span>
                  <span>👤 {complaint.filedBy}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
