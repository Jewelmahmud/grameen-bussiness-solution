import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Alert,
  Snackbar,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  PhotoCamera as PhotoCameraIcon,
  Refresh as RefreshIcon,
  Lock as LockIcon
} from '@mui/icons-material';

const ProfileSettingsPage = () => {
  const [profileData, setProfileData] = useState({
    // Personal Information
    firstName: 'আব্দুল',
    lastName: 'করিম',
    displayName: 'আব্দুল করিম',
    email: 'abdul.karim@example.com',
    phone: '+880 1712-345678',
    mobile: '+880 1712-345678',
    
    // Address Information
    address: 'ধানমন্ডি, ঢাকা',
    city: 'ঢাকা',
    state: 'ঢাকা বিভাগ',
    postalCode: '1205',
    country: 'বাংলাদেশ',
    
    // Profile Picture
    profilePicture: null,
    
    // Additional Information
    designation: 'ম্যানেজার',
    department: 'বিক্রয়',
    company: 'হাবিব ট্রেডার্স',
    bio: 'আমি একজন অভিজ্ঞ ব্যবসায়ী এবং ম্যানেজার।',
    
    // Security
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setSnackbar({
          open: true,
          message: 'ছবির আকার 5MB এর কম হতে হবে',
          severity: 'error'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profilePicture: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      newErrors.email = 'সঠিক ইমেইল ঠিকানা দিন';
    }
    
    // Phone validation
    if (profileData.phone && !/^\+?[\d\s-]+$/.test(profileData.phone)) {
      newErrors.phone = 'সঠিক ফোন নম্বর দিন';
    }
    
    // Password validation (if changing password)
    if (profileData.currentPassword || profileData.newPassword || profileData.confirmPassword) {
      if (!profileData.currentPassword) {
        newErrors.currentPassword = 'বর্তমান পাসওয়ার্ড প্রয়োজন';
      }
      if (!profileData.newPassword) {
        newErrors.newPassword = 'নতুন পাসওয়ার্ড প্রয়োজন';
      } else if (profileData.newPassword.length < 6) {
        newErrors.newPassword = 'পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে';
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        newErrors.confirmPassword = 'পাসওয়ার্ড মিলছে না';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'অনুগ্রহ করে ফর্মের ত্রুটি ঠিক করুন',
        severity: 'error'
      });
      return;
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real app, save to backend
      console.log('Saving profile:', profileData);
      
      setSnackbar({
        open: true,
        message: 'প্রোফাইল সফলভাবে সংরক্ষণ করা হয়েছে',
        severity: 'success'
      });
      
      // Clear password fields after successful save
      if (profileData.currentPassword) {
        setProfileData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'প্রোফাইল সংরক্ষণ করতে সমস্যা হয়েছে',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('আপনি কি নিশ্চিত যে আপনি সমস্ত পরিবর্তন বাতিল করতে চান?')) {
      // Reset to default values (in real app, fetch from API)
      setProfileData({
        firstName: 'আব্দুল',
        lastName: 'করিম',
        displayName: 'আব্দুল করিম',
        email: 'abdul.karim@example.com',
        phone: '+880 1712-345678',
        mobile: '+880 1712-345678',
        address: 'ধানমন্ডি, ঢাকা',
        city: 'ঢাকা',
        state: 'ঢাকা বিভাগ',
        postalCode: '1205',
        country: 'বাংলাদেশ',
        profilePicture: null,
        designation: 'ম্যানেজার',
        department: 'বিক্রয়',
        company: 'হাবিব ট্রেডার্স',
        bio: 'আমি একজন অভিজ্ঞ ব্যবসায়ী এবং ম্যানেজার।',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setSnackbar({
        open: true,
        message: 'ফর্ম রিসেট করা হয়েছে',
        severity: 'info'
      });
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          প্রোফাইল সেটিংস
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleReset}
          >
            রিসেট করুন
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
        {/* Profile Picture Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
              <Avatar
                src={profileData.profilePicture}
                sx={{
                  width: 120,
                  height: 120,
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '3rem'
                }}
              >
                {!profileData.profilePicture && (
                  <PersonIcon sx={{ fontSize: 60 }} />
                )}
              </Avatar>
              
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="profile-picture-upload"
                type="file"
                onChange={handleProfilePictureChange}
              />
              <label htmlFor="profile-picture-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ mb: 2 }}
                >
                  ছবি পরিবর্তন করুন
                </Button>
              </label>
              
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {profileData.displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {profileData.designation}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {profileData.email}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ব্যক্তিগত তথ্য
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="প্রথম নাম"
                    fullWidth
                    value={profileData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="শেষ নাম"
                    fullWidth
                    value={profileData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="প্রদর্শিত নাম"
                    fullWidth
                    value={profileData.displayName}
                    onChange={(e) => handleChange('displayName', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ইমেইল"
                    fullWidth
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="ফোন নম্বর"
                    fullWidth
                    value={profileData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="পদবী"
                    fullWidth
                    value={profileData.designation}
                    onChange={(e) => handleChange('designation', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="বিবরণ"
                    fullWidth
                    multiline
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="আপনার নিজের সম্পর্কে কিছু লিখুন..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Address Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocationIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ঠিকানা তথ্য
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="ঠিকানা"
                    fullWidth
                    multiline
                    rows={2}
                    value={profileData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="শহর"
                    fullWidth
                    value={profileData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="বিভাগ/রাজ্য"
                    fullWidth
                    value={profileData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="পোস্টাল কোড"
                    fullWidth
                    value={profileData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    label="দেশ"
                    fullWidth
                    value={profileData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <PersonIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  কোম্পানি তথ্য
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="কোম্পানি/প্রতিষ্ঠানের নাম"
                    fullWidth
                    value={profileData.company}
                    onChange={(e) => handleChange('company', e.target.value)}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="ডিপার্টমেন্ট"
                    fullWidth
                    value={profileData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Change Password */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LockIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  পাসওয়ার্ড পরিবর্তন
                </Typography>
              </Box>
              
              <Alert severity="info" sx={{ mb: 2 }}>
                পাসওয়ার্ড পরিবর্তন করতে নিচের ক্ষেত্রগুলি পূরণ করুন
              </Alert>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="বর্তমান পাসওয়ার্ড"
                    fullWidth
                    type="password"
                    value={profileData.currentPassword}
                    onChange={(e) => handleChange('currentPassword', e.target.value)}
                    error={!!errors.currentPassword}
                    helperText={errors.currentPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="নতুন পাসওয়ার্ড"
                    fullWidth
                    type="password"
                    value={profileData.newPassword}
                    onChange={(e) => handleChange('newPassword', e.target.value)}
                    error={!!errors.newPassword}
                    helperText={errors.newPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    label="পাসওয়ার্ড নিশ্চিত করুন"
                    fullWidth
                    type="password"
                    value={profileData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
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

export default ProfileSettingsPage;

