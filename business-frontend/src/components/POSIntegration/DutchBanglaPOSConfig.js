import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  CreditCard as CreditCardIcon,
  Security as SecurityIcon,
  Wifi as WifiIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import dutchBanglaPOSService from '../../services/dutchBanglaPOSService';

const DutchBanglaPOSConfig = () => {
  const [config, setConfig] = useState({
    merchantId: '',
    terminalId: '',
    terminalType: 'GPRS', // 'PSTN' or 'GPRS'
    connectionType: 'SIM',
    isEnabled: false,
    testMode: true
  });

  const [terminalStatus, setTerminalStatus] = useState({
    isOnline: false,
    lastTransaction: null,
    connectionType: null
  });

  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('dutchBanglaPOSConfig');
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleConfigChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    localStorage.setItem('dutchBanglaPOSConfig', JSON.stringify(newConfig));
  };

  const testConnection = async () => {
    setIsLoading(true);
    try {
      const result = await dutchBanglaPOSService.testConnection(config.terminalId);
      setTestResult(result);
      
      if (result.success) {
        setTerminalStatus({
          isOnline: true,
          lastTransaction: result.lastTransaction,
          connectionType: result.connectionType
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Connection test failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const initializeTerminal = async () => {
    setIsLoading(true);
    try {
      const result = await dutchBanglaPOSService.initializeTerminal(config);
      if (result.success) {
        setTestResult({
          success: true,
          message: 'Terminal initialized successfully'
        });
      } else {
        setTestResult(result);
      }
    } catch (error) {
      setTestResult({
        success: false,
        error: 'Terminal initialization failed'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSupportedCards = () => {
    return dutchBanglaPOSService.getSupportedCardTypes();
  };

  const getTerminalConfig = () => {
    return dutchBanglaPOSService.getTerminalConfiguration();
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Dutch-Bangla Bank POS কনফিগারেশন
      </Typography>

      <Grid container spacing={3}>
        {/* Configuration Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SettingsIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                টার্মিনাল সেটিংস
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="মার্চেন্ট আইডি"
                  value={config.merchantId}
                  onChange={(e) => handleConfigChange('merchantId', e.target.value)}
                  placeholder="আপনার মার্চেন্ট আইডি লিখুন"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="টার্মিনাল আইডি"
                  value={config.terminalId}
                  onChange={(e) => handleConfigChange('terminalId', e.target.value)}
                  placeholder="আপনার টার্মিনাল আইডি লিখুন"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>টার্মিনাল টাইপ</InputLabel>
                  <Select
                    value={config.terminalType}
                    label="টার্মিনাল টাইপ"
                    onChange={(e) => handleConfigChange('terminalType', e.target.value)}
                  >
                    <MenuItem value="GPRS">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WifiIcon sx={{ mr: 1 }} />
                        GPRS (মোবাইল সিম)
                      </Box>
                    </MenuItem>
                    <MenuItem value="PSTN">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1 }} />
                        PSTN (ল্যান্ডলাইন)
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>সংযোগ টাইপ</InputLabel>
                  <Select
                    value={config.connectionType}
                    label="সংযোগ টাইপ"
                    onChange={(e) => handleConfigChange('connectionType', e.target.value)}
                  >
                    <MenuItem value="SIM">মোবাইল সিম</MenuItem>
                    <MenuItem value="ETHERNET">ইথারনেট</MenuItem>
                    <MenuItem value="WIFI">ওয়াইফাই</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.isEnabled}
                      onChange={(e) => handleConfigChange('isEnabled', e.target.checked)}
                    />
                  }
                  label="POS টার্মিনাল সক্রিয় করুন"
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.testMode}
                      onChange={(e) => handleConfigChange('testMode', e.target.checked)}
                    />
                  }
                  label="টেস্ট মোড"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="contained"
                    onClick={initializeTerminal}
                    disabled={isLoading || !config.merchantId || !config.terminalId}
                    sx={{ 
                      background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)'
                      }
                    }}
                  >
                    টার্মিনাল শুরু করুন
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={testConnection}
                    disabled={isLoading || !config.terminalId}
                  >
                    সংযোগ পরীক্ষা করুন
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Status and Information */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                টার্মিনাল অবস্থা
              </Typography>
            </Box>

            {/* Connection Status */}
            <Card sx={{ mb: 2, bgcolor: terminalStatus.isOnline ? '#e8f5e8' : '#fff3e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {terminalStatus.isOnline ? (
                    <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                  ) : (
                    <ErrorIcon sx={{ color: 'warning.main', mr: 1 }} />
                  )}
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {terminalStatus.isOnline ? 'অনলাইন' : 'অফলাইন'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  সংযোগ টাইপ: {terminalStatus.connectionType || 'অজানা'}
                </Typography>
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResult && (
              <Alert 
                severity={testResult.success ? 'success' : 'error'} 
                sx={{ mb: 2 }}
              >
                {testResult.message || testResult.error}
              </Alert>
            )}

            {/* Supported Cards */}
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CreditCardIcon sx={{ mr: 1 }} />
                  <Typography>সমর্থিত কার্ড</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {getSupportedCards().map((card) => (
                    <Chip
                      key={card.type}
                      label={card.name}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ my: 2 }} />

            {/* Terminal Features */}
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              নিরাপত্তা বৈশিষ্ট্য:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {getTerminalConfig().securityFeatures.map((feature) => (
                <Chip
                  key={feature}
                  label={feature}
                  color="primary"
                  size="small"
                />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              সমর্থিত টার্মিনাল:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {getTerminalConfig().supportedTerminals.map((terminal) => (
                <Chip
                  key={terminal}
                  label={terminal}
                  variant="outlined"
                  size="small"
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DutchBanglaPOSConfig; 