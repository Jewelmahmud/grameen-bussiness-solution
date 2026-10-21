import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  CardActionArea,
  IconButton,
  Divider,
  Chip,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Badge,
  alpha,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  ShoppingCart as CartIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
  Clear as ClearIcon,
  Discount as DiscountIcon,
  LocalOffer as OfferIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import multiBankPOSService from '../../services/multiBankPOSService';

// Styled Components
const StyledProductCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  border: `1px solid ${theme.palette.divider}`,
  transition: 'all 0.3s ease',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
    transform: 'scaleX(0)',
    transition: 'transform 0.3s ease',
  },
  '&:hover': {
    boxShadow: theme.shadows[8],
    transform: 'translateY(-4px)',
    '&::before': {
      transform: 'scaleX(1)',
    },
  },
}));

const StyledCartPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
}));

const StyledProductPaper = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 600,
  padding: '10px 24px',
  boxShadow: theme.shadows[4],
  '&:hover': {
    background: 'linear-gradient(45deg, #5568d3 0%, #6a4190 100%)',
    boxShadow: theme.shadows[8],
    transform: 'translateY(-2px)',
  },
  '&:disabled': {
    background: theme.palette.grey[300],
    color: theme.palette.grey[500],
  },
  transition: 'all 0.3s ease',
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
  },
  transition: 'background-color 0.2s ease',
}));

const SalesPage = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const barcodeTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const discountInputRef = useRef(null);
  const [products] = useState([
    {
      id: 1,
      name: 'মসুর ডাল',
      price: 120,
      stock: 50,
      category: 'ডাল',
      barcode: '123456789',
      image: '/images/groceries/am.jpeg'
    },
    {
      id: 2,
      name: 'চাল',
      price: 65,
      stock: 100,
      category: 'চাল',
      barcode: '987654321',
      image: '/images/groceries/basmati.jpg'
    },
    {
      id: 3,
      name: 'চিনি',
      price: 95,
      stock: 30,
      category: 'মিষ্টি',
      barcode: '456789123',
      image: '/images/groceries/tomato.webp'
    },
    {
      id: 4,
      name: 'আটা',
      price: 55,
      stock: 75,
      category: 'আটা',
      barcode: '789123456',
      image: '/images/groceries/basmati.jpg'
    },
    {
      id: 5,
      name: 'তেল',
      price: 180,
      stock: 25,
      category: 'তেল',
      barcode: '321654987',
      image: '/images/mustardoil.jpg'
    },
    {
      id: 6,
      name: 'বাসমতি চাল',
      price: 140,
      stock: 45,
      category: 'চাল',
      barcode: '111222333',
      image: '/images/groceries/basmati.jpg'
    },
    {
      id: 7,
      name: 'হলুদ গুঁড়ো',
      price: 220,
      stock: 40,
      category: 'মসলা',
      barcode: '444555666',
      image: '/images/holudgura.jpg'
    },
    {
      id: 8,
      name: 'ধনিয়া গুঁড়ো',
      price: 180,
      stock: 35,
      category: 'মসলা',
      barcode: '777888999',
      image: '/images/holudgura.jpg'
    },
    {
      id: 9,
      name: 'জিরা',
      price: 320,
      stock: 20,
      category: 'মসলা',
      barcode: '101112131',
      image: '/images/holudgura.jpg'
    },
    {
      id: 10,
      name: 'লবণ',
      price: 25,
      stock: 150,
      category: 'মসলা',
      barcode: '141516171',
      image: '/images/salt.jpg'
    },
    {
      id: 11,
      name: 'মরিচ গুঁড়ো',
      price: 280,
      stock: 30,
      category: 'মসলা',
      barcode: '181920212',
      image: '/images/holudgura.jpg'
    },
    {
      id: 12,
      name: 'বাদাম',
      price: 450,
      stock: 15,
      category: 'ড্রাই ফ্রুটস',
      barcode: '222324252',
      image: '/images/biscuit.jpg'
    },
    {
      id: 13,
      name: 'কিসমিস',
      price: 350,
      stock: 25,
      category: 'ড্রাই ফ্রুটস',
      barcode: '262728293',
      image: '/images/biscuit.jpg'
    },
    {
      id: 14,
      name: 'খেজুর',
      price: 280,
      stock: 30,
      category: 'ড্রাই ফ্রুটস',
      barcode: '303132333',
      image: '/images/biscuit.jpg'
    },
    {
      id: 15,
      name: 'সয়া তেল',
      price: 165,
      stock: 40,
      category: 'তেল',
      barcode: '343536373',
      image: '/images/mustardoil.jpg'
    },
    {
      id: 16,
      name: 'সরিষার তেল',
      price: 195,
      stock: 35,
      category: 'তেল',
      barcode: '383940414',
      image: '/images/mustardoil.jpg'
    },
    {
      id: 17,
      name: 'মুগ ডাল',
      price: 110,
      stock: 55,
      category: 'ডাল',
      barcode: '424344454',
      image: '/images/groceries/am.jpeg'
    },
    {
      id: 18,
      name: 'ছোলা ডাল',
      price: 130,
      stock: 45,
      category: 'ডাল',
      barcode: '464748495',
      image: '/images/groceries/am.jpeg'
    },
    {
      id: 19,
      name: 'মাখন',
      price: 320,
      stock: 20,
      category: 'ডেইরি',
      barcode: '505152535',
      image: '/images/milk.jpg'
    },
    {
      id: 20,
      name: 'পনির',
      price: 380,
      stock: 18,
      category: 'ডেইরি',
      barcode: '545556575',
      image: '/images/milk.jpg'
    }
  ]);
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState('percentage'); // 'percentage' or 'fixed'
  const [discountDisplayValue, setDiscountDisplayValue] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedBank, setSelectedBank] = useState('dbbl');
  const [deliveryOption, setDeliveryOption] = useState('onShopSell');
  const [availableDeliveryOptions, setAvailableDeliveryOptions] = useState({
    onShopSell: true,
    grameenDelivery: true,
    steadfast: false,
    redex: false
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm)
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Load delivery options from localStorage on mount
  useEffect(() => {
    const savedDeliveryOptions = localStorage.getItem('deliveryOptions');
    if (savedDeliveryOptions) {
      try {
        const parsed = JSON.parse(savedDeliveryOptions);
        setAvailableDeliveryOptions(parsed);
        // Set default delivery option to first enabled one
        const enabledOptions = Object.entries(parsed).filter(([_, enabled]) => enabled);
        if (enabledOptions.length > 0) {
          setDeliveryOption(enabledOptions[0][0]);
        }
      } catch (e) {
        console.error('Error parsing delivery options:', e);
      }
    }
  }, []);

  const addToCart = useCallback((product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    setSnackbar({ open: true, message: `${product.name} কার্টে যোগ করা হয়েছে`, severity: 'success' });
  }, [cart]);

  const handleBarcodeScanned = useCallback((barcode) => {
    const trimmedBarcode = barcode.trim();
    console.log('Barcode scanned:', trimmedBarcode);
    
    // Clear search field when barcode is scanned
    setSearchTerm('');
    
    // Find product by barcode (exact match first, then partial)
    const product = products.find(p => p.barcode === trimmedBarcode) || 
                   products.find(p => p.barcode.includes(trimmedBarcode)) ||
                   products.find(p => trimmedBarcode.includes(p.barcode));
    
    if (product) {
      // Check stock availability
      if (product.stock > 0) {
        addToCart(product);
        setSnackbar({ 
          open: true, 
          message: `✓ ${product.name} স্ক্যান করা হয়েছে এবং কার্টে যোগ করা হয়েছে`, 
          severity: 'success' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: `⚠ ${product.name} এর স্টক নেই`, 
          severity: 'warning' 
        });
      }
    } else {
      setSnackbar({ 
        open: true, 
        message: `✗ বারকোড "${trimmedBarcode}" এর জন্য কোন পণ্য পাওয়া যায়নি`, 
        severity: 'error' 
      });
    }
    
    // Clear barcode buffer
    setIsScanning(false);
  }, [addToCart, products]);

  // Barcode Scanner Integration
  useEffect(() => {
    let buffer = '';
    let lastKeyTime = 0;
    const BARCODE_TIMEOUT = 100; // ms between keypresses for barcode scanner

    const handleKeyPress = (event) => {
      const currentTime = Date.now();
      const isSearchFocused = document.activeElement === searchInputRef.current?.querySelector('input');
      
      // If Enter is pressed and we have a buffer, process it as a barcode
      if (event.key === 'Enter' && buffer.length > 0) {
        event.preventDefault();
        event.stopPropagation();
        
        // Process barcode if buffer is long enough (barcode scanners send fast, manual typing is slower)
        if (buffer.length >= 3) {
          handleBarcodeScanned(buffer);
        }
        
        buffer = '';
        setIsScanning(false);
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
          barcodeTimeoutRef.current = null;
        }
        return;
      }
      
      // Handle character input - only if search field is not focused or it's rapid input
      if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
        const timeSinceLastKey = currentTime - lastKeyTime;
        
        // If search field is focused and there's a delay, it's manual typing - ignore
        if (isSearchFocused && timeSinceLastKey > 200) {
          return; // Let the search field handle it
        }
        
        // If too much time has passed, reset buffer (likely manual typing)
        if (timeSinceLastKey > BARCODE_TIMEOUT && buffer.length > 0) {
          buffer = '';
        }
        
        // Add character to buffer
        buffer += event.key;
        lastKeyTime = currentTime;
        
        // If buffer is getting long, it's likely a barcode scan
        if (buffer.length >= 3) {
          setIsScanning(true);
        }
        
        // Clear timeout
        if (barcodeTimeoutRef.current) {
          clearTimeout(barcodeTimeoutRef.current);
        }
        
        // Reset buffer if no more input comes
        barcodeTimeoutRef.current = setTimeout(() => {
          if (buffer.length > 0 && buffer.length < 8) {
            buffer = '';
            setIsScanning(false);
          }
        }, BARCODE_TIMEOUT);
      }
    };

    // Listen for keypress events (use capture phase to catch before input field)
    window.addEventListener('keypress', handleKeyPress, true);

    return () => {
      window.removeEventListener('keypress', handleKeyPress, true);
      if (barcodeTimeoutRef.current) {
        clearTimeout(barcodeTimeoutRef.current);
      }
    };
  }, [handleBarcodeScanned]);

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getDiscountAmount = () => {
    const discountValue = discount === '' || discount === null ? 0 : discount;
    if (discountType === 'percentage') {
      return (getTotalAmount() * discountValue) / 100;
    } else {
      // Fixed amount - ensure it doesn't exceed total
      return Math.min(discountValue, getTotalAmount());
    }
  };

  const getFinalAmount = () => {
    return getTotalAmount() - getDiscountAmount();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      setSnackbar({ open: true, message: 'কার্টে কোন পণ্য নেই', severity: 'error' });
      return;
    }
    setShowPaymentDialog(true);
  };

  const processPayment = async () => {
    try {
      // Prepare sale data
      const saleData = {
        items: cart,
        total: getTotalAmount(),
        discount: getDiscountAmount(),
        finalAmount: getFinalAmount(),
        paymentMethod,
        selectedBank,
        deliveryOption,
        timestamp: new Date().toISOString()
      };
      
      console.log('Processing sale:', saleData);

      // Process payment based on method
      let paymentResult;
      
      if (paymentMethod === 'card') {
        // Use Multi-Bank POS for card payments
        paymentResult = await multiBankPOSService.processCardPayment(selectedBank, {
          amount: getFinalAmount(),
          cardType: 'mastercard', // This would be selected by user
          cardNumber: '4111111111111111', // This would come from card reader
          expiryDate: '12/25', // This would come from card reader
          cvv: '123', // This would come from card reader
          merchantId: 'YOUR_MERCHANT_ID', // Configure this
          terminalId: 'YOUR_TERMINAL_ID' // Configure this
        });
      } else if (paymentMethod === 'mobile') {
        // Mobile banking integration (separate service)
        paymentResult = { success: true, message: 'Mobile banking payment processed' };
      } else {
        // Cash payment
        paymentResult = { success: true, message: 'Cash payment received' };
      }

      if (paymentResult.success) {
        // Clear cart and close dialog
        setCart([]);
        setDiscount(0);
        setDiscountType('percentage');
        // Reset delivery option to first enabled option
        const enabledOptions = Object.entries(availableDeliveryOptions).filter(([_, enabled]) => enabled);
        if (enabledOptions.length > 0) {
          setDeliveryOption(enabledOptions[0][0]);
        } else {
          setDeliveryOption('onShopSell'); // Fallback
        }
        setShowPaymentDialog(false);
        
        // Show success message with transaction details
        const successMessage = paymentMethod === 'card' 
          ? `${paymentResult.bankName} - বিক্রয় সফল! ট্রানজেকশন আইডি: ${paymentResult.transactionId}`
          : 'বিক্রয় সফলভাবে সম্পন্ন হয়েছে!';
          
        setSnackbar({ 
          open: true, 
          message: successMessage, 
          severity: 'success' 
        });

        // Here you would typically send the complete sale data to your backend
        // await saveSaleToDatabase(saleData, paymentResult);
        
      } else {
        // Show payment error
        const errorMessage = paymentMethod === 'card'
          ? `${paymentResult.bankName} - পেমেন্ট ব্যর্থ: ${paymentResult.error}`
          : `পেমেন্ট ব্যর্থ: ${paymentResult.error}`;
          
        setSnackbar({ 
          open: true, 
          message: errorMessage, 
          severity: 'error' 
        });
      }
      
    } catch (error) {
      console.error('Payment processing error:', error);
      setSnackbar({ 
        open: true, 
        message: 'পেমেন্ট প্রক্রিয়াকরণে ত্রুটি হয়েছে', 
        severity: 'error' 
      });
    }
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setDiscountType('percentage');
    setDiscountDisplayValue('');
    // Reset delivery option to first enabled option
    const enabledOptions = Object.entries(availableDeliveryOptions).filter(([_, enabled]) => enabled);
    if (enabledOptions.length > 0) {
      setDeliveryOption(enabledOptions[0][0]);
    } else {
      setDeliveryOption('onShopSell'); // Fallback
    }
  };

  // Sync display value when discount changes externally (but not when user is typing)
  useEffect(() => {
    // Only sync if discount is not 0 and display value is empty (meaning it was reset externally)
    if (discount !== 0 && discountDisplayValue === '') {
      setDiscountDisplayValue(discount.toString());
    }
    // If discount is 0 and not focused, clear display
    if (discount === 0 && document.activeElement !== discountInputRef.current?.querySelector('input')) {
      setDiscountDisplayValue('');
    }
  }, [discount, discountType, discountDisplayValue]);

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              নতুন বিক্রয়
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              পণ্য স্ক্যান করুন বা অনুসন্ধান করুন
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearCart}
              disabled={cart.length === 0}
              sx={{
                borderColor: 'rgba(255,255,255,0.5)',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.5)'
                }
              }}
            >
              কার্ট খালি করুন
            </Button>
            <GradientButton
              startIcon={<ReceiptIcon />}
              onClick={handleCheckout}
              disabled={cart.length === 0}
              sx={{ color: 'white' }}
            >
              বিক্রয় সম্পন্ন করুন (৳{getFinalAmount().toFixed(2)})
            </GradientButton>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {/* Product Search and List */}
        <Grid item xs={12} md={6}>
          <StyledProductPaper sx={{ p: 3, height: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                পণ্য অনুসন্ধান
              </Typography>
              <Badge badgeContent={filteredProducts.length} color="primary">
                <SearchIcon color="action" />
              </Badge>
            </Box>
            
            <TextField
              fullWidth
              placeholder="পণ্যের নাম বা বারকোড লিখুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: isScanning && (
                  <InputAdornment position="end">
                    <Chip 
                      label="স্ক্যান হচ্ছে..." 
                      size="small" 
                      color="primary" 
                      icon={<SearchIcon />}
                      sx={{ animation: 'pulse 1.5s ease-in-out infinite' }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: 'white',
                  '&:hover': {
                    boxShadow: theme.shadows[2],
                  },
                  '&.Mui-focused': {
                    boxShadow: theme.shadows[4],
                  },
                }
              }}
              ref={searchInputRef}
            />

            {/* Barcode Scanner Status */}
            {isScanning && (
              <Alert severity="info" sx={{ mb: 2 }}>
                বারকোড স্ক্যানার সক্রিয় - পণ্য স্ক্যান করুন
              </Alert>
            )}

            <Box sx={{ flex: 1, overflow: 'auto', pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '10px', '&:hover': { background: '#555' } } }}>
              <Grid container spacing={2}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} key={product.id}>
                    <StyledProductCard onClick={() => addToCart(product)}>
                      <CardActionArea>
                        <CardContent sx={{ p: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5, gap: 2 }}>
                            {/* Product Image */}
                            <Box
                              component="img"
                              src={product.image || '/images/groceries/basmati.jpg'}
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/images/groceries/basmati.jpg';
                              }}
                              sx={{
                                width: 80,
                                height: 80,
                                objectFit: 'cover',
                                borderRadius: 2,
                                border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                                flexShrink: 0,
                                boxShadow: theme.shadows[2]
                              }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, lineHeight: 1.2 }}>
                                {product.name}
                              </Typography>
                              <Chip 
                                label={product.category} 
                                size="small" 
                                sx={{ 
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  fontWeight: 500
                                }} 
                              />
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                              ৳{product.price}
                            </Typography>
                            <Chip 
                              label={`স্টক: ${product.stock}`} 
                              size="small" 
                              color={product.stock < 10 ? 'error' : 'success'}
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </StyledProductCard>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </StyledProductPaper>
        </Grid>

        {/* Shopping Cart */}
        <Grid item xs={12} md={6}>
          <StyledCartPaper sx={{ p: 3, height: '75vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.2)}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge badgeContent={cart.length} color="error" overlap="circular">
                  <CartIcon sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
                </Badge>
                <Typography variant="h6" sx={{ fontWeight: 700, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  বিক্রয় কার্ট
                </Typography>
              </Box>
              {cart.length > 0 && (
                <Chip 
                  label={`${cart.length} আইটেম`} 
                  color="primary" 
                  sx={{ fontWeight: 600 }}
                />
              )}
            </Box>

            {cart.length === 0 ? (
              <Box sx={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'text.secondary',
                textAlign: 'center',
                p: 4
              }}>
                <CartIcon sx={{ fontSize: 96, mb: 2, opacity: 0.3, color: 'primary.main' }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>কার্ট খালি</Typography>
                <Typography variant="body1" color="text.secondary">
                  পণ্য যোগ করতে বাম দিকে ক্লিক করুন
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  অথবা বারকোড স্ক্যান করুন
                </Typography>
              </Box>
            ) : (
              <>
                <Box sx={{ flex: 1, overflow: 'auto', mb: 2, pr: 1, '&::-webkit-scrollbar': { width: '8px' }, '&::-webkit-scrollbar-track': { background: '#f1f1f1', borderRadius: '10px' }, '&::-webkit-scrollbar-thumb': { background: '#888', borderRadius: '10px', '&:hover': { background: '#555' } } }}>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                          <TableCell sx={{ fontWeight: 700 }}>পণ্য</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>দাম</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>পরিমাণ</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700 }}>মোট</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700 }}>কার্যক্রম</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {cart.map((item) => (
                          <StyledTableRow key={item.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                  {item.name}
                                </Typography>
                                <Chip 
                                  label={item.category} 
                                  size="small" 
                                  sx={{ 
                                    height: 20,
                                    fontSize: '0.7rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main
                                  }} 
                                />
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                ৳{item.price}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                                  }}
                                >
                                  <RemoveIcon fontSize="small" />
                                </IconButton>
                                <Chip 
                                  label={item.quantity} 
                                  size="small"
                                  sx={{ minWidth: 40, fontWeight: 700 }}
                                />
                                <IconButton 
                                  size="small" 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  sx={{ 
                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) }
                                  }}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                                ৳{item.price * item.quantity}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => removeFromCart(item.id)}
                                sx={{ 
                                  '&:hover': { 
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    transform: 'scale(1.1)'
                                  },
                                  transition: 'all 0.2s'
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </StyledTableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>

                <Divider sx={{ my: 2, borderWidth: 2, borderColor: alpha(theme.palette.primary.main, 0.2) }} />

                {/* Cart Summary */}
                <Paper elevation={3} sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      মোট মূল্য:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 700 }}>
                      ৳{getTotalAmount().toFixed(2)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 1 }}>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={discountType}
                          onChange={(e) => {
                            setDiscountType(e.target.value);
                            setDiscount(0);
                            setDiscountDisplayValue('');
                          }}
                          sx={{ borderRadius: 1.5 }}
                          MenuProps={{
                            disableScrollLock: true,
                            PaperProps: {
                              style: {
                                maxHeight: 300,
                              },
                            },
                            anchorOrigin: {
                              vertical: 'bottom',
                              horizontal: 'left',
                            },
                            transformOrigin: {
                              vertical: 'top',
                              horizontal: 'left',
                            },
                          }}
                        >
                          <MenuItem value="percentage">শতাংশ (%)</MenuItem>
                          <MenuItem value="fixed">নির্দিষ্ট পরিমাণ (৳)</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label={discountType === 'percentage' ? 'ছাড় (%)' : 'ছাড় (৳)'}
                        type="number"
                        value={discountDisplayValue}
                        inputRef={discountInputRef}
                        onFocus={(e) => {
                          // When focused, clear display value if discount is 0
                          if (discount === 0) {
                            setDiscountDisplayValue('');
                          }
                          // Select all text for easy replacement
                          setTimeout(() => {
                            e.target.select();
                          }, 0);
                        }}
                        onBlur={(e) => {
                          // If field is empty on blur, set to 0
                          const value = e.target.value;
                          setDiscountDisplayValue('');
                          if (value === '' || value === null || value === undefined || value === '0') {
                            setDiscount(0);
                          }
                        }}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          setDiscountDisplayValue(inputValue);
                          
                          // Allow empty string for clearing
                          if (inputValue === '' || inputValue === null) {
                            setDiscount('');
                            return;
                          }
                          const value = parseFloat(inputValue);
                          if (!isNaN(value)) {
                            if (discountType === 'percentage') {
                              setDiscount(Math.min(100, Math.max(0, value)));
                            } else {
                              setDiscount(Math.max(0, value));
                            }
                          }
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <DiscountIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ 
                          flex: 1,
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1.5,
                          }
                        }}
                      />
                    </Box>
                    {discount > 0 && (
                      <Chip 
                        label={`ছাড়: ৳${getDiscountAmount().toFixed(2)}`}
                        color="success"
                        icon={<OfferIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    p: 2,
                    borderRadius: 2,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.05)
                  }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      চূড়ান্ত মূল্য:
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        fontWeight: 'bold',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        color: 'primary.main'
                      }}
                    >
                      ৳{getFinalAmount().toFixed(2)}
                    </Typography>
                  </Box>
                </Paper>

                {/* Checkout Button at Bottom */}
                <Box sx={{ mt: 2 }}>
                  <GradientButton
                    fullWidth
                    size="large"
                    startIcon={<ReceiptIcon />}
                    onClick={handleCheckout}
                    disabled={cart.length === 0}
                    sx={{ 
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'white'
                    }}
                  >
                    বিক্রয় সম্পন্ন করুন (৳{getFinalAmount().toFixed(2)})
                  </GradientButton>
                </Box>
              </>
            )}
          </StyledCartPaper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog 
        open={showPaymentDialog} 
        onClose={() => setShowPaymentDialog(false)} 
        maxWidth="sm" 
        fullWidth 
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: theme.shadows[24]
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2.5
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PaymentIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>পেমেন্ট সম্পন্ন করুন</Typography>
            </Box>
            <IconButton 
              onClick={() => setShowPaymentDialog(false)}
              sx={{ color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box spacing={3}>
            {/* Payment Summary */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                mb: 3,
                borderRadius: 2,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 700, mb: 2 }}>
                বিলের বিবরণ
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={2}>
                <Typography variant="body1" color="text.secondary">মোট মূল্য:</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>৳{getTotalAmount().toFixed(2)}</Typography>
              </Box>
              {discount > 0 && (
                <Box display="flex" justifyContent="space-between" mb={2}>
                  <Typography variant="body1" color="text.secondary">ছাড়:</Typography>
                  <Typography variant="body1" color="success.main" sx={{ fontWeight: 600 }}>
                    -৳{getDiscountAmount().toFixed(2)}
                  </Typography>
                </Box>
              )}
              <Divider sx={{ my: 2, borderWidth: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 700 }}>সর্বমোট:</Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ৳{getFinalAmount().toFixed(2)}
                </Typography>
              </Box>
            </Paper>

            {/* Payment Method Selection */}
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend">পেমেন্ট পদ্ধতি</FormLabel>
              <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                <FormControlLabel value="cash" control={<Radio />} label="ক্যাশ" />
                <FormControlLabel value="card" control={<Radio />} label="কার্ড" />
                <FormControlLabel value="mobile" control={<Radio />} label="মোবাইল ব্যাংকিং" />
              </RadioGroup>
            </FormControl>

            {/* Bank Selection for Card Payments */}
            {paymentMethod === 'card' && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>ব্যাংক নির্বাচন করুন</InputLabel>
                <Select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  label="ব্যাংক নির্বাচন করুন"
                >
                  {multiBankPOSService.getSupportedBanks().map((bank) => (
                    <MenuItem key={bank.id} value={bank.id}>
                      <Box display="flex" alignItems="center">
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: bank.color,
                            mr: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {bank.shortName}
                        </Box>
                        {bank.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Payment Instructions */}
            {paymentMethod === 'card' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {multiBankPOSService.getBank(selectedBank)?.name} POS মেশিন ব্যবহার করে পেমেন্ট গ্রহণ করা হবে।
                  কার্ডটি স্ক্যান করুন এবং PIN নম্বর দিন।
                </Typography>
              </Alert>
            )}

            {paymentMethod === 'mobile' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  মোবাইল ব্যাংকিং এর মাধ্যমে পেমেন্ট করুন। বিকাশ, নগদ, রকেট ইত্যাদি।
                </Typography>
              </Alert>
            )}

            {/* Delivery Option Selection */}
            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <FormLabel component="legend">ডেলিভারি অপশন</FormLabel>
              <RadioGroup value={deliveryOption} onChange={(e) => setDeliveryOption(e.target.value)}>
                {availableDeliveryOptions.onShopSell && (
                  <FormControlLabel 
                    value="onShopSell" 
                    control={<Radio />} 
                    label="অন শপ সেল (On Shop Sell)" 
                  />
                )}
                {availableDeliveryOptions.grameenDelivery && (
                  <FormControlLabel 
                    value="grameenDelivery" 
                    control={<Radio />} 
                    label="গ্রামীণ ডেলিভারি (Grameen Delivery)" 
                  />
                )}
                {availableDeliveryOptions.steadfast && (
                  <FormControlLabel 
                    value="steadfast" 
                    control={<Radio />} 
                    label="স্টেডফাস্ট (Steadfast)" 
                  />
                )}
                {availableDeliveryOptions.redex && (
                  <FormControlLabel 
                    value="redex" 
                    control={<Radio />} 
                    label="রেডেক্স (Redex)" 
                  />
                )}
              </RadioGroup>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
          <Button 
            onClick={() => setShowPaymentDialog(false)}
            variant="outlined"
            size="large"
            sx={{ 
              borderRadius: 2,
              px: 4,
              borderWidth: 2,
              '&:hover': { borderWidth: 2 }
            }}
          >
            বাতিল
          </Button>
          <GradientButton
            onClick={processPayment}
            startIcon={<PaymentIcon />}
            size="large"
            sx={{ 
              px: 4,
              borderRadius: 2,
              color: 'white'
            }}
          >
            পেমেন্ট সম্পন্ন করুন
          </GradientButton>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SalesPage; 