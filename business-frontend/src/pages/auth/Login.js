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
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { getApiBaseUrl } from '../../config/api';

// Styled components
const LoginWrapper = styled(Box)(({ theme }) => ({
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

const LoginFormContainer = styled(Box)(({ theme }) => ({
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

const LoginButton = styled(Button)(({ theme }) => ({
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

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.email || !formData.password) {
        setError('সব ক্ষেত্র পূরণ করুন');
        setIsSubmitting(false);
        return;
      }

      const loginResult = await login(formData.email, formData.password);
      const user = loginResult?.user ?? loginResult;
      const token = loginResult?.tokens?.accessToken;
      const tenantUuid = loginResult?.tenant_uuid;
      
      if (user) {
        // Only vendors/tenants need to be checked for existing businesses
        const roles = Array.isArray(user.roles) ? user.roles : [];
        const isVendorOrTenant = roles.some(
          (r) => r.name === 'grameen_bazaar_vendor' || r.name === 'grameen_bazaar_tenant'
        );

        if (isVendorOrTenant) {
          try {
            const baseUrl = getApiBaseUrl();

            if (tenantUuid && token) {
              // Check if this tenant already has any business
              const response = await axios.get(`${baseUrl}/businesses`, {
                params: { tenant_uuid: tenantUuid },
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              

              const data = response.data?.data ?? response.data;

              if (Array.isArray(data) && data.length === 0) {
                localStorage.setItem('hasBusiness', 'false');
                // No business for this tenant – send user to business setup
                navigate('/business/setup');
                return;
              } else if (Array.isArray(data) && data.length > 0) {
                localStorage.setItem('hasBusiness', 'true');
              }
            }
          } catch (checkError) {
            // If the check fails, ignore and fall back to normal dashboard redirect
            // console.error('Business check failed', checkError);
          }
        }

        // Default redirect when user has existing business or is not vendor/tenant
        navigate('/business/dashboard');
      }
    } catch (err) {
      if (err?.code === 'VERIFICATION_REQUIRED' || err?.statusCode === 401) {
        navigate('/verify', {
          state: { email: formData.email, phone: formData.email, password: formData.password },
        });
        return;
      }
      setError(err.message || authError || 'ইমেইল বা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // Implement Google login here
  };

  return (
    <LoginWrapper>
      {/* Left Section - Login Form */}
      <LeftSection>
        <LoginFormContainer>
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
            লগইন
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
            onClick={handleGoogleLogin}
            sx={{ mb: 3 }}
          >
            Google দিয়ে লগইন করুন
          </GoogleButton>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              অথবা ইমেইল দিয়ে লগইন করুন
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
                    <PersonIcon sx={{ color: '#667eea' }} />
                  </InputAdornment>
                ),
              }}
            />

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
              autoComplete="current-password"
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

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    name="rememberMe"
                    sx={{
                      color: '#667eea',
                      '&.Mui-checked': {
                        color: '#667eea',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2">আমাকে লগইন রাখুন</Typography>}
              />
              <MuiLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Forgot password clicked');
                }}
                sx={{
                  textDecoration: 'none',
                  color: '#667eea',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  '&:hover': {
                    textDecoration: 'underline',
                  },
                }}
              >
                পাসওয়ার্ড ভুলে গেছেন?
              </MuiLink>
            </Box>

            <LoginButton
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting || loading}
            >
              {isSubmitting || loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'লগইন'
              )}
            </LoginButton>

            <Box sx={{ mt: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                অ্যাকাউন্ট নেই?{' '}
                <MuiLink
                  component={Link}
                  to="/register"
                  sx={{
                    textDecoration: 'none',
                    color: '#667eea',
                    fontWeight: 600,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  রেজিস্টার করুন
                </MuiLink>
              </Typography>
            </Box>
          </Box>
        </LoginFormContainer>
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
    </LoginWrapper>
  );
};

export default Login;
