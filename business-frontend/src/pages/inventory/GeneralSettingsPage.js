import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Switch,
  FormControlLabel,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  InputAdornment,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Language as LanguageIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Backup as BackupIcon,
  CloudUpload as CloudUploadIcon,
  CloudDownload as CloudDownloadIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Email as EmailIcon,
  VolumeUp as VolumeIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';

const GeneralSettingsPage = () => {
  const [settings, setSettings] = useState({
    // Language & Region
    language: 'bn', // 'bn' for Bengali, 'en' for English
    timezone: 'Asia/Dhaka',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h', // '12h' or '24h'
    
    // Appearance
    theme: 'light', // 'light' or 'dark'
    fontSize: 'medium', // 'small', 'medium', 'large'
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    lowStockAlert: true,
    salesNotification: true,
    paymentNotification: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30, // minutes
    passwordExpiry: 90, // days
    
    // Data Management
    autoBackup: true,
    backupFrequency: 'daily', // 'daily', 'weekly', 'monthly'
    backupRetention: 30, // days
    exportDataFormat: 'csv', // 'csv', 'excel', 'json'
    
    // Delivery Options
    deliveryOptions: {
      onShopSell: true,
      grameenDelivery: true,
      steadfast: false,
      redex: false
    }
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);

  // Load delivery options from localStorage on mount
  useEffect(() => {
    const savedDeliveryOptions = localStorage.getItem('deliveryOptions');
    if (savedDeliveryOptions) {
      try {
        const parsed = JSON.parse(savedDeliveryOptions);
        setSettings(prev => ({
          ...prev,
          deliveryOptions: parsed
        }));
      } catch (e) {
        console.error('Error parsing delivery options:', e);
      }
    }
  }, []);

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, save to backend
      console.log('Saving general settings:', settings);
      
      // Update language preference in localStorage
      if (settings.language) {
        localStorage.setItem('preferredLanguage', settings.language);
        // Trigger language change event
        window.dispatchEvent(new Event('preferredLanguageChanged'));
      }
      
      // Save delivery options to localStorage
      if (settings.deliveryOptions) {
        localStorage.setItem('deliveryOptions', JSON.stringify(settings.deliveryOptions));
      }
      
      setSnackbar({
        open: true,
        message: 'সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত সেটিংস পুনরায় সেট করতে চান?')) {
      // Reset to default values
      setSettings({
        language: 'bn',
        timezone: 'Asia/Dhaka',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        theme: 'light',
        fontSize: 'medium',
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        lowStockAlert: true,
        salesNotification: true,
        paymentNotification: true,
        twoFactorAuth: false,
        sessionTimeout: 30,
        passwordExpiry: 90,
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        exportDataFormat: 'csv',
        deliveryOptions: {
          onShopSell: true,
          grameenDelivery: true,
          steadfast: false,
          redex: false
        }
      });
      setSnackbar({
        open: true,
        message: 'সেটিংস পুনরায় সেট করা হয়েছে',
        severity: 'info'
      });
    }
  };

  const handleExportData = async () => {
    try {
      // Simulate export
      setSnackbar({
        open: true,
        message: 'ডাটা এক্সপোর্ট শুরু হয়েছে...',
        severity: 'info'
      });
      // In real app, trigger data export
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'ডাটা এক্সপোর্ট করতে সমস্যা হয়েছে',
        severity: 'error'
      });
    }
  };

  const handleImportData = async () => {
    try {
      // Simulate import
      setSnackbar({
        open: true,
        message: 'ডাটা ইমপোর্ট শুরু হয়েছে...',
        severity: 'info'
      });
      // In real app, trigger data import
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'ডাটা ইমপোর্ট করতে সমস্যা হয়েছে',
        severity: 'error'
      });
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          জেনারেল সেটিংস
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            পুনরায় সেট করুন
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Language & Region */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LanguageIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ভাষা ও অঞ্চল
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>ভাষা</InputLabel>
                  <Select
                    value={settings.language}
                    label="ভাষা"
                    onChange={(e) => handleChange('language', e.target.value)}
                  >
                    <MenuItem value="bn">বাংলা</MenuItem>
                    <MenuItem value="en">English</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>সময় অঞ্চল</InputLabel>
                  <Select
                    value={settings.timezone}
                    label="সময় অঞ্চল"
                    onChange={(e) => handleChange('timezone', e.target.value)}
                  >
                    <MenuItem value="Asia/Dhaka">এশিয়া/ঢাকা (GMT+6)</MenuItem>
                    <MenuItem value="UTC">UTC (GMT+0)</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>তারিখ ফরম্যাট</InputLabel>
                  <Select
                    value={settings.dateFormat}
                    label="তারিখ ফরম্যাট"
                    onChange={(e) => handleChange('dateFormat', e.target.value)}
                  >
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>সময় ফরম্যাট</InputLabel>
                  <Select
                    value={settings.timeFormat}
                    label="সময় ফরম্যাট"
                    onChange={(e) => handleChange('timeFormat', e.target.value)}
                  >
                    <MenuItem value="12h">১২ ঘন্টা (AM/PM)</MenuItem>
                    <MenuItem value="24h">২৪ ঘন্টা</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Appearance */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                {settings.theme === 'light' ? <LightModeIcon color="primary" /> : <DarkModeIcon color="primary" />}
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  চেহারা
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>থিম</InputLabel>
                  <Select
                    value={settings.theme}
                    label="থিম"
                    onChange={(e) => handleChange('theme', e.target.value)}
                  >
                    <MenuItem value="light">হালকা</MenuItem>
                    <MenuItem value="dark">অন্ধকার</MenuItem>
                  </Select>
                </FormControl>
                
                <FormControl fullWidth>
                  <InputLabel>ফন্ট সাইজ</InputLabel>
                  <Select
                    value={settings.fontSize}
                    label="ফন্ট সাইজ"
                    onChange={(e) => handleChange('fontSize', e.target.value)}
                  >
                    <MenuItem value="small">ছোট</MenuItem>
                    <MenuItem value="medium">মধ্যম</MenuItem>
                    <MenuItem value="large">বড়</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Notifications */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  বিজ্ঞপ্তি
                </Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="ইমেইল বিজ্ঞপ্তি"
                    secondary="ইমেইলের মাধ্যমে বিজ্ঞপ্তি পান"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.emailNotifications}
                      onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <NotificationsIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="SMS বিজ্ঞপ্তি"
                    secondary="এসএমএসের মাধ্যমে বিজ্ঞপ্তি পান"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.smsNotifications}
                      onChange={(e) => handleChange('smsNotifications', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemIcon>
                    <VolumeIcon />
                  </ListItemIcon>
                  <ListItemText 
                    primary="পুশ বিজ্ঞপ্তি"
                    secondary="ব্রাউজার বিজ্ঞপ্তি পান"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.pushNotifications}
                      onChange={(e) => handleChange('pushNotifications', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="নিম্ন স্টক সতর্কতা"
                    secondary="স্টক কমে গেলে বিজ্ঞপ্তি পান"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.lowStockAlert}
                      onChange={(e) => handleChange('lowStockAlert', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="বিক্রয় বিজ্ঞপ্তি"
                    secondary="নতুন বিক্রয় সম্পর্কে জানুন"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.salesNotification}
                      onChange={(e) => handleChange('salesNotification', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="পেমেন্ট বিজ্ঞপ্তি"
                    secondary="পেমেন্ট সম্পর্কে বিজ্ঞপ্তি পান"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.paymentNotification}
                      onChange={(e) => handleChange('paymentNotification', e.target.checked)}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Security */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SecurityIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  নিরাপত্তা
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="দুই-ফ্যাক্টর প্রমাণীকরণ"
                />
                
                <TextField
                  label="সেশন টাইমআউট (মিনিট)"
                  type="number"
                  fullWidth
                  value={settings.sessionTimeout}
                  onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">মিনিট</InputAdornment>
                  }}
                />
                
                <TextField
                  label="পাসওয়ার্ড মেয়াদ (দিন)"
                  type="number"
                  fullWidth
                  value={settings.passwordExpiry}
                  onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">দিন</InputAdornment>
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Data Management */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BackupIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ডাটা ব্যবস্থাপনা
                </Typography>
              </Box>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={settings.autoBackup}
                          onChange={(e) => handleChange('autoBackup', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="স্বয়ংক্রিয় ব্যাকআপ"
                    />
                    
                    <FormControl fullWidth>
                      <InputLabel>ব্যাকআপ ফ্রিকোয়েন্সি</InputLabel>
                      <Select
                        value={settings.backupFrequency}
                        label="ব্যাকআপ ফ্রিকোয়েন্সি"
                        onChange={(e) => handleChange('backupFrequency', e.target.value)}
                        disabled={!settings.autoBackup}
                      >
                        <MenuItem value="daily">প্রতিদিন</MenuItem>
                        <MenuItem value="weekly">সাপ্তাহিক</MenuItem>
                        <MenuItem value="monthly">মাসিক</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <TextField
                      label="ব্যাকআপ সংরক্ষণ (দিন)"
                      type="number"
                      fullWidth
                      value={settings.backupRetention}
                      onChange={(e) => handleChange('backupRetention', parseInt(e.target.value) || 0)}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">দিন</InputAdornment>
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>ডাটা এক্সপোর্ট ফরম্যাট</InputLabel>
                      <Select
                        value={settings.exportDataFormat}
                        label="ডাটা এক্সপোর্ট ফরম্যাট"
                        onChange={(e) => handleChange('exportDataFormat', e.target.value)}
                      >
                        <MenuItem value="csv">CSV</MenuItem>
                        <MenuItem value="excel">Excel</MenuItem>
                        <MenuItem value="json">JSON</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <Button
                      variant="outlined"
                      startIcon={<CloudDownloadIcon />}
                      fullWidth
                      onClick={handleExportData}
                      sx={{ mt: 1 }}
                    >
                      ডাটা এক্সপোর্ট করুন
                    </Button>
                    
                    <Button
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      fullWidth
                      onClick={handleImportData}
                    >
                      ডাটা ইমপোর্ট করুন
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Delivery Options */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <ShippingIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ডেলিভারি অপশন
                </Typography>
              </Box>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                POS সিস্টেমে কোন ডেলিভারি অপশনগুলো প্রদর্শন হবে তা নির্বাচন করুন
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemText 
                    primary="অন শপ সেল (On Shop Sell)"
                    secondary="পণ্য দোকান থেকে সরাসরি বিক্রি"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.deliveryOptions?.onShopSell || false}
                      onChange={(e) => handleChange('deliveryOptions', {
                        ...settings.deliveryOptions,
                        onShopSell: e.target.checked
                      })}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="গ্রামীণ ডেলিভারি (Grameen Delivery)"
                    secondary="গ্রামীণ ডেলিভারি সার্ভিস"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.deliveryOptions?.grameenDelivery || false}
                      onChange={(e) => handleChange('deliveryOptions', {
                        ...settings.deliveryOptions,
                        grameenDelivery: e.target.checked
                      })}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="স্টেডফাস্ট (Steadfast)"
                    secondary="স্টেডফাস্ট কুরিয়ার সার্ভিস"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.deliveryOptions?.steadfast || false}
                      onChange={(e) => handleChange('deliveryOptions', {
                        ...settings.deliveryOptions,
                        steadfast: e.target.checked
                      })}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Divider />
                
                <ListItem>
                  <ListItemText 
                    primary="রেডেক্স (Redex)"
                    secondary="রেডেক্স কুরিয়ার সার্ভিস"
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={settings.deliveryOptions?.redex || false}
                      onChange={(e) => handleChange('deliveryOptions', {
                        ...settings.deliveryOptions,
                        redex: e.target.checked
                      })}
                      color="primary"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default GeneralSettingsPage;

