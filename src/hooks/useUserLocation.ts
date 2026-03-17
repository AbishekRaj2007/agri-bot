import { useState, useEffect } from 'react';

const OWM_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Normalize OWM state names to match data.gov.in Mandi API state names
const STATE_NORMALIZE: Record<string, string> = {
  'Uttaranchal': 'Uttarakhand',
  'Orissa': 'Odisha',
  'Pondicherry': 'Puducherry',
  'Andaman and Nicobar Islands': 'Andaman & Nicobar Island',
  'Dadra and Nagar Haveli': 'Dadra & Nagar Haveli',
  'Jammu and Kashmir': 'Jammu and Kashmir',
};

export interface UserLocation {
  lat: number;
  lon: number;
  state: string | null;
  city: string | null;
}

async function reverseGeocode(lat: number, lon: number): Promise<UserLocation> {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${OWM_KEY}`,
    );
    if (!res.ok) return { lat, lon, state: null, city: null };
    const data = await res.json();
    const item = data[0];
    if (!item) return { lat, lon, state: null, city: null };

    const rawState = item.state as string | undefined;
    const state = rawState ? (STATE_NORMALIZE[rawState] ?? rawState) : null;
    return { lat, lon, state, city: item.name ?? null };
  } catch {
    return { lat, lon, state: null, city: null };
  }
}

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLocating(false);
      setError('Geolocation not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const loc = OWM_KEY ? await reverseGeocode(lat, lon) : { lat, lon, state: null, city: null };
        setLocation(loc);
        setIsLocating(false);
      },
      () => {
        // Fallback: Karnal, Haryana
        setLocation({ lat: 29.6857, lon: 76.9905, state: 'Haryana', city: 'Karnal' });
        setError('Location access denied — showing Haryana prices');
        setIsLocating(false);
      },
    );
  }, []);

  return { location, isLocating, error };
}
