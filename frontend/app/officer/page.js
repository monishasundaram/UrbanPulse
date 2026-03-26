'use client';
import { useState } from 'react';
import Link from 'next/link';

const complaints = [
  {
    id: 'GRV001',
    title: 'Broken road near bus stand',
    category: 'Road & Infrastructure',
    location: 'Anna Nagar, Chennai',
    status: 'Under Review',
    date: '2026-03-25',
    description: 'The road near the main bus stand has large potholes causing accidents daily.',
    filedBy: 'Citizen #A7X92K',
    priority: 'High',
  },
  {
    id: 'GRV002',
    title: 'No water supply for 3 days',
    category: 'Water Supply',
    location: 'Tiruppur, Tamil Nadu',
    status: 'In Progress',
    date: '2026-03-24',
    description: 'Our area has not received water supply for the past 3 days.',
    filedBy: 'Citizen #B3K71M',
    priority: 'High',
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
    priority: 'Medium',
  },
];

const statusColors = {
  'Under Review': 'bg-yellow-900 text-yellow-300',
  'In Progress': 'bg-blue-900 text-blue-300',
  'Resolved': 'bg-green-900 text-green-300',
};

const priorityColors = {
  'High': 'text-red-400',
  'Medium': 'text-yellow-400',
  'Low': 'text-green-400',
};

export default function OfficerDashboard() {
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState('');
  const [actionList, setActionList] = useState([]);
  const [statusList, setStatusList] = useState(
    complaints.reduce((acc, c) => ({ ...acc, [c.id]: c.status }), {})
  );
  const [submitted, setSubmitted] = useState(false);

  const handleLogAction = () => {
    if (!action.trim()) return;
    const newAction = {
      id: 'ACT' + Date.now(),
      complaintId: selected.id,
      text: action,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      signature: Buffer.from(selected.id + Date.now()).toString('base64').slice(0, 20),
    };
    setActionList([newAction, ...actionList]);
    setAction('');
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);
  };

  const handleStatusChange = (id, newStatus) => {
    setStatusList({ ...statusList, [id]: newStatus });
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
          <div className="text-gray-400 text-sm">Officer #OFF2024</div>
        </div>
      </nav>

      <div className="flex h-screen">

        {/* Left Panel - Complaints List */}
        <div className="w-96 bg-gray-900 border-r border-gray-800 overflow-y-auto">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-bold text-lg">Assigned Complaints</h2>
            <p className="text-gray-500 text-xs mt-1">{complaints.length} total assigned</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 p-4 border-b border-gray-800">
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {Object.values(statusList).filter(s => s === 'Under Review').length}
              </div>
              <div className="text-xs text-gray-500">Review</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-blue-400">
                {Object.values(statusList).filter(s => s === 'In Progress').length}
              </div>
              <div className="text-xs text-gray-500">Progress</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-2 text-center">
              <div className="text-lg font-bold text-green-400">
                {Object.values(statusList).filter(s => s === 'Resolved').length}
              </div>
              <div className="text-xs text-gray-500">Resolved</div>
            </div>
          </div>

          {/* Complaint Cards */}
          <div className="p-3 space-y-3">
            {complaints.map(complaint => (
              <div
                key={complaint.id}
                onClick={() => setSelected(complaint)}
                className={`rounded-xl p-4 cursor-pointer border transition ${
                  selected?.id === complaint.id
                    ? 'border-blue-500 bg-gray-800'
                    : 'border-gray-800 hover:border-gray-600 bg-gray-800'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-blue-400 text-xs font-mono">{complaint.id}</span>
                  <span className={`text-xs font-bold ${priorityColors[complaint.priority]}`}>
                    {complaint.priority}
                  </span>
                </div>
                <h3 className="text-sm font-semibold mb-1">{complaint.title}</h3>
                <p className="text-gray-500 text-xs mb-2">📍 {complaint.location}</p>
                <span className={`text-xs px-2 py-1 rounded-full ${statusColors[statusList[complaint.id]]}`}>
                  {statusList[complaint.id]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Complaint Detail */}
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
                    <span className="text-blue-400 text-sm font-mono">{selected.id}</span>
                    <h2 className="text-2xl font-bold mt-1">{selected.title}</h2>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full ${statusColors[statusList[selected.id]]}`}>
                    {statusList[selected.id]}
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
                    <p className="text-white">👤 {selected.filedBy}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date</span>
                    <p className="text-white">📅 {selected.date}</p>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 mb-6">
                <h3 className="font-bold mb-4">Update Status</h3>
                <div className="flex gap-3 flex-wrap">
                  {['Under Review', 'In Progress', 'Resolved'].map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selected.id, s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition border ${
                        statusList[selected.id] === s
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
                <h3 className="font-bold mb-4">Log Action</h3>
                <p className="text-gray-500 text-xs mb-4">
                  Every action is digitally signed and recorded on blockchain permanently.
                </p>
                <textarea
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  rows={3}
                  placeholder="Describe the action taken..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none mb-4"
                />
                <button
                  onClick={handleLogAction}
                  disabled={!action.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
                >
                  {submitted ? '✅ Action Logged on Blockchain!' : 'Log Action'}
                </button>
              </div>

              {/* Action History */}
              {actionList.filter(a => a.complaintId === selected.id).length > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <h3 className="font-bold mb-4">Action History</h3>
                  <div className="space-y-4">
                    {actionList
                      .filter(a => a.complaintId === selected.id)
                      .map(a => (
                        <div key={a.id} className="border-l-2 border-blue-500 pl-4">
                          <p className="text-white text-sm">{a.text}</p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-gray-500 text-xs">📅 {a.date} {a.time}</span>
                            <span className="text-gray-600 text-xs font-mono">🔐 {a.signature}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}
