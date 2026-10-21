import React, { useState } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Container, 
  Grid, 
  Paper, 
  Avatar,
  Badge,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  SwipeableDrawer,
  Fab,
  Tooltip,
  ListItemButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Inventory2 as Inventory2Icon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Public as PublicIcon,
  LibraryBooks as LibraryBooksIcon,
  Category as CategoryIcon,
  Attribution as AttributionIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  Star as StarIcon,
  People as PeopleIcon,
  LocalShipping as LocalShippingIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  SupportAgent as SupportAgentIcon,
  Storage as StorageIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Menu as MenuIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
  position: 'fixed',
  zIndex: theme.zIndex.drawer + 1,
}));

export const InventoryDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [inventoryMenuAnchor, setInventoryMenuAnchor] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);
  const [isHoveringInventory, setIsHoveringInventory] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [language, setLanguage] = useState('bn'); // 'bn' for Bangla, 'en' for English
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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

  const handleInventoryMenuOpen = (event) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHoveringInventory(true);
    setInventoryMenuAnchor(event.currentTarget);
  };

  const handleInventoryMenuClose = () => {
    setIsHoveringInventory(false);
    setInventoryMenuAnchor(null);
  };

  const handleInventoryMenuEnter = (event) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    
    // Only open if not already hovering (prevents repeated opening)
    if (!isHoveringInventory) {
      setIsHoveringInventory(true);
      setInventoryMenuAnchor(event.currentTarget);
    }
  };

  const handleInventoryMenuLeave = () => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    
    // Set a longer timeout to close the menu after leaving
    const timeout = setTimeout(() => {
      if (!isHoveringInventory) {
        setInventoryMenuAnchor(null);
      }
    }, 300);
    setHoverTimeout(timeout);
  };

  const handleDropdownEnter = () => {
    // Clear the timeout when hovering over the dropdown
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsHoveringInventory(true);
  };

  const handleDropdownLeave = () => {
    setIsHoveringInventory(false);
    // Set a timeout to close the menu when leaving the dropdown
    const timeout = setTimeout(() => {
      setInventoryMenuAnchor(null);
    }, 200);
    setHoverTimeout(timeout);
  };

  const handleLogout = () => {
    handleMenuClose();
    // In a real app, this would handle logout logic
    navigate('/login');
  };

  const handleMobileDrawerToggle = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleMobileNavigation = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  const handleMobileTabChange = (newValue) => {
    setCurrentTab(newValue);
    setMobileDrawerOpen(false);
  };

  const handleTabChange = (event, newValue) => {
    // Don't navigate if it's the Inventory tab (index 2) - hover will handle dropdown
    if (newValue === 2) {
      return;
    }
    setCurrentTab(newValue);
    navigate(menuItems[newValue].path);
  };

  const handleInventoryNavigation = (path) => {
    navigate(path);
    handleInventoryMenuClose();
    // Set current tab to Inventory when navigating to any inventory page
    setCurrentTab(2);
  };

  // Translations
  const translations = {
    bn: {
      title: 'ইনভেন্টরি ড্যাশবোর্ড',
      dashboard: 'ড্যাশবোর্ড',
      overview: 'সংক্ষিপ্ত বিবরণ',
      inventory: 'ইনভেন্টরি',
      stock: 'স্টক',
      analytics: 'বিশ্লেষণ',
      settings: 'সেটিংস',
      profile: 'প্রোফাইল',
      logout: 'লগআউট',
      inventoryManagement: 'ইনভেন্টরি ব্যবস্থাপনা',
      addProduct: 'পণ্য যোগ করুন',
      stockUpdate: 'স্টক আপডেট',
      lowStockAlert: 'কম স্টক সতর্কতা',
      inventoryReport: 'ইনভেন্টরি রিপোর্ট',
      language: 'ভাষা',
      bangla: 'বাংলা',
      english: 'English'
    },
    en: {
      title: 'Inventory Dashboard',
      dashboard: 'Dashboard',
      overview: 'Overview',
      inventory: 'Inventory',
      stock: 'Stock',
      analytics: 'Analytics',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      inventoryManagement: 'Inventory Management',
      addProduct: 'Add Product',
      stockUpdate: 'Stock Update',
      lowStockAlert: 'Low Stock Alert',
      inventoryReport: 'Inventory Report',
      language: 'Language',
      bangla: 'বাংলা',
      english: 'English'
    }
  };

  const t = translations[language];

  const menuItems = [
    { text: t.dashboard, icon: <DashboardIcon />, path: '/business/dashboard' },
    { text: t.overview, icon: <AssessmentIcon />, path: '/business/dashboard/overview' },
    { text: t.inventory, icon: <InventoryIcon />, path: '/business/dashboard/inventory', hasDropdown: true },
    { text: t.stock, icon: <StorageIcon />, path: '/business/dashboard/stock' },
    { text: t.analytics, icon: <BarChartIcon />, path: '/business/dashboard/analytics' },
    { text: t.settings, icon: <SettingsIcon />, path: '/business/dashboard/settings' },
  ];

  const inventoryMenuItems = [
    { text: t.inventoryManagement, path: '/business/dashboard/inventory', icon: <LibraryBooksIcon /> },
    { text: t.addProduct, path: '/business/dashboard/inventory/add', icon: <AddIcon /> },
    { text: t.stockUpdate, path: '/business/dashboard/inventory/update', icon: <Inventory2Icon /> },
    { text: t.lowStockAlert, path: '/business/dashboard/inventory/alerts', icon: <WarningIcon /> },
    { text: t.inventoryReport, path: '/business/dashboard/inventory/report', icon: <AssessmentIcon /> },
  ];

  // Set current tab based on current path
  React.useEffect(() => {
    const currentIndex = menuItems.findIndex(item => {
      if (item.hasDropdown && location.pathname.includes('/business')) {
        return true;
      }
      return item.path === location.pathname;
    });
    if (currentIndex !== -1) {
      setCurrentTab(currentIndex);
    }
  }, [location.pathname]);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBarStyled>
        <Toolbar>
          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleMobileDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {t.title}
          </Typography>
          
          {/* Inventory Status Buttons */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            gap: 1, 
            mr: 2 
          }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<VisibilityIcon />}
              component="a"
              href="/"
              target="_blank"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.3)'
                }
              }}
            >
              স্টক দেখুন
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              সম্পাদনা
            </Button>
          </Box>
          
          {/* Language Switcher */}
          <IconButton 
            color="inherit" 
            onClick={handleLanguageMenuOpen}
            sx={{ mr: 1 }}
          >
            <LanguageIcon />
          </IconButton>
          
          {/* View Site Icon */}
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
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>I</Avatar>
          </IconButton>
          
          {/* Profile Menu */}
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
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              {t.settings}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              {t.logout}
            </MenuItem>
          </Menu>
          
          {/* Language Menu */}
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
          
          {/* Inventory Dropdown Menu */}
          <Menu
            anchorEl={inventoryMenuAnchor}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            open={Boolean(inventoryMenuAnchor)}
            onClose={handleInventoryMenuClose}
            disableScrollLock={true}
            MenuListProps={{
              onMouseEnter: handleDropdownEnter,
              onMouseLeave: handleDropdownLeave,
            }}
            sx={{
              mt: 1,
              '& .MuiPaper-root': {
                backgroundColor: 'white',
                minWidth: 200,
              }
            }}
          >
            {inventoryMenuItems.map((item) => (
              <MenuItem 
                key={item.text}
                onClick={() => handleInventoryNavigation(item.path)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 'auto', mr: 1 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </MenuItem>
            ))}
          </Menu>
        </Toolbar>
        
        {/* Navigation Tabs - Hidden on Mobile */}
        {!isMobile && (
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
                  onMouseEnter={item.hasDropdown ? handleInventoryMenuEnter : undefined}
                  onMouseLeave={item.hasDropdown ? handleInventoryMenuLeave : undefined}
                />
              ))}
            </Tabs>
          </Box>
        )}
              </AppBarStyled>

        {/* Mobile Navigation Drawer */}
        <SwipeableDrawer
          anchor="left"
          open={mobileDrawerOpen}
          onClose={handleMobileDrawerClose}
          onOpen={() => setMobileDrawerOpen(true)}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 280,
              backgroundColor: 'white',
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {t.title}
              </Typography>
              <IconButton onClick={handleMobileDrawerClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
          
          <List component="nav" sx={{ p: 1 }}>
            {menuItems.map((item, index) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.hasDropdown) {
                      // For inventory menu, open the first item
                      handleMobileNavigation('/business/dashboard/inventory');
                    } else {
                      handleMobileNavigation(item.path);
                    }
                  }}
                  selected={location.pathname === item.path || (item.hasDropdown && location.pathname.includes('/business'))}
                  sx={{
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.light',
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit' }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.hasDropdown && (
                    <Badge badgeContent={inventoryMenuItems.length} color="primary" />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Inventory Submenu in Mobile Drawer */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
              {t.inventory}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {inventoryMenuItems.map((item) => (
                <Button
                  key={item.text}
                  variant="outlined"
                  size="small"
                  startIcon={item.icon}
                  fullWidth
                  component={Link}
                  to={item.path}
                  onClick={handleMobileDrawerClose}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Quick Actions in Mobile Drawer */}
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
              দ্রুত কার্যক্রম
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                fullWidth
                component={Link}
                to="/business/dashboard/inventory/add"
                onClick={handleMobileDrawerClose}
                sx={{ justifyContent: 'flex-start' }}
              >
                পণ্য যোগ করুন
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<StorageIcon />}
                fullWidth
                component={Link}
                to="/business/dashboard/stock"
                onClick={handleMobileDrawerClose}
                sx={{ justifyContent: 'flex-start' }}
              >
                স্টক আপডেট
              </Button>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<WarningIcon />}
                fullWidth
                component={Link}
                to="/business/dashboard/inventory/alerts"
                onClick={handleMobileDrawerClose}
                sx={{ justifyContent: 'flex-start' }}
              >
                সতর্কতা দেখুন
              </Button>
            </Box>
          </Box>
        </SwipeableDrawer>

        {/* Mobile Floating Action Button */}
        {isMobile && (
          <Fab
            color="primary"
            aria-label="menu"
            onClick={handleMobileDrawerToggle}
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              zIndex: 1000,
              display: { xs: 'flex', md: 'none' },
              background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)'
            }}
          >
            <MenuIcon />
          </Fab>
        )}
        
        {/* Main Content Area with Sidebar */}
        <Box sx={{ display: 'flex', pt: { xs: 8, md: 16 } }}>
        {/* Left Sidebar - Hidden on Mobile */}
        {!isMobile && (
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
          {/* Quick Actions */}
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
              to="/business/dashboard/inventory/add"
              sx={{ justifyContent: 'flex-start' }}
            >
              পণ্য যোগ করুন
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<StorageIcon />}
              fullWidth
              component={Link}
              to="/business/dashboard/stock"
              sx={{ justifyContent: 'flex-start' }}
            >
              স্টক আপডেট
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<BarChartIcon />}
              fullWidth
              component={Link}
              to="/business/dashboard/analytics"
              sx={{ justifyContent: 'flex-start' }}
            >
              বিশ্লেষণ দেখুন
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<WarningIcon />}
              fullWidth
              component={Link}
              to="/business/dashboard/inventory/alerts"
              sx={{ justifyContent: 'flex-start' }}
            >
              সতর্কতা দেখুন
            </Button>
          </Box>
          
          {/* Quick Stats */}
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
                মোট পণ্য
              </Typography>
              <Typography variant="h4" color="primary">
                ২৪৫
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="body2" color="text.secondary">
                কম স্টক
              </Typography>
              <Typography variant="h4" color="warning.main">
                ১২
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="body2" color="text.secondary">
                স্টক আউট
              </Typography>
              <Typography variant="h4" color="error.main">
                ৩
              </Typography>
            </Paper>
          </Box>
          
          {/* Recent Notifications */}
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
            <Paper sx={{ p: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                কম স্টক সতর্কতা
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ২ মিনিট আগে
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, bgcolor: '#ffebee' }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                স্টক আউট সতর্কতা
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ১৫ মিনিট আগে
              </Typography>
            </Paper>
          </Box>
        </Box>
        )}
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            minHeight: 'calc(100vh - 128px)',
            p: { xs: 2, md: 3 },
            width: '100%',
          }}
        >
          <Routes>
            <Route path="/" element={<InventoryDashboardHome />} />
            <Route path="/overview" element={<div>Overview Page</div>} />
            <Route path="/inventory" element={<div>Inventory Management Page</div>} />
            <Route path="/inventory/add" element={<div>Add Product Page</div>} />
            <Route path="/inventory/update" element={<div>Stock Update Page</div>} />
            <Route path="/inventory/alerts" element={<div>Low Stock Alerts Page</div>} />
            <Route path="/inventory/report" element={<div>Inventory Report Page</div>} />
            <Route path="/stock" element={<div>Stock Management Page</div>} />
            <Route path="/analytics" element={<div>Analytics Page</div>} />
            <Route path="/settings" element={<div>Settings Page</div>} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

// Default dashboard home component
const InventoryDashboardHome = () => {
  // Mock data with Bangla content
  const recentStockUpdates = [
    { id: 1, product: 'টাজা টমেটো', action: 'স্টক যোগ করা হয়েছে', quantity: 50, date: '২৫ মার্চ, ২০২৫', status: 'সম্পন্ন' },
    { id: 2, product: 'অর্গানিক আলু', action: 'স্টক আপডেট', quantity: -20, date: '২৫ মার্চ, ২০২৫', status: 'সম্পন্ন' },
    { id: 3, product: 'সবুজ পালং শাক', action: 'স্টক যোগ করা হয়েছে', quantity: 30, date: '২৪ মার্চ, ২০২৫', status: 'সম্পন্ন' },
    { id: 4, product: 'লাল পেঁয়াজ', action: 'স্টক আপডেট', quantity: -15, date: '২৪ মার্চ, ২০২৫', status: 'সম্পন্ন' },
  ];

  const topProducts = [
    { id: 1, name: 'টাজা টমেটো', stock: 120, value: 14400, category: 'সবজি' },
    { id: 2, name: 'অর্গানিক আলু', stock: 85, value: 6800, category: 'সবজি' },
    { id: 3, name: 'সবুজ পালং শাক', stock: 75, value: 4500, category: 'সবজি' },
    { id: 4, name: 'লাল পেঁয়াজ', stock: 65, value: 5850, category: 'সবজি' },
  ];

  return (
    <Box>
      {/* First Div - Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          {/* Enhanced Statistics Cards */}
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট পণ্য
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>২৪৫</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <StorageIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট স্টক
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>১,২৫৬</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট মূল্য
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>৳২,৪৫,৬৮০</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    কম স্টক
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>১২</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 2, width: 48, height: 48 }}>
                  <ErrorIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    স্টক আউট
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>৩</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={3} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 2, width: 48, height: 48 }}>
                  <CheckCircleIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    স্টক আপডেট
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>২৫</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Second Div - Main Content Sections */}
      <Box>
        <Grid container spacing={2}>
          {/* Top Products */}
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  সর্বাধিক স্টক পণ্য
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
                  component={Link}
                  to="/business/dashboard/inventory/add"
                >
                  নতুন পণ্য
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>পণ্যের নাম</TableCell>
                      <TableCell align="right">স্টক</TableCell>
                      <TableCell align="right">মূল্য</TableCell>
                      <TableCell align="right">ক্যাটেগরি</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell align="right">{product.stock}</TableCell>
                        <TableCell align="right">৳{product.value}</TableCell>
                        <TableCell align="right">{product.category}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Recent Stock Updates */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  সাম্প্রতিক স্টক আপডেট
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
                      <TableCell>কার্যক্রম</TableCell>
                      <TableCell>পরিমাণ</TableCell>
                      <TableCell align="right">তারিখ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStockUpdates.map((update) => (
                      <TableRow key={update.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {update.product}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {update.action}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={update.quantity > 0 ? `+${update.quantity}` : update.quantity}
                            color={update.quantity > 0 ? 'success' : 'error'}
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="caption" color="text.secondary">
                            {update.date}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Low Stock Alert */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
              <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
                কম স্টক সতর্কতা
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        সবুজ মরিচ
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        মাত্র ৫ কেজি বাকি
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" color="warning">
                      স্টক করুন
                    </Button>
                  </Box>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: '#ffebee', border: '1px solid #f44336' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        টাজা গাজর
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        মাত্র ৩ কেজি বাকি
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" color="error">
                      স্টক করুন
                    </Button>
                  </Box>
                </Paper>
                
                <Paper sx={{ p: 2, bgcolor: '#e8f5e8', border: '1px solid #4caf50' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        অর্গানিক লেটুস
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        মাত্র ২ বান্ডিল বাকি
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" color="success">
                      স্টক করুন
                    </Button>
                  </Box>
                </Paper>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}; 