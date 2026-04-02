'use client';
import { useState } from 'react';

export default function LocationPicker({ onLocationSelect, onAccuracyChange }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [accuracyLevel, setAccuracyLevel] = useState(null);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          // Check accuracy level
          let level = 'low';
          if (accuracy <= 100) level = 'high';
          else if (accuracy <= 500) level = 'medium';
          else level = 'low';

          setAccuracyLevel(level);
          setPosition({ lat: latitude, lng: longitude, accuracy });

          if (onAccuracyChange) onAccuracyChange(level);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const addr = data.display_name || `${latitude}, ${longitude}`;
            setAddress(addr);
            onLocationSelect({
              lat: latitude,
              lng: longitude,
              address: addr,
              accuracy: accuracy,
              accuracyLevel: level,
            });
          } catch (error) {
            const addr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setAddress(addr);
            onLocationSelect({ lat: latitude, lng: longitude, address: addr, accuracy, accuracyLevel: level });
          }
          setLoading(false);
        },
        (err) => {
          alert('❌ Could not get location. Please allow location access and try again.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      alert('❌ Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={getCurrentLocation}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 py-3 rounded-lg text-sm font-medium transition disabled:opacity-50"
      >
        {loading ? (
          <>⏳ Getting your location...</>
        ) : (
          <>📍 Get My Live Location (Required)</>
        )}
      </button>

      {/* Accuracy Warning */}
      {position && accuracyLevel === 'low' && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-3">
          <p className="text-red-300 text-sm">
            ❌ <strong>Location accuracy too low</strong> — ±{Math.round(position.accuracy)}m<br/>
            Please move to an open area and try again. Medium accuracy required.
          </p>
          <button
            onClick={getCurrentLocation}
            className="mt-2 text-red-400 hover:text-red-300 text-xs underline"
          >
            Try again
          </button>
        </div>
      )}

      {position && accuracyLevel === 'medium' && (
        <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-3">
          <p className="text-yellow-300 text-sm">
            ⚠️ <strong>Medium accuracy</strong> — ±{Math.round(position.accuracy)}m — Accepted
          </p>
        </div>
      )}

      {position && accuracyLevel === 'high' && (
        <div className="bg-green-950 border border-green-800 rounded-lg p-3">
          <p className="text-green-300 text-sm">
            ✅ <strong>High accuracy</strong> — ±{Math.round(position.accuracy)}m — 
          </p>
        </div>
      )}

      {position && (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-white text-sm">{address}</p>
          <p className="text-gray-500 text-xs mt-1">
            📐 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </p>
        </div>
      )}

      <div className="text-center text-gray-600 text-xs">
        — or type location manually below —
      </div>
    </div>
  );
}