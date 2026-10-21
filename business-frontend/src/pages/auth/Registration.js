import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Link as MuiLink,
  Divider,
  Autocomplete,
  ClickAwayListener,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

// Styled components (reused from Login)
const RegistrationWrapper = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  background: '#ffffff',
  position: 'relative',
  overflow: 'hidden',
}));

const LeftSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4, 6),
  position: 'relative',
  zIndex: 1,
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(4),
  },
}));

const RightSection = styled(Box)(({ theme }) => ({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(4, 6),
  position: 'relative',
  background: '#ffffff',
  overflow: 'hidden',
  [theme.breakpoints.down('md')]: {
    display: 'none',
  },
}));

const RegistrationFormContainer = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 420,
  display: 'flex',
  flexDirection: 'column',
}));

const LogoBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(4),
  '& .logo-icon': {
    width: 48,
    height: 48,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      fontSize: 28,
      color: 'white',
    },
  },
  '& .logo-text': {
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: theme.spacing(1),
    backgroundColor: '#f8f9fa',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#f0f2f5',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      },
    },
    '&.Mui-focused': {
      backgroundColor: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
        borderWidth: '2px',
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

const GoogleButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  backgroundColor: '#ffffff',
  color: '#333',
  border: '1px solid #e0e0e0',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#f8f9fa',
    borderColor: '#d0d0d0',
  },
}));

const RegisterButton = styled(Button)(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '1rem',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
    boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    opacity: 0.7,
  },
}));

// Abstract gradient shapes for decoration
const AbstractShape = styled(Box)(({ position, size, color, rotation }) => ({
  position: 'absolute',
  width: size,
  height: size,
  borderRadius: '50%',
  background: color,
  opacity: 0.6,
  filter: 'blur(40px)',
  ...position,
  transform: `rotate(${rotation}deg)`,
  zIndex: 0,
}));

const TaglineBox = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  textAlign: 'center',
  '& .tagline': {
    fontSize: '3rem',
    fontWeight: 800,
    color: '#1a1a1a',
    lineHeight: 1.2,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('lg')]: {
      fontSize: '2.5rem',
    },
  },
  '& .subtitle': {
    fontSize: '1.25rem',
    color: '#666',
    fontWeight: 500,
  },
}));

const DottedPattern = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: '10%',
  right: '10%',
  width: '200px',
  height: '200px',
  backgroundImage: 'radial-gradient(circle, #667eea 1px, transparent 1px)',
  backgroundSize: '20px 20px',
  opacity: 0.1,
  zIndex: 0,
}));

const Registration = () => {
  const navigate = useNavigate();
  const { register, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [countryCode, setCountryCode] = useState('+880');
  const [countryOpen, setCountryOpen] = useState(false);
  const countryOptions = [
    { code: '+880', flag: '/images/flags/bd.svg' },
    { code: '+977', flag: '/images/flags/np.svg' },
    { code: '+92', flag: '/images/flags/pk.svg' },
    { code: '+94', flag: '/images/flags/sl.svg' },
    { code: '+975', flag: '/images/flags/bt.svg' },
    { code: '+93', flag: '/images/flags/af.svg' },
    { code: '+1', flag: '/images/flags/us.svg' },
    { code: '+49', flag: '/images/flags/de.svg' },
    { code: '+33', flag: '/images/flags/fr.svg' },
    { code: '+81', flag: '/images/flags/jp.svg' },
    { code: '+86', flag: '/images/flags/cn.svg' },
    { code: '+34', flag: '/images/flags/spanish.svg' },
  ];

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber || !formData.password) {
      setError('সব ক্ষেত্র পূরণ করুন');
      return false;
    }

    if (formData.password.length < 6) {
      setError('পাসওয়ার্ড অন্তত ৬ অক্ষরের হতে হবে');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('বৈধ ইমেইল ঠিকানা লিখুন');
      return false;
    }

    // Basic phone validation (should start with + and have digits)
    const phoneDigits = `${countryCode}${formData.phoneNumber}`.replace(/\s/g, '');
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneDigits)) {
      setError('বৈধ ফোন নম্বর লিখুন (উদাহরণ: +8801712345678)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }


      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: `${countryCode}${formData.phoneNumber}`.replace(/\s/g, ''),
        password: formData.password,
      };

      await register(userData);
      navigate('/verify', {
        state: {
          email: formData.email,
          phone: userData.phone,
          password: formData.password,
        },
      });
    } catch (err) {
      setError(err.message || authError || 'রেজিস্টেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = () => {
    console.log('Google signup clicked');
    // Implement Google signup here
  };

  return (
    <RegistrationWrapper>
      {/* Left Section - Registration Form */}
      <LeftSection>
        <RegistrationFormContainer>
          <LogoBox>
            <Box className="logo-icon">
              <InventoryIcon />
            </Box>
            <Typography className="logo-text">গ্রামীণ ব্যবসা</Typography>
          </LogoBox>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#1a1a1a',
              mb: 3,
            }}
          >
            নতুন অ্যাকাউন্ট তৈরি করুন
          </Typography>

          <GoogleButton
            variant="outlined"
            startIcon={
              <Box
                component="img"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E"
                alt="Google"
                sx={{ width: 20, height: 20 }}
              />
            }
            onClick={handleGoogleSignup}
            sx={{ mb: 3 }}
          >
            Google দিয়ে রেজিস্টার করুন
          </GoogleButton>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              অথবা ইমেইল দিয়ে রেজিস্টার করুন
            </Typography>
          </Divider>

          {(error || authError) && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 1,
              }}
            >
              {error || authError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <StyledTextField
              fullWidth
              label="নামের প্রথম অংশ"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isSubmitting}
              autoComplete="given-name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="নামের শেষ অংশ"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isSubmitting}
              autoComplete="family-name"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <StyledTextField
              fullWidth
              label="ইমেইল"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isSubmitting}
              autoComplete="email"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

            <ClickAwayListener onClickAway={() => setCountryOpen(false)}>
              <Box>
                <StyledTextField
                  fullWidth
                  label="ফোন নম্বর"
                  name="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onMouseDown={() => setCountryOpen(true)}
                  margin="normal"
                  required
                  disabled={isSubmitting}
                  autoComplete="tel"
                  placeholder="1712345678"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            component="img"
                            src={countryOptions.find((option) => option.code === countryCode)?.flag || '/images/flags/bd.svg'}
                            alt={countryCode}
                            sx={{ width: 20, height: 14, borderRadius: '2px' }}
                          />
                          <Autocomplete
                            options={countryOptions}
                            value={countryOptions.find((option) => option.code === countryCode) || null}
                        onChange={(_, newValue) => {
                          if (newValue?.code) {
                            setCountryCode(newValue.code);
                            setCountryOpen(false);
                          }
                        }}
                            getOptionLabel={(option) => option.code}
                            isOptionEqualToValue={(option, value) => option.code === value.code}
                            filterOptions={(options, { inputValue }) =>
                              options.filter((option) => option.code.includes(inputValue))
                            }
                        disableClearable
                        openOnFocus={false}
                        autoHighlight
                            open={countryOpen}
                            onClose={() => setCountryOpen(false)}
                            forcePopupIcon={false}
                            popupIcon={null}
                            size="small"
                            sx={{ minWidth: 40 }}
                            slotProps={{
                              popper: {
                                sx: { minWidth: 130 },
                              },
                              paper: {
                                sx: { minWidth: 130 },
                              },
                            }}
                            disablePortal
                        renderOption={(props, option) => (
                          <Box
                            component="li"
                            {...props}
                            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                          >
                                <Box
                                  component="img"
                                  src={option.flag}
                                  alt={option.code}
                                  sx={{ width: 18, height: 12, borderRadius: '2px' }}
                                />
                                <Typography variant="body2">{option.code}</Typography>
                              </Box>
                            )}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                variant="standard"
                                placeholder="+880"
                                onMouseDown={(event) => {
                                  event.stopPropagation();
                                  setCountryOpen(true);
                                }}
                                InputProps={{
                                  ...params.InputProps,
                                  disableUnderline: true,
                                }}
                                sx={{
                                  '& .MuiInputBase-input': {
                                    padding: 0,
                                    fontWeight: 600,
                                    color: '#667eea',
                                  },
                                  '& .MuiInput-underline:before': { borderBottom: 'none' },
                                  '& .MuiInput-underline:after': { borderBottom: 'none' },
                                }}
                              />
                            )}
                          />
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </ClickAwayListener>

            <StyledTextField
              fullWidth
              label="পাসওয়ার্ড"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              disabled={isSubmitting}
              autoComplete="new-password"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={isSubmitting}
                      sx={{ color: '#667eea' }}
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <RegisterButton
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting || loading}
              sx={{ mt: 3 }}
            >
              {isSubmitting || loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'রেজিস্টার করুন'
              )}
            </RegisterButton>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <MuiLink
                  component={Link}
                  to="/login"
                  sx={{
                    textDecoration: 'none',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  লগইন করুন
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </RegistrationFormContainer>
      </LeftSection>

      {/* Right Section - Decorative */}
      <RightSection>
        <DottedPattern />
        
        {/* Abstract gradient shapes */}
        <AbstractShape
          position={{ top: '10%', left: '10%' }}
          size="300px"
          color="linear-gradient(135deg, rgba(102, 126, 234, 0.6) 0%, rgba(118, 75, 162, 0.6) 100%)"
          rotation={0}
        />
        <AbstractShape
          position={{ top: '5%', right: '15%' }}
          size="250px"
          color="linear-gradient(135deg, rgba(255, 152, 0, 0.5) 0%, rgba(255, 87, 34, 0.5) 100%)"
          rotation={45}
        />
        <AbstractShape
          position={{ top: '40%', right: '5%' }}
          size="200px"
          color="linear-gradient(135deg, rgba(255, 152, 0, 0.4) 0%, rgba(233, 30, 99, 0.4) 100%)"
          rotation={90}
        />
        <AbstractShape
          position={{ bottom: '20%', left: '20%' }}
          size="350px"
          color="linear-gradient(135deg, rgba(255, 82, 82, 0.5) 0%, rgba(255, 255, 255, 0.5) 100%)"
          rotation={135}
        />
        <AbstractShape
          position={{ bottom: '10%', right: '10%' }}
          size="280px"
          color="linear-gradient(135deg, rgba(33, 150, 243, 0.4) 0%, rgba(156, 39, 176, 0.4) 100%)"
          rotation={180}
        />
        <AbstractShape
          position={{ top: '50%', right: '25%' }}
          size="180px"
          color="linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%)"
          rotation={225}
        />

        <TaglineBox>
          <Typography className="tagline">
            আপনার ব্যবসায়ের 
            <br/>
            মালামাল ও হিসাব নিকাশ 
            <br />
            রক্ষনের সহজ ও সুলভ উপায়
          </Typography>
          <Typography className="subtitle">
            আপনার ব্যবসার জন্য সর্বোত্তম সমাধান
          </Typography>
        </TaglineBox>
      </RightSection>
    </RegistrationWrapper>
  );
};

export default Registration;

