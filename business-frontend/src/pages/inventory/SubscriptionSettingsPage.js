import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CardMembership as SubscriptionIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  Store as StoreIcon,
  Warehouse as WarehouseIcon,
  CheckCircle as CheckIcon,
  TrendingUp as UpgradeIcon,
  Star as StarIcon,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { getApiBaseUrl } from '../../config/api';

// Package definitions: id matches core.subscription_plan enum
const PLAN_PACKAGES = [
  {
    id: 'marketplace_only',
    label: 'মার্কেটপ্লেস অনলি',
    description: 'শুধুমাত্র মার্কেটপ্লেসে বিক্রয়। কমিশন-ভিত্তিক।',
    max_users: 3,
    max_products: null,
    max_productsLabel: 'সীমাহীন',
    max_businesses: 1,
    max_warehouses: 1,
    popular: false,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: '🛒',
    priceMonthly: null,
    priceYearly: null,
    priceLabel: 'ফ্রি',
  },
  {
    id: 'small_business',
    label: 'ছোট ব্যবসা',
    description: 'ছোট দোকান ও রিটেইলারের জন্য। পণ্য, স্টক ও বিক্রয় ব্যবস্থাপনা।',
    max_users: 5,
    max_products: 200,
    max_productsLabel: '২০০ পণ্য',
    max_businesses: 1,
    max_warehouses: 1,
    popular: true,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    icon: '🏪',
    priceMonthly: 999,
    priceYearly: 9990,
    priceLabel: null,
  },
  {
    id: 'mid_size_business',
    label: 'মাঝারি ব্যবসা',
    description: 'বহু শাখা ও গুদাম। আরও ব্যবহারকারী ও পণ্য সীমা।',
    max_users: 10,
    max_products: 500,
    max_productsLabel: '৫০০ পণ্য',
    max_businesses: 3,
    max_warehouses: 3,
    popular: false,
    gradient: 'linear-gradient(135deg, #4e279d 0%, #1275cb 100%)',
    icon: '🏢',
    priceMonthly: 2499,
    priceYearly: 24990,
    priceLabel: null,
  },
  {
    id: 'big_business',
    label: 'বড় ব্যবসা',
    description: 'সীমাহীন পণ্য, বহু শাখা ও গুদাম। এন্টারপ্রাইজ ফিচার।',
    max_users: 50,
    max_products: null,
    max_productsLabel: 'সীমাহীন',
    max_businesses: 10,
    max_warehouses: 10,
    popular: false,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: '🏭',
    priceMonthly: 7999,
    priceYearly: 79990,
    priceLabel: null,
  },
];

const formatPrice = (amount) => {
  if (amount == null) return '';
  return amount.toLocaleString('bn-BD');
};

// Payment method labels (matches finance.payment_method_type + common Bangladesh methods)
const PAYMENT_METHOD_LABELS = {
  cash: 'নগদ',
  card: 'কার্ড (ভিসা/মাস্টারকার্ড)',
  mobile_banking: 'মোবাইল ব্যাংকিং',
  bank_transfer: 'ব্যাংক ট্রান্সফার',
  cheque: 'চেক',
  bkash: 'bKash',
  nagad: 'Nagad',
  rocket: 'Rocket',
  upay: 'Upay',
  sslcommerz: 'SSLCommerz',
};

const FeatureRow = ({ icon: Icon, text }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.75 }}>
    <Box sx={{ width: 28, height: 28, borderRadius: 1, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon sx={{ fontSize: 16 }} color="action" />
    </Box>
    <Typography variant="body2" color="text.secondary">
      {text}
    </Typography>
  </Box>
);

const SubscriptionSettingsPage = () => {
  const theme = useTheme();
  const [currentPlan, setCurrentPlan] = useState('marketplace_only');
  const [subscriptionStatus, setSubscriptionStatus] = useState('active');
  const [subscriptionEndDate, setSubscriptionEndDate] = useState('');
  const [paymentMethod] = useState('');
  const [limits, setLimits] = useState({
    max_users: 5,
    max_products: null,
    max_businesses: 1,
    max_warehouses: 1,
  });
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadSubscription = async () => {
    setLoading(true);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem('accessToken');
      const tenantUuid = localStorage.getItem('tenant_uuid');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const url = tenantUuid
        ? `${baseUrl}/tenant?tenant_uuid=${tenantUuid}`
        : `${baseUrl}/tenant`;
      const res = await fetch(url, { headers }).catch(() => null);
      if (res?.ok) {
        const json = await res.json();
        const t = json?.data ?? json;
        if (t) {
          setCurrentPlan(t.subscription_plan ?? 'marketplace_only');
          setSubscriptionStatus(t.subscription_status ?? 'active');
          setSubscriptionEndDate(t.subscription_end_date ? t.subscription_end_date.slice(0, 10) : '');
          setLimits({
            max_users: t.max_users ?? 5,
            max_products: t.max_products ?? null,
            max_businesses: t.max_businesses ?? 1,
            max_warehouses: t.max_warehouses ?? 1,
          });
        }
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'ডেটা লোড করতে সমস্যা হয়েছে', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubscription();
  }, []);

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    setUpgrading(planId);
    try {
      const baseUrl = getApiBaseUrl();
      const token = localStorage.getItem('accessToken');
      const tenantUuid = localStorage.getItem('tenant_uuid');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };
      const body = {
        ...(tenantUuid && { tenant_uuid: tenantUuid }),
        subscription_plan: planId,
      };
      const res = await fetch(`${baseUrl}/tenant`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setCurrentPlan(planId);
      const pkg = PLAN_PACKAGES.find((p) => p.id === planId);
      setLimits({
        max_users: pkg.max_users,
        max_products: pkg.max_products,
        max_businesses: pkg.max_businesses,
        max_warehouses: pkg.max_warehouses,
      });
      setSnackbar({
        open: true,
        message: `প্ল্যান পরিবর্তন করা হয়েছে: ${pkg.label}`,
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.message || 'প্ল্যান পরিবর্তন করতে সমস্যা হয়েছে।',
        severity: 'error',
      });
    } finally {
      setUpgrading(null);
    }
  };

  const currentPackage = PLAN_PACKAGES.find((p) => p.id === currentPlan) || PLAN_PACKAGES[0];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={48} thickness={4} />
        <Typography variant="body2" color="text.secondary">
          সাবস্ক্রিপশন লোড হচ্ছে...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <SubscriptionIcon sx={{ fontSize: 32 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
                সাবস্ক্রিপশন
              </Typography>
              <Typography variant="body2" color="text.secondary">
                আপনার প্ল্যান পরিচালনা করুন এবং যেকোনো সময় আপগ্রেড করুন
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadSubscription}
            sx={{ borderRadius: 2 }}
          >
            রিফ্রেশ
          </Button>
        </Box>
      </Box>

      {/* Current plan card */}
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, display: 'block', mb: 2 }}>
        আপনার বর্তমান প্ল্যান
      </Typography>
      <Card
        sx={{
          mb: 5,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.12)}`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Box
          sx={{
            height: 4,
            background: currentPackage.gradient,
          }}
        />
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {currentPackage.icon} {currentPackage.label}
            </Typography>
            <Chip
              label="বর্তমান প্ল্যান"
              color="primary"
              size="small"
              icon={<CheckIcon sx={{ fontSize: 16 }} />}
              sx={{ fontWeight: 600 }}
            />
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {currentPackage.priceLabel
                  ? currentPackage.priceLabel
                  : `৳${formatPrice(currentPackage.priceMonthly)}`}
              </Typography>
              {!currentPackage.priceLabel && (
                <Typography variant="body2" color="text.secondary">/মাস</Typography>
              )}
            </Box>
            {subscriptionStatus && subscriptionStatus !== 'active' && (
              <Chip label={subscriptionStatus} size="small" variant="outlined" />
            )}
            {subscriptionEndDate && (
              <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                মেয়াদ শেষ: {subscriptionEndDate}
              </Typography>
            )}
          </Box>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {currentPackage.description}
          </Typography>
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: 'action.hover',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CreditCardIcon sx={{ fontSize: 28, color: 'primary.main' }} />
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                পেমেন্ট মেথড
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {paymentMethod
                  ? (PAYMENT_METHOD_LABELS[paymentMethod] ?? paymentMethod)
                  : currentPackage.priceLabel
                    ? 'ফ্রি প্ল্যান – পেমেন্ট প্রয়োজন নেই'
                    : 'নির্ধারিত হয়নি'}
              </Typography>
            </Box>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <PeopleIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {limits.max_users}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  ব্যবহারকারী
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <InventoryIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {limits.max_products == null ? '∞' : limits.max_products}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  পণ্য
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <StoreIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {limits.max_businesses}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  শাখা
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover' }}>
                <WarehouseIcon sx={{ fontSize: 28, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {limits.max_warehouses}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  গুদাম
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* All packages */}
      <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, display: 'block', mb: 2 }}>
        অন্যান্য প্যাকেজ – যেকোনো সময় পরিবর্তন করুন
      </Typography>
      <Grid container spacing={3}>
        {PLAN_PACKAGES.map((pkg) => {
          const isCurrent = pkg.id === currentPlan;
          return (
            <Grid item xs={12} sm={6} md={3} key={pkg.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: isCurrent ? 2 : 1,
                  borderColor: isCurrent ? 'primary.main' : 'divider',
                  boxShadow: isCurrent ? `0 12px 40px ${alpha(theme.palette.primary.main, 0.15)}` : 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: isCurrent ? 'none' : 'translateY(-4px)',
                    boxShadow: isCurrent ? undefined : `0 12px 28px ${alpha(theme.palette.common.black, 0.12)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    height: 6,
                    background: pkg.gradient,
                  }}
                />
                <CardContent sx={{ flexGrow: 1, p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                      {pkg.icon} {pkg.label}
                    </Typography>
                    {pkg.popular && (
                      <Chip
                        label="পপুলার"
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                          color: 'white',
                          fontWeight: 600,
                        }}
                        icon={<StarIcon sx={{ fontSize: 14, color: 'white' }} />}
                      />
                    )}
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {pkg.priceLabel
                        ? pkg.priceLabel
                        : `৳${formatPrice(pkg.priceMonthly)}`}
                    </Typography>
                    {!pkg.priceLabel && (
                      <Typography variant="body2" color="text.secondary">
                        /মাস
                        {pkg.priceYearly != null && (
                          <Box component="span" sx={{ ml: 1 }}>
                            · ৳{formatPrice(pkg.priceYearly)}/বছর
                          </Box>
                        )}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                    {pkg.description}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    <FeatureRow icon={PeopleIcon} text={`${pkg.max_users} ব্যবহারকারী`} />
                    <FeatureRow icon={InventoryIcon} text={pkg.max_productsLabel} />
                    <FeatureRow icon={StoreIcon} text={`${pkg.max_businesses} শাখা`} />
                    <FeatureRow icon={WarehouseIcon} text={`${pkg.max_warehouses} গুদাম`} />
                  </Box>
                </CardContent>
                <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                  {isCurrent ? (
                    <Button
                      fullWidth
                      variant="outlined"
                      disabled
                      startIcon={<CheckIcon />}
                      sx={{ borderRadius: 2, py: 1.25, fontWeight: 600 }}
                    >
                      বর্তমান প্ল্যান
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={upgrading === pkg.id ? <CircularProgress size={18} color="inherit" /> : <UpgradeIcon />}
                      disabled={upgrading !== null}
                      onClick={() => handleUpgrade(pkg.id)}
                      sx={{
                        borderRadius: 2,
                        py: 1.25,
                        fontWeight: 600,
                        background: pkg.gradient,
                        boxShadow: `0 4px 14px ${alpha(theme.palette.common.black, 0.2)}`,
                        '&:hover': {
                          opacity: 0.95,
                          background: pkg.gradient,
                          boxShadow: `0 6px 20px ${alpha(theme.palette.common.black, 0.25)}`,
                        },
                      }}
                    >
                      {upgrading === pkg.id ? 'পরিবর্তন হচ্ছে...' : 'এই প্ল্যান নিন'}
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SubscriptionSettingsPage;
