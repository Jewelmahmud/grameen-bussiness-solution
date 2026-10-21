import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  Save as SaveIcon,
  Business as BusinessIcon,
  Message as MessageIcon,
  Phone as PhoneIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const HalkhataSettingsPage = () => {
  const [settings, setSettings] = useState({
    // Business Information
    businessName: 'হাবিব ট্রেডার্স',
    businessAddress: 'আমার প্রতিষ্ঠান প্রঙ্গন',
    businessPhone: '',
    businessEmail: '',
    
    // Message Settings
    defaultMessageTemplate: `প্রিয় {{customer_name}},
আসসালামু আলাইকুম। নতুন বছরের শুভ সূচনাকে কেন্দ্র করে আমাদের প্রতিষ্ঠানে হালখাতা আয়োজন করা হয়েছে। আপনার সহযোগিতা ও আস্থার প্রতি কৃতজ্ঞতা জানিয়ে আমরা এই অনুষ্ঠানে আপনার উপস্থিতি একান্তভাবে কামনা করছি।

তারিখ: {{date}}
সময়: {{time}}
স্থান: {{business_address}}

আপনার আগমন একান্তভাবে কাম্য ।

— {{business_name}}`,
    
    // Date & Time Settings
    defaultEventDate: '',
    defaultEventTime: 'সকাল ১০টা',
    
    // SMS Settings
    smsEnabled: true,
    smsProvider: 'local',
    smsApiKey: '',
    smsSenderId: '',
    
    // WhatsApp Settings
    whatsappEnabled: true,
    whatsappProvider: 'twilio',
    whatsappApiKey: '',
    whatsappBusinessNumber: '',
    
    // General Settings
    autoCalculateBalance: true,
    showBalanceInMessage: false,
    allowPartialPayment: true,
    sendReminderEnabled: false,
    reminderDaysBefore: 3,
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);

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
      console.log('Saving settings:', settings);
      
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
        businessName: 'হাবিব ট্রেডার্স',
        businessAddress: 'আমার প্রতিষ্ঠান প্রঙ্গন',
        businessPhone: '',
        businessEmail: '',
        defaultMessageTemplate: `প্রিয় {{customer_name}},
আসসালামু আলাইকুম। নতুন বছরের শুভ সূচনাকে কেন্দ্র করে আমাদের প্রতিষ্ঠানে হালখাতা আয়োজন করা হয়েছে। আপনার সহযোগিতা ও আস্থার প্রতি কৃতজ্ঞতা জানিয়ে আমরা এই অনুষ্ঠানে আপনার উপস্থিতি একান্তভাবে কামনা করছি।

তারিখ: {{date}}
সময়: {{time}}
স্থান: {{business_address}}

আপনার আগমন একান্তভাবে কাম্য ।

— {{business_name}}`,
        defaultEventDate: '',
        defaultEventTime: 'সকাল ১০টা',
        smsEnabled: true,
        smsProvider: 'local',
        smsApiKey: '',
        smsSenderId: '',
        whatsappEnabled: true,
        whatsappProvider: 'twilio',
        whatsappApiKey: '',
        whatsappBusinessNumber: '',
        autoCalculateBalance: true,
        showBalanceInMessage: false,
        allowPartialPayment: true,
        sendReminderEnabled: false,
        reminderDaysBefore: 3,
      });
      setSnackbar({
        open: true,
        message: 'সেটিংস পুনরায় সেট করা হয়েছে',
        severity: 'info'
      });
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          হালখাতা সেটিংস
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
        {/* Business Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <BusinessIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ব্যবসায়িক তথ্য
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="প্রতিষ্ঠানের নাম"
                  fullWidth
                  value={settings.businessName}
                  onChange={(e) => handleChange('businessName', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  label="ঠিকানা"
                  fullWidth
                  multiline
                  rows={2}
                  value={settings.businessAddress}
                  onChange={(e) => handleChange('businessAddress', e.target.value)}
                />
                
                <TextField
                  label="ফোন নম্বর"
                  fullWidth
                  value={settings.businessPhone}
                  onChange={(e) => handleChange('businessPhone', e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  label="ইমেইল"
                  fullWidth
                  type="email"
                  value={settings.businessEmail}
                  onChange={(e) => handleChange('businessEmail', e.target.value)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Event Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <AccessTimeIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  অনুষ্ঠানের তথ্য
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="ডিফল্ট তারিখ"
                  fullWidth
                  type="date"
                  value={settings.defaultEventDate}
                  onChange={(e) => handleChange('defaultEventDate', e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                
                <TextField
                  label="ডিফল্ট সময়"
                  fullWidth
                  value={settings.defaultEventTime}
                  onChange={(e) => handleChange('defaultEventTime', e.target.value)}
                  placeholder="সকাল ১০টা"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Message Template */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MessageIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ডিফল্ট বার্তা টেমপ্লেট
                </Typography>
              </Box>
              
              <TextField
                label="বার্তা টেমপ্লেট"
                fullWidth
                multiline
                rows={12}
                value={settings.defaultMessageTemplate}
                onChange={(e) => handleChange('defaultMessageTemplate', e.target.value)}
                placeholder="আপনার বার্তা টেমপ্লেট লিখুন..."
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                উপলব্ধ ভ্যারিয়েবল: {'{{customer_name}}'}, {'{{date}}'}, {'{{time}}'}, {'{{business_name}}'}, {'{{business_address}}'}, {'{{amount}}'}
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* SMS Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    SMS সেটিংস
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.smsEnabled}
                      onChange={(e) => handleChange('smsEnabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={settings.smsEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                />
              </Box>
              
              {settings.smsEnabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>SMS প্রোভাইডার</InputLabel>
                    <Select
                      value={settings.smsProvider}
                      label="SMS প্রোভাইডার"
                      onChange={(e) => handleChange('smsProvider', e.target.value)}
                    >
                      <MenuItem value="local">লোকাল</MenuItem>
                      <MenuItem value="twilio">Twilio</MenuItem>
                      <MenuItem value="nexmo">Nexmo</MenuItem>
                      <MenuItem value="custom">কাস্টম</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="API Key"
                    fullWidth
                    type="password"
                    value={settings.smsApiKey}
                    onChange={(e) => handleChange('smsApiKey', e.target.value)}
                  />
                  
                  <TextField
                    label="Sender ID"
                    fullWidth
                    value={settings.smsSenderId}
                    onChange={(e) => handleChange('smsSenderId', e.target.value)}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* WhatsApp Settings */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MessageIcon color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    WhatsApp সেটিংস
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.whatsappEnabled}
                      onChange={(e) => handleChange('whatsappEnabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={settings.whatsappEnabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                />
              </Box>
              
              {settings.whatsappEnabled && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>WhatsApp প্রোভাইডার</InputLabel>
                    <Select
                      value={settings.whatsappProvider}
                      label="WhatsApp প্রোভাইডার"
                      onChange={(e) => handleChange('whatsappProvider', e.target.value)}
                    >
                      <MenuItem value="twilio">Twilio</MenuItem>
                      <MenuItem value="whatsapp-api">WhatsApp API</MenuItem>
                      <MenuItem value="custom">কাস্টম</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <TextField
                    label="API Key"
                    fullWidth
                    type="password"
                    value={settings.whatsappApiKey}
                    onChange={(e) => handleChange('whatsappApiKey', e.target.value)}
                  />
                  
                  <TextField
                    label="বিজনেস নম্বর"
                    fullWidth
                    value={settings.whatsappBusinessNumber}
                    onChange={(e) => handleChange('whatsappBusinessNumber', e.target.value)}
                  />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* General Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                সাধারণ সেটিংস
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoCalculateBalance}
                      onChange={(e) => handleChange('autoCalculateBalance', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="স্বয়ংক্রিয়ভাবে ব্যালেন্স গণনা করুন"
                />
                
                <Divider />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.showBalanceInMessage}
                      onChange={(e) => handleChange('showBalanceInMessage', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="বার্তায় ব্যালেন্স দেখান"
                />
                
                <Divider />
                
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.allowPartialPayment}
                      onChange={(e) => handleChange('allowPartialPayment', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="আংশিক পরিশোধের অনুমতি দিন"
                />
                
                <Divider />
                
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.sendReminderEnabled}
                        onChange={(e) => handleChange('sendReminderEnabled', e.target.checked)}
                        color="primary"
                      />
                    }
                    label="অনুষ্ঠানের আগে রিমাইন্ডার পাঠান"
                  />
                  
                  {settings.sendReminderEnabled && (
                    <TextField
                      label="দিন আগে"
                      type="number"
                      value={settings.reminderDaysBefore}
                      onChange={(e) => handleChange('reminderDaysBefore', parseInt(e.target.value) || 0)}
                      sx={{ width: 150 }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">দিন</InputAdornment>
                      }}
                    />
                  )}
                </Box>
              </Box>
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

export default HalkhataSettingsPage;
