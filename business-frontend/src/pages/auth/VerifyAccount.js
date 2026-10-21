import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Paper, InputAdornment, Divider } from '@mui/material';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Email as EmailIcon, Phone as PhoneIcon, Verified as VerifiedIcon } from '@mui/icons-material';
import axios from 'axios';
import { getApiBaseUrl } from '../../config/api';
import { useAuth } from '../../contexts/AuthContext';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const presetEmail = location.state?.email || '';
  const presetPhone = location.state?.phone || '';
  const presetPassword = location.state?.password || '';

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [emailResendIn, setEmailResendIn] = useState(0);
  const [phoneResendIn, setPhoneResendIn] = useState(0);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (emailResendIn === 0 && phoneResendIn === 0) return;

    const intervalId = setInterval(() => {
      setEmailResendIn((prev) => (prev > 0 ? prev - 1 : 0));
      setPhoneResendIn((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalId);
  }, [emailResendIn, phoneResendIn]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!emailCode || !phoneCode) {
      setError('ইমেইল ও ফোন ভেরিফিকেশন কোড দিন।');
      return;
    }
    if (!presetEmail && !presetPhone) {
      setError('ইমেইল বা ফোন নম্বর পাওয়া যায়নি। রেজিস্ট্রেশন পেজে ফিরে যান।');
      return;
    }
    if (!presetPassword) {
      setError('পাসওয়ার্ড পাওয়া যায়নি। রেজিস্ট্রেশন পেজে ফিরে যান।');
      return;
    }

    setIsVerifying(true);
    try {
      const apiBaseUrl = getApiBaseUrl();
      await axios.post(`${apiBaseUrl}/auth/verify-email`, {
        token: emailCode,
      });
      await axios.post(`${apiBaseUrl}/auth/verify-phone`, {
        phone: presetPhone,
        code: phoneCode,
      });
      const loginIdentifier = presetEmail || presetPhone;
      await login(loginIdentifier, presetPassword);
      setSuccess('ভেরিফিকেশন সফল হয়েছে। এখন ড্যাশবোর্ডে যাচ্ছেন।');
      navigate('/business/dashboard');
    } catch (err) {
      if (err?.code === 'VERIFICATION_REQUIRED' || err?.statusCode === 401) {
        navigate('/verify', {
          state: { email: presetEmail, phone: presetPhone, password: presetPassword },
        });
        return;
      }
      const errorMessage = err.response?.data?.message || err.message || 'ভেরিফিকেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendEmail = () => {
    if (emailResendIn > 0) return;
    if (!presetEmail) {
      setError('ইমেইল পাওয়া যায়নি।');
      return;
    }
    setError('');
    const apiBaseUrl = getApiBaseUrl();
    axios
      .post(`${apiBaseUrl}/auth/resend-verification`, {
        type: 'email',
        email: presetEmail,
      })
      .then(() => setEmailResendIn(60))
      .catch(() => setError('ইমেইল কোড পুনরায় পাঠানো যায়নি।'));
  };

  const handleResendPhone = () => {
    if (phoneResendIn > 0) return;
    if (!presetPhone) {
      setError('ফোন নম্বর পাওয়া যায়নি।');
      return;
    }
    setError('');
    const apiBaseUrl = getApiBaseUrl();
    axios
      .post(`${apiBaseUrl}/auth/resend-verification`, {
        type: 'phone',
        phone: presetPhone,
      })
      .then(() => setPhoneResendIn(60))
      .catch(() => setError('ফোন কোড পুনরায় পাঠানো যায়নি।'));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f5f6fa 0%, #eef1ff 100%)',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
            }}
          >
            <VerifiedIcon />
          </Box>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              ভেরিফিকেশন
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ইমেইল ও ফোন নম্বর যাচাই করে পরবর্তী ধাপে যান।
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {(presetEmail || presetPhone) && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: '#f8f9ff',
              border: '1px solid #e6e9ff',
            }}
          >
            {presetEmail && (
              <Typography variant="body2" color="text.secondary">
                ইমেইল: {presetEmail}
              </Typography>
            )}
            {presetPhone && (
              <Typography variant="body2" color="text.secondary">
                ফোন: {presetPhone}
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleVerify}>
          <TextField
            fullWidth
            label="ইমেইল ভেরিফিকেশন কোড"
            name="emailCode"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
            margin="normal"
            autoComplete="one-time-code"
            disabled={isVerifying}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={handleResendEmail}
                    disabled={isVerifying || emailResendIn > 0}
                    sx={{ textTransform: 'none', minWidth: 110 }}
                  >
                    {emailResendIn > 0 ? `পুনরায় পাঠান (${emailResendIn}s)` : 'পুনরায় পাঠান'}
                  </Button>
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="ফোন ভেরিফিকেশন কোড"
            name="phoneCode"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            margin="normal"
            autoComplete="one-time-code"
            disabled={isVerifying}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Button
                    size="small"
                    onClick={handleResendPhone}
                    disabled={isVerifying || phoneResendIn > 0}
                    sx={{ textTransform: 'none', minWidth: 110 }}
                  >
                    {phoneResendIn > 0 ? `পুনরায় পাঠান (${phoneResendIn}s)` : 'পুনরায় পাঠান'}
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={isVerifying}
            sx={{ mt: 3, width: '100%' }}
          >
            ভেরিফাই করে পরবর্তী ধাপ
          </Button>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
          ভুল ইমেইল বা ফোন?{' '}
          <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: 600 }}>
            রেজিস্ট্রেশন পেজে ফিরে যান
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default VerifyAccount;
