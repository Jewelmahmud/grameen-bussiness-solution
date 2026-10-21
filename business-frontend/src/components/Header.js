import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Container, 
  Box, 
  TextField, 
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Select,
  FormControl,
  Badge,
  Stack,
  Link as MuiLink,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  Search as SearchIcon, 
  ShoppingCart as CartIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
  Home as HomeIcon,
  Store as StoreIcon,
  Category as CategoryIcon,
  Language as LanguageIcon,
  KeyboardArrowDown as ArrowDownIcon,
  LocalPharmacy as LocalPharmacyIcon,
  Storefront as StorefrontIcon,
  Grass as GrassIcon,
  Restaurant as RestaurantIcon,
  ShoppingBag as ShoppingBagIcon,
  Handyman as HandymanIcon,
  MenuBook as BookIcon,
  Computer as ElectronicsIcon,
  Checkroom as GarmentsIcon,
  Science as ChemicalIcon,
  Build as HardwareIcon,
  FaceRetouchingNatural as CosmeticsIcon,
  LocalFlorist as LocalFloristIcon,
  Settings as SettingsIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Public as PublicIcon,
  Pets as PetsIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { availableLanguages } from '../config/languages'; // We'll create this file
import headerBn from '../i18n/bn/header';
import headerEn from '../i18n/en/header';
import headerNp from '../i18n/np/header';
import headerPk from '../i18n/pk/header';
import headerDe from '../i18n/de/header';
import headerBt from '../i18n/bt/header';
import headerSl from '../i18n/sl/header';
import headerAf from '../i18n/af/header';
import headerCn from '../i18n/cn/header';
import { useCart } from '../contexts/CartContext';
import { useLocation as useUserLocation } from '../contexts/LocationContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const { cartCount } = useCart();
  const { getFormattedLocation, getShortFormattedLocation, userLocation, updateLocation } = useUserLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [languageAnchorEl, setLanguageAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [languages, setLanguages] = useState(availableLanguages);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  // Define routes where you want to show the search box
  const showSearchRoutes = ['/categories', '/stores', '/products'];
  
  // Check if search box should be displayed on current route
  const shouldShowSearch = showSearchRoutes.includes(location.pathname);
  
  // Fetch languages from API on component mount
  useEffect(() => {
    // This could be replaced with your actual API call
    const fetchLanguages = async () => {
      try {
        const response = await fetch('/api/languages');
        if (response.ok) {
          const data = await response.json();
          setLanguages(data);
        }
      } catch (error) {
        console.error('Failed to fetch languages:', error);
        // Fallback to default languages if API fails
      }
    };
    
    // fetchLanguages();
    
    // Get stored language preference from localStorage or use default
    const storedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(storedLanguage);
  }, []);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLanguageMenuOpen = (event) => {
    setLanguageAnchorEl(event.currentTarget);
  };
  
  const handleLanguageMenuClose = () => {
    setLanguageAnchorEl(null);
  };
  
  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('preferredLanguage', languageCode);
    // Here you would also trigger your language change logic
    // e.g., call a function from your i18n setup
    // Notify other components that language changed
    const event = new Event('preferredLanguageChanged');
    window.dispatchEvent(event);
    handleLanguageMenuClose();
  };

  const t = currentLanguage === 'en' ? headerEn : 
            currentLanguage === 'np' ? headerNp : 
            currentLanguage === 'pk' ? headerPk : 
            currentLanguage === 'bt' ? headerBt : 
            currentLanguage === 'de' ? headerDe : 
            currentLanguage === 'sl' ? headerSl : 
            currentLanguage === 'af' ? headerAf : 
            currentLanguage === 'cn' ? headerCn : 
            headerBn;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };
  
  const getCurrentLanguageDisplay = () => {
    const lang = languages.find(lang => lang.code === currentLanguage);
    return lang ? lang.name : 'English';
  };

  const FlagIcon = ({ code }) => (
    <Box
      component="img"
      src={`/images/flags/${code}.svg`}
      alt={code}
      sx={{ width: 18, height: 12, borderRadius: '2px', boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', mr: 1 }}
      onError={(e) => { e.currentTarget.style.display = 'none'; }}
    />
  );


  return (
    <>
      <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: (theme) => theme.zIndex.appBar }}>
      {/* Top Bar (always visible) */}
      <AppBar 
        position="static" 
        sx={{ 
          background: 'linear-gradient(45deg, #4a2496 30%, #0373d6 90%)', 
          minHeight: '30px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          '& .MuiToolbar-root': {
            minHeight: '15px !important',
            height: '15px',
            py: 1
          }
        }}
      >
        <Container sx={{ maxWidth: '100% !important', px: { xs: 1, sm: 2, md: 3 } }}>
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1 }} />
            <Stack 
              direction="row" 
              spacing={3} 
              sx={{ 
                display: { xs: 'none', md: 'flex' },
                alignItems: 'center'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: '0.9rem' }} />
                <Typography variant="caption">
                  +880 1234 567890
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon sx={{ fontSize: '0.9rem' }} />
                <Typography variant="caption">
                  info@grameenbazar.com
                </Typography>
              </Box>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 0.5
                }}
              >
                <LocationIcon sx={{ fontSize: '0.9rem' }} />
                <Typography 
                  variant="caption"
                  sx={{ 
                    display: { xs: 'none', lg: 'block' },
                    maxWidth: 200,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getFormattedLocation()}
                </Typography>
                <Typography 
                  variant="caption"
                  sx={{ 
                    display: { xs: 'block', lg: 'none' },
                    maxWidth: 120,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {getShortFormattedLocation()}
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
              <MuiLink 
                component={Link}
                to="/bazars"
                color="inherit" 
                underline="hover"
                sx={{ 
                  typography: 'caption',
                  '&:hover': { color: '#ffd54f' }
                }}
              >
                {t.top.bazarList}
              </MuiLink>
              <MuiLink 
                component={Link}
                to="/help"
                color="inherit" 
                underline="hover"
                sx={{ 
                  typography: 'caption',
                  '&:hover': { color: '#ffd54f' }
                }}
              >
                {t.top.help}
              </MuiLink>
              <MuiLink 
                component={Link}
                to="/contact"
                color="inherit" 
                underline="hover"
                sx={{ 
                  typography: 'caption',
                  '&:hover': { color: '#ffd54f' }
                }}
              >
                {t.top.contact}
              </MuiLink>
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>


      {/* Main Header */}
      <Box>
      <AppBar position="static" sx={{ 
        background: 'linear-gradient(45deg, #5e35b1 30%, #1e88e5 90%)',
      }}>
        <Container sx={{ maxWidth: '100% !important', px: { xs: 0.5, sm: 2, md: 3 } }}>
          <Toolbar sx={{ minHeight: { xs: '56px', md: '64px', justifyContent: 'space-between' } }}>
            {/* Left side - Hamburger menu and brand */}
            <Box sx={{ display: 'flex', alignItems: 'center'	 }}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              
              <Typography
                variant="h6"
                noWrap
                component={Link}
                to="/"
                sx={{
                  mr: 2,
                  display: { xs: 'flex', md: 'flex' },
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  maxWidth: { xs: '120px', sm: 'none' },
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {t.brand}
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              <Button
                component={Link}
                to="/daily-bazar"
                startIcon={<StorefrontIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/daily-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.dailyBazar : t.nav.dailyBazar}
              </Button>
              <Button
                component={Link}
                to="/medicine-bazar"
                startIcon={<LocalPharmacyIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/medicine-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.medicineBazar : t.nav.medicineBazar}
              </Button>
              <Button
                component={Link}
                to="/food-bazar"
                startIcon={<RestaurantIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/food-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.foodBazar : t.nav.foodBazar}
              </Button>
              <Button
                component={Link}
                to="/grains"
                startIcon={<GrassIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/grains' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.grains : t.nav.grains}
              </Button>   
              
              <Button
                component={Link}
                to="/national-bazar"
                startIcon={<PublicIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/national-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.nationalBazar : t.nav.nationalBazar}
              </Button>
              
              <Button
                component={Link}
                to="/garments-bazar"
                startIcon={<GarmentsIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/garments-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.garmentsBazar : t.nav.garmentsBazar}
              </Button>
              <Button
                component={Link}
                to="/cosmetics-bazar"
                startIcon={<CosmeticsIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/cosmetics-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.cosmeticsBazar : t.nav.cosmeticsBazar}
              </Button>
              <Button
                component={Link}
                to="/book-bazar"
                startIcon={<BookIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/book-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.bookBazar : t.nav.bookBazar}
              </Button>
              <Button
                component={Link}
                to="/nursery-bazar"
                startIcon={<LocalFloristIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/nursery-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.nurseryBazar : t.nav.nurseryBazar}
              </Button>
              <Button
                component={Link}
                to="/electronics-bazar"
                startIcon={<ElectronicsIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/electronics-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.electronicsBazar : t.nav.electronicsBazar}
              </Button>
              <Button
                component={Link}
                to="/chemical-bazar"
                startIcon={<ChemicalIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/chemical-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.chemicalBazar : t.nav.chemicalBazar}
              </Button>
              <Button
                component={Link}
                to="/hardware-bazar"
                startIcon={<HardwareIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/hardware-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.hardwareBazar : t.nav.hardwareBazar}
              </Button>
              
              <Button
                component={Link}
                to="/service-bazar"
                startIcon={<HandymanIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/service-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.serviceBazar : t.nav.serviceBazar}
              </Button>
              <Button
                component={Link}
                to="/feed-bazar"
                startIcon={<PetsIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/feed-bazar' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.feedBazar : t.nav.feedBazar}
              </Button>
              <Button
                component={Link}
                to="/halkhata"
                startIcon={<AccountBalanceIcon />}
                sx={{ 
                  mx: 0.5, 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 1,
                  padding: '6px 10px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                  ...(location.pathname === '/halkhata' && {
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  }),
                }}
              >
                {currentLanguage === 'en' ? t.nav.halkhata : t.nav.halkhata}
              </Button>
            </Box>

            {/* Conditionally render the search box */}
            {shouldShowSearch && (
              <Box component="form" onSubmit={handleSearch} sx={{ 
                flexGrow: 1, 
                maxWidth: 500, 
                mx: 'auto',
                display: { xs: 'none', md: 'block' }
              }}>
                <TextField
                  fullWidth
                  placeholder={t.search.placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 1,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton type="submit" edge="end">
                          <SearchIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {/* Right side - Language selector, cart, and profile */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Language Selector */}
              <Button
                color="inherit"
                onClick={handleLanguageMenuOpen}
                startIcon={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon code={(languages.find(l => l.code === currentLanguage)?.flag) || 'us'} />
                  </Box>
                }
                endIcon={<ArrowDownIcon />}
                sx={{ 
                  minWidth: 'unset',
                  textTransform: 'none',
                  display: { xs: 'none', sm: 'flex' }
                }}
              >
                {getCurrentLanguageDisplay()}
              </Button>
              
              {/* Mobile search button */}
              {shouldShowSearch && (
                <IconButton
                  color="inherit"
                  aria-label="search"
                  sx={{ display: { xs: 'flex', md: 'none' } }}
                  onClick={() => navigate('/search')}
                >
                  <SearchIcon />
                </IconButton>
              )}
              
              {/* Mobile language selector - just flag icon */}
              <IconButton
                color="inherit"
                onClick={handleLanguageMenuOpen}
                sx={{ display: { xs: 'flex', sm: 'none' } }}
              >
                <FlagIcon code={(languages.find(l => l.code === currentLanguage)?.flag) || 'us'} />
              </IconButton>
              
              {/* Cart */}
              <IconButton
                component={Link}
                to="/cart"
                color="inherit"
                aria-label="cart"
              >
                <Badge badgeContent={cartCount} color="error">
                  <CartIcon />
                </Badge>
              </IconButton>
              
              {/* Profile */}
              <IconButton
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleProfileMenuOpen}
                color="inherit"
              >
                <PersonIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      </Box>
      </Box>
      {/* Spacer to offset fixed header height (reserve full height so content doesn't jump) */}
      <Box sx={{ height: (30 + (isMdUp ? 64 : 56)) + 'px' }} />
      
      {/* Language Menu */}
      <Menu
        anchorEl={languageAnchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(languageAnchorEl)}
        onClose={handleLanguageMenuClose}
        disableScrollLock={true}
      >
        {languages.map((lang) => (
          <MenuItem 
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            selected={currentLanguage === lang.code}
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FlagIcon code={lang.flag} />
            <Box>
              <Typography variant="body2" sx={{ lineHeight: 1 }}>
                {lang.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                {lang.nativeName}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Menu>
      
      {/* User Profile Menu */}
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
        <MenuItem component={Link} to="/login" onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {t.profileMenu.login}
        </MenuItem>
        <MenuItem component={Link} to="/register" onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {t.profileMenu.register}
        </MenuItem>
        <Divider />
        <MenuItem component={Link} to="/customer/dashboard" onClick={handleMenuClose}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {t.profileMenu.myAccount}
        </MenuItem>
        <MenuItem component={Link} to="/store-owner/dashboard" onClick={handleMenuClose}>
          <ListItemIcon>
            <StoreIcon fontSize="small" />
          </ListItemIcon>
          {t.profileMenu.storeDashboard}
        </MenuItem>
        <MenuItem component={Link} to="/admin/dashboard" onClick={handleMenuClose}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {t.profileMenu.adminDashboard}
        </MenuItem>
      </Menu>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            {/* Mobile search in drawer */}
            {shouldShowSearch && (
              <ListItem button onClick={() => {
                navigate('/search');
                toggleDrawer(false)();
              }}>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText primary={t.search.placeholder} />
              </ListItem>
            )}
            
            <ListItem button component={Link} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary={t.drawer.home} />
            </ListItem>
            <ListItem button component={Link} to="/daily-bazar">
              <ListItemIcon>
                <StorefrontIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.dailyBazar} />
            </ListItem>
            <ListItem button component={Link} to="/medicine-bazar">
              <ListItemIcon>
                <LocalPharmacyIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.medicineBazar} />
            </ListItem>
            <ListItem button component={Link} to="/grains">
              <ListItemIcon>
                <GrassIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.grains} />
            </ListItem>
            <ListItem button component={Link} to="/national-bazar">
              <ListItemIcon>
                <PublicIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.nationalBazar} />
            </ListItem>
            <ListItem button component={Link} to="/food-bazar">
              <ListItemIcon>
                <RestaurantIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.foodBazar} />
            </ListItem>
            <ListItem button component={Link} to="/book-bazar">
              <ListItemIcon>
                <BookIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.bookBazar} />
            </ListItem>
            <ListItem button component={Link} to="/nursery-bazar">
              <ListItemIcon>
                <LocalFloristIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.nurseryBazar} />
            </ListItem>
            <ListItem button component={Link} to="/garments-bazar">
              <ListItemIcon>
                <GarmentsIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.garmentsBazar} />
            </ListItem>
            <ListItem button component={Link} to="/electronics-bazar">
              <ListItemIcon>
                <ElectronicsIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.electronicsBazar} />
            </ListItem>
            <ListItem button component={Link} to="/chemical-bazar">
              <ListItemIcon>
                <ChemicalIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.chemicalBazar} />
            </ListItem>
            <ListItem button component={Link} to="/hardware-bazar">
              <ListItemIcon>
                <HardwareIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.hardwareBazar} />
            </ListItem>
            <ListItem button component={Link} to="/cosmetics-bazar">
              <ListItemIcon>
                <CosmeticsIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.cosmeticsBazar} />
            </ListItem>
            <ListItem button component={Link} to="/service-bazar">
              <ListItemIcon>
                <HandymanIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.serviceBazar} />
            </ListItem>
            <ListItem button component={Link} to="/feed-bazar">
              <ListItemIcon>
                <PetsIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.feedBazar} />
            </ListItem>
            <ListItem button component={Link} to="/halkhata">
              <ListItemIcon>
                <AccountBalanceIcon />
              </ListItemIcon>
               <ListItemText primary={t.drawer.halkhata} />
            </ListItem>
            {/* Language selector in drawer for mobile */}
            <ListItem button onClick={(event) => {
              event.stopPropagation();
              handleLanguageMenuOpen(event);
            }}>
              <ListItemIcon>
                <LanguageIcon />
              </ListItemIcon>
              <ListItemText primary={`Language (${getCurrentLanguageDisplay()})`} />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;