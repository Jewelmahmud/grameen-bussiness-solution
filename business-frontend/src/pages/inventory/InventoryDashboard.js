import React, { useState } from 'react';
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
  ListItemButton
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  Settings as SettingsIcon,
  Notifications as NotificationsIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  Public as PublicIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  TrendingUp as TrendingUpIcon,
  AttachMoney as AttachMoneyIcon,
  LocalShipping as LocalShippingIcon,
  PointOfSale as POSIcon,
  Warning as WarningIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  Warehouse as WarehouseIcon,
  Receipt as SalesIcon,
  ShoppingBag as PurchaseIcon,
  AssignmentReturn as ReturnsIcon,
  VerifiedUser as WarrantyIcon,
  Group as CustomersIcon,
  Groups as HRIcon,
  Analytics as AnalysisIcon,
  Description as ReportIcon,
  Label as BrandIcon,
  Straighten as UnitsIcon,
  CompareArrows as VariationsIcon,
  History as TransactionHistoryIcon,
  AccountBalance as HalkhataIcon,
  AccountBalance as AccountingIcon,
  Mail as MailIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CardMembership as SubscriptionIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useModules } from '../../contexts/ModuleContext';
import ModuleProtectedRoute from '../../components/ModuleProtectedRoute';
import ProductsPage from './ProductsPage';
import CategoriesPage from './CategoriesPage';
import BrandsPage from './BrandsPage';
import UnitsPage from './UnitsPage';
import VariationsPage from './VariationsPage';
import ContactsPage from './ContactsPage';
import SalesPage from './SalesPage';
import SalesListPage from './SalesListPage';
import ReturnsPage from './ReturnsPage';
import WarrantyPage from './WarrantyPage';
import AccountingPage from './AccountingPage';
import HRPage from './HRPage';
import PayrollPage from './PayrollPage';
import ReportPage from './ReportPage';
import StockPage from './StockPage';
import PurchasePage from './PurchasePage';
import TransactionHistory from './TransactionHistory';
import AnalyticsPage from './AnalyticsPage';
import AnalysisPage from './AnalysisPage';
import POSConfiguration from './POSConfiguration';
import HalkhataPage from '../HalkhataPage';
import HalkhataInvitationPage from '../HalkhataInvitationPage';
import HalkhataSettingsPage from '../HalkhataSettingsPage';
import ProfileSettingsPage from './ProfileSettingsPage';
import GeneralSettingsPage from './GeneralSettingsPage';
import BusinessSettingsPage from './BusinessSettingsPage';
import SubscriptionSettingsPage from './SubscriptionSettingsPage';

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
  position: 'fixed',
  zIndex: theme.zIndex.drawer + 1,
}));

const InventoryDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isModuleEnabled } = useModules();
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageMenuAnchor, setLanguageMenuAnchor] = useState(null);
  const [transactionsMenuAnchor, setTransactionsMenuAnchor] = useState(null);
  const [transactionsMenuTimeout, setTransactionsMenuTimeout] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [language, setLanguage] = useState('bn'); // 'bn' for Bangla, 'en' for English
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();


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

  const handleTransactionsMenuOpen = (event) => {
    // Clear any existing timeout
    if (transactionsMenuTimeout) {
      clearTimeout(transactionsMenuTimeout);
      setTransactionsMenuTimeout(null);
    }
    setTransactionsMenuAnchor(event.currentTarget);
  };

  const handleTransactionsMenuClose = () => {
    // Add a small delay before closing to allow moving to the menu
    const timeout = setTimeout(() => {
      setTransactionsMenuAnchor(null);
    }, 100);
    setTransactionsMenuTimeout(timeout);
  };

  const handleTransactionsMenuEnter = () => {
    // Cancel close timeout when mouse enters menu
    if (transactionsMenuTimeout) {
      clearTimeout(transactionsMenuTimeout);
      setTransactionsMenuTimeout(null);
    }
  };

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Navigate to login anyway even if logout API call fails
      navigate('/login');
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    if (menuItems[newValue].path) {
      navigate(menuItems[newValue].path);
    }
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


  const handleAddProduct = () => {
    // Navigate to products page
    navigate('/business/dashboard/products');
  };


  // Translations
  const translations = {
    bn: {
      title: 'ইনভেন্টরি ড্যাশবোর্ড',
      dashboard: 'ড্যাশবোর্ড',
      products: 'পণ্যসমূহ',
      posIntegration: 'POS ইন্টিগ্রেশন',
      analytics: 'বিশ্লেষণ',
      settings: 'সেটিংস',
      profile: 'প্রোফাইল',
      logout: 'লগআউট',
      addProducts: 'পণ্য যোগ করুন',
      viewProducts: 'পণ্য দেখুন',
      viewAnalytics: 'বিশ্লেষণ দেখুন',
      language: 'ভাষা',
      bangla: 'বাংলা',
      english: 'English',
      stock: 'স্টক',
      sales: 'বিক্রয়',
      purchase: 'ক্রয়',
      returns: 'ফেরত',
      warranty: 'ওয়ারেন্টি',
      customers: 'পরিচিতি',
      contacts: 'পরিচিতি',
      analysis: 'বিশ্লেষণ',
      report: 'রিপোর্ট',
      posSystem: 'POS সিস্টেম',
      halkhata: 'হালখাতা',
      accounting: 'হিসাবনিকাশ',
      hr: 'মানব সম্পদ',
      payroll: 'বেতন'
    },
    en: {
      title: 'Inventory Dashboard',
      dashboard: 'Dashboard',
      products: 'Products',
      posIntegration: 'POS Integration',
      analytics: 'Analytics',
      settings: 'Settings',
      profile: 'Profile',
      logout: 'Logout',
      addProducts: 'Add Products',
      viewProducts: 'View Products',
      viewAnalytics: 'View Analytics',
      language: 'Language',
      bangla: 'বাংলা',
      english: 'English',
      stock: 'Stock',
      sales: 'Sales',
      purchase: 'Purchase',
      returns: 'Returns',
      warranty: 'Warranty',
      customers: 'Contacts',
      contacts: 'Contacts',
      analysis: 'Analysis',
      report: 'Report',
      posSystem: 'POS System',
      halkhata: 'Ledger',
      accounting: 'Accounting',
      hr: 'Human Resources',
      payroll: 'Payroll'
    }
  };

  const t = translations[language];

  // Build menu items dynamically based on enabled modules
  const getMenuItems = () => {
    const items = [
      { text: t.dashboard, icon: <DashboardIcon />, path: '/business/dashboard', moduleId: null }
    ];

    // Inventory (always enabled - core module)
    if (isModuleEnabled('inventory')) {
      items.push(
        { text: t.products, icon: <InventoryIcon />, path: '/business/dashboard/products', moduleId: 'inventory' },
        { text: t.stock, icon: <WarehouseIcon />, path: '/business/dashboard/stock', moduleId: 'inventory' }
      );
    }

    // Sales module
    if (isModuleEnabled('sales')) {
      items.push(
        { text: t.posSystem, icon: <POSIcon />, path: '/business/pos-system/sales', moduleId: 'sales' }
      );
    }

    // Transactions menu (Purchase, Sales, Returns grouped together)
    const transactionsSubItems = [];
    
    // Always show Sales if sales module is enabled
    if (isModuleEnabled('sales')) {
      transactionsSubItems.push(
        { text: t.sales, icon: <SalesIcon />, path: '/business/dashboard/sales', moduleId: 'sales' }
      );
    }
    
    // Always show Purchase if purchase module is enabled
    if (isModuleEnabled('purchase')) {
      transactionsSubItems.push(
        { text: t.purchase, icon: <PurchaseIcon />, path: '/business/dashboard/purchase', moduleId: 'purchase' }
      );
    }
    
    // Always show Returns if sales module is enabled (returns is part of sales)
    if (isModuleEnabled('sales')) {
      transactionsSubItems.push(
        { text: t.returns, icon: <ReturnsIcon />, path: '/business/dashboard/returns', moduleId: 'sales' }
      );
    }

    // Show transactions menu if we have at least one sub-item
    if (transactionsSubItems.length > 0) {
      items.push({
        text: language === 'bn' ? 'লেনদেন' : 'Transactions',
        icon: <SalesIcon />,
        path: null, // No direct path, only sub-menu
        moduleId: null,
        hasSubMenu: true,
        subItems: transactionsSubItems
      });
    }

    // Warranty (can be part of sales or standalone)
    if (isModuleEnabled('sales')) {
      items.push(
        { text: t.warranty, icon: <WarrantyIcon />, path: '/business/dashboard/warranty', moduleId: 'sales' }
      );
    }

    // CRM module
    if (isModuleEnabled('crm')) {
      items.push(
        { text: t.contacts || t.customers, icon: <CustomersIcon />, path: '/business/dashboard/contacts', moduleId: 'crm' }
      );
    } else if (isModuleEnabled('inventory')) {
      // Show contacts as part of inventory if CRM not enabled
      items.push(
        { text: t.contacts || t.customers, icon: <CustomersIcon />, path: '/business/dashboard/contacts', moduleId: 'inventory' }
      );
    }

    // Reports module
    if (isModuleEnabled('reports')) {
      items.push(
        { text: t.analysis, icon: <AnalysisIcon />, path: '/business/dashboard/analysis', moduleId: 'reports' },
        { text: t.report, icon: <ReportIcon />, path: '/business/dashboard/report', moduleId: 'reports' }
      );
    }

    // Accounting module
    if (isModuleEnabled('accounting')) {
      items.push(
        { text: t.accounting, icon: <AccountingIcon />, path: '/business/dashboard/accounting', moduleId: 'accounting' }
      );
    }

    // HR module
    if (isModuleEnabled('hr')) {
      items.push(
        { text: t.hr, icon: <HRIcon />, path: '/business/dashboard/hr', moduleId: 'hr' }
      );
    }

    // Halkhata module
    if (isModuleEnabled('halkhata')) {
      items.push(
        { text: t.halkhata, icon: <HalkhataIcon />, path: '/business/dashboard/halkhata', moduleId: 'halkhata' }
      );
    }

    // Settings (always available)
    items.push(
      { text: t.settings, icon: <SettingsIcon />, path: '/business/dashboard/settings', moduleId: null }
    );

    return items;
  };

  const menuItems = getMenuItems();

  // Set current tab based on current path
  React.useEffect(() => {
    const pathname = location.pathname.replace(/\/$/, ''); // Remove trailing slash
    let matchedIndex = -1;
    
    // If pathname is products page or any products sub-page, set Products menu as active
    if (pathname === '/business/dashboard/products' || pathname.startsWith('/business/dashboard/products/')) {
      const productsIndex = menuItems.findIndex(item => item.path === '/business/dashboard/products');
      if (productsIndex !== -1) {
        setCurrentTab(productsIndex);
        return;
      }
    }
    
    // If pathname is POS system page or any POS sub-page, set POS menu as active
    if (pathname.startsWith('/business/pos-system')) {
      const posIndex = menuItems.findIndex(item => item.path === '/business/pos-system/sales');
      if (posIndex !== -1) {
        setCurrentTab(posIndex);
        return;
      }
    }
    
    // If pathname is settings page or any settings sub-page, set Settings menu as active
    if (pathname.startsWith('/business/dashboard/settings')) {
      const settingsIndex = menuItems.findIndex(item => item.path === '/business/dashboard/settings');
      if (settingsIndex !== -1) {
        setCurrentTab(settingsIndex);
        return;
      }
    }

    // Check transactions sub-menu items (Purchase, Sales, Returns)
    const transactionsItem = menuItems.find(item => item.hasSubMenu && item.subItems);
    if (transactionsItem) {
      const matchingSubItem = transactionsItem.subItems.find(subItem => {
        const normalizedSubPath = subItem.path.replace(/\/$/, '');
        return pathname === normalizedSubPath || pathname.startsWith(normalizedSubPath + '/');
      });
      if (matchingSubItem) {
        const transactionsIndex = menuItems.findIndex(item => item.hasSubMenu && item.subItems);
        if (transactionsIndex !== -1) {
          setCurrentTab(transactionsIndex);
          return;
        }
      }
    }
    
    // Check all menu items, prioritizing more specific (longer) paths
    // Sort by path length descending to check specific routes first
    const sortedItems = menuItems
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const pathA = a.item.path || '';
        const pathB = b.item.path || '';
        return pathB.length - pathA.length;
      });
    
    for (const { item, index } of sortedItems) {
      // Skip items without a path (like dropdown menus)
      if (!item.path) {
        continue;
      }
      
      const normalizedItemPath = item.path.replace(/\/$/, '');
      
      // Exact match
      if (pathname === normalizedItemPath) {
        matchedIndex = index;
        break;
      }
      
      // For dashboard, only match exactly (not sub-paths)
      if (normalizedItemPath === '/business/dashboard') {
        if (pathname === '/business/dashboard') {
          matchedIndex = index;
          break;
        }
        continue; // Skip dashboard for sub-paths
      }
      
      // Skip products for sub-paths (already handled above)
      if (normalizedItemPath === '/business/dashboard/products') {
        continue;
      }
      
      // Skip POS for sub-paths (already handled above)
      if (normalizedItemPath === '/business/pos-system/sales') {
        continue;
      }
      
      // Skip settings for sub-paths (already handled above)
      if (normalizedItemPath === '/business/dashboard/settings') {
        continue;
      }
      
      // For other paths, check if pathname starts with menu item path followed by /
      if (pathname.startsWith(normalizedItemPath + '/')) {
        matchedIndex = index;
        break;
      }
    }
    
    if (matchedIndex !== -1) {
      setCurrentTab(matchedIndex);
    }
  }, [location.pathname, menuItems]);

  // Check if we're on a POS page
  const isPOSPage = location.pathname.startsWith('/business/pos-system');
  
  // Check if we're on a Halkhata page
  const isHalkhataPage = location.pathname.startsWith('/business/dashboard/halkhata');
  
  // Check if we're on a Settings page
  const isSettingsPage = location.pathname.startsWith('/business/dashboard/settings');
  
  // Check if we're on an HR page
  const isHRPage = location.pathname.startsWith('/business/dashboard/hr') || 
                    location.pathname.startsWith('/business/dashboard/payroll') ||
                    location.pathname.startsWith('/business/dashboard/employees');

  // POS sidebar menu items
  const posSidebarItems = [
    { text: 'নতুন বিক্রয়', icon: <SalesIcon />, path: '/business/pos-system/sales' },
    { text: 'লেনদেনের ইতিহাস', icon: <TransactionHistoryIcon />, path: '/business/pos-system/transaction-history' },
    { text: 'বিশ্লেষণ', icon: <AnalysisIcon />, path: '/business/pos-system/analytics' },
    { text: 'কনফিগারেশন', icon: <SettingsIcon />, path: '/business/pos-system/configuration' },
    { text: 'সেটিংস', icon: <SettingsIcon />, path: '/business/pos-system/settings' },
  ];

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
          
          {/* Quick Actions */}
          <Box sx={{ 
            display: { xs: 'none', sm: 'flex' }, 
            gap: 1, 
            mr: 2 
          }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<POSIcon />}
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
              POS সিস্টেম
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddProduct}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              পণ্য যোগ করুন
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
            <Badge badgeContent={3} color="secondary">
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
            <MenuItem component={Link} to="/business/dashboard/settings/profile" onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" />
              </ListItemIcon>
              {t.profile}
            </MenuItem>
            <MenuItem component={Link} to="/business/dashboard/settings" onClick={handleMenuClose}>
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
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {item.text}
                      {item.hasSubMenu && (
                        <ArrowDownIcon sx={{ fontSize: 16 }} />
                      )}
                    </Box>
                  }
                  icon={item.icon}
                  iconPosition="start"
                  sx={{ minWidth: 120 }}
                  onMouseEnter={(e) => {
                    if (item.hasSubMenu) {
                      handleTransactionsMenuOpen(e);
                    }
                  }}
                  onClick={(e) => {
                    if (item.hasSubMenu) {
                      e.preventDefault();
                      handleTransactionsMenuOpen(e);
                    } else if (item.path) {
                      handleTabChange(e, index);
                    }
                  }}
                />
              ))}
            </Tabs>
            
            {/* Transactions Dropdown Menu */}
            <Menu
              anchorEl={transactionsMenuAnchor}
              open={Boolean(transactionsMenuAnchor)}
              onClose={handleTransactionsMenuClose}
              keepMounted
              MenuListProps={{
                onMouseEnter: handleTransactionsMenuEnter,
                onMouseLeave: handleTransactionsMenuClose,
              }}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              disableScrollLock={true}
              sx={{
                mt: 1,
                '& .MuiPaper-root': {
                  backgroundColor: 'white',
                  minWidth: 200,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }
              }}
            >
              {(() => {
                const transactionsItem = menuItems.find(item => item.hasSubMenu && item.subItems);
                return transactionsItem?.subItems?.map((subItem, subIndex) => (
                  <MenuItem
                    key={subIndex}
                    onClick={() => {
                      handleTransactionsMenuClose();
                      navigate(subItem.path);
                    }}
                    selected={location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      },
                      '&.Mui-selected': {
                        backgroundColor: 'rgba(78, 39, 157, 0.08)',
                        '&:hover': {
                          backgroundColor: 'rgba(78, 39, 157, 0.12)',
                        },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                      {subItem.icon}
                    </ListItemIcon>
                    <ListItemText primary={subItem.text} />
                  </MenuItem>
                ));
              })()}
            </Menu>
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
          {menuItems.map((item, index) => {
            if (item.hasSubMenu && item.subItems) {
              return (
                <React.Fragment key={item.text}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={(e) => {
                        // Toggle submenu on mobile - could expand/collapse here
                        handleMobileNavigation(item.path || '#');
                      }}
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
                      <ArrowDownIcon />
                    </ListItemButton>
                  </ListItem>
                  {/* Sub-menu items */}
                  {item.subItems.map((subItem, subIndex) => (
                    <ListItem key={`${item.text}-${subIndex}`} disablePadding sx={{ pl: 4 }}>
                      <ListItemButton
                        onClick={() => handleMobileNavigation(subItem.path)}
                        selected={location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')}
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
                          {subItem.icon}
                        </ListItemIcon>
                        <ListItemText primary={subItem.text} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </React.Fragment>
              );
            }
            return (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  onClick={() => handleMobileNavigation(item.path)}
                  selected={location.pathname === item.path || (item.path && location.pathname.startsWith(item.path + '/'))}
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
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        
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
              startIcon={<POSIcon />}
              fullWidth
              component={Link}
              to="/business/pos-system/sales"
              onClick={handleMobileDrawerClose}
              sx={{ justifyContent: 'flex-start' }}
            >
              POS সিস্টেম
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              fullWidth
              component={Link}
              to="/business/products/add"
              onClick={handleMobileDrawerClose}
              sx={{ justifyContent: 'flex-start' }}
            >
              পণ্য যোগ করুন
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<InventoryIcon />}
              fullWidth
              component={Link}
              to="/business/products"
              onClick={handleMobileDrawerClose}
              sx={{ justifyContent: 'flex-start' }}
            >
              পণ্য দেখুন
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
          {isPOSPage ? (
            // POS Sidebar
            <>
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
                POS মেনু
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {posSidebarItems.map((item, index) => {
                  // Different gradient colors for each button
                  const gradients = [
                    'linear-gradient(135deg, #4e279d 0%, #1275cb 100%)', // Sales - Blue to Purple
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Transaction History - Purple
                    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Analysis - Pink to Red
                    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Configuration - Blue to Cyan
                    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // Settings - Pink to Yellow
                  ];
                  const hoverGradients = [
                    'linear-gradient(135deg, #3d1f7d 0%, #0f5d9b 100%)', // Sales hover
                    'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                    'linear-gradient(135deg, #e084ea 0%, #e5475c 100%)',
                    'linear-gradient(135deg, #3e9bee 0%, #00d2ee 100%)',
                    'linear-gradient(135deg, #ea609a 0%, #eed130 100%)',
                  ];
                  const isActive = location.pathname === item.path || 
                    (item.path === '/business/pos-system/sales' && 
                     (location.pathname === '/business/pos-system' || location.pathname === '/business/pos-system/'));
                  
                  return (
                    <Button
                      key={index}
                      variant="contained"
                      startIcon={item.icon}
                      fullWidth
                      component={Link}
                      to={item.path}
                      sx={{
                        justifyContent: 'flex-start',
                        background: gradients[index] || gradients[0],
                        '&:hover': {
                          background: hoverGradients[index] || hoverGradients[0],
                        },
                        opacity: isActive ? 1 : 0.9,
                        boxShadow: isActive ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                      }}
                    >
                      {item.text}
                    </Button>
                  );
                })}
              </Box>
            </>
          ) : isSettingsPage ? (
            // Settings Sidebar
            <>
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
                সেটিংস
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/settings"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3e9bee 0%, #00d2ee 100%)',
                    },
                  }}
                >
                  জেনারেল সেটিংস
                </Button>

                <Button
                  variant="contained"
                  startIcon={<StoreIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/settings/business"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e084ea 0%, #e5475c 100%)',
                    },
                  }}
                >
                  ব্যবসা সেটিংস
                </Button>

                <Button
                  variant="contained"
                  startIcon={<SubscriptionIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/settings/subscription"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ea609a 0%, #eed130 100%)',
                    },
                  }}
                >
                  সাবস্ক্রিপশন
                </Button>
              </Box>
            </>
          ) : isHalkhataPage ? (
            // Halkhata Sidebar
            <>
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
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<HalkhataIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/halkhata"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0f8980 0%, #2edf6d 100%)',
                    },
                  }}
                >
                  হালখাতা
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<MailIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/halkhata/invitation"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                    },
                  }}
                >
                  হালখাতা আমন্ত্রণ
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<SettingsIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/halkhata/settings"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e084ea 0%, #e5475c 100%)',
                    },
                  }}
                >
                  হালখাতা সেটিংস
                </Button>
              </Box>
            </>
          ) : isHRPage ? (
            // HR Sidebar
            <>
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
                মানব সম্পদ
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<HRIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/hr"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                    },
                    opacity: (location.pathname === '/business/dashboard/hr' || location.pathname === '/business/dashboard/employees') ? 1 : 0.9,
                    boxShadow: (location.pathname === '/business/dashboard/hr' || location.pathname === '/business/dashboard/employees') ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                  }}
                >
                  মানব সম্পদ
                </Button>
                
                {isModuleEnabled('payroll') && (
                  <Button
                    variant="contained"
                    startIcon={<AttachMoneyIcon />}
                    fullWidth
                    component={Link}
                    to="/business/dashboard/payroll"
                    sx={{
                      justifyContent: 'flex-start',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #e084ea 0%, #e5475c 100%)',
                      },
                      opacity: location.pathname === '/business/dashboard/payroll' ? 1 : 0.9,
                      boxShadow: location.pathname === '/business/dashboard/payroll' ? '0 4px 15px rgba(0,0,0,0.2)' : 'none',
                    }}
                  >
                    বেতন
                  </Button>
                )}
              </Box>
            </>
          ) : (
            // Regular Inventory Sidebar
            <>
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
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={handleAddProduct}
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                    },
                  }}
                >
                  পণ্য যোগ করুন
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<CategoryIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/products/categories"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #e084ea 0%, #e5475c 100%)',
                    },
                  }}
                >
                  পন্য ক্যাটাগরি
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<BrandIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/products/brands"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #3e9bee 0%, #00d2ee 100%)',
                    },
                  }}
                >
                  ব্র্যান্ড
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<UnitsIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/products/units"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #ea609a 0%, #eed130 100%)',
                    },
                  }}
                >
                  ইউনিট সমূহ
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={<VariationsIcon />}
                  fullWidth
                  component={Link}
                  to="/business/dashboard/products/variations"
                  sx={{
                    justifyContent: 'flex-start',
                    background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                    color: '#333',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #98ddea 0%, #eec6d3 100%)',
                    },
                  }}
                >
                  ভ্যারিয়েশান
                </Button>
              </Box>
            </>
          )}
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
            {isPOSPage ? (
              // POS Routes - relative to /business/pos-system/*
              <>
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/transaction-history" element={<TransactionHistory />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/configuration" element={<POSConfiguration />} />
                <Route path="/settings" element={<div>POS Settings Page</div>} />
                <Route path="/" element={<SalesPage />} />
              </>
            ) : (
              // Inventory Dashboard Routes - relative to /business/dashboard/*
              <>
                <Route path="/" element={<Dashboard />} />
                <Route 
                  path="/products" 
                  element={
                    <ModuleProtectedRoute moduleId="inventory">
                      <ProductsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/products/categories" 
                  element={
                    <ModuleProtectedRoute moduleId="inventory">
                      <CategoriesPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/products/brands" 
                  element={
                    <ModuleProtectedRoute moduleId="inventory">
                      <BrandsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/products/units" 
                  element={
                    <ModuleProtectedRoute moduleId="inventory">
                      <UnitsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/products/variations" 
                  element={
                    <ModuleProtectedRoute moduleId="inventory">
                      <VariationsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/stock" 
                  element={
                    <ModuleProtectedRoute moduleId="inventory">
                      <StockPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/sales" 
                  element={
                    <ModuleProtectedRoute moduleId="sales">
                      <SalesListPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/purchase" 
                  element={
                    <ModuleProtectedRoute moduleId="purchase">
                      <PurchasePage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/returns" 
                  element={
                    <ModuleProtectedRoute moduleId="sales">
                      <ReturnsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/warranty" 
                  element={
                    <ModuleProtectedRoute moduleId="sales">
                      <WarrantyPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/contacts" 
                  element={
                    <ModuleProtectedRoute moduleId="crm">
                      <ContactsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <ModuleProtectedRoute moduleId="crm">
                      <ContactsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/analysis" 
                  element={
                    <ModuleProtectedRoute moduleId="reports">
                      <AnalysisPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/report" 
                  element={
                    <ModuleProtectedRoute moduleId="reports">
                      <ReportPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/accounting" 
                  element={
                    <ModuleProtectedRoute moduleId="accounting">
                      <AccountingPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/hr" 
                  element={
                    <ModuleProtectedRoute moduleId="hr">
                      <HRPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/employees" 
                  element={
                    <ModuleProtectedRoute moduleId="hr">
                      <HRPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/payroll" 
                  element={
                    <ModuleProtectedRoute moduleId="payroll">
                      <PayrollPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/halkhata" 
                  element={
                    <ModuleProtectedRoute moduleId="halkhata">
                      <HalkhataPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/halkhata/invitation" 
                  element={
                    <ModuleProtectedRoute moduleId="halkhata">
                      <HalkhataInvitationPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route 
                  path="/halkhata/settings" 
                  element={
                    <ModuleProtectedRoute moduleId="halkhata">
                      <HalkhataSettingsPage />
                    </ModuleProtectedRoute>
                  } 
                />
                <Route path="/settings/profile" element={<ProfileSettingsPage />} />
                <Route path="/settings/business" element={<BusinessSettingsPage />} />
                <Route path="/settings/subscription" element={<SubscriptionSettingsPage />} />
                <Route path="/settings" element={<GeneralSettingsPage />} />
              </>
            )}
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

// Default dashboard home component
const Dashboard = () => {
  const [inventoryData] = useState({
    totalProducts: 1250,
    lowStockItems: 45,
    outOfStockItems: 12,
    totalValue: 2500000,
    stockUtilization: 78,
    categories: [
      { name: 'খাদ্যশস্য', count: 320, color: '#4CAF50' },
      { name: 'ডাল', count: 180, color: '#FF9800' },
      { name: 'মসলা', count: 95, color: '#F44336' },
      { name: 'তেল', count: 75, color: '#9C27B0' }
    ],
    recentProducts: [
      {
        id: 1,
        name: 'বাসমতি চাল',
        sku: 'RICE-001',
        stockLevel: 150,
        reorderPoint: 50,
        status: 'in_stock',
        category: 'খাদ্যশস্য',
        price: 120,
        unit: 'কেজি'
      },
      {
        id: 2,
        name: 'মসুর ডাল',
        sku: 'DAL-002',
        stockLevel: 25,
        reorderPoint: 30,
        status: 'low_stock',
        category: 'ডাল',
        price: 180,
        unit: 'কেজি'
      },
      {
        id: 3,
        name: 'চিনি',
        sku: 'SUGAR-003',
        stockLevel: 0,
        reorderPoint: 20,
        status: 'out_of_stock',
        category: 'খাদ্যশস্য',
        price: 95,
        unit: 'কেজি'
      },
      {
        id: 4,
        name: 'হলুদ গুঁড়ো',
        sku: 'SPICE-004',
        stockLevel: 45,
        reorderPoint: 25,
        status: 'in_stock',
        category: 'মসলা',
        price: 220,
        unit: 'কেজি'
      }
    ]
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_stock': return 'স্টকে আছে';
      case 'low_stock': return 'কম স্টক';
      case 'out_of_stock': return 'স্টক নেই';
      default: return 'অজানা';
    }
  };

  return (
    <Box>
      {/* First Div - Statistics Cards */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Enhanced Statistics Cards */}
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <InventoryIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট পণ্য
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.totalProducts.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <AttachMoneyIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট মূল্য
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ৳{(inventoryData.totalValue / 100000).toFixed(1)}L
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <WarningIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    কম স্টক আইটেম
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.lowStockItems}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <LocalShippingIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    স্টক নেই
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.outOfStockItems}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#333' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 2, width: 48, height: 48 }}>
                  <CategoryIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    পণ্য বিভাগ
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.categories.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#333' }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.7)', mr: 2, width: 48, height: 48 }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    স্টক ব্যবহার
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {inventoryData.stockUtilization}%
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Charts Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Sales Trend Chart */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  বিক্রয় প্রবণতা (গত ৭ দিন)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={[
                      { name: 'সোম', sales: 45000, purchases: 35000 },
                      { name: 'মঙ্গল', sales: 52000, purchases: 40000 },
                      { name: 'বুধ', sales: 48000, purchases: 38000 },
                      { name: 'বৃহস্পতি', sales: 61000, purchases: 45000 },
                      { name: 'শুক্র', sales: 55000, purchases: 42000 },
                      { name: 'শনি', sales: 68000, purchases: 50000 },
                      { name: 'রবি', sales: 72000, purchases: 55000 },
                    ]}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0a6abd" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0a6abd" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3d1789" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3d1789" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area type="monotone" dataKey="sales" stroke="#0a6abd" fillOpacity={1} fill="url(#colorSales)" name="বিক্রয়" />
                    <Area type="monotone" dataKey="purchases" stroke="#3d1789" fillOpacity={1} fill="url(#colorPurchases)" name="ক্রয়" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Distribution Pie Chart */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  পণ্য বিভাগ বিতরণ
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={inventoryData.categories}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {inventoryData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  শীর্ষ পণ্য (স্টক মূল্য)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'বাসমতি চাল', value: 18000 },
                      { name: 'মসুর ডাল', value: 4500 },
                      { name: 'হলুদ গুঁড়ো', value: 9900 },
                      { name: 'চিনি', value: 0 },
                      { name: 'আটা', value: 12000 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0a6abd" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3d1789" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="url(#colorBar)" radius={[8, 8, 0, 0]}>
                      {[
                        { name: 'বাসমতি চাল', value: 18000 },
                        { name: 'মসুর ডাল', value: 4500 },
                        { name: 'হলুদ গুঁড়ো', value: 9900 },
                        { name: 'চিনি', value: 0 },
                        { name: 'আটা', value: 12000 },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#0a6abd' : '#3d1789'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Stock Status Line Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                  স্টক অবস্থা (গত ৭ দিন)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={[
                      { name: 'সোম', inStock: 1200, lowStock: 40, outOfStock: 10 },
                      { name: 'মঙ্গল', inStock: 1180, lowStock: 45, outOfStock: 12 },
                      { name: 'বুধ', inStock: 1165, lowStock: 50, outOfStock: 15 },
                      { name: 'বৃহস্পতি', inStock: 1150, lowStock: 48, outOfStock: 12 },
                      { name: 'শুক্র', inStock: 1135, lowStock: 52, outOfStock: 13 },
                      { name: 'শনি', inStock: 1120, lowStock: 55, outOfStock: 15 },
                      { name: 'রবি', inStock: 1105, lowStock: 58, outOfStock: 17 },
                    ]}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="inStock" stroke="#4CAF50" strokeWidth={2} name="স্টকে আছে" />
                    <Line type="monotone" dataKey="lowStock" stroke="#FF9800" strokeWidth={2} name="কম স্টক" />
                    <Line type="monotone" dataKey="outOfStock" stroke="#F44336" strokeWidth={2} name="স্টক নেই" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Second Div - Main Content Sections */}
      <Box>
        <Grid container spacing={2}>
          {/* Recent Products */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  সাম্প্রতিক পণ্য
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<AddIcon />}
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
                      <TableCell align="right">অবস্থা</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryData.recentProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {product.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {product.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {product.stockLevel} {product.unit}
                        </TableCell>
                        <TableCell align="right">৳{product.price}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={getStatusText(product.status)} 
                            color={getStatusColor(product.status)}
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

          {/* Categories Breakdown */}
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  পণ্য বিভাগ
                </Typography>
                <Button variant="outlined" size="small">
                  সব দেখুন
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>বিভাগ</TableCell>
                      <TableCell align="right">পণ্য সংখ্যা</TableCell>
                      <TableCell align="right">শতকরা হার</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryData.categories.map((category) => (
                      <TableRow key={category.name}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box 
                              sx={{ 
                                width: 12, 
                                height: 12, 
                                borderRadius: '50%', 
                                backgroundColor: category.color,
                                mr: 2
                              }} 
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {category.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">{category.count}</TableCell>
                        <TableCell align="right">
                          {((category.count / inventoryData.totalProducts) * 100).toFixed(1)}%
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                  কম স্টক সতর্কতা
                </Typography>
                <Button 
                  variant="outlined" 
                  size="small"
                  startIcon={<POSIcon />}
                  component={Link}
                  to="/business/pos-system/sales"
                >
                  POS সিস্টেম
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Paper sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        মসুর ডাল
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        মাত্র ২৫ কেজি বাকি
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
                        চিনি
                      </Typography>
                      <Typography variant="body2" color="error.main">
                        স্টক নেই
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
                        হলুদ গুঁড়ো
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        মাত্র ৪৫ কেজি বাকি
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

export default InventoryDashboard; 