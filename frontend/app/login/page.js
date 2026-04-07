'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { registerCitizen, loginCitizen } from '../../lib/api';
import { auth } from '../../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, signInWithEmailAndPassword, createUserWithEmailAndPassword, getIdToken } from "firebase/auth";

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login', 'register'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [citizenId, setCitizenId] = useState('');
  const [error, setError] = useState('');
  
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    aadhaar: '',
  });

  useEffect(() => {
    // Setup recaptcha once
    if (typeof window !== 'undefined' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: (response) => {
          // reCAPTCHA solved
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const requestOtp = async () => {
    if (mode === 'register') {
      if (form.aadhaar.length !== 12) {
        setError('❌ Aadhaar must be exactly 12 digits');
        return;
      }
      if (!form.name) {
        setError('❌ Name is required');
        return;
      }
    }
    
    if (!form.phone || form.phone.length !== 10) {
      setError('❌ Please enter your 10 digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const appVerifier = window.recaptchaVerifier;
      const phoneNumber = '+91' + form.phone; // Assuming India ISO for Aadhaar context
      
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      setShowOtp(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to send OTP. Ensure Firebase config is correct and domain is authorized.');
    }
    setLoading(false);
  };

  const verifyOtpAndSubmit = async () => {
    if (otp.length !== 6) {
      setOtpError('❌ OTP must be 6 digits');
      return;
    }

    setLoading(true);
    setOtpError('');

    try {
      // 1. Verify Firebase Phone OTP
      const result = await window.confirmationResult.confirm(otp);
      const user = result.user;
      
      // 2. Get the Firebase ID Token for backend validation (Token Based Auth)
      const idToken = await getIdToken(user, true);

      // 3. Call our Backend API
      let apiResult;
      if (mode === 'register') {
        apiResult = await registerCitizen({
          name: form.name,
          email: form.email,
          phone: form.phone,
          aadhaar: form.aadhaar,
          firebaseToken: idToken // Use token instead of password
        });
      } else {
        apiResult = await loginCitizen({
          phone: form.phone,
          firebaseToken: idToken
        });
      }

      if (apiResult.success) {
        // Save own Custom JWT or just rely on Firebase
        if (apiResult.token) {
          localStorage.setItem('token', apiResult.token);
          localStorage.setItem('pseudoId', apiResult.pseudoId);
        }
        setCitizenId(apiResult.pseudoId);
        setSuccess(true);
      } else {
        setOtpError(apiResult.message || 'Backend verification failed');
      }
    } catch (err) {
      console.error(err);
      setOtpError('Invalid OTP or Verification Failed.');
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
            {mode === 'login' ? 'You are now logged in via Firebase Auth.' : 'Your anonymous citizen account is ready.'}
          </p>
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
        
        {/* Invisible Recaptcha Container */}
        <div id="recaptcha-container"></div>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold">UP</div>
          <span className="text-2xl font-bold">UrbanPulse</span>
        </div>

        {/* Toggle */}
        <div className="flex bg-gray-800 rounded-lg p-1 mb-8">
          <button
            onClick={() => { setMode('login'); setError(''); setShowOtp(false); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'login' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Login
          </button>
          <button
            onClick={() => { setMode('register'); setError(''); setShowOtp(false); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${mode === 'register' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Register
          </button>
        </div>

        <div className="space-y-4">
          {!showOtp ? (
            <>
              {mode === 'register' && (
                <>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Aadhaar Number
                      <span className="text-gray-500 font-normal ml-2">(12 digits)</span>
                    </label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={form.aadhaar}
                      onChange={handleChange}
                      placeholder="12 digit Aadhaar number"
                      maxLength={12}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <div className="flex bg-gray-800 border border-gray-700 rounded-lg overflow-hidden focus-within:border-blue-500">
                  <span className="px-4 py-3 bg-gray-900 border-r border-gray-700 text-gray-400">+91</span>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="10 digit mobile number"
                    maxLength={10}
                    className="w-full bg-transparent px-4 py-3 text-white placeholder-gray-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-950 border border-red-800 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={requestOtp}
                disabled={loading || !form.phone}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition mt-2 flex justify-center"
              >
                {loading ? 'Sending OTP...' : mode === 'register' ? 'Verify Aadhaar via Phone OTP' : 'Login with secure OTP'}
              </button>
            </>
          ) : (
            <>
              {/* OTP Input State */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Enter 6-digit OTP</label>
                <div className="bg-blue-950 border border-blue-800 rounded-lg p-3 mb-4">
                    <p className="text-blue-300 text-xs">
                      📱 Firebase OTP sent to ending in ...{form.phone.slice(-4)}
                    </p>
                </div>

                <input
                  type="text"
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value); setOtpError(''); }}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4 tracking-widest text-center text-lg font-mono"
                />

                {otpError && (
                  <div className="bg-red-950 border border-red-800 rounded-lg p-3 mb-4">
                    <p className="text-red-300 text-sm">{otpError}</p>
                  </div>
                )}

                <button
                  onClick={verifyOtpAndSubmit}
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition mb-3"
                >
                  {loading ? 'Verifying...' : 'Verify and Submit'}
                </button>

                <button
                  onClick={() => setShowOtp(false)}
                  className="w-full border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white py-3 rounded-lg font-semibold transition"
                >
                  Back / Change Phone
                </button>
              </div>
            </>
          )}

          <div className="text-center text-sm text-gray-500 mt-6">
            {mode === 'login' ? (
              <p>Don&apos;t have an account?{' '}
                <button onClick={() => { setMode('register'); setShowOtp(false); }} className="text-blue-400 hover:text-blue-300">Register here</button>
              </p>
            ) : (
              <p>Already have an account?{' '}
                <button onClick={() => { setMode('login'); setShowOtp(false); }} className="text-blue-400 hover:text-blue-300">Login here</button>
              </p>
            )}
          </div>
          
          <div className="text-center mt-2">
            <Link href="/" className="text-gray-600 hover:text-gray-400 text-sm transition">
              ← Back to Homepage
            </Link>
          </div>
          
        </div>
      </div>
    </main>
  );
}