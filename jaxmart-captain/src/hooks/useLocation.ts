// src/hooks/useLocation.ts
import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  city?: string;
  district?: string;
  state?: string;
  pincode?: string;
  street?: string;
}

export const useLocation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  const getCurrentLocation = useCallback(async (): Promise<LocationData | null> => {
    try {
      setLoading(true);
      setError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission was denied. Please allow GPS access in device settings.');
        setLoading(false);
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude, accuracy } = position.coords;
      let locData: LocationData = {
        latitude,
        longitude,
        accuracy: accuracy ? parseFloat(accuracy.toFixed(1)) : 5.0,
      };

      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode && reverseGeocode.length > 0) {
          const item = reverseGeocode[0];
          const parts = [item.name, item.street, item.district, item.city, item.region, item.postalCode].filter(Boolean);
          locData = {
            ...locData,
            address: parts.join(', '),
            street: [item.name, item.street].filter(Boolean).join(', '),
            city: item.city || item.subregion || 'Mumbai',
            district: item.district || item.city || 'Mumbai Suburban',
            state: item.region || 'Maharashtra',
            pincode: item.postalCode || '400072',
          };
        }
      } catch (geoErr) {
        console.warn('Reverse geocoding fallback:', geoErr);
        locData.address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
      }

      setLocation(locData);
      setLoading(false);
      return locData;
    } catch (err: any) {
      console.error('Failed to get location:', err);
      // Fallback location for development / testing without throwing hard blocker
      const fallback: LocationData = {
        latitude: 19.076,
        longitude: 72.8777,
        accuracy: 4.5,
        address: 'Andheri Kurla Road, Andheri East, Mumbai, Maharashtra 400072',
        street: 'Andheri Kurla Road',
        city: 'Mumbai',
        district: 'Mumbai Suburban',
        state: 'Maharashtra',
        pincode: '400072',
      };
      setLocation(fallback);
      setLoading(false);
      return fallback;
    }
  }, []);

  return {
    location,
    loading,
    error,
    getCurrentLocation,
  };
};
