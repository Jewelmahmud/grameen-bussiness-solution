import React, { useState, useEffect, useRef } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  ListItem,
  Box
} from '@mui/material';
import {
  LocationOn,
  Search,
  Close,
  Store
} from '@mui/icons-material';
import { useLocation as useUserLocation } from '../contexts/LocationContext';
import locationsData from '../json/locations.json';
import locationBn from '../i18n/bn/location';
import locationEn from '../i18n/en/location';
import locationNp from '../i18n/np/location';
import locationPk from '../i18n/pk/location';
import locationBt from '../i18n/bt/location';
import locationDe from '../i18n/de/location';
import locationSl from '../i18n/sl/location';

const LocationSelector = ({ 
  onLocationChange, 
  sx = {},
  showBazar = true,
  variant = 'search-bar' // 'search-bar' or 'standalone'
}) => {
  const { userLocation, updateLocation } = useUserLocation();
  const isInitializing = useRef(true);
  
  // Local state for dropdowns
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazilla, setSelectedUpazilla] = useState('');
  const [selectedBazar, setSelectedBazar] = useState('');
  
  // Search states
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [upazillaSearchQuery, setUpazillaSearchQuery] = useState('');
  const [bazarSearchQuery, setBazarSearchQuery] = useState('');
  
  // Available data based on selections
  const [availableUpazillas, setAvailableUpazillas] = useState([{ bn: 'সকল উপজেলা', en: 'All Upazilas' }]);
  const [availableBazars, setAvailableBazars] = useState([{ bn: 'সকল বাজার', en: 'All Bazars' }]);

  const currentLanguage = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn';
  const t = currentLanguage === 'en' ? locationEn : currentLanguage === 'np' ? locationNp : currentLanguage === 'pk' ? locationPk : currentLanguage === 'bt' ? locationBt : currentLanguage === 'de' ? locationDe : currentLanguage === 'sl' ? locationSl : locationBn;
  const langKey = currentLanguage === 'en' ? 'en' : 'bn';

  // Initialize from userLocation context
  useEffect(() => {
    if (isInitializing.current && userLocation) {
      setSelectedDistrict(userLocation.district || 'সকল জেলা');
      setSelectedUpazilla(userLocation.upazilla || 'সকল উপজেলা');
      setSelectedBazar(userLocation.bazar || 'সকল বাজার');
      isInitializing.current = false;
    } else if (isInitializing.current && !userLocation) {
      // Set default values if no user location
      setSelectedDistrict('সকল জেলা');
      setSelectedUpazilla('সকল উপজেলা');
      setSelectedBazar('সকল বাজার');
      isInitializing.current = false;
    }
  }, [userLocation]);

  // Get districts from locations.json with proper Bangla names
  const districts = [
    { bn: 'সকল জেলা', en: 'All Districts', name: 'all' },
    ...locationsData.districts.map(district => ({ 
      bn: district.bn,
      en: district.en,
      name: district.name
    }))
  ];

  // Update available upazillas when district changes
  useEffect(() => {
    if (selectedDistrict === 'সকল জেলা' || !selectedDistrict) {
      const defaultUpazillas = [{ bn: 'সকল উপজেলা', en: 'All Upazilas' }];
      const defaultBazars = [{ bn: 'সকল বাজার', en: 'All Bazars' }];
      
      setAvailableUpazillas(defaultUpazillas);
      setAvailableBazars(defaultBazars);
    } else {
      // Find district by Bangla name
      const selectedDistrictData = locationsData.districts.find(
        district => district.bn === selectedDistrict
      );
      
      
      if (selectedDistrictData) {
        const upazillas = [
          { bn: 'সকল উপজেলা', en: 'All Upazilas' },
          ...selectedDistrictData.upazilas.map(upazila => ({ bn: upazila.bn, en: upazila.en }))
        ];
        
        setAvailableUpazillas(upazillas);
        
        // Get all bazars from all upazilas in the district
        const allBazars = selectedDistrictData.upazilas.reduce((acc, upazila) => {
          return [...acc, ...upazila.bazars];
        }, []);
        
        const bazarsWithDefault = [
          { bn: 'সকল বাজার', en: 'All Bazars' },
          ...allBazars
        ];
        
        setAvailableBazars(bazarsWithDefault);
      }
    }
  }, [selectedDistrict]);

  // Update available bazars when upazilla changes
  useEffect(() => {
    if (selectedUpazilla === 'সকল উপজেলা' || !selectedUpazilla || selectedDistrict === 'সকল জেলা') {
      // Keep all bazars from the district
      return;
    }
    
    // Find district by Bangla name
    const selectedDistrictData = locationsData.districts.find(
      district => district.bn === selectedDistrict
    );
    
    if (selectedDistrictData) {
      const selectedUpazilaData = selectedDistrictData.upazilas.find(
        upazila => upazila.bn === selectedUpazilla
      );
      
      
      if (selectedUpazilaData) {
        const bazars = [
          { bn: 'সকল বাজার', en: 'All Bazars' },
          ...selectedUpazilaData.bazars
        ];
        
        setAvailableBazars(bazars);
      }
    }
  }, [selectedUpazilla, selectedDistrict]);

  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    
    // Only reset dependent selections if changing to a different district
    if (district === 'সকল জেলা') {
      setSelectedUpazilla('সকল উপজেলা');
      setSelectedBazar('সকল বাজার');
    } else {
      // Reset to default values for new district
      setSelectedUpazilla('সকল উপজেলা');
      setSelectedBazar('সকল বাজার');
    }
    
    setUpazillaSearchQuery('');
    setBazarSearchQuery('');
    
    // Update context and notify parent only if not initializing
    if (!isInitializing.current) {
      const newLocation = {
        district,
        upazilla: 'সকল উপজেলা',
        bazar: 'সকল বাজার'
      };
      updateLocation(newLocation);
      if (onLocationChange) {
        onLocationChange(newLocation);
      }
    }
  };

  const handleUpazillaChange = (event) => {
    const upazilla = event.target.value;
    setSelectedUpazilla(upazilla);
    
    // Reset bazar selection when upazilla changes
    setSelectedBazar('সকল বাজার');
    setBazarSearchQuery('');
    
    // Update context and notify parent only if not initializing
    if (!isInitializing.current) {
      const newLocation = {
        district: selectedDistrict,
        upazilla,
        bazar: 'সকল বাজার'
      };
      updateLocation(newLocation);
      if (onLocationChange) {
        onLocationChange(newLocation);
      }
    }
  };

  const handleBazarChange = (event) => {
    const bazar = event.target.value;
    setSelectedBazar(bazar);
    
    // Update context and notify parent only if not initializing
    if (!isInitializing.current) {
      const newLocation = {
        district: selectedDistrict,
        upazilla: selectedUpazilla,
        bazar
      };
      updateLocation(newLocation);
      if (onLocationChange) {
        onLocationChange(newLocation);
      }
    }
  };

  // Filter functions
  const filteredDistricts = districts.filter(
    district => (district[langKey] || district.bn).toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  const filteredUpazillas = availableUpazillas.filter(
    upazilla => (upazilla[langKey] || upazilla.bn).toLowerCase().includes(upazillaSearchQuery.toLowerCase())
  );

  const filteredBazars = availableBazars.filter(
    bazar => (bazar[langKey] || bazar.bn).toLowerCase().includes(bazarSearchQuery.toLowerCase())
  );

  const dropdownStyle = {
    minWidth: { xs: 110, sm: 140, md: 160 },
    zIndex: 2,
    mr: variant === 'search-bar' ? 1 : 0,
    mb: variant === 'standalone' ? 2 : 0,
    '& .MuiOutlinedInput-root': {
      backgroundColor: variant === 'search-bar' ? 'rgba(255, 255, 255, 0.92)' : 'white',
      borderRadius: 2,
      boxShadow: variant === 'search-bar' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
    },
  };

  const labelStyle = {
    backgroundColor: variant === 'search-bar' ? 'rgba(255, 255, 255, 0.9)' : 'white',
    px: 1,
    borderRadius: '4px'
  };

  // Common MenuProps to prevent scrollbar issues
  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      },
    },
    disableScrollLock: true, // This prevents body scroll lock
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: variant === 'search-bar' ? { xs: 'column', sm: 'row' } : 'column',
      gap: variant === 'search-bar' ? { xs: 1, sm: 0.5 } : 0,
      flexWrap: 'nowrap',
      width: variant === 'search-bar' ? { xs: '100%', sm: 'auto' } : 'auto',
      ...sx 
    }}>
      {/* District Dropdown */}
      <FormControl sx={dropdownStyle}>
        <InputLabel id="district-select-label" sx={labelStyle}>
          <LocationOn sx={{ mr: 0.5, fontSize: 20 }} />
          {t.selector.districtLabel}
        </InputLabel>
        <Select
          labelId="district-select-label"
          value={selectedDistrict}
          onChange={handleDistrictChange}
          label={t.selector.districtLabel}
          sx={{ borderRadius: 2 }}
          MenuProps={menuProps}
          onClose={() => setDistrictSearchQuery('')}
        >
          <ListItem dense sx={{ p: 0, pt: 1, pb: 2 }}>
            <TextField
              size="small"
              autoFocus
              placeholder={t.selector.districtSearchPlaceholder}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: districtSearchQuery ? (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setDistrictSearchQuery('')}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              value={districtSearchQuery}
              onChange={(e) => setDistrictSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                px: 1,
                mb: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 1 }
              }}
            />
          </ListItem>
          {filteredDistricts.map((district) => (
            <MenuItem key={district.bn} value={district.bn}>
              {district[langKey] || district.bn}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Upazilla Dropdown */}
      <FormControl sx={dropdownStyle}>
        <InputLabel id="upazilla-select-label" sx={labelStyle}>
          <LocationOn sx={{ mr: 0.5, fontSize: 20 }} />
          {t.selector.upazillaLabel}
        </InputLabel>
        <Select
          labelId="upazilla-select-label"
          value={selectedUpazilla}
          onChange={handleUpazillaChange}
          label={t.selector.upazillaLabel}
          sx={{ borderRadius: 2 }}
          MenuProps={menuProps}
          onClose={() => setUpazillaSearchQuery('')}
          renderValue={(value) => {
            if (!value) return '';
            const item = [...availableUpazillas].find(u => u.bn === value);
            return item ? (item[langKey] || item.bn) : value;
          }}
        >
          <ListItem dense sx={{ p: 0, pt: 1, pb: 2 }}>
            <TextField
              size="small"
              autoFocus
              placeholder={t.selector.upazillaSearchPlaceholder}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: upazillaSearchQuery ? (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={() => setUpazillaSearchQuery('')}
                    >
                      <Close fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
              value={upazillaSearchQuery}
              onChange={(e) => setUpazillaSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              sx={{ 
                px: 1,
                mb: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 1 }
              }}
            />
          </ListItem>
          {filteredUpazillas.map((upazilla) => (
            <MenuItem key={upazilla.bn} value={upazilla.bn}>
              {upazilla[langKey] || upazilla.bn}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Bazar Dropdown */}
      {showBazar && (
        <FormControl sx={{
          ...dropdownStyle,
          mr: variant === 'search-bar' ? 2 : 0,
        }}>
          <InputLabel id="bazar-select-label" sx={labelStyle}>
            <Store sx={{ mr: 0.5, fontSize: 20 }} />
            {t.selector.bazarLabel}
          </InputLabel>
          <Select
            labelId="bazar-select-label"
            value={selectedBazar}
            onChange={handleBazarChange}
            label={t.selector.bazarLabel}
            sx={{ borderRadius: 2 }}
            MenuProps={menuProps}
            onClose={() => setBazarSearchQuery('')}
            renderValue={(value) => {
              if (!value) return '';
              const item = [...availableBazars].find(b => b.bn === value);
              return item ? (item[langKey] || item.bn) : value;
            }}
          >
            <ListItem dense sx={{ p: 0, pt: 1, pb: 2 }}>
              <TextField
                size="small"
                autoFocus
                placeholder={t.selector.bazarSearchPlaceholder}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: bazarSearchQuery ? (
                    <InputAdornment position="end">
                      <IconButton 
                        size="small" 
                        onClick={() => setBazarSearchQuery('')}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
                value={bazarSearchQuery}
                onChange={(e) => setBazarSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                sx={{ 
                  px: 1,
                  mb: 1,
                  '& .MuiOutlinedInput-root': { borderRadius: 1 }
                }}
              />
            </ListItem>
            {filteredBazars.map((bazar) => (
              <MenuItem key={bazar.bn} value={bazar.bn}>
                {bazar[langKey] || bazar.bn}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );
};

export default LocationSelector; 