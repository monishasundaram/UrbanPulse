'use client';
import { useState } from 'react';
import Link from 'next/link';
import { submitComplaint, checkProofGate, checkImage } from '../../lib/api';

export default function FileComplaint() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    evidence: null,
  });

  const categories = [
    'Road & Infrastructure',
    'Water Supply',
    'Electricity',
    'Garbage & Sanitation',
    'Corruption',
    'Public Safety',
    'Government Services',
    'Other',
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFile = (e) => {
    setForm({ ...form, evidence: e.target.files[0] });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setAiMessage('🤖 Checking complaint text...');
    try {
      // Step 1 — AI Text Check
      const textCheck = await checkProofGate({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
      });

      if (!textCheck.passed) {
        alert('❌ AI Proof Gate Failed:\n\n' + textCheck.issues.join('\n'));
        setLoading(false);
        setAiMessage('');
        return;
      }

      // Step 2 — AI Image Check
      if (form.evidence) {
        setAiMessage('🤖 Scanning image for authenticity...');
        const imageCheck = await checkImage(form.evidence);
        if (!imageCheck.passed) {
          alert('❌ Image Check Failed:\n\n' + imageCheck.issues.join('\n'));
          setLoading(false);
          setAiMessage('');
          return;
        }
      }

      // Step 3 — Submit Complaint
      setAiMessage('✅ AI checks passed! Submitting...');
      const result = await submitComplaint({
        title: form.title,
        description: form.description,
        category: form.category,
        location: form.location,
        pseudo_citizen_id: 'ANONYMOUS',
      });

      if (result.success) {
        setComplaintId(result.complaint.complaint_number);
        setStep(3);
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
    setAiMessage('');
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">UP</div>
          <span className="text-xl font-bold text-white">UrbanPulse</span>
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-500' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 1 ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-600'}`}>1</div>
            <span className="text-sm">Details</span>
          </div>
          <div className={`h-px w-12 ${step >= 2 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-500' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 2 ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-600'}`}>2</div>
            <span className="text-sm">Evidence</span>
          </div>
          <div className={`h-px w-12 ${step >= 3 ? 'bg-blue-500' : 'bg-gray-700'}`}></div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-500' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${step >= 3 ? 'border-blue-500 bg-blue-500 text-white' : 'border-gray-600'}`}>3</div>
            <span className="text-sm">Submitted</span>
          </div>
        </div>

        {/* Step 1 - Complaint Details */}
        {step === 1 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h1 className="text-2xl font-bold mb-2">File a Complaint</h1>
            <p className="text-gray-400 text-sm mb-8">Your identity will remain anonymous to the public.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Complaint Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Broken road near bus stand"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Anna Nagar, Chennai"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                  <span className="text-gray-500 font-normal ml-2">(minimum 10 words)</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe the issue in detail..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
                <div className="text-right text-xs text-gray-500 mt-1">
                  {form.description.split(' ').filter(w => w).length} words
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!form.title || !form.category || !form.location || form.description.split(' ').filter(w => w).length < 10}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
              >
                Next — Add Evidence
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Evidence Upload */}
        {step === 2 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
            <h1 className="text-2xl font-bold mb-2">Upload Evidence</h1>
            <p className="text-gray-400 text-sm mb-8">
              Photo or video is mandatory. Complaint will be rejected without valid proof.
            </p>

            <div className="space-y-6">
              <div
                className="border-2 border-dashed border-gray-700 rounded-xl p-10 text-center hover:border-blue-500 transition cursor-pointer"
                onClick={() => document.getElementById('fileInput').click()}
              >
                {form.evidence ? (
                  <div>
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-green-400 font-medium">{form.evidence.name}</p>
                    <p className="text-gray-500 text-sm mt-1">Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">📎</div>
                    <p className="text-gray-300 font-medium">Click to upload photo or video</p>
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG, MP4 supported</p>
                  </div>
                )}
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </div>

              {/* AI Proof Gate Notice */}
              <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  🤖 <strong>AI Proof Gate:</strong> Your complaint and evidence will be
                  scanned for authenticity before submission.
                </p>
              </div>

              {/* AI Status Message */}
              {aiMessage && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm font-medium">{aiMessage}</p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="w-full border border-gray-600 hover:border-gray-400 disabled:opacity-50 py-3 rounded-lg font-semibold transition"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!form.evidence || loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
                >
                  {loading ? aiMessage || '🤖 AI Checking...' : 'Submit Complaint'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 - Success */}
        {step === 3 && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-2xl font-bold mb-2">Complaint Submitted!</h1>
            <p className="text-gray-400 mb-6">Your complaint has been recorded successfully.</p>

            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <p className="text-gray-400 text-sm mb-1">Your Complaint ID</p>
              <p className="text-2xl font-bold text-blue-400">{complaintId}</p>
              <p className="text-gray-500 text-xs mt-2">Save this ID to track your complaint</p>
            </div>

            <div className="bg-green-950 border border-green-800 rounded-lg p-4 mb-8 text-left">
              <p className="text-green-300 text-sm">
                ✅ AI verification passed<br />
                ✅ Complaint saved to database<br />
                ✅ Evidence stored securely<br />
                ✅ Your identity is protected
              </p>
            </div>

            <div className="flex gap-4">
              <Link href="/" className="w-full border border-gray-600 hover:border-gray-400 py-3 rounded-lg font-semibold transition text-center">
                Go Home
              </Link>
              <Link href="/complaints" className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition text-center">
                View Complaints
              </Link>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}