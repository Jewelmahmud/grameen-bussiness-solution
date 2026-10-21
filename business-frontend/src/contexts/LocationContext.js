import React, { createContext, useContext, useState, useEffect } from 'react';
import locationsData from '../json/locations.json';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load location from localStorage on mount
  useEffect(() => {
    const loadLocationFromStorage = () => {
      try {
        const storedLocation = localStorage.getItem('userLocation');
        if (storedLocation) {
          const locationData = JSON.parse(storedLocation);
          setUserLocation(locationData);
        }
      } catch (error) {
        console.error('Error loading location from storage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLocationFromStorage();
  }, []);

  // Update location and save to localStorage
  const updateLocation = (locationData) => {
    setUserLocation(locationData);
    if (locationData) {
      localStorage.setItem('userLocation', JSON.stringify(locationData));
    } else {
      localStorage.removeItem('userLocation');
    }
  };

  // Clear location
  const clearLocation = () => {
    setUserLocation(null);
    localStorage.removeItem('userLocation');
  };

  // Get formatted location string
  const getFormattedLocation = () => {
    const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn';
    const langKey = preferredLanguage === 'en' ? 'en' : 'bn';
    if (!userLocation) return langKey === 'en' ? 'Select location' : 'অবস্থান নির্বাচন করুন';

    const { district: storedDistrict, upazilla: storedUpazilla, bazar: storedBazar } = userLocation;

    const resolveName = (obj, fallback) => (obj && (obj[langKey] || obj.bn)) || fallback || '';

    // Find district by bn or en
    const districtObj = locationsData.districts.find(d => d.bn === storedDistrict || d.en === storedDistrict || d.name === storedDistrict);
    const districtName = resolveName(districtObj, storedDistrict);

    // Find upazila within district
    const upazilaObj = districtObj?.upazilas?.find(u => u.bn === storedUpazilla || u.en === storedUpazilla);
    const upazilaName = resolveName(upazilaObj, storedUpazilla);

    // Find bazar within upazila (if upazila matched), otherwise search all upazilas in district
    let bazarObj = upazilaObj?.bazars?.find(b => b.bn === storedBazar || b.en === storedBazar);
    if (!bazarObj && districtObj) {
      for (const u of districtObj.upazilas || []) {
        const found = u.bazars?.find(b => b.bn === storedBazar || b.en === storedBazar);
        if (found) { bazarObj = found; break; }
      }
    }
    const bazarName = resolveName(bazarObj, storedBazar);

    return `${bazarName}, ${upazilaName}, ${districtName}`.trim();
  };

  // Get short formatted location (for mobile)
  const getShortFormattedLocation = () => {
    const preferredLanguage = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn';
    const langKey = preferredLanguage === 'en' ? 'en' : 'bn';
    if (!userLocation) return langKey === 'en' ? 'Location' : 'অবস্থান';

    const { district: storedDistrict, upazilla: storedUpazilla } = userLocation;

    const districtObj = locationsData.districts.find(d => d.bn === storedDistrict || d.en === storedDistrict || d.name === storedDistrict);
    const districtName = (districtObj && (districtObj[langKey] || districtObj.bn)) || storedDistrict || '';

    const upazilaObj = districtObj?.upazilas?.find(u => u.bn === storedUpazilla || u.en === storedUpazilla);
    const upazilaName = (upazilaObj && (upazilaObj[langKey] || upazilaObj.bn)) || storedUpazilla || '';

    return `${upazilaName}, ${districtName}`.trim();
  };

  const value = {
    userLocation,
    isLoading,
    updateLocation,
    clearLocation,
    getFormattedLocation,
    getShortFormattedLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

export default LocationContext; 