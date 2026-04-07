'use client';
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue with Next.js/Webpack
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

function LocationMarker({ position, setPosition, setAddress }) {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition({ lat, lng });
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          setAddress(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }).catch(() => {});
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>Problem Location</Popup>
    </Marker>
  );
}

export default function LocationPicker({ onLocationSelect, onAccuracyChange }) {
  const [userLocation, setUserLocation] = useState(null);
  const [problemLocation, setProblemLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [accuracyLevel, setAccuracyLevel] = useState(null);

  useEffect(() => {
    if (userLocation && problemLocation) {
        onLocationSelect({
            gpsLocation: userLocation,
            problemLocation: problemLocation,
            address: address,
            accuracyLevel: accuracyLevel
        });
    }
  }, [userLocation, problemLocation, address, accuracyLevel, onLocationSelect]);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          let level = 'low';
          if (accuracy <= 100) level = 'high';
          else if (accuracy <= 500) level = 'medium';
          else level = 'low';

          setAccuracyLevel(level);
          setUserLocation({ lat: latitude, lng: longitude, accuracy });
          
          // Initially set problem location to user location
          if (!problemLocation) {
              setProblemLocation({ lat: latitude, lng: longitude });
          }

          if (onAccuracyChange) onAccuracyChange(level);

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            const addr = data.display_name || `${latitude}, ${longitude}`;
            setAddress(addr);
          } catch (error) {}
          
          setLoading(false);
        },
        (err) => {
          alert('❌ Could not get location. Please allow location access and try again.');
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
        {loading ? <>⏳ Getting your location...</> : <>📍 Get My Live Location (Required)</>}
      </button>

      {userLocation && accuracyLevel === 'low' && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-3">
          <p className="text-red-300 text-sm">
            ❌ <strong>Location accuracy too low</strong> — ±{Math.round(userLocation.accuracy)}m<br/>
            Please move to an open area and try again. Medium accuracy required.
          </p>
          <button onClick={getCurrentLocation} className="mt-2 text-red-400 hover:text-red-300 text-xs underline">
            Try again
          </button>
        </div>
      )}

      {userLocation && (
        <>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-white text-sm">🎯 <strong>User Location:</strong> Captured (±{Math.round(userLocation.accuracy)}m)</p>
          <p className="text-gray-400 text-sm mt-2">🗺️ <strong>Problem Location:</strong> {address}</p>
          <p className="text-gray-500 text-xs mt-1">Tap Map below to fine-tune problem location.</p>
        </div>
        
        {/* Leaflet Map for fine-tuning */}
        <div className="h-64 w-full rounded-xl overflow-hidden border border-gray-700 z-0">
          <MapContainer 
            center={[userLocation.lat, userLocation.lng]} 
            zoom={15} 
            scrollWheelZoom={false} 
            style={{ height: '100%', width: '100%', zIndex: 0 }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* User GPS Location (Blue dot simulation) */}
            <Marker position={[userLocation.lat, userLocation.lng]} icon={L.divIcon({className: 'bg-blue-500 w-4 h-4 rounded-full border-2 border-white'})}>
                <Popup>Your Location</Popup>
            </Marker>
            
            {/* Draggable Problem Location */}
            <LocationMarker position={problemLocation} setPosition={setProblemLocation} setAddress={setAddress} />
            
            <MapUpdater center={problemLocation || userLocation} />
          </MapContainer>
        </div>
        </>
      )}
    </div>
  );
}

// Helper to center map if problemLocation changes
function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
}