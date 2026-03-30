'use client';
import { useState } from 'react';

export default function LocationPicker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setPosition({ lat: latitude, lng: longitude, accuracy });

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
            });
          } catch (error) {
            const addr = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setAddress(addr);
            onLocationSelect({ lat: latitude, lng: longitude, address: addr });
          }
          setLoading(false);
        },
        () => {
          alert('Could not get location. Please enter manually.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy <= 50) return 'text-green-400';
    if (accuracy <= 200) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyLabel = (accuracy) => {
    if (accuracy <= 50) return 'High Accuracy';
    if (accuracy <= 200) return 'Medium Accuracy';
    return 'Low Accuracy';
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
          <>📍 Use My Current Location</>
        )}
      </button>

      {position && (
        <div className="bg-gray-800 rounded-xl p-4 border border-green-800">
          <div className="flex items-start gap-3">
            <div className="text-2xl">✅</div>
            <div className="flex-1">
              <p className="text-green-400 text-xs font-medium mb-1">Location Captured!</p>
              <p className="text-white text-sm">{address}</p>
              <p className="text-gray-500 text-xs mt-1">
                📐 {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </p>
              {position.accuracy && (
                <p className={`text-xs mt-1 ${getAccuracyColor(position.accuracy)}`}>
                  🎯 {getAccuracyLabel(position.accuracy)} — ±{Math.round(position.accuracy)}m
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accuracy explanation */}
      {position && position.accuracy > 200 && (
        <div className="bg-yellow-950 border border-yellow-800 rounded-lg p-3">
          <p className="text-yellow-300 text-xs">
            ⚠️ Low accuracy detected. This is normal for laptops without GPS.
            You can improve accuracy by typing your location manually below.
          </p>
        </div>
      )}

      <div className="text-center text-gray-600 text-xs">
        — or type location manually below —
      </div>
    </div>
  );
}