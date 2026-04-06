
/* eslint-disable @next/next/no-img-element */
'use client';
import dynamic from 'next/dynamic';
const LocationPicker = dynamic(() => import('../../components/LocationPicker'), { ssr: false });
import Link from 'next/link';
import { submitComplaint, checkProofGate, checkImage } from '../../lib/api';
import { useState, useEffect } from 'react';

export default function FileComplaint() {
  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/login';
  }
}, []);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState('');
  const [aiMessage, setAiMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    evidence: null,
    locationAccuracy: null,
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
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleFile = (e) => {
    setForm({ ...form, evidence: e.target.files[0] });
    setErrors({ ...errors, image: '' });
  };

  const handleNext = () => {
    const newErrors = {};
    if (!form.title) newErrors.title = '⚠️ Please enter a complaint title';
    if (!form.category) newErrors.category = '⚠️ Please select a category';
    if (!form.location) newErrors.location = '⚠️ Please provide your location using GPS or type it manually';
    if (form.locationAccuracy === 'low') newErrors.location = '❌ Location accuracy too low — please try GPS again or move to open area';
    if (form.description.split(' ').filter(w => w).length < 10)
      newErrors.description = `⚠️ Description too short — ${form.description.split(' ').filter(w => w).length} words written. Need at least 10 words`;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrors({});
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
        setLoading(false);
        setAiMessage('');
        setErrors({ ai: textCheck.issues.join('\n') });
        return;
      }

      // Step 2 — AI Image Check
      if (form.evidence) {
        setAiMessage('🤖 Scanning image for authenticity...');
        const imageCheck = await checkImage(form.evidence);
        if (!imageCheck.passed) {
          setLoading(false);
          setAiMessage('');
          setErrors({
            image: imageCheck.issues.join('\n')
          });
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
      }, form.evidence);

      if (result.success) {
        setComplaintId(result.complaint.complaint_number);
        setStep(3);
      } else {
        setErrors({ submit: '❌ ' + result.message });
      }
    } catch (error) {
      setErrors({ submit: '❌ ' + error.message });
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

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Complaint Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Broken road near bus stand"
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-700'}`}
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 ${errors.category ? 'border-red-500' : 'border-gray-700'}`}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                  <span className="text-red-400 ml-1">*</span>
                  <span className="text-gray-500 font-normal ml-2">(Live GPS required)</span>
                </label>
                <LocationPicker
                  onLocationSelect={(loc) => {
                    setForm(prev => ({
                      ...prev,
                      location: loc.address,
                      locationAccuracy: loc.accuracyLevel
                    }));
                    setErrors(prev => ({ ...prev, location: '' }));
                  }}
                  onAccuracyChange={(level) => {
                    setForm(prev => ({ ...prev, locationAccuracy: level }));
                  }}
                />
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Anna Nagar, Chennai"
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mt-2 ${errors.location ? 'border-red-500' : 'border-gray-700'}`}
                />
                {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
              </div>

              {/* Description */}
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
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none ${errors.description ? 'border-red-500' : 'border-gray-700'}`}
                />
                <div className="flex justify-between items-center mt-1">
                  <div>
                    {errors.description && <p className="text-red-400 text-xs">{errors.description}</p>}
                  </div>
                  <span className={`text-xs ${form.description.split(' ').filter(w => w).length >= 10 ? 'text-green-400' : 'text-gray-500'}`}>
                    {form.description.split(' ').filter(w => w).length}/10 words
                  </span>
                </div>
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
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

              {/* File Upload */}
              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center hover:border-blue-500 transition cursor-pointer ${errors.image ? 'border-red-500' : 'border-gray-700'}`}
                onClick={() => document.getElementById('fileInput').click()}
              >
                {form.evidence ? (
                  <div>
                    <div className="text-4xl mb-3">✅</div>
                    <p className="text-green-400 font-medium">{form.evidence.name}</p>
                    <p className="text-gray-500 text-sm mt-1">
                      {(form.evidence.size / 1024 / 1024).toFixed(2)} MB — Click to change
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-4xl mb-3">📎</div>
                    <p className="text-gray-300 font-medium">Click to upload photo or video</p>
                    <p className="text-gray-500 text-sm mt-1">JPG, PNG, WEBP, MP4 — Max 10MB</p>
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

              {/* Image Preview */}
              {form.evidence && form.evidence.type.startsWith('image') && (
                <div className="rounded-xl overflow-hidden border border-gray-700">
                  <img
                    src={URL.createObjectURL(form.evidence)}
                    alt="Evidence preview"
                    className="w-full max-h-48 object-cover"
                  />
                  <p className="text-center text-gray-500 text-xs py-2">Evidence Preview</p>
                </div>
              )}

              {/* AI Proof Gate Notice */}
              <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  🤖 <strong>AI Proof Gate:</strong> Your complaint and evidence will be
                  scanned for authenticity. AI-generated or fake images will be rejected.
                </p>
              </div>

              {/* AI Status Message */}
              {aiMessage && (
                <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm font-medium">{aiMessage}</p>
                </div>
              )}

              {/* AI Error Messages */}
              {errors.ai && (
                <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                  <p className="text-red-300 text-sm font-bold mb-1">❌ AI Proof Gate Failed:</p>
                  <p className="text-red-400 text-sm whitespace-pre-line">{errors.ai}</p>
                </div>
              )}

              {errors.image && (
                <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                  <p className="text-red-300 text-sm font-bold mb-2">🚨 Fake Image Detected by AI:</p>
                  <p className="text-red-400 text-sm whitespace-pre-line">{errors.image}</p>
                  <p className="text-red-300 text-xs mt-2">Please upload a real photo taken at the scene.</p>
                </div>
              )}

              {errors.submit && (
                <div className="bg-red-950 border border-red-800 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{errors.submit}</p>
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
                ✅ Blockchain hash generated<br />
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
