'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function OfficerLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/officer-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('officerToken', data.token);
        localStorage.setItem('officerId', data.officerId);
        localStorage.setItem('officerName', data.name);
        router.push('/officer');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Connection failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">

          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm text-white">UP</div>
              <span className="text-xl font-bold text-white">UrbanPulse</span>
            </Link>
            <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👮</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Officer Login</h1>
            <p className="text-gray-500 text-sm mt-1">Authorized personnel only</p>
          </div>

          {/* Warning */}
          <div className="bg-yellow-900 border border-yellow-700 rounded-xl p-3 mb-6 text-center">
            <p className="text-yellow-300 text-xs">🔒 This portal is restricted to verified government officers only</p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-2 block">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter your password"
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded-xl p-3 text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={!username || !password || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-xl font-semibold text-white transition"
            >
              {loading ? 'Logging in...' : 'Login as Officer'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link href="/" className="text-gray-600 text-sm hover:text-gray-400">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}