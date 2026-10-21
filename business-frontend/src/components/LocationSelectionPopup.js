import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  ListItem,
  Box,
  Typography,
  Paper,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Search,
  Close,
  Store,
  CheckCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import locationsData from '../json/locations.json';
import locationBn from '../i18n/bn/location';
import locationEn from '../i18n/en/location';
import locationNp from '../i18n/np/location';
import locationPk from '../i18n/pk/location';
import locationBt from '../i18n/bt/location';
import locationDe from '../i18n/de/location';
import locationSl from '../i18n/sl/location';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    padding: '0px',
    maxWidth: '600px',
    width: '90%',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  margin: 0,
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  fontWeight: 500,
  fontSize: '1.25rem',
  lineHeight: 1.6,
  letterSpacing: '0.0075em',
  padding: '16px 24px',
  flex: '0 0 auto',
  background: 'linear-gradient(45deg, #5e35b1 30%, #1e88e5 90%)',
  color: 'white',
  textAlign: 'center',
  borderRadius: '8px 8px 0 0',
  marginBottom: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const LocationSelectionPopup = ({ open, onLocationSelected }) => {
  const currentLanguage = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn';
  const t = currentLanguage === 'en' ? locationEn : currentLanguage === 'np' ? locationNp : currentLanguage === 'pk' ? locationPk : currentLanguage === 'bt' ? locationBt : currentLanguage === 'de' ? locationDe : currentLanguage === 'sl' ? locationSl : locationBn;
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedUpazilla, setSelectedUpazilla] = useState('');
  const [selectedBazar, setSelectedBazar] = useState('');
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');
  const [upazillaSearchQuery, setUpazillaSearchQuery] = useState('');
  const [bazarSearchQuery, setBazarSearchQuery] = useState('');
  const [availableUpazillas, setAvailableUpazillas] = useState([]);
  const [availableBazars, setAvailableBazars] = useState([]);

  // Get districts from locations.json with proper Bangla names
  const langKey = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) === 'en' ? 'en' : 'bn';
  const districts = locationsData.districts.map(district => ({ 
    bn: district.bn,
    en: district.en,
    name: district.name
  }));

  // Update available upazillas when district changes
  useEffect(() => {
    if (selectedDistrict) {
      // Find district by Bangla name
      const selectedDistrictData = locationsData.districts.find(
        district => district.bn === selectedDistrict
      );
      
      if (selectedDistrictData) {
        setAvailableUpazillas(selectedDistrictData.upazilas);
        
        // Get all bazars from all upazilas in the district
        const allBazars = selectedDistrictData.upazilas.reduce((acc, upazila) => {
          return [...acc, ...upazila.bazars];
        }, []);
        
        setAvailableBazars(allBazars);
        setSelectedUpazilla('');
        setSelectedBazar('');
      }
    } else {
      setAvailableUpazillas([]);
      setAvailableBazars([]);
    }
  }, [selectedDistrict]);

  // Update available bazars when upazilla changes
  useEffect(() => {
    if (selectedUpazilla && selectedDistrict) {
      // Find district by Bangla name
      const selectedDistrictData = locationsData.districts.find(
        district => district.bn === selectedDistrict
      );
      
      if (selectedDistrictData) {
        const selectedUpazilaData = selectedDistrictData.upazilas.find(
          upazila => upazila.bn === selectedUpazilla
        );
        
        if (selectedUpazilaData) {
          setAvailableBazars(selectedUpazilaData.bazars);
          setSelectedBazar('');
        }
      }
    }
  }, [selectedUpazilla, selectedDistrict]);

  const handleDistrictChange = (event) => {
    setSelectedDistrict(event.target.value);
    setDistrictSearchQuery('');
  };

  const handleUpazillaChange = (event) => {
    setSelectedUpazilla(event.target.value);
    setUpazillaSearchQuery('');
  };

  const handleBazarChange = (event) => {
    setSelectedBazar(event.target.value);
    setBazarSearchQuery('');
  };

  const handleSubmit = () => {
    if (selectedDistrict && selectedUpazilla && selectedBazar) {
      const locationData = {
        district: selectedDistrict,
        upazilla: selectedUpazilla,
        bazar: selectedBazar,
        timestamp: new Date().toISOString(),
      };
      
      // Store in localStorage
      localStorage.setItem('userLocation', JSON.stringify(locationData));
      
      // Call the callback function
      onLocationSelected(locationData);
    }
  };

  const isFormValid = selectedDistrict && selectedUpazilla && selectedBazar;

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

  const menuProps = {
    PaperProps: {
      style: {
        maxHeight: 300,
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      },
    },
    disableScrollLock: true,
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
    <StyledDialog
      open={open}
      disableEscapeKeyDown
      disableBackdropClick
      maxWidth="md"
      fullWidth
    >
      <StyledDialogTitle>
        <LocationOn sx={{ mr: 1, fontSize: 28 }} />
        {t.popup.title}
      </StyledDialogTitle>
      
      <DialogContent sx={{ pt: 2, px: 3, pb: 1 }}>
        <Typography variant="body1" sx={{ mb: 3, textAlign: 'center', color: 'text.secondary' }}>
          {t.popup.instruction}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* District Selection */}
          <FormControl fullWidth>
            <InputLabel id="district-select-label">
              <LocationOn sx={{ mr: 0.5, fontSize: 20 }} />
              {t.popup.chooseDistrict}
            </InputLabel>
            <Select
              labelId="district-select-label"
              value={selectedDistrict}
              onChange={handleDistrictChange}
              label={t.popup.chooseDistrict}
              MenuProps={menuProps}
              onClose={() => setDistrictSearchQuery('')}
            >
              <ListItem dense sx={{ p: 0, pt: 1, pb: 2 }}>
                <TextField
                  size="small"
                  autoFocus
                  placeholder={t.popup.districtSearchPlaceholder}
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
                  sx={{ px: 1, mb: 1 }}
                />
              </ListItem>
              {filteredDistricts.map((district) => (
                <MenuItem key={district.bn} value={district.bn}>
                  {district[langKey] || district.bn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Upazilla Selection */}
          <FormControl fullWidth disabled={!selectedDistrict}>
            <InputLabel id="upazilla-select-label">
              <LocationOn sx={{ mr: 0.5, fontSize: 20 }} />
              {t.popup.chooseUpazilla}
            </InputLabel>
            <Select
              labelId="upazilla-select-label"
              value={selectedUpazilla}
              onChange={handleUpazillaChange}
              label={t.popup.chooseUpazilla}
              MenuProps={menuProps}
              onClose={() => setUpazillaSearchQuery('')}
            >
              <ListItem dense sx={{ p: 0, pt: 1, pb: 2 }}>
                <TextField
                  size="small"
                  autoFocus
                  placeholder={t.popup.upazillaSearchPlaceholder}
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
                  sx={{ px: 1, mb: 1 }}
                />
              </ListItem>
              {filteredUpazillas.map((upazilla) => (
                <MenuItem key={upazilla.bn} value={upazilla.bn}>
                  {upazilla[langKey] || upazilla.bn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Bazar Selection */}
          <FormControl fullWidth disabled={!selectedUpazilla}>
            <InputLabel id="bazar-select-label">
              <Store sx={{ mr: 0.5, fontSize: 20 }} />
              {t.popup.chooseBazar}
            </InputLabel>
            <Select
              labelId="bazar-select-label"
              value={selectedBazar}
              onChange={handleBazarChange}
              label={t.popup.chooseBazar}
              MenuProps={menuProps}
              onClose={() => setBazarSearchQuery('')}
            >
              <ListItem dense sx={{ p: 0, pt: 1, pb: 2 }}>
                <TextField
                  size="small"
                  autoFocus
                  placeholder={t.popup.bazarSearchPlaceholder}
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
                  sx={{ px: 1, mb: 1 }}
                />
              </ListItem>
              {filteredBazars.map((bazar) => (
                <MenuItem key={bazar.bn} value={bazar.bn}>
                  {bazar[langKey] || bazar.bn}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {isFormValid && (
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: 'success.light', 
                color: 'success.contrastText',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <CheckCircle />
              <Typography variant="body2">
                {t.popup.selectedPrefix} {selectedDistrict} → {selectedUpazilla} → {selectedBazar}
              </Typography>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <Divider sx={{ mx: 3 }} />

      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          onClick={handleSubmit}
          disabled={!isFormValid}
          variant="contained"
          size="large"
          startIcon={<CheckCircle />}
          sx={{
            background: 'linear-gradient(45deg, #5e35b1 30%, #1e88e5 90%)',
            borderRadius: 2,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            fontWeight: 'bold',
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {t.popup.confirm}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default LocationSelectionPopup; 