import React, { useState, useMemo } from 'react';
import {
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  IconButton,
  Box,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  LocalGasStation,
  Close,
  Phone,
  LocationOn,
  Business,
  MonetizationOn,
  LocalHospital,
  LocalPharmacy,
  Upload,
  Home,
} from '@mui/icons-material';
import { useLocation as useUserLocation } from '../contexts/LocationContext';
import emergencyBn from '../i18n/bn/emergency';
import emergencyEn from '../i18n/en/emergency';
import emergencyNp from '../i18n/np/emergency';
import emergencyPk from '../i18n/pk/emergency';
import emergencyBt from '../i18n/bt/emergency';
import emergencyDe from '../i18n/de/emergency';
import emergencySl from '../i18n/sl/emergency';
import emergencyAf from '../i18n/af/emergency';
import emergencyCn from '../i18n/cn/emergency';

// Styled components
const MainFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: 'linear-gradient(45deg, #6d66c9 30%, #ff1100 90%)',
  color: 'white',
  '&:hover': {
    background: 'linear-gradient(45deg, #5a52b8 30%, #e60f00 90%)',
  },
  zIndex: 1000,
}));

const SubButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: 'linear-gradient(45deg, #5e35b1 30%, #1e88e5 90%)',
  color: 'white',
  borderRadius: '50px',
  padding: '12px 20px',
  minWidth: 'auto',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(94, 53, 177, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #4527a0 30%, #1565c0 90%)',
    boxShadow: '0 6px 16px rgba(94, 53, 177, 0.4)',
  },
  zIndex: 999,
}));

const EmergencyButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(4),
  right: theme.spacing(4),
  background: 'linear-gradient(45deg, #ff6f00 30%, #ff9800 90%)',
  color: 'white',
  borderRadius: '50px',
  padding: '12px 20px',
  minWidth: 'auto',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 12px rgba(255, 111, 0, 0.3)',
  '&:hover': {
    background: 'linear-gradient(45deg, #e65100 30%, #f57c00 90%)',
    boxShadow: '0 6px 16px rgba(255, 111, 0, 0.4)',
  },
  zIndex: 998,
}));

const FormContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const EmergencyServiceButton = () => {
  const { userLocation } = useUserLocation();
  const currentLanguage = (typeof window !== 'undefined' && localStorage.getItem('preferredLanguage')) || 'bn';
  const t = currentLanguage === 'en' ? emergencyEn : currentLanguage === 'np' ? emergencyNp : currentLanguage === 'pk' ? emergencyPk : currentLanguage === 'bt' ? emergencyBt : currentLanguage === 'de' ? emergencyDe : currentLanguage === 'sl' ? emergencySl : currentLanguage === 'af' ? emergencyAf : currentLanguage === 'cn' ? emergencyCn : emergencyBn;
  const [isExpanded, setIsExpanded] = useState(false);
  const [gasDialogOpen, setGasDialogOpen] = useState(false);
  const [medicineDialogOpen, setMedicineDialogOpen] = useState(false);
  
  // Gas refill form data
  const [gasFormData, setGasFormData] = useState({
    name: '',
    phone: '',
    address: '',
    village: '',
    houseNumber: '',
    details: '',
    cylinderSize: '',
    quantity: '1',
    company: '',
  });

  // Medicine form data
  const [medicineFormData, setMedicineFormData] = useState({
    name: '',
    phone: '',
    address: '',
    village: '',
    houseNumber: '',
    medicineName: '',
    prescription: '',
    prescriptionFile: null,
    urgency: 'normal',
    details: '',
  });

  const gasCompanies = [
    { value: 'bashundhara', label: 'বসুন্ধরা গ্যাস' },
    { value: 'jamuna', label: 'যমুনা গ্যাস' },
    { value: 'omera', label: 'ওমেরা গ্যাস' },
    { value: 'beximco', label: 'বেক্সিমকো গ্যাস' },
    { value: 'fresh', label: 'ফ্রেশ গ্যাস' },
    { value: 'totalgaz', label: 'টোটাল গ্যাজ' },
    { value: 'others', label: 'অন্যান্য' }
  ];

  // Pricing structure based on company and cylinder size
  const gasPricing = {
    bashundhara: {
      '12kg': 1250,
      '33kg': 3200,
      '45kg': 4300
    },
    jamuna: {
      '12kg': 1230,
      '33kg': 3150,
      '45kg': 4250
    },
    omera: {
      '12kg': 1240,
      '33kg': 3180,
      '45kg': 4280
    },
    beximco: {
      '12kg': 1260,
      '33kg': 3220,
      '45kg': 4320
    },
    fresh: {
      '12kg': 1235,
      '33kg': 3160,
      '45kg': 4260
    },
    totalgaz: {
      '12kg': 1245,
      '33kg': 3190,
      '45kg': 4290
    },
    others: {
      '12kg': 1250,
      '33kg': 3200,
      '45kg': 4300
    }
  };

  // Calculate total price for gas
  const calculatedGasPrice = useMemo(() => {
    const { company, cylinderSize, quantity } = gasFormData;
    
    if (!company || !cylinderSize || !quantity || quantity <= 0) {
      return null;
    }

    const unitPrice = gasPricing[company]?.[cylinderSize];
    if (!unitPrice) return null;

    const totalPrice = unitPrice * parseInt(quantity);
    const deliveryCharge = 50; // Fixed delivery charge
    const grandTotal = totalPrice + deliveryCharge;

    return {
      unitPrice,
      totalPrice,
      deliveryCharge,
      grandTotal,
      quantity: parseInt(quantity)
    };
  }, [gasFormData.company, gasFormData.cylinderSize, gasFormData.quantity]);

  const handleMainButtonClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGasButtonClick = () => {
    setGasDialogOpen(true);
    setIsExpanded(false);
  };

  const handleMedicineButtonClick = () => {
    setMedicineDialogOpen(true);
    setIsExpanded(false);
  };

  const handleGasClose = () => {
    setGasDialogOpen(false);
    setGasFormData({
      name: '',
      phone: '',
      address: '',
      village: '',
      houseNumber: '',
      details: '',
      cylinderSize: '',
      quantity: '1',
      company: '',
    });
  };

  const handleMedicineClose = () => {
    setMedicineDialogOpen(false);
    setMedicineFormData({
      name: '',
      phone: '',
      address: '',
      village: '',
      houseNumber: '',
      medicineName: '',
      prescription: '',
      prescriptionFile: null,
      urgency: 'normal',
      details: '',
    });
  };

  const handleGasSubmit = () => {
    const submissionData = {
      ...gasFormData,
      pricing: calculatedGasPrice,
      location: userLocation ? {
        district: userLocation.district,
        upazilla: userLocation.upazilla,
        bazar: userLocation.bazar,
      } : null
    };
    console.log('Gas refill order:', submissionData);
    handleGasClose();
  };

  const handleMedicineSubmit = () => {
    const submission = { 
      ...medicineFormData,
      location: userLocation ? {
        district: userLocation.district,
        upazilla: userLocation.upazilla,
        bazar: userLocation.bazar,
      } : null
    };
    // If a file is provided, include lightweight metadata for now
    if (medicineFormData.prescriptionFile) {
      submission.prescriptionFileMeta = {
        name: medicineFormData.prescriptionFile.name,
        size: medicineFormData.prescriptionFile.size,
        type: medicineFormData.prescriptionFile.type,
      };
    }
    console.log('Emergency medicine order:', submission);
    handleMedicineClose();
  };

  const handleGasChange = (e) => {
    setGasFormData({
      ...gasFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicineChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'prescriptionFile') {
      setMedicineFormData({
        ...medicineFormData,
        prescriptionFile: files && files[0] ? files[0] : null,
      });
    } else {
      setMedicineFormData({
        ...medicineFormData,
        [name]: value
      });
    }
  };

  return (
    <>
      {/* Main Emergency Service Button */}
      <MainFab
        onClick={handleMainButtonClick}
        sx={{
          animation: 'pulse 2s infinite',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(255, 17, 0, 0.4)',
            },
            '70%': {
              boxShadow: '0 0 0 15px rgba(255, 17, 0, 0)',
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(255, 17, 0, 0)',
            },
          },
        }}
              >
          <LocalHospital />
        </MainFab>

      {/* Gas Cylinder Button - appears when expanded */}
      {isExpanded && (
        <SubButton
          onClick={handleGasButtonClick}
          startIcon={<LocalGasStation />}
          sx={{
            bottom: 120,
            right: 32,
            animation: 'slideIn 0.3s ease-out',
            '@keyframes slideIn': {
              '0%': {
                transform: 'translateY(20px) scale(0.8)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateY(0) scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          {t.buttons.gas}
        </SubButton>
      )}

      {/* Emergency Medicine Button - appears when expanded */}
      {isExpanded && (
        <EmergencyButton
          onClick={handleMedicineButtonClick}
          startIcon={<LocalPharmacy />}
          sx={{
            bottom: 200,
            right: 32,
            animation: 'slideIn 0.3s ease-out 0.1s both',
            '@keyframes slideIn': {
              '0%': {
                transform: 'translateY(20px) scale(0.8)',
                opacity: 0,
              },
              '100%': {
                transform: 'translateY(0) scale(1)',
                opacity: 1,
              },
            },
          }}
        >
          {t.buttons.medicine}
        </EmergencyButton>
      )}

      {/* Gas Cylinder Refill Dialog */}
      <Dialog
        open={gasDialogOpen}
        onClose={handleGasClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            '& .MuiDialogContent-root': {
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          background: 'linear-gradient(45deg, #5e35b1 30%, #1e88e5 90%)', 
          color: 'white' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalGasStation sx={{ mr: 1 }} />
            <Typography variant="h6">
              {t.gas.title}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleGasClose}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <FormContainer>
            <TextField
              fullWidth
              label={t.common.nameLabel}
              name="name"
              value={gasFormData.name}
              onChange={handleGasChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    👤
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label={t.common.phoneLabel}
              name="phone"
              value={gasFormData.phone}
              onChange={handleGasChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label={t.common.villageLabel}
                name="village"
                value={gasFormData.village}
                onChange={handleGasChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label={t.common.houseNumberLabel}
                name="houseNumber"
                value={gasFormData.houseNumber}
                onChange={handleGasChange}
                margin="normal"
                required
              />
            </Box>
            {userLocation && (
              <Typography variant="caption" color="text.secondary">
                {t.common.districtLabel}: {userLocation.district} • {t.common.upazillaLabel}: {userLocation.upazilla}
              </Typography>
            )}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t.gas.companyLabel}</InputLabel>
              <Select
                name="company"
                value={gasFormData.company}
                onChange={handleGasChange}
                label={t.gas.companyLabel}
                startAdornment={
                  <InputAdornment position="start">
                    <Business sx={{ ml: 1, mr: -0.5 }} />
                  </InputAdornment>
                }
              >
                {[
                  { value: 'bashundhara', label: t.gas.companies.bashundhara },
                  { value: 'jamuna', label: t.gas.companies.jamuna },
                  { value: 'omera', label: t.gas.companies.omera },
                  { value: 'beximco', label: t.gas.companies.beximco },
                  { value: 'fresh', label: t.gas.companies.fresh },
                  { value: 'totalgaz', label: t.gas.companies.totalgaz },
                  { value: 'others', label: t.gas.companies.others },
                ].map((company) => (
                  <MenuItem key={company.value} value={company.value}>
                    {company.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                fullWidth
                label={t.gas.cylinderSizeLabel}
                name="cylinderSize"
                value={gasFormData.cylinderSize}
                onChange={handleGasChange}
                select
                required
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">{t.gas.cylinderSizePlaceholder}</option>
                <option value="12kg">{t.gas.cylinderSizeOptions['12kg']}</option>
                <option value="33kg">{t.gas.cylinderSizeOptions['33kg']}</option>
                <option value="45kg">{t.gas.cylinderSizeOptions['45kg']}</option>
              </TextField>
              <TextField
                fullWidth
                label={t.gas.quantityLabel}
                name="quantity"
                type="number"
                value={gasFormData.quantity}
                onChange={handleGasChange}
                required
                InputProps={{
                  inputProps: { min: 1, max: 10 }
                }}
              />
            </Box>

            {/* Price Display */}
            {calculatedGasPrice && (
              <Paper 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                  border: '1px solid #dee2e6'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MonetizationOn sx={{ color: '#5e35b1', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600, color: '#5e35b1' }}>
                    {t.gas.price.header}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t.gas.price.unitPrice} ({gasFormData.cylinderSize}):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ৳{calculatedGasPrice.unitPrice.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t.gas.quantityLabel}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {calculatedGasPrice.quantity} {t.gas.price.unitSuffix}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t.gas.price.subtotal}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ৳{calculatedGasPrice.totalPrice.toLocaleString()}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t.gas.price.delivery}:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    ৳{calculatedGasPrice.deliveryCharge}
                  </Typography>
                </Box>
                
                <Divider sx={{ my: 1 }} />
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#5e35b1' }}>
                    {t.gas.price.total}:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#5e35b1' }}>
                    ৳{calculatedGasPrice.grandTotal.toLocaleString()}
                  </Typography>
                </Box>
                
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {t.gas.price.note}
                </Typography>
              </Paper>
            )}

            <TextField
              fullWidth
              label={t.common.detailsLabel}
              name="details"
              value={gasFormData.details}
              onChange={handleGasChange}
              margin="normal"
              multiline
              rows={4}
              placeholder={t.common.detailsPlaceholder}
            />
          </FormContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleGasClose} 
            variant="outlined" 
            sx={{
              borderColor: '#5e35b1',
              color: '#5e35b1',
              '&:hover': {
                borderColor: '#4527a0',
                backgroundColor: 'rgba(94, 53, 177, 0.04)'
              }
            }}
          >
            {t.common.cancel}
          </Button>
          <Button 
            onClick={handleGasSubmit} 
            variant="contained" 
            disabled={!calculatedGasPrice}
            sx={{
              background: 'linear-gradient(45deg, #5e35b1 30%, #1e88e5 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4527a0 30%, #1565c0 90%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {calculatedGasPrice ? `৳${calculatedGasPrice.grandTotal.toLocaleString()} - ${t.gas.orderNow}` : t.gas.orderNow}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Emergency Medicine Dialog */}
      <Dialog
        open={medicineDialogOpen}
        onClose={handleMedicineClose}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            '& .MuiDialogContent-root': {
              '&::-webkit-scrollbar': {
                display: 'none',
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          background: 'linear-gradient(45deg, #ff6f00 30%, #ff9800 90%)', 
          color: 'white' 
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalPharmacy sx={{ mr: 1 }} />
            <Typography variant="h6">
              {t.medicine.title}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleMedicineClose}
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)'
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          <FormContainer>
            <TextField
              fullWidth
              label={t.common.nameLabel}
              name="name"
              value={medicineFormData.name}
              onChange={handleMedicineChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    👤
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label={t.common.phoneLabel}
              name="phone"
              value={medicineFormData.phone}
              onChange={handleMedicineChange}
              margin="normal"
              required
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label={t.common.villageLabel}
                name="village"
                value={medicineFormData.village}
                onChange={handleMedicineChange}
                margin="normal"
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Home />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label={t.common.houseNumberLabel}
                name="houseNumber"
                value={medicineFormData.houseNumber}
                onChange={handleMedicineChange}
                margin="normal"
                required
              />
            </Box>
            {userLocation && (
              <Typography variant="caption" color="text.secondary">
                {t.common.districtLabel}: {userLocation.district} • {t.common.upazillaLabel}: {userLocation.upazilla}
              </Typography>
            )}
            <TextField
              fullWidth
              label={t.medicine.medicineNameLabel}
              name="medicineName"
              value={medicineFormData.medicineName}
              onChange={handleMedicineChange}
              margin="normal"
              required
              placeholder={t.medicine.medicineNamePlaceholder}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t.medicine.urgencyLabel}</InputLabel>
              <Select
                name="urgency"
                value={medicineFormData.urgency}
                onChange={handleMedicineChange}
                label={t.medicine.urgencyLabel}
              >
                <MenuItem value="normal">{t.medicine.urgencyOptions.normal}</MenuItem>
                <MenuItem value="urgent">{t.medicine.urgencyOptions.urgent}</MenuItem>
                <MenuItem value="emergency">{t.medicine.urgencyOptions.emergency}</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label={t.medicine.prescriptionLabel}
              name="prescription"
              value={medicineFormData.prescription}
              onChange={handleMedicineChange}
              margin="normal"
              multiline
              rows={3}
              placeholder={t.medicine.prescriptionPlaceholder}
            />
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              {t.medicine.uploadNote}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              startIcon={<Upload />}
            >
              {t.medicine.uploadButton}
              <input
                type="file"
                name="prescriptionFile"
                accept="image/*,application/pdf"
                hidden
                onChange={handleMedicineChange}
              />
            </Button>
            {medicineFormData.prescriptionFile && (
              <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                {t.medicine.selectedFilePrefix} {medicineFormData.prescriptionFile.name}
              </Typography>
            )}
          </Box>
            <TextField
              fullWidth
              label={t.common.detailsLabel}
              name="details"
              value={medicineFormData.details}
              onChange={handleMedicineChange}
              margin="normal"
              multiline
              rows={4}
              placeholder={t.common.detailsPlaceholder}
            />
          </FormContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleMedicineClose} 
            variant="outlined" 
            sx={{
              borderColor: '#ff6f00',
              color: '#ff6f00',
              '&:hover': {
                borderColor: '#e65100',
                backgroundColor: 'rgba(255, 111, 0, 0.04)'
              }
            }}
          >
            {t.common.cancel}
          </Button>
          <Button 
            onClick={handleMedicineSubmit} 
            variant="contained" 
            sx={{
              background: 'linear-gradient(45deg, #ff6f00 30%, #ff9800 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #e65100 30%, #f57c00 90%)',
              },
            }}
          >
            {t.medicine.submit}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default EmergencyServiceButton; 