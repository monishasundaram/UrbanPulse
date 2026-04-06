'use client';
import { useState } from 'react';
import Link from 'next/link';
import { registerCitizen, loginCitizen } from '../../lib/api';
import { useEffect } from 'react';
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [citizenId, setCitizenId] = useState('');
  const [error, setError] = useState('');
  const [aadhaarVerified, setAadhaarVerified] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    aadhaar: '',
  });

  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "normal" },
        auth
      );
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const verifyAadhaar = () => {
    if (form.aadhaar.length !== 12) {
      setOtpError('❌ Aadhaar must be exactly 12 digits');
      return;
    }
    if (!form.phone || form.phone.length !== 10) {
      setOtpError('❌ Please enter your 10 digit mobile number first');
      return;
    }
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setShowOtp(true);
    setOtpError('');
    alert(`📱 OTP sent to mobile number ending in ...${form.phone.slice(-4)}\n\nDemo OTP: ${mockOtp}\n\n(In production this will be sent via SMS)`);
  };

  const verifyOtp = async () => {
  try {
    await window.confirmationResult.confirm(otp);
    setAadhaarVerified(true);
    setShowOtp(false);
    setOtp('');
    setOtpError('');
  } catch (error) {
    setOtpError('❌ Wrong OTP. Please try again.');
  }
};
  const handleSubmit = async () => {
    if (mode === 'register' && !aadhaarVerified) {
      setError('❌ Please verify your Aadhaar number first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      let result;
      if (mode === 'register') {
        result = await registerCitizen({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          aadhaar: form.aadhaar,
        });
      } else {
        result = await loginCitizen({
          phone: form.phone,
          password: form.password,
        });
      }

      if (result.success) {
        if (result.token) {
          localStorage.setItem('token', result.token);
          localStorage.setItem('pseudoId', result.pseudoId);
        }
        setCitizenId(result.pseudoId);
        setSuccess(true);
      } else {
        setError(result.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center max-w-md w-full mx-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back!' : 'Account Created!'}
          </h2>
          <p className="text-gray-400 mb-6">
            {mode === 'login' ? 'You are now logged in.' : 'Your anonymous citizen account is ready.'}
          </p>
          {mode === 'register' && form.email && (
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-3 mb-4">
              <p className="text-blue-300 text-xs">
                📧 Welcome email sent to {form.email}
              </p>
            </div>
          )}
          <div className="bg-gray-800 rounded-xl p-4 mb-6">
            <p className="text-gray-400 text-sm">Your Citizen ID</p>
            <p className="text-xl font-bold text-blue-400">{citizenId}</p>
            <p className="text-gray-500 text-xs mt-1">
              This is your public identity — your real info is encrypted
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/profile" className="flex-1 border border-gray-600 hover:border-gray-400 py-3 rounded-lg font-semibold transition text-center">
              My Profile
            </Link>
            <Link href="/file-complaint" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition text-center">
              File Complaint
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 max-w-md w-full mx-4">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">UP</div>
          <span className="text-2xl font-bold">UrbanPulse</span>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => { setMode('login'); setError(''); setAadhaarVerified(false); setShowOtp(false); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">

          {/* Name */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Email */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
                <span className="text-gray-500 font-normal ml-2">(for notifications)</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="10 digit mobile number"
              maxLength={10}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Aadhaar with OTP Verify */}
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aadhaar Number
                <span className="text-gray-500 font-normal ml-2">(never shown publicly)</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="aadhaar"
                  value={form.aadhaar}
                  onChange={handleChange}
                  placeholder="12 digit Aadhaar number"
                  maxLength={12}
                  disabled={aadhaarVerified}
                  className={`flex-1 bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 ${aadhaarVerified ? 'border-green-600 opacity-75' : 'border-gray-700'}`}
                />
                <button
                  type="button"
                  onClick={verifyAadhaar}
                  disabled={form.aadhaar.length !== 12 || aadhaarVerified}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition ${aadhaarVerified ? 'bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white'}`}
                >
                  {aadhaarVerified ? '✅ Done' : 'Verify'}
                </button>
              </div>

              {/* OTP Input */}
              {showOtp && (
                <div className="mt-3 space-y-2">
                  <div className="bg-blue-950 border border-blue-800 rounded-lg p-3">
                    <p className="text-blue-300 text-xs">
                      📱 OTP sent to mobile ending in ...{form.phone.slice(-4)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => { setOtp(e.target.value); setOtpError(''); }}
                      placeholder="Enter 6 digit OTP"
                      maxLength={6}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={verifyOtp}
                      disabled={otp.length !== 6}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed px-4 py-3 rounded-lg text-sm font-medium transition text-white"
                    >
                      Submit
                    </button>
                  </div>
                  {otpError && <p className="text-red-400 text-xs">{otpError}</p>}
                </div>
              )}

              {aadhaarVerified && (
                <p className="text-green-400 text-xs mt-2">✅ Aadhaar verified with mobile number!</p>
              )}
              {otpError && !showOtp && <p className="text-red-400 text-xs mt-1">{otpError}</p>}
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-950 border border-red-800 rounded-lg p-3">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {mode === 'register' && (
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
              <p className="text-blue-300 text-xs">
                🔐 <strong>Privacy Protected:</strong> Your Aadhaar and real name are encrypted and never shown publicly. You will be identified only by a random Citizen ID.
              </p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.phone || !form.password || (mode === 'register' && !aadhaarVerified)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition mt-2"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
          </button>

          {mode === 'register' && !aadhaarVerified && (
            <p className="text-yellow-400 text-xs text-center">
              ⚠️ You must verify your Aadhaar before creating account
            </p>
          )}

          <div className="text-center text-sm text-gray-500">
            {mode === 'login' ? (
              <p>Don&apos;t have an account?{' '}
                <button onClick={() => setMode('register')} className="text-blue-400 hover:text-blue-300">Register here</button>
              </p>
            ) : (
              <p>Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-blue-400 hover:text-blue-300">Login here</button>
              </p>
            )}
          </div>

          <div className="text-center">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm transition">
              ← Back to Homepage
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
