import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  Snackbar,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Divider,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  CalendarToday as CalendarIcon,
  Percent as PercentIcon,
  Warning as WarningIcon,
  Tune as SettingsIcon,
  Store as StoreIcon,
  Warehouse as WarehouseIcon,
  Extension as ExtensionIcon
} from '@mui/icons-material';
import { getApiBaseUrl } from '../../config/api';
import BusinessesPage from './BusinessesPage';
import WarehousesPage from './WarehousesPage';
import ModuleManagementPage from './ModuleManagementPage';

const defaultSettings = {
  currency_code: 'BDT',
  currency_symbol: '৳',
  timezone: 'Asia/Dhaka',
  date_format: 'DD/MM/YYYY',
  financial_year_start: '01-07',
  enable_vat: true,
  vat_percentage: 15,
  enable_discount: true,
  enable_barcode: true,
  enable_warranty: true,
  low_stock_threshold: 10,
  receipt_header: '',
  receipt_footer: '',
};

const CURRENCY_OPTIONS = [
  { value: 'BDT', label: 'BDT - বাংলাদেশী টাকা (৳)' },
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'INR', label: 'INR - Indian Rupee (₹)' },
];

const DATE_FORMAT_OPTIONS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (দিন/মাস/বছর)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (মাস/দিন/বছর)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (আইএসও)' },
];

const TIMEZONE_OPTIONS = [
  'Asia/Dhaka',
  'Asia/Kolkata',
  'Asia/Karachi',
  'Asia/Kathmandu',
  'Asia/Thimphu',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Bangkok',
  'Asia/Tokyo',
  'Europe/London',
  'America/New_York',
  'UTC',
];

function TabPanel({ children, value, index, ...rest }) {
  return (
    <div role="tabpanel" hidden={value !== index} id={`business-settings-tab-${index}`} aria-labelledby={`business-settings-tab-${index}`} {...rest}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

const BusinessSettingsPage = () => {
  const location = useLocation();
  const [tabValue, setTabValue] = useState(() => {
    const tab = location.state?.settingsTab;
    return typeof tab === 'number' && tab >= 0 && tab <= 3 ? tab : 0;
  });
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  const handleSettingsChange = (field, value) => {
    const v = field === 'vat_percentage' || field === 'low_stock_threshold' ? (parseFloat(value) ?? value) : value;
    setSettings((prev) => ({ ...prev, [field]: v }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem('accessToken');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(`${baseUrl}/tenant/settings`, { headers }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        const s = data?.data ?? data;
        if (s) setSettings((prev) => ({ ...prev, ...s }));
      }
    } catch (e) {
      // keep defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const tab = location.state?.settingsTab;
    if (typeof tab === 'number' && tab >= 0 && tab <= 3) setTabValue(tab);
  }, [location.state?.settingsTab]);

  const validate = () => {
    const e = {};
    if (settings.vat_percentage < 0 || settings.vat_percentage > 100) e.vat_percentage = '০–১০০ এর মধ্যে দিন';
    if (settings.low_stock_threshold < 0) e.low_stock_threshold = '০ বা তার বেশি দিন';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      setSnackbar({ open: true, message: 'ত্রুটি ঠিক করুন', severity: 'error' });
      return;
    }
    setSaving(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem('accessToken');
      const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
      const res = await fetch(`${baseUrl}/tenant/settings`, { method: 'PATCH', headers, body: JSON.stringify(settings) });
      if (!res.ok) throw new Error(await res.text());
      setSnackbar({ open: true, message: 'সেটিংস সংরক্ষণ করা হয়েছে', severity: 'success' });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || 'সংরক্ষণ করতে সমস্যা হয়েছে।',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm('সেটিংস রিসেট করতে চান?')) return;
    setSettings({ ...defaultSettings });
    setErrors({});
    setSnackbar({ open: true, message: 'রিসেট করা হয়েছে', severity: 'info' });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
        ব্যবসা সেটিংস
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab icon={<StoreIcon />} iconPosition="start" label="শাখা / দোকান" id="business-settings-tab-0" />
        <Tab icon={<WarehouseIcon />} iconPosition="start" label="গুদাম" id="business-settings-tab-2" />
        <Tab icon={<SettingsIcon />} iconPosition="start" label="সেটিংস (মুদ্রা, ভ্যাট, রশিদ)" id="business-settings-tab-1" />
        <Tab icon={<ExtensionIcon />} iconPosition="start" label="মডিউল সেটিংস" id="business-settings-tab-3" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <BusinessesPage embedded />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset}>
                রিসেট
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={saving}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)' },
                }}
              >
                {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </Button>
            </Box>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>মুদ্রা</InputLabel>
                      <Select
                        value={settings.currency_code}
                        label="মুদ্রা"
                        onChange={(e) => handleSettingsChange('currency_code', e.target.value)}
                      >
                        {CURRENCY_OPTIONS.map((o) => (
                          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="মুদ্রা প্রতীক"
                      fullWidth
                      value={settings.currency_symbol}
                      onChange={(e) => handleSettingsChange('currency_symbol', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>সময় অঞ্চল</InputLabel>
                      <Select
                        value={settings.timezone}
                        label="সময় অঞ্চল"
                        onChange={(e) => handleSettingsChange('timezone', e.target.value)}
                      >
                        {TIMEZONE_OPTIONS.map((tz) => (
                          <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>তারিখ ফরম্যাট</InputLabel>
                      <Select
                        value={settings.date_format}
                        label="তারিখ ফরম্যাট"
                        onChange={(e) => handleSettingsChange('date_format', e.target.value)}
                      >
                        {DATE_FORMAT_OPTIONS.map((o) => (
                          <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="আর্থিক বছর শুরু (MM-DD)"
                      fullWidth
                      placeholder="01-07"
                      value={settings.financial_year_start}
                      onChange={(e) => handleSettingsChange('financial_year_start', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><CalendarIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="VAT (%)"
                      fullWidth
                      type="number"
                      value={settings.vat_percentage}
                      onChange={(e) => handleSettingsChange('vat_percentage', e.target.value)}
                      error={!!errors.vat_percentage}
                      helperText={errors.vat_percentage}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><PercentIcon /></InputAdornment>,
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      label="নিম্ন স্টক সীমা"
                      fullWidth
                      type="number"
                      value={settings.low_stock_threshold}
                      onChange={(e) => handleSettingsChange('low_stock_threshold', e.target.value)}
                      error={!!errors.low_stock_threshold}
                      helperText={errors.low_stock_threshold}
                      inputProps={{ min: 0 }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><WarningIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>সক্রিয় করুন / বন্ধ করুন</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={settings.enable_vat} onChange={(e) => handleSettingsChange('enable_vat', e.target.checked)} />}
                      label="VAT"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={settings.enable_discount} onChange={(e) => handleSettingsChange('enable_discount', e.target.checked)} />}
                      label="ছাড়"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={settings.enable_barcode} onChange={(e) => handleSettingsChange('enable_barcode', e.target.checked)} />}
                      label="বারকোড"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControlLabel
                      control={<Switch checked={settings.enable_warranty} onChange={(e) => handleSettingsChange('enable_warranty', e.target.checked)} />}
                      label="ওয়ারেন্টি"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="রশিদ হেডার"
                      fullWidth
                      multiline
                      rows={2}
                      value={settings.receipt_header}
                      onChange={(e) => handleSettingsChange('receipt_header', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ alignItems: 'flex-start', pt: 1 }}><ReceiptIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="রশিদ ফুটার"
                      fullWidth
                      multiline
                      rows={2}
                      value={settings.receipt_footer}
                      onChange={(e) => handleSettingsChange('receipt_footer', e.target.value)}
                      InputProps={{
                        startAdornment: <InputAdornment position="start" sx={{ alignItems: 'flex-start', pt: 1 }}><ReceiptIcon /></InputAdornment>,
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <WarehousesPage embedded />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <ModuleManagementPage embedded />
      </TabPanel>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BusinessSettingsPage;
