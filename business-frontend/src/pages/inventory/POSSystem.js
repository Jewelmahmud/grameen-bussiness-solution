import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Grid, 
  Paper, 
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Button,
  Chip,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Fab,
  Tooltip
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  ShoppingCart as ShoppingCartIcon,
  Sync as SyncIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Public as PublicIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
  Inventory as InventoryIcon,
  Warehouse as WarehouseIcon,
  ShoppingBag as PurchaseIcon,
  AssignmentReturn as ReturnsIcon,
  VerifiedUser as WarrantyIcon,
  Group as CustomersIcon,
  Description as ReportIcon,
  PointOfSale as POSIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import SalesPage from './SalesPage';
import AnalyticsPage from './AnalyticsPage';
import POSConfiguration from './POSConfiguration';
import TransactionHistory from './TransactionHistory';

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
  position: 'fixed',
  zIndex: theme.zIndex.drawer + 1,
}));

const POSSystem = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [language, setLanguage] = useState('bn');
  const navigate = useNavigate();
  const location = useLocation();

  const [posData, setPosData] = useState({
    totalSales: 450000,
    todaySales: 12500,
    pendingTransactions: 8,
    syncStatus: 'synced',
    recentTransactions: [
      {
        id: 1,
        customer: 'আহমেদ আলী',
        amount: 1250,
        status: 'completed',
        time: '10:30 AM',
        items: 5
      },
      {
        id: 2,
        customer: 'ফাতেমা বেগম',
        amount: 850,
        status: 'pending',
        time: '10:25 AM',
        items: 3
      },
      {
        id: 3,
        customer: 'করিম হোসেন',
        amount: 2100,
        status: 'completed',
        time: '10:20 AM',
        items: 8
      }
    ],
    lowStockAlerts: [
      {
        id: 1,
        product: 'মসুর ডাল',
        currentStock: 25,
        reorderPoint: 30,
        status: 'critical'
      },
      {
        id: 2,
        product: 'চিনি',
        currentStock: 0,
        reorderPoint: 20,
        status: 'out_of_stock'
      }
    ],
    syncHistory: [
      {
        id: 1,
        type: 'inventory_update',
        status: 'success',
        time: '10:30 AM',
        details: '৫টি পণ্য আপডেট হয়েছে'
      },
      {
        id: 2,
        type: 'sales_sync',
        status: 'success',
        time: '10:25 AM',
        details: '৩টি বিক্রয় সিঙ্ক হয়েছে'
      }
    ]
  });

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageMenuOpen = (event) => {
    setLanguageMenuAnchor(event.currentTarget);
  };

  const handleLanguageMenuClose = () => {
    setLanguageMenuAnchor(null);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    handleLanguageMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    navigate('/login');
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    navigate(menuItems[newValue].path);
  };

  const handleNewSale = () => {
    console.log('New sale clicked');
  };

  const handleSyncInventory = () => {
    console.log('Sync inventory clicked');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'synced': return 'success';
      case 'critical': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'সম্পন্ন';
      case 'pending': return 'অপেক্ষমান';
      case 'failed': return 'ব্যর্থ';
      case 'synced': return 'সিঙ্ক হয়েছে';
      case 'critical': return 'সমালোচনামূলক';
      case 'out_of_stock': return 'স্টক নেই';
      default: return 'অজানা';
    }
  };

  const translations = {
    bn: {
      title: 'POS সিস্টেম',
      dashboard: 'ড্যাশবোর্ড',
      sales: 'বিক্রয়',
      sync: 'সিঙ্ক',
      analytics: 'বিশ্লেষণ',
      settings: 'সেটিংস',
      profile: 'প্রোফাইল',
      logout: 'লগআউট',
      newSale: 'নতুন বিক্রয়',
      syncInventory: 'ইনভেন্টরি সিঙ্ক',
      language: 'ভাষা',
      bangla: 'বাংলা',
      english: 'English'
    },
    en: {
      title: 'POS System',
      dashboard: 'Dashboard',
      sales: 'Sales',
      sync: 'Sync',
      analytics: 'Analytics',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      newSale: 'New Sale',
      syncInventory: 'Sync Inventory',
      language: 'Language',
      bangla: 'বাংলা',
      english: 'English'
    }
  };

  const t = translations[language];

  const menuItems = [
    { text: t.dashboard, icon: <DashboardIcon />, path: '/business/pos-system' },
    { text: t.sales, icon: <ShoppingCartIcon />, path: '/business/pos-system/sales' },
    { text: 'লেনদেনের ইতিহাস', icon: <ReceiptIcon />, path: '/business/pos-system/transaction-history' },
    { text: t.sync, icon: <SyncIcon />, path: '/business/pos-system/sync' },
    { text: t.analytics, icon: <BarChartIcon />, path: '/business/pos-system/analytics' },
    { text: 'কনফিগারেশন', icon: <SettingsIcon />, path: '/business/pos-system/configuration' },
    { text: t.settings, icon: <SettingsIcon />, path: '/business/pos-system/settings' },
  ];

  React.useEffect(() => {
    const currentIndex = menuItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setCurrentTab(currentIndex);
    }
  }, [location.pathname]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBarStyled>
        <Toolbar>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {t.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              component={Link}
              to="/business/pos-system/sales"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              নতুন বিক্রয়
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SyncIcon />}
              onClick={handleSyncInventory}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              সিঙ্ক করুন
            </Button>
          </Box>
          
          <IconButton 
            color="inherit" 
            onClick={handleLanguageMenuOpen}
            sx={{ mr: 1 }}
          >
            <LanguageIcon />
          </IconButton>
          
          <IconButton 
            color="inherit" 
            component="a" 
            href="/" 
            target="_blank" 
            rel="noopener noreferrer"
            sx={{ mr: 1 }}
          >
            <PublicIcon />
          </IconButton>
          
          <IconButton color="inherit">
            <Badge badgeContent={5} color="secondary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="inherit"
            onClick={handleProfileMenuOpen}
          >
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>P</Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            disableScrollLock={true}
          >
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              {t.profile}
            </MenuItem>
            <MenuItem onClick={() => navigate('/business/pos-system/configuration')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              কনফিগারেশন
            </MenuItem>
            <MenuItem onClick={() => navigate('/business/pos-system/settings')}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              সেটিংস
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {t.logout}
            </MenuItem>
          </Menu>
          
          <Menu
            anchorEl={languageMenuAnchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(languageMenuAnchor)}
            onClose={handleLanguageMenuClose}
            disableScrollLock={true}
          >
            <MenuItem 
              onClick={() => handleLanguageChange('bn')}
              selected={language === 'bn'}
            >
              {t.bangla}
            </MenuItem>
            <MenuItem 
              onClick={() => handleLanguageChange('en')}
              selected={language === 'en'}
            >
              {t.english}
            </MenuItem>
          </Menu>
        </Toolbar>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'rgba(255,255,255,0.2)',
          background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)'
        }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            textColor="inherit"
            TabIndicatorProps={{
              style: { backgroundColor: 'white' }
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255,255,255,0.8)',
                '&.Mui-selected': {
                  color: 'white'
                }
              }
            }}
          >
            {menuItems.map((item, index) => (
              <Tab 
                key={item.text}
                label={item.text} 
                icon={item.icon}
                iconPosition="start"
                sx={{ minWidth: 120 }}
              />
            ))}
          </Tabs>
        </Box>
      </AppBarStyled>
      
      <Box sx={{ display: 'flex', pt: 16 }}>
        <Box
          sx={{
            width: 280,
            backgroundColor: 'white',
            borderRight: '1px solid #e0e0e0',
            minHeight: 'calc(100vh - 128px)',
            p: 2,
            position: 'sticky',
            top: 128,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            দ্রুত কার্যক্রম
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              fullWidth
              component={Link}
              to="/business/pos-system/sales"
              sx={{ justifyContent: 'flex-start' }}
            >
              নতুন বিক্রয়
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SyncIcon />}
              fullWidth
              onClick={handleSyncInventory}
              sx={{ justifyContent: 'flex-start' }}
            >
              ইনভেন্টরি সিঙ্ক
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              fullWidth
              component={Link}
              to="/business/pos-system/analytics"
              sx={{ justifyContent: 'flex-start' }}
            >
              বিক্রয় বিশ্লেষণ
            </Button>
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 2, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            আজকের পরিসংখ্যান
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="body2" color="text.secondary">
                আজকের বিক্রয়
              </Typography>
              <Typography variant="h4" color="primary">
                ৳{posData.todaySales.toLocaleString()}
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="body2" color="text.secondary">
                অপেক্ষমান লেনদেন
              </Typography>
              <Typography variant="h4" color="warning.main">
                {posData.pendingTransactions}
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="body2" color="text.secondary">
                সিঙ্ক অবস্থা
              </Typography>
              <Chip 
                label={getStatusText(posData.syncStatus)} 
                color={getStatusColor(posData.syncStatus)}
                size="small" 
                sx={{ mt: 1 }}
              />
            </Paper>
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              mt: 3, 
              mb: 2, 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            সাম্প্রতিক বিজ্ঞপ্তি
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Paper sx={{ p: 2, bgcolor: '#e8f5e8' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                সিঙ্ক সফল
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ২ মিনিট আগে
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                নতুন বিক্রয়
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ৫ মিনিট আগে
              </Typography>
            </Paper>
          </Box>
        </Box>
        
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            minHeight: 'calc(100vh - 128px)',
            p: 3,
          }}
        >
          <Routes>
            <Route path="/" element={<POSDashboard />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/sync" element={<div>Sync Page</div>} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/settings" element={<div>Settings Page</div>} />
            <Route path="/configuration" element={<POSConfiguration />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

const POSDashboard = () => {
  const [posData, setPosData] = useState({
    totalSales: 450000,
    todaySales: 12500,
    pendingTransactions: 8,
    syncStatus: 'synced',
    recentTransactions: [
      {
        id: 1,
        customer: 'আহমেদ আলী',
        amount: 1250,
        status: 'completed',
        time: '10:30 AM',
        items: 5
      },
      {
        id: 2,
        customer: 'ফাতেমা বেগম',
        amount: 850,
        status: 'pending',
        time: '10:25 AM',
        items: 3
      },
      {
        id: 3,
        customer: 'করিম হোসেন',
        amount: 2100,
        status: 'completed',
        time: '10:20 AM',
        items: 8
      }
    ],
    lowStockAlerts: [
      {
        id: 1,
        product: 'মসুর ডাল',
        currentStock: 25,
        reorderPoint: 30,
        status: 'critical'
      },
      {
        id: 2,
        product: 'চিনি',
        currentStock: 0,
        reorderPoint: 20,
        status: 'out_of_stock'
      }
    ],
    syncHistory: [
      {
        id: 1,
        type: 'inventory_update',
        status: 'success',
        time: '10:30 AM',
        details: '৫টি পণ্য আপডেট হয়েছে'
      },
      {
        id: 2,
        type: 'sales_sync',
        status: 'success',
        time: '10:25 AM',
        details: '৩টি বিক্রয় সিঙ্ক হয়েছে'
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'synced': return 'success';
      case 'critical': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'সম্পন্ন';
      case 'pending': return 'অপেক্ষমান';
      case 'failed': return 'ব্যর্থ';
      case 'synced': return 'সিঙ্ক হয়েছে';
      case 'critical': return 'সমালোচনামূলক';
      case 'out_of_stock': return 'স্টক নেই';
      default: return 'অজানা';
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট বিক্রয়
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ৳{(posData.totalSales / 1000).toFixed(0)}K
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    আজকের বিক্রয়
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ৳{posData.todaySales.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <ShoppingCartIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    অপেক্ষমান লেনদেন
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {posData.pendingTransactions}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <SyncIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    সিঙ্ক অবস্থা
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {getStatusText(posData.syncStatus)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 2, width: 48, height: 48 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    আজকের গ্রাহক
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ১২
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 2, width: 48, height: 48 }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    গড় বিক্রয়
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ৳১,০৪২
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  সাম্প্রতিক লেনদেন
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                >
                  নতুন বিক্রয়
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>গ্রাহক</TableCell>
                      <TableCell align="right">পরিমাণ</TableCell>
                      <TableCell align="right">সময়</TableCell>
                      <TableCell align="right">অবস্থা</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {posData.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {transaction.customer}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {transaction.items}টি আইটেম
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">৳{transaction.amount}</TableCell>
                        <TableCell align="right">{transaction.time}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={getStatusText(transaction.status)} 
                            color={getStatusColor(transaction.status)}
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  কম স্টক সতর্কতা
                </Typography>
                <Button variant="outlined" size="small">
                  সব দেখুন
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>পণ্য</TableCell>
                      <TableCell align="right">বর্তমান স্টক</TableCell>
                      <TableCell align="right">অবস্থা</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {posData.lowStockAlerts.map((alert) => (
                      <TableRow key={alert.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {alert.product}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{alert.currentStock}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={getStatusText(alert.status)} 
                            color={getStatusColor(alert.status)}
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  সিঙ্ক ইতিহাস
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<RefreshIcon />}
                >
                  রিফ্রেশ
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posData.syncHistory.map((sync) => (
                  <Paper key={sync.id} sx={{ p: 2, bgcolor: '#f8f9fa' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {sync.type === 'inventory_update' ? 'ইনভেন্টরি আপডেট' : 'বিক্রয় সিঙ্ক'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {sync.details}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sync.time}
                        </Typography>
                      </Box>
                      <Chip 
                        label={getStatusText(sync.status)} 
                        color={getStatusColor(sync.status)}
                        size="small" 
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default POSSystem; 