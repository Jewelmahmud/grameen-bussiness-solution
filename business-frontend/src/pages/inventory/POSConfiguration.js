import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  Build as TestIcon,
  Save as SaveIcon,
  CreditCard as CardIcon,
  Wifi as WifiIcon,
  Phone as PhoneIcon,
  SignalCellularAlt as SignalIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import multiBankPOSService from '../../services/multiBankPOSService';

const POSConfiguration = () => {
  const [selectedBank, setSelectedBank] = useState('dbbl');
  const [configurations, setConfigurations] = useState({});
  const [testResults, setTestResults] = useState({});
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Initialize configurations for all banks
  useEffect(() => {
    const banks = multiBankPOSService.getSupportedBanks();
    const initialConfigs = {};
    
    banks.forEach(bank => {
      initialConfigs[bank.id] = {
        merchantId: '',
        terminalId: '',
        terminalType: bank.terminals[0] || 'VeriFone',
        connectionType: bank.connectionTypes[0] || 'PSTN',
        isEnabled: false,
        autoSettlement: false,
        settlementTime: '23:00',
        testMode: true
      };
    });
    
    setConfigurations(initialConfigs);
  }, []);

  const handleConfigChange = (bankId, field, value) => {
    setConfigurations(prev => ({
      ...prev,
      [bankId]: {
        ...prev[bankId],
        [field]: value
      }
    }));
  };

  const handleSaveConfiguration = async (bankId) => {
    setSaving(true);
    try {
      const config = configurations[bankId];
      
      // Validate required fields
      if (!config.merchantId || !config.terminalId) {
        setSnackbar({
          open: true,
          message: 'মার্চেন্ট আইডি এবং টার্মিনাল আইডি প্রয়োজন',
          severity: 'error'
        });
        return;
      }

      // Save configuration (in real app, this would save to backend)
      localStorage.setItem(`pos_config_${bankId}`, JSON.stringify(config));
      
      setSnackbar({
        open: true,
        message: `${multiBankPOSService.getBankName(bankId)} কনফিগারেশন সেভ করা হয়েছে`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'কনফিগারেশন সেভ করতে ব্যর্থ',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (bankId) => {
    setTesting(true);
    setShowTestDialog(true);
    
    try {
      const config = configurations[bankId];
      const result = await multiBankPOSService.testConnection(bankId, config.terminalId);
      
      setTestResults(prev => ({
        ...prev,
        [bankId]: result
      }));
      
      if (result.success) {
        setSnackbar({
          open: true,
          message: `${result.bankName} - সংযোগ সফল!`,
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: `${result.bankName} - সংযোগ ব্যর্থ: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [bankId]: {
          success: false,
          error: 'সংযোগ পরীক্ষায় ত্রুটি'
        }
      }));
    } finally {
      setTesting(false);
    }
  };

  const getConnectionIcon = (connectionType) => {
    switch (connectionType) {
      case 'WiFi': return <WifiIcon />;
      case 'GPRS': return <SignalIcon />;
      case 'PSTN': return <PhoneIcon />;
      default: return <WifiIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        POS সিস্টেম কনফিগারেশন
      </Typography>

      <Grid container spacing={3}>
        {/* Bank Selection */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>ব্যাংক নির্বাচন করুন</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {multiBankPOSService.getSupportedBanks().map((bank) => (
                <Chip
                  key={bank.id}
                  label={bank.name}
                  onClick={() => setSelectedBank(bank.id)}
                  color={selectedBank === bank.id ? 'primary' : 'default'}
                  variant={selectedBank === bank.id ? 'filled' : 'outlined'}
                  sx={{
                    backgroundColor: selectedBank === bank.id ? bank.color : 'transparent',
                    color: selectedBank === bank.id ? 'white' : 'inherit',
                    '&:hover': {
                      backgroundColor: selectedBank === bank.id ? bank.color : 'rgba(0,0,0,0.04)'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Configuration Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: multiBankPOSService.getBank(selectedBank)?.color,
                  mr: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              >
                {multiBankPOSService.getBank(selectedBank)?.shortName}
              </Box>
              <Typography variant="h5">
                {multiBankPOSService.getBankName(selectedBank)} কনফিগারেশন
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="মার্চেন্ট আইডি"
                  value={configurations[selectedBank]?.merchantId || ''}
                  onChange={(e) => handleConfigChange(selectedBank, 'merchantId', e.target.value)}
                  placeholder="উদাহরণ: 123456789"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="টার্মিনাল আইডি"
                  value={configurations[selectedBank]?.terminalId || ''}
                  onChange={(e) => handleConfigChange(selectedBank, 'terminalId', e.target.value)}
                  placeholder="উদাহরণ: TERM001"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>টার্মিনাল টাইপ</InputLabel>
                  <Select
                    value={configurations[selectedBank]?.terminalType || ''}
                    onChange={(e) => handleConfigChange(selectedBank, 'terminalType', e.target.value)}
                    label="টার্মিনাল টাইপ"
                  >
                    {multiBankPOSService.getBank(selectedBank)?.terminals.map((terminal) => (
                      <MenuItem key={terminal} value={terminal}>{terminal}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>সংযোগ টাইপ</InputLabel>
                  <Select
                    value={configurations[selectedBank]?.connectionType || ''}
                    onChange={(e) => handleConfigChange(selectedBank, 'connectionType', e.target.value)}
                    label="সংযোগ টাইপ"
                  >
                    {multiBankPOSService.getBank(selectedBank)?.connectionTypes.map((connection) => (
                      <MenuItem key={connection} value={connection}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {getConnectionIcon(connection)}
                          <span style={{ marginLeft: 8 }}>{connection}</span>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>অতিরিক্ত সেটিংস</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configurations[selectedBank]?.isEnabled || false}
                      onChange={(e) => handleConfigChange(selectedBank, 'isEnabled', e.target.checked)}
                    />
                  }
                  label="POS সক্রিয় করুন"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configurations[selectedBank]?.autoSettlement || false}
                      onChange={(e) => handleConfigChange(selectedBank, 'autoSettlement', e.target.checked)}
                    />
                  }
                  label="স্বয়ংক্রিয় সেটেলমেন্ট"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="সেটেলমেন্ট সময়"
                  value={configurations[selectedBank]?.settlementTime || '23:00'}
                  onChange={(e) => handleConfigChange(selectedBank, 'settlementTime', e.target.value)}
                  disabled={!configurations[selectedBank]?.autoSettlement}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={configurations[selectedBank]?.testMode || false}
                      onChange={(e) => handleConfigChange(selectedBank, 'testMode', e.target.checked)}
                    />
                  }
                  label="টেস্ট মোড"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={() => handleSaveConfiguration(selectedBank)}
                disabled={saving}
                sx={{
                  backgroundColor: multiBankPOSService.getBank(selectedBank)?.color,
                  '&:hover': {
                    backgroundColor: multiBankPOSService.getBank(selectedBank)?.color
                  }
                }}
              >
                {saving ? 'সেভ হচ্ছে...' : 'কনফিগারেশন সেভ করুন'}
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<TestIcon />}
                onClick={() => handleTestConnection(selectedBank)}
                disabled={testing}
              >
                {testing ? 'পরীক্ষা হচ্ছে...' : 'সংযোগ পরীক্ষা করুন'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Bank Information */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>ব্যাংক তথ্য</Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>সমর্থিত কার্ড</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {multiBankPOSService.getBank(selectedBank)?.supportedCards.map((card) => (
                    <ListItem key={card}>
                      <ListItemIcon>
                        <CardIcon />
                      </ListItemIcon>
                      <ListItemText primary={card.toUpperCase()} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>বৈশিষ্ট্য</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {multiBankPOSService.getBank(selectedBank)?.features.map((feature) => (
                    <ListItem key={feature}>
                      <ListItemIcon>
                        <SecurityIcon />
                      </ListItemIcon>
                      <ListItemText primary={feature} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>সংযোগ টাইপ</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {multiBankPOSService.getBank(selectedBank)?.connectionTypes.map((connection) => (
                    <ListItem key={connection}>
                      <ListItemIcon>
                        {getConnectionIcon(connection)}
                      </ListItemIcon>
                      <ListItemText primary={connection} />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          </Paper>
        </Grid>
      </Grid>

      {/* Test Results Dialog */}
      <Dialog open={showTestDialog} onClose={() => setShowTestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TestIcon sx={{ mr: 1 }} />
            সংযোগ পরীক্ষার ফলাফল
          </Box>
        </DialogTitle>
        <DialogContent>
          {testResults[selectedBank] && (
            <Box>
              {testResults[selectedBank].success ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="h6">সংযোগ সফল!</Typography>
                  <Typography variant="body2">
                    ব্যাংক: {testResults[selectedBank].bankName}
                  </Typography>
                  {testResults[selectedBank].responseTime && (
                    <Typography variant="body2">
                      প্রতিক্রিয়া সময়: {testResults[selectedBank].responseTime}ms
                    </Typography>
                  )}
                </Alert>
              ) : (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Typography variant="h6">সংযোগ ব্যর্থ!</Typography>
                  <Typography variant="body2">
                    ত্রুটি: {testResults[selectedBank].error}
                  </Typography>
                </Alert>
              )}
              
              <Typography variant="body2" color="text.secondary">
                {testResults[selectedBank].message}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTestDialog(false)}>বন্ধ করুন</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Alert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
      >
        {snackbar.message}
      </Alert>
    </Box>
  );
};

export default POSConfiguration; 