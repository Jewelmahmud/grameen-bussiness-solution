import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Tooltip,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Inventory as InventoryIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Mock product data
  useEffect(() => {
    const mockProducts = [
      {
        id: 1,
        name: 'বাসমতি চাল',
        sku: 'RICE-001',
        category: 'খাদ্যশস্য',
        price: 120,
        stockLevel: 150,
        reorderPoint: 50,
        status: 'in_stock',
        unit: 'কেজি',
        image: '/images/groceries/basmati.jpg'
      },
      {
        id: 2,
        name: 'মসুর ডাল',
        sku: 'DAL-002',
        category: 'ডাল',
        price: 180,
        stockLevel: 25,
        reorderPoint: 30,
        status: 'low_stock',
        unit: 'কেজি',
        image: '/images/groceries/murgi.jpeg'
      },
      {
        id: 3,
        name: 'চিনি',
        sku: 'SUGAR-003',
        category: 'খাদ্যশস্য',
        price: 95,
        stockLevel: 0,
        reorderPoint: 20,
        status: 'out_of_stock',
        unit: 'কেজি',
        image: '/images/biscuit.jpg'
      },
      {
        id: 4,
        name: 'হলুদ গুঁড়ো',
        sku: 'SPICE-004',
        category: 'মসলা',
        price: 220,
        stockLevel: 45,
        reorderPoint: 25,
        status: 'in_stock',
        unit: 'কেজি',
        image: '/images/holudgura.jpg'
      },
      {
        id: 5,
        name: 'সরিষার তেল',
        sku: 'OIL-005',
        category: 'তেল',
        price: 180,
        stockLevel: 80,
        reorderPoint: 40,
        status: 'in_stock',
        unit: 'লিটার',
        image: '/images/mustardoil.jpg'
      },
      {
        id: 6,
        name: 'আটা',
        sku: 'FLOUR-006',
        category: 'খাদ্যশস্য',
        price: 55,
        stockLevel: 120,
        reorderPoint: 60,
        status: 'in_stock',
        unit: 'কেজি',
        image: '/images/groceries/tomato.webp'
      },
    ];
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  }, []);

  // Filter products
  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
    setFilteredProducts(filtered);
  }, [searchTerm, categoryFilter, statusFilter, products]);

  const categories = [...new Set(products.map(p => p.category))];

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

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('আপনি কি এই পণ্যটি মুছে ফেলতে চান?')) {
      setProducts(products.filter(p => p.id !== productId));
      setSnackbar({
        open: true,
        message: 'পণ্য সফলভাবে মুছে ফেলা হয়েছে',
        severity: 'success'
      });
    }
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setDialogMode('view');
    setOpenDialog(true);
  };

  const handleSaveProduct = (productData) => {
    if (dialogMode === 'add') {
      const newProduct = {
        ...productData,
        id: products.length + 1,
        status: productData.stockLevel > productData.reorderPoint ? 'in_stock' :
                productData.stockLevel > 0 ? 'low_stock' : 'out_of_stock'
      };
      setProducts([...products, newProduct]);
      setSnackbar({
        open: true,
        message: 'নতুন পণ্য সফলভাবে যোগ করা হয়েছে',
        severity: 'success'
      });
    } else {
      setProducts(products.map(p => p.id === selectedProduct.id ? {
        ...productData,
        status: productData.stockLevel > productData.reorderPoint ? 'in_stock' :
                productData.stockLevel > 0 ? 'low_stock' : 'out_of_stock'
      } : p));
      setSnackbar({
        open: true,
        message: 'পণ্য সফলভাবে আপডেট করা হয়েছে',
        severity: 'success'
      });
    }
    setOpenDialog(false);
  };

  const getStats = () => {
    return {
      total: products.length,
      inStock: products.filter(p => p.status === 'in_stock').length,
      lowStock: products.filter(p => p.status === 'low_stock').length,
      outOfStock: products.filter(p => p.status === 'out_of_stock').length,
    };
  };

  const stats = getStats();

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          পণ্য ব্যবস্থাপনা
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            },
          }}
        >
          নতুন পণ্য যোগ করুন
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    মোট পণ্য
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {stats.total}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <InventoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    স্টকে আছে
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {stats.inStock}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                  <CategoryIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    কম স্টক
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {stats.lowStock}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.light', width: 56, height: 56 }}>
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    স্টক নেই
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                    {stats.outOfStock}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'error.light', width: 56, height: 56 }}>
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="পণ্যের নাম বা SKU দিয়ে খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>বিভাগ</InputLabel>
              <Select
                value={categoryFilter}
                label="বিভাগ"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">সব বিভাগ</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>স্টক অবস্থা</InputLabel>
              <Select
                value={statusFilter}
                label="স্টক অবস্থা"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">সব অবস্থা</MenuItem>
                <MenuItem value="in_stock">স্টকে আছে</MenuItem>
                <MenuItem value="low_stock">কম স্টক</MenuItem>
                <MenuItem value="out_of_stock">স্টক নেই</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}
            >
              রিসেট
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Products Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>পণ্যের নাম</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>বিভাগ</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>মূল্য</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>স্টক</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>অবস্থা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      কোন পণ্য পাওয়া যায়নি
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          src={product.image}
                          alt={product.name}
                          variant="rounded"
                          sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'grey.200',
                          }}
                        >
                          <InventoryIcon sx={{ fontSize: 22 }} color="action" />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {product.unit}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 500 }}>
                        ৳{product.price}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {product.stockLevel} {product.unit}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusText(product.status)}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="দেখুন">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewProduct(product)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="সম্পাদনা">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditProduct(product)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="মুছুন">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Product Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'নতুন পণ্য যোগ করুন' :
           dialogMode === 'edit' ? 'পণ্য সম্পাদনা করুন' :
           'পণ্য বিস্তারিত'}
        </DialogTitle>
        <DialogContent>
          {dialogMode === 'view' ? (
            selectedProduct && (
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">পণ্যের নাম</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedProduct.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">SKU</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedProduct.sku}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">বিভাগ</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedProduct.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">মূল্য</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      ৳{selectedProduct.price}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">স্টক</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedProduct.stockLevel} {selectedProduct.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">পুনঃঅর্ডার পয়েন্ট</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, mb: 2 }}>
                      {selectedProduct.reorderPoint} {selectedProduct.unit}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">অবস্থা</Typography>
                    <Chip
                      label={getStatusText(selectedProduct.status)}
                      color={getStatusColor(selectedProduct.status)}
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )
          ) : (
            <ProductForm
              product={selectedProduct}
              onSave={handleSaveProduct}
              onCancel={() => setOpenDialog(false)}
            />
          )}
        </DialogContent>
        {dialogMode === 'view' && (
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
            <Button
              variant="contained"
              onClick={() => {
                setDialogMode('edit');
              }}
            >
              সম্পাদনা করুন
            </Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Simple Product Form Component
const ProductForm = ({ product, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    price: product?.price || '',
    stockLevel: product?.stockLevel || '',
    reorderPoint: product?.reorderPoint || '',
    unit: product?.unit || 'কেজি',
  });

  const categories = ['খাদ্যশস্য', 'ডাল', 'মসলা', 'তেল', 'খাবার'];
  const units = ['কেজি', 'লিটার', 'পিস', 'প্যাকেট'];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="পণ্যের নাম"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="SKU"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>বিভাগ</InputLabel>
            <Select
              name="category"
              value={formData.category}
              label="বিভাগ"
              onChange={handleChange}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>ইউনিট</InputLabel>
            <Select
              name="unit"
              value={formData.unit}
              label="ইউনিট"
              onChange={handleChange}
            >
              {units.map(unit => (
                <MenuItem key={unit} value={unit}>{unit}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="মূল্য (৳)"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="স্টক পরিমাণ"
            name="stockLevel"
            type="number"
            value={formData.stockLevel}
            onChange={handleChange}
            required
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="পুনঃঅর্ডার পয়েন্ট"
            name="reorderPoint"
            type="number"
            value={formData.reorderPoint}
            onChange={handleChange}
            required
          />
        </Grid>
      </Grid>
      <DialogActions sx={{ mt: 3 }}>
        <Button onClick={onCancel}>বাতিল</Button>
        <Button type="submit" variant="contained" color="primary">
          সংরক্ষণ করুন
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ProductsPage;

