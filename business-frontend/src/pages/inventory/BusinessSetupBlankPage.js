import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Switch,
  FormControlLabel,
  Paper,
  Button,
  Autocomplete,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import InventoryIcon from '@mui/icons-material/Inventory';
import axios from 'axios';
import { getApiBaseUrl, getAuthApiBaseUrl } from '../../config/api';

const initialForm = {
  tenant_uuid: '',
  business_type_uuid: '',
  business_name: '',
  name: '',
  code: '',
  logo_url: '',
  domain: '',
  company_id: '',
  address: '',
  country_code: '',
  location_level_1_id: '',
  location_level_2_id: '',
  location_level_3_id: '',
  location_level_4_id: '',
  location_level_5_id: '',
  location_level_6_id: '',
  location_level_7_id: '',
  location_rank: '',
  postal_code: '',
  phone: '',
  email: '',
  manager_uuid: '',
  tin_number: '',
  trade_license: '',
  opening_time: '08:00',
  closing_time: '22:00',
  enable_pos: true,
  is_active: true,
  is_primary: false,
  is_personal_website_enabled: false,
  is_marketplace_enabled: true,
  // tenant_settings fields
  currency_code: 'BDT',
  currency_symbol: '৳',
  timezone: 'Asia/Dhaka',
  date_format: 'DD/MM/YYYY',
  financial_year_start: '01-07',
  enable_vat: true,
  vat_percentage: '15.00',
  enable_discount: true,
  enable_barcode: true,
  enable_warranty: true,
  low_stock_threshold: '10',
  receipt_header: '',
  receipt_footer: '',
  // default unit fields
  unit_name: '',
  unit_short_name_en: '',
  unit_short_name_bn: '',
  unit_type: '',
  is_base_unit: true,
  unit_is_active: true,
};

const PageWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
  padding: theme.spacing(4),
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(2),
  },
}));

const FormCard = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: 960,
  padding: theme.spacing(4),
  borderRadius: 4,
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)',
  border: '1px solid rgba(148, 163, 184, 0.3)',
  position: 'relative',
  zIndex: 1,
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(1),
  color: '#0f172a',
}));

const SectionSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '0.9rem',
  color: '#64748b',
  marginBottom: theme.spacing(3),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f1f5f9',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#667eea',
    },
  },
}));

const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 4,
    backgroundColor: '#f8fafc',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f1f5f9',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
        borderWidth: 2,
      },
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    '&.Mui-focused': {
      color: '#667eea',
    },
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  borderRadius: 4,
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '0.95rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 10px 25px rgba(129, 140, 248, 0.4)',
  color: '#ffffff',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
    boxShadow: '0 14px 30px rgba(129, 140, 248, 0.55)',
  },
}));

// Abstract gradient shapes for decoration (inspired by login page)
const AbstractShape = styled(Box)(({ position, size, color, rotation }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  opacity: 0.55,
  filter: 'blur(40px)',
  ...position,
  transform: `rotate(${rotation}deg)`,
  zIndex: 0,
}));

const DottedPattern = styled(Box)(() => ({
  position: 'absolute',
  top: '8%',
  right: '8%',
  width: '220px',
  height: '220px',
  backgroundImage: 'radial-gradient(circle, #667eea 1px, transparent 1px)',
  backgroundSize: '18px 18px',
  opacity: 0.1,
  zIndex: 0,
}));

const BusinessSetupBlankPage = () => {
  const [form, setForm] = useState(initialForm);
  const [activeStep, setActiveStep] = useState(0);
  const [countries, setCountries] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [upazilas, setUpazilas] = useState([]);
  const [unions, setUnions] = useState([]);
  const [villages, setVillages] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const apiBaseUrl = getApiBaseUrl();
  const authBaseUrl = getAuthApiBaseUrl();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const steps = [
    { label: 'ব্যবসার তথ্য' },
    { label: 'ব্যবসার সেটিংস' },
    { label: 'ডিফল্ট ইউনিট' },
  ];

  const handleChange = (field) => (event) => {
    const value =
      typeof form[field] === 'boolean'
        ? event.target.checked
        : event.target.value;

    // Auto-generate short business code from English name; no direct user input field
    if (field === 'name') {
      const cleaned = (value || '')
        .toString()
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '');
      let generatedCode = cleaned.slice(0, 4);
      if (!generatedCode) {
        generatedCode = 'BIZ1';
      } else if (generatedCode.length < 4) {
        generatedCode = generatedCode.padEnd(4, '1').slice(0, 4);
      }

      setForm((prev) => ({
        ...prev,
        [field]: value,
        code: generatedCode,
      }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Step 0: create business first
    if (activeStep === 0) {
      const tenantUuid = localStorage.getItem('tenant_uuid');
      const token = localStorage.getItem('accessToken');

      const errors = [];
      if (!tenantUuid) errors.push('tenant_uuid অনুপস্থিত। আবার লগইন করুন।');
      if (!form.business_type_uuid) errors.push('বিজনেস টাইপ নির্বাচন করুন।');
      if (!form.business_name) errors.push('বাংলা বিজনেস নাম দিন।');
      if (!form.name) errors.push('ইংরেজি বিজনেস নাম দিন।');
      if (!form.phone) errors.push('মোবাইল নম্বর দিন।');
      if (!form.email) errors.push('ইমেইল দিন।');

      if (errors.length) {
        setSubmitError(errors.join(' '));
        return;
      }

      // Prepare payload
      const code =
        form.code && form.code.length <= 4
          ? form.code
          : (() => {
              const cleaned = (form.name || form.business_name || '')
                .toString()
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '');
              let c = cleaned.slice(0, 4);
              if (!c) c = 'BIZ1';
              if (c.length < 4) c = c.padEnd(4, '1').slice(0, 4);
              return c;
            })();

      const payload = {
        tenant_uuid: tenantUuid,
        business_type_uuid: form.business_type_uuid,
        business_name: form.business_name,
        business_name_en: form.name,
        code,
        logo_url: form.logo_url || undefined,
        domain: form.domain || undefined,
        company_id: form.company_id || undefined,
        address: form.address || '',
        country_code: form.country_code || undefined,
        location_level_1_id: form.location_level_1_id || null,
        location_level_2_id: form.location_level_2_id || null,
        location_level_3_id: form.location_level_3_id || null,
        location_level_4_id: form.location_level_4_id || null,
        location_level_5_id: form.location_level_5_id || null,
        location_level_6_id: form.location_level_6_id || null,
        location_level_7_id: form.location_level_7_id || null,
        location_rank: form.location_rank || 1,
        postal_code: form.postal_code || '',
        phone: form.phone,
        email: form.email,
        manager_uuid: form.manager_uuid || undefined,
        tin_number: form.tin_number || undefined,
        trade_license: form.trade_license || undefined,
        opening_time: form.opening_time
          ? `${form.opening_time}:00`
          : undefined,
        closing_time: form.closing_time
          ? `${form.closing_time}:00`
          : undefined,
        enable_pos: true,
        is_active: true,
        is_primary: true,
        is_personal_website_enabled: form.is_personal_website_enabled,
        is_marketplace_enabled: form.is_marketplace_enabled,
      };

      setSubmitting(true);
      try {
        const headers = {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
        const response = await axios.post(
          `${apiBaseUrl}/admin/businesses`,
          payload,
          { headers }
        );
        const data = response.data?.data ?? response.data;
        if (data?.business_uuid) {
          localStorage.setItem('business_uuid', data.business_uuid);
        }
        // Move to next step on success
        setActiveStep((prev) => Math.min(prev + 1, 2));
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'ব্যবসা তৈরি করতে সমস্যা হয়েছে।';
        setSubmitError(msg);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Later steps: just advance for now
    if (activeStep < steps.length - 1) {
      setActiveStep((prev) => prev + 1);
      return;
    }
  };

  // Prefill phone and email from logged-in user (from token/localStorage)
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;
      const user = JSON.parse(storedUser);
      const phone = user?.phone || user?.mobile || user?.phone_number || '';
      const email = user?.email || '';

      setForm((prev) => ({
        ...prev,
        phone: prev.phone || phone,
        email: prev.email || email,
      }));
    } catch {
      // ignore parse errors
    }
  }, []);

  // Load countries on first mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get(
          `${authBaseUrl}/locations/countries`,
          { headers: getAuthHeaders() }
        );
        const data = response.data?.data ?? [];
        setCountries(data);
      } catch (err) {
        console.error('Failed to load countries', err);
      }
    };

    fetchCountries();
  }, [authBaseUrl]);

  // Load business types from main server
  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${apiBaseUrl}/business-types`, {
          headers,
        });
        const data = response.data?.data ?? [];
        setBusinessTypes(data);
      } catch (err) {
        console.error('Failed to load business types', err);
      }
    };

    fetchBusinessTypes();
  }, [apiBaseUrl]);

  const handleCountrySelect = async (event) => {
    const countryCode = event.target.value;
    setForm((prev) => ({
      ...prev,
      country_code: countryCode,
      location_level_1_id: '',
      location_level_2_id: '',
      location_level_3_id: '',
      location_level_4_id: '',
      location_level_5_id: '',
      location_level_6_id: '',
      location_level_7_id: '',
    }));
    setDivisions([]);
    setDistricts([]);
    setUpazilas([]);
    setUnions([]);
    setVillages([]);

    if (!countryCode) return;

    try {
      const response = await axios.get(
        `${authBaseUrl}/locations`,
        {
          params: { typeName: 'division', countryCode },
          headers: getAuthHeaders(),
        }
      );
      const data = response.data?.data ?? [];
      setDivisions(data);
    } catch (err) {
      console.error('Failed to load divisions', err);
    }
  };

  const handleDivisionSelect = async (event) => {
    const divisionId = event.target.value;
    setForm((prev) => ({
      ...prev,
      location_level_1_id: divisionId,
      location_level_2_id: '',
      location_level_3_id: '',
      location_level_4_id: '',
      location_level_5_id: '',
      location_level_6_id: '',
      location_level_7_id: '',
    }));
    setDistricts([]);
    setUpazilas([]);
    setUnions([]);
    setVillages([]);

    if (!divisionId) return;

    try {
      const response = await axios.get(
        `${authBaseUrl}/locations`,
        {
          params: { parentId: divisionId },
          headers: getAuthHeaders(),
        }
      );
      const data = response.data?.data ?? [];
      setDistricts(data);
    } catch (err) {
      console.error('Failed to load districts', err);
    }
  };

  const handleDistrictSelect = async (event) => {
    const districtId = event.target.value;
    setForm((prev) => ({
      ...prev,
      location_level_2_id: districtId,
      location_level_3_id: '',
      location_level_4_id: '',
      location_level_5_id: '',
      location_level_6_id: '',
      location_level_7_id: '',
    }));
    setUpazilas([]);
    setUnions([]);
    setVillages([]);

    if (!districtId) return;

    try {
      const response = await axios.get(
        `${authBaseUrl}/locations`,
        {
          params: { parentId: districtId },
          headers: getAuthHeaders(),
        }
      );
      const data = response.data?.data ?? [];
      setUpazilas(data);
    } catch (err) {
      console.error('Failed to load upazilas', err);
    }
  };

  const handleUpazilaSelect = async (event) => {
    const upazilaId = event.target.value;
    setForm((prev) => ({
      ...prev,
      location_level_3_id: upazilaId,
      location_level_4_id: '',
      location_level_5_id: '',
      location_level_6_id: '',
      location_level_7_id: '',
    }));
    setUnions([]);
    setVillages([]);

    if (!upazilaId) return;

    try {
      const response = await axios.get(
        `${authBaseUrl}/locations`,
        {
          params: { parentId: upazilaId },
          headers: getAuthHeaders(),
        }
      );
      const data = response.data?.data ?? [];
      setUnions(data);
    } catch (err) {
      console.error('Failed to load unions', err);
    }
  };

  const handleUnionSelect = async (event) => {
    const unionId = event.target.value;
    setForm((prev) => ({
      ...prev,
      location_level_4_id: unionId,
      location_level_5_id: '',
      location_level_6_id: '',
      location_level_7_id: '',
    }));
    setVillages([]);

    if (!unionId) return;

    try {
      const response = await axios.get(
        `${authBaseUrl}/locations`,
        {
          params: { parentId: unionId },
          headers: getAuthHeaders(),
        }
      );
      const data = response.data?.data ?? [];
      setVillages(data);
    } catch (err) {
      console.error('Failed to load villages', err);
    }
  };

  const handleVillageSelect = (event) => {
    const villageId = event.target.value;
    setForm((prev) => ({
      ...prev,
      location_level_5_id: villageId,
    }));
  };

  return (
    <PageWrapper>
      {/* Decorative background similar to login page */}
      <DottedPattern />
      <AbstractShape
        position={{ top: '-5%', left: '-5%' }}
        size="320px"
        color="linear-gradient(135deg, rgba(102,126,234,0.55) 0%, rgba(118,75,162,0.55) 100%)"
        rotation={0}
      />
      <AbstractShape
        position={{ top: '65%', left: '-10%' }}
        size="280px"
        color="linear-gradient(135deg, rgba(255,152,0,0.45) 0%, rgba(233,30,99,0.45) 100%)"
        rotation={45}
      />
      <AbstractShape
        position={{ top: '10%', right: '-5%' }}
        size="260px"
        color="linear-gradient(135deg, rgba(33,150,243,0.4) 0%, rgba(156,39,176,0.4) 100%)"
        rotation={90}
      />
      <AbstractShape
        position={{ bottom: '-10%', right: '10%' }}
        size="340px"
        color="linear-gradient(135deg, rgba(255,82,82,0.5) 0%, rgba(255,255,255,0.4) 100%)"
        rotation={135}
      />

      <FormCard>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 4,
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1.5,
            }}
          >
            <InventoryIcon sx={{ color: 'white' }} />
          </Box>
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: '.02em',
                fontSize: '1.25rem',
                background:
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              গ্রামীণ ব্যবসা
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: '#64748b', mt: 0.25 }}
            >
              প্রথমবারের মতো ব্যবসা সেটআপ করুন
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 4,
            position: 'relative',
            px: 1,
          }}
        >
          {/* Base line across all steps */}
          <Box
            sx={{
              position: 'absolute',
              top: 18,
              left: 32,
              right: 32,
              height: 2,
              backgroundColor: '#e2e8f0',
              zIndex: 0,
            }}
          />

          {steps.map((step, index) => {
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;

            return (
              <Box
                key={step.label}
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: index === 0 ? 'flex-start' : index === steps.length - 1 ? 'flex-end' : 'center',
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: isActive || isCompleted ? '#00AEEF' : '#cbd5f5',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive || isCompleted ? '#00AEEF' : '#94a3b8',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  {index + 1}
                </Box>
                {/* Active/completed line overlay to match blue segment */}
                {index < activeStep && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 18,
                      left: index === 0 ? 32 : '50%',
                      right: index === steps.length - 1 ? 32 : '50%',
                      height: 2,
                      backgroundColor: '#00AEEF',
                      zIndex: 0,
                    }}
                  />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive || isCompleted ? '#0f172a' : '#94a3b8',
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <SectionTitle variant="h5">ব্যবসা সেটআপ করুন</SectionTitle>
        <SectionSubtitle>
          ধাপে ধাপে তথ্য দিন – প্রথমে ব্যবসার তথ্য, তারপর সেটিংস, তারপর ডিফল্ট ইউনিট।
        </SectionSubtitle>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {activeStep === 0 && (
              <>
                {submitError && (
                  <Grid item xs={12}>
                    <Alert severity="error" sx={{ mb: 1, borderRadius: 2 }}>
                      {submitError}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={businessTypes}
                    getOptionLabel={(option) => {
                      const bn = option?.name_bn || '';
                      const en = option?.name || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      businessTypes.find(
                        (t) => t.business_type_uuid === form.business_type_uuid
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleChange('business_type_uuid')({
                        target: { value: newValue?.business_type_uuid || '' },
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="বিজনেস টাইপ নির্বাচন করুন"
                        placeholder="কৃষি, ফার্মেসি, মুদি ইত্যাদি লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="বিজনেস নাম (বাংলা)"
                    value={form.business_name}
                    onChange={handleChange('business_name')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="বিজনেস নাম (ইংরেজি নাম / শর্ট নাম)"
                    value={form.name}
                    onChange={handleChange('name')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="মোবাইল নম্বর"
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ইমেইল (ঐচ্ছিক)"
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={countries}
                    getOptionLabel={(option) => {
                      const bn = option?.countryNameBn || '';
                      const en = option?.countryName || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      countries.find(
                        (c) => c.countryCode === form.country_code
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleCountrySelect({
                        target: { value: newValue?.countryCode || '' },
                      })
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="দেশ নির্বাচন করুন"
                        placeholder="দেশের নাম লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={divisions}
                    getOptionLabel={(option) => {
                      const bn = option?.name_bn || '';
                      const en = option?.name_en || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      divisions.find(
                        (d) => d.id === form.location_level_1_id
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleDivisionSelect({
                        target: { value: newValue?.id || '' },
                      })
                    }
                    disabled={!divisions.length}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="বিভাগ / স্টেট"
                        placeholder="বিভাগের নাম লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={districts}
                    getOptionLabel={(option) => {
                      const bn = option?.name_bn || '';
                      const en = option?.name_en || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      districts.find(
                        (d) => d.id === form.location_level_2_id
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleDistrictSelect({
                        target: { value: newValue?.id || '' },
                      })
                    }
                    disabled={!districts.length}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="জেলা"
                        placeholder="জেলার নাম লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={upazilas}
                    getOptionLabel={(option) => {
                      const bn = option?.name_bn || '';
                      const en = option?.name_en || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      upazilas.find(
                        (u) => u.id === form.location_level_3_id
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleUpazilaSelect({
                        target: { value: newValue?.id || '' },
                      })
                    }
                    disabled={!upazilas.length}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="উপজেলা"
                        placeholder="উপজেলার নাম লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={unions}
                    getOptionLabel={(option) => {
                      const bn = option?.name_bn || '';
                      const en = option?.name_en || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      unions.find(
                        (u) => u.id === form.location_level_4_id
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleUnionSelect({
                        target: { value: newValue?.id || '' },
                      })
                    }
                    disabled={!unions.length}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="ইউনিয়ন"
                        placeholder="ইউনিয়নের নাম লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledAutocomplete
                    fullWidth
                    options={villages}
                    getOptionLabel={(option) => {
                      const bn = option?.name_bn || '';
                      const en = option?.name_en || '';
                      return `${bn} ${en}`.trim();
                    }}
                    value={
                      villages.find(
                        (v) => v.id === form.location_level_5_id
                      ) || null
                    }
                    onChange={(_, newValue) =>
                      handleVillageSelect({
                        target: { value: newValue?.id || '' },
                      })
                    }
                    disabled={!villages.length}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="গ্রাম / ওয়ার্ড"
                        placeholder="গ্রামের নাম লিখে সার্চ করুন"
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="পোস্ট কোড (ঐচ্ছিক)"
                    value={form.postal_code}
                    onChange={handleChange('postal_code')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    label="ঠিকানা লাইন"
                    placeholder="Shop # 401, Multiplan Center"
                    value={form.address}
                    onChange={handleChange('address')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ট্রেড লাইসেন্স নম্বর (ঐচ্ছিক)"
                    value={form.trade_license}
                    onChange={handleChange('trade_license')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="TIN নম্বর (ঐচ্ছিক)"
                    value={form.tin_number}
                    onChange={handleChange('tin_number')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    type="time"
                    label="খোলার সময়"
                    value={form.opening_time}
                    onChange={handleChange('opening_time')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    type="time"
                    label="বন্ধের সময়"
                    value={form.closing_time}
                    onChange={handleChange('closing_time')}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300,
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      mt: 1,
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid rgba(59,130,246,0.35)',
                      background:
                        'linear-gradient(135deg, rgba(219,234,254,0.8) 0%, rgba(239,246,255,0.9) 100%)',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_marketplace_enabled}
                          onChange={handleChange('is_marketplace_enabled')}
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#2563eb',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                              {
                                backgroundColor: '#2563eb',
                              },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography sx={{ fontWeight: 700, color: '#1d4ed8' }}>
                            গ্রামীণ বাজারে বিক্রি করুন
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#475569', mt: 0.25 }}
                          >
                            এই অপশন চালু করলে আপনার পণ্য গ্রামীণ বাজার মার্কেটপ্লেসে
                            দেখানো হবে।
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                </Grid>
              </>
            )}

            {activeStep === 1 && (
              <>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="মুদ্রার কোড (যেমন: BDT)"
                    value={form.currency_code}
                    onChange={handleChange('currency_code')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="মুদ্রা সিম্বল (যেমন: ৳)"
                    value={form.currency_symbol}
                    onChange={handleChange('currency_symbol')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="টাইমজোন"
                    value={form.timezone}
                    onChange={handleChange('timezone')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="তারিখ ফরম্যাট"
                    placeholder="যেমন: DD/MM/YYYY"
                    value={form.date_format}
                    onChange={handleChange('date_format')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ফাইন্যান্সিয়াল ইয়ার শুরু (DD-MM)"
                    placeholder="যেমন: 01-07"
                    value={form.financial_year_start}
                    onChange={handleChange('financial_year_start')}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ভ্যাট পারসেন্টেজ (%)"
                    value={form.vat_percentage}
                    onChange={handleChange('vat_percentage')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.enable_vat}
                          onChange={handleChange('enable_vat')}
                        />
                      }
                      label="ভ্যাট প্রযোজ্য"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.enable_discount}
                          onChange={handleChange('enable_discount')}
                        />
                      }
                      label="ডিসকাউন্ট চালু"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.enable_barcode}
                          onChange={handleChange('enable_barcode')}
                        />
                      }
                      label="বারকোড ব্যবহার"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.enable_warranty}
                          onChange={handleChange('enable_warranty')}
                        />
                      }
                      label="ওয়ারেন্টি ট্র্যাকিং"
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="লো স্টক থ্রেশহোল্ড"
                    placeholder="যেমন: 10"
                    value={form.low_stock_threshold}
                    onChange={handleChange('low_stock_threshold')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="রসিদের হেডার (ঐচ্ছিক)"
                    value={form.receipt_header}
                    onChange={handleChange('receipt_header')}
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    multiline
                    minRows={2}
                    label="রসিদের ফুটার (ঐচ্ছিক)"
                    value={form.receipt_footer}
                    onChange={handleChange('receipt_footer')}
                  />
                </Grid>
              </>
            )}

            {activeStep === 2 && (
              <>
                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ডিফল্ট ইউনিটের নাম (যেমন: কেজি, পিস)"
                    value={form.unit_name}
                    onChange={handleChange('unit_name')}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <StyledTextField
                    fullWidth
                    label="শর্ট নাম (EN)"
                    placeholder="যেমন: kg"
                    value={form.unit_short_name_en}
                    onChange={handleChange('unit_short_name_en')}
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <StyledTextField
                    fullWidth
                    label="শর্ট নাম (BN)"
                    placeholder="যেমন: কেজি"
                    value={form.unit_short_name_bn}
                    onChange={handleChange('unit_short_name_bn')}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <StyledTextField
                    fullWidth
                    label="ইউনিট টাইপ (ঐচ্ছিক)"
                    placeholder="যেমন: weight, quantity"
                    value={form.unit_type}
                    onChange={handleChange('unit_type')}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 2,
                      mt: 1,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.is_base_unit}
                          onChange={handleChange('is_base_unit')}
                        />
                      }
                      label="বেস ইউনিট (মূল ইউনিট)"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.unit_is_active}
                          onChange={handleChange('unit_is_active')}
                        />
                      }
                      label="ইউনিট সক্রিয়"
                    />
                  </Box>
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: '#64748b' }}
                >
                  {activeStep === 0 &&
                    'প্রথমে আপনার ব্যবসার মৌলিক তথ্য দিন।'}
                  {activeStep === 1 &&
                    'এখন ব্যবসার আর্থিক ও রসিদ সংক্রান্ত সেটিংস ঠিক করুন।'}
                  {activeStep === 2 &&
                    'সবশেষে আপনার ডিফল্ট পণ্য ইউনিট সেট করুন।'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  {activeStep > 0 && (
                    <Button
                      type="button"
                      variant="outlined"
                      onClick={() =>
                        setActiveStep((prev) => Math.max(prev - 1, 0))
                      }
                      sx={{
                        borderRadius: 4,
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    >
                      আগের ধাপ
                    </Button>
                  )}
                  <PrimaryButton type="submit">
                    {activeStep === steps.length - 1
                      ? 'সেটআপ সম্পন্ন করুন'
                      : 'সেভ করুন ও পরের ধাপে যান'}
                  </PrimaryButton>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </FormCard>
    </PageWrapper>
  );
};

export default BusinessSetupBlankPage;

