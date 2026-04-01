import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">

      {/* Navbar */}
      <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">UP</div>
    <span className="text-xl font-bold text-white">UrbanPulse</span>
  </div>
  <div className="flex items-center gap-3">
    <Link href="/complaints" className="text-gray-400 hover:text-white text-sm transition">
      View Complaints
    </Link>
    <Link href="/profile" className="text-gray-400 hover:text-white text-sm transition">
      Profile
    </Link>
    <Link href="/admin" className="text-gray-400 hover:text-white text-sm transition">
      Admin
    </Link>
    <Link href="/login" className="border border-gray-600 hover:border-gray-400 px-4 py-2 rounded-lg text-sm font-medium transition">
      Login
    </Link>
    <Link href="/file-complaint" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition">
      File Complaint
    </Link>
  </div>
</nav>

      {/* Hero Section */}
      <section className="text-center py-24 px-6">
        <div className="inline-block bg-blue-900 text-blue-300 text-sm px-4 py-1 rounded-full mb-6">
          Blockchain Powered • Tamper Proof • 100% Transparent
        </div>
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Your Voice.<br />
          <span className="text-blue-500">Public Record.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          File grievances against public issues. Every complaint is permanently
          recorded on blockchain. Every action by officials is verified and visible to all.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/file-complaint" className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition">
            File a Complaint
          </Link>
          <Link href="/complaints" className="border border-gray-600 hover:border-gray-400 px-8 py-3 rounded-lg font-semibold transition">
            View All Complaints
          </Link>
          <Link href="/login" className="border border-blue-600 hover:bg-blue-900 px-8 py-3 rounded-lg font-semibold transition text-blue-400">
            Login / Register
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-3 gap-6 max-w-3xl mx-auto px-6 mb-24">
        <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
          <div className="text-3xl font-bold text-blue-500">0</div>
          <div className="text-gray-400 text-sm mt-1">Total Complaints</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
          <div className="text-3xl font-bold text-green-500">0</div>
          <div className="text-gray-400 text-sm mt-1">Resolved</div>
        </div>
        <div className="bg-gray-900 rounded-xl p-6 text-center border border-gray-800">
          <div className="text-3xl font-bold text-yellow-500">0</div>
          <div className="text-gray-400 text-sm mt-1">Pending</div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-5xl mx-auto px-6 mb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Why UrbanPulse?</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">🔐</div>
            <h3 className="font-bold text-lg mb-2">Tamper Proof</h3>
            <p className="text-gray-400 text-sm">Every complaint is hashed on blockchain. Nobody can edit or delete it.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">🤖</div>
            <h3 className="font-bold text-lg mb-2">AI Verified</h3>
            <p className="text-gray-400 text-sm">AI checks every complaint for fake evidence before it goes live.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">👤</div>
            <h3 className="font-bold text-lg mb-2">Stay Anonymous</h3>
            <p className="text-gray-400 text-sm">Your identity is encrypted. Public only sees your pseudonymous ID.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">📎</div>
            <h3 className="font-bold text-lg mb-2">Proof Required</h3>
            <p className="text-gray-400 text-sm">Photo or video evidence is mandatory. No proof means no complaint.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">✅</div>
            <h3 className="font-bold text-lg mb-2">Proof of Action</h3>
            <p className="text-gray-400 text-sm">Every officer action is digitally signed and timestamped on chain.</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="text-3xl mb-4">👁️</div>
            <h3 className="font-bold text-lg mb-2">Full Transparency</h3>
            <p className="text-gray-400 text-sm">Anyone can view all complaints and their full resolution history.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 text-center py-8 text-gray-500 text-sm">
        UrbanPulse — Smart Transparent Public Grievance System © 2026
      </footer>

    </main>
  );
}