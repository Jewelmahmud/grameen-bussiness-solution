import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Delete as DeleteIcon,
  QrCodeScanner as ScannerIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import posService from '../../services/posService';

const SalesTransaction = () => {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await posService.getProductsForPOS();
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) return;

    // Check stock availability
    if (selectedProduct.stockLevel < quantity) {
      alert('Insufficient stock!');
      return;
    }

    const existingItem = cart.find(item => item.id === selectedProduct.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === selectedProduct.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        ...selectedProduct,
        quantity,
        totalPrice: selectedProduct.price * quantity
      }]);
    }

    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.id !== productId));
    } else {
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity }
          : item
      ));
    }
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.totalPrice
        })),
        totalAmount: calculateTotal(),
        paymentMethod,
        customerInfo,
        status: 'completed'
      };

      const sale = await posService.createSale(saleData);
      
      // Update inventory after successful sale
      await posService.updateInventoryAfterSale(sale.id);
      
      // Clear cart and show success
      setCart([]);
      setPaymentDialog(false);
      alert('Sale completed successfully!');
      
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Error processing sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        বিক্রয় লেনদেন
      </Typography>

      <Grid container spacing={3}>
        {/* Product Selection */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              পণ্য নির্বাচন
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="পণ্য খুঁজুন (নাম বা SKU)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              
              <Autocomplete
                options={filteredProducts}
                getOptionLabel={(option) => `${option.name} (${option.sku}) - Stock: ${option.stockLevel}`}
                value={selectedProduct}
                onChange={(event, newValue) => setSelectedProduct(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="পণ্য নির্বাচন করুন" />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="subtitle1">{option.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        SKU: {option.sku} | Price: ৳{option.price} | Stock: {option.stockLevel}
                      </Typography>
                    </Box>
                  </Box>
                )}
              />
            </Box>

            {selectedProduct && (
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {selectedProduct.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ৳{selectedProduct.price} | Available: {selectedProduct.stockLevel}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <TextField
                    type="number"
                    label="পরিমাণ"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ min: 1, max: selectedProduct.stockLevel }}
                    sx={{ width: 120 }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddToCart}
                    disabled={quantity > selectedProduct.stockLevel}
                  >
                    কার্টে যোগ করুন
                  </Button>
                </Box>
              </Box>
            )}

            {/* Cart Items */}
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
              কার্ট আইটেম ({cart.length})
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>পণ্য</TableCell>
                    <TableCell>দাম</TableCell>
                    <TableCell>পরিমাণ</TableCell>
                    <TableCell>মোট</TableCell>
                    <TableCell>অ্যাকশন</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cart.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">{item.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            SKU: {item.sku}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>৳{item.price}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <Typography>{item.quantity}</Typography>
                          <IconButton
                            size="small"
                            onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stockLevel}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>৳{item.totalPrice}</TableCell>
                      <TableCell>
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveFromCart(item.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Payment Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: 'fit-content' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
              পেমেন্ট বিবরণ
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                ৳{calculateTotal().toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                মোট পরিমাণ
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                গ্রাহক তথ্য
              </Typography>
              <TextField
                fullWidth
                label="নাম"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="ফোন নম্বর"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                sx={{ mb: 1 }}
              />
              <TextField
                fullWidth
                label="ইমেইল"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<ReceiptIcon />}
              onClick={() => setPaymentDialog(true)}
              disabled={cart.length === 0 || loading}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'চেকআউট করুন'}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => setCart([])}
              disabled={cart.length === 0}
            >
              কার্ট খালি করুন
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>পেমেন্ট পদ্ধতি নির্বাচন করুন</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Button
              variant={paymentMethod === 'cash' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('cash')}
              fullWidth
            >
              নগদ/ক্যাশ
            </Button>
            <Button
              variant={paymentMethod === 'card' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('card')}
              fullWidth
            >
              কার্ড
            </Button>
            <Button
              variant={paymentMethod === 'mobile_banking' ? 'contained' : 'outlined'}
              onClick={() => setPaymentMethod('mobile_banking')}
              fullWidth
            >
              মোবাইল ব্যাংকিং
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>বাতিল</Button>
          <Button onClick={handleCheckout} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'পেমেন্ট সম্পন্ন করুন'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesTransaction; 