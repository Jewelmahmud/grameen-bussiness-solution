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
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Pagination,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBag as PurchaseIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const PurchasePage = () => {
  const [purchases, setPurchases] = useState([]);
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'completed', 'cancelled'
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock purchase data
  useEffect(() => {
    const mockPurchases = [
      {
        id: 1,
        purchaseNumber: 'PUR-2024-001',
        supplierName: 'হাবিব ট্রেডার্স',
        supplierPhone: '+880 1711-111111',
        date: '2024-01-15',
        time: '09:30 AM',
        items: [
          { name: 'বাসমতি চাল', quantity: 100, unit: 'কেজি', price: 115, total: 11500 },
          { name: 'মসুর ডাল', quantity: 50, unit: 'কেজি', price: 170, total: 8500 }
        ],
        subtotal: 20000,
        discount: 500,
        tax: 2925,
        total: 22425,
        paymentMethod: 'bank_transfer',
        status: 'completed',
        purchaseBy: 'আব্দুল করিম',
        deliveryDate: '2024-01-16',
        notes: 'স্টকে যোগ করা হয়েছে'
      },
      {
        id: 2,
        purchaseNumber: 'PUR-2024-002',
        supplierName: 'করিম স্টোর',
        supplierPhone: '+880 1712-222222',
        date: '2024-01-14',
        time: '11:00 AM',
        items: [
          { name: 'হলুদ গুঁড়ো', quantity: 30, unit: 'কেজি', price: 210, total: 6300 },
          { name: 'ধনিয়া গুঁড়ো', quantity: 30, unit: 'কেজি', price: 190, total: 5700 }
        ],
        subtotal: 12000,
        discount: 0,
        tax: 1800,
        total: 13800,
        paymentMethod: 'cash',
        status: 'pending',
        purchaseBy: 'আব্দুল করিম',
        deliveryDate: '2024-01-17',
        notes: ''
      },
      {
        id: 3,
        purchaseNumber: 'PUR-2024-003',
        supplierName: 'আলম ট্রেডার্স',
        supplierPhone: '+880 1713-333333',
        date: '2024-01-13',
        time: '02:15 PM',
        items: [
          { name: 'চিনি', quantity: 80, unit: 'কেজি', price: 90, total: 7200 },
          { name: 'তেল', quantity: 40, unit: 'লিটার', price: 175, total: 7000 }
        ],
        subtotal: 14200,
        discount: 200,
        tax: 2100,
        total: 16100,
        paymentMethod: 'check',
        status: 'completed',
        purchaseBy: 'আব্দুল করিম',
        deliveryDate: '2024-01-14',
        notes: 'চেক দিয়ে পেমেন্ট'
      },
      {
        id: 4,
        purchaseNumber: 'PUR-2024-004',
        supplierName: 'রহিম স্টোর',
        supplierPhone: '+880 1714-444444',
        date: '2024-01-12',
        time: '10:45 AM',
        items: [
          { name: 'আটা', quantity: 100, unit: 'কেজি', price: 50, total: 5000 },
          { name: 'লবণ', quantity: 50, unit: 'কেজি', price: 32, total: 1600 }
        ],
        subtotal: 6600,
        discount: 100,
        tax: 975,
        total: 7475,
        paymentMethod: 'cash',
        status: 'completed',
        purchaseBy: 'আব্দুল করিম',
        deliveryDate: '2024-01-13',
        notes: ''
      },
      {
        id: 5,
        purchaseNumber: 'PUR-2024-005',
        supplierName: 'হাবিব ট্রেডার্স',
        supplierPhone: '+880 1711-111111',
        date: '2024-01-11',
        time: '03:30 PM',
        items: [
          { name: 'বাসমতি চাল', quantity: 150, unit: 'কেজি', price: 115, total: 17250 },
          { name: 'মসুর ডাল', quantity: 40, unit: 'কেজি', price: 170, total: 6800 }
        ],
        subtotal: 24050,
        discount: 300,
        tax: 3562.5,
        total: 27312.5,
        paymentMethod: 'bank_transfer',
        status: 'pending',
        purchaseBy: 'আব্দুল করিম',
        deliveryDate: '2024-01-15',
        notes: 'দীর্ঘমেয়াদি অর্ডার'
      },
      {
        id: 6,
        purchaseNumber: 'PUR-2024-006',
        supplierName: 'করিম স্টোর',
        supplierPhone: '+880 1712-222222',
        date: '2024-01-10',
        time: '09:00 AM',
        items: [
          { name: 'মরিচ গুঁড়ো', quantity: 25, unit: 'কেজি', price: 240, total: 6000 }
        ],
        subtotal: 6000,
        discount: 0,
        tax: 900,
        total: 6900,
        paymentMethod: 'cash',
        status: 'cancelled',
        purchaseBy: 'আব্দুল করিম',
        deliveryDate: null,
        notes: 'সরবরাহকারী বাতিল করেছেন'
      }
    ];
    
    setPurchases(mockPurchases);
    setFilteredPurchases(mockPurchases);
  }, []);

  // Filter purchases based on search and filters
  useEffect(() => {
    let filtered = [...purchases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(purchase =>
        purchase.purchaseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        purchase.supplierPhone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.status === statusFilter);
    }

    // Supplier filter
    if (supplierFilter !== 'all') {
      filtered = filtered.filter(purchase => purchase.supplierName === supplierFilter);
    }

    setFilteredPurchases(filtered);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, supplierFilter, purchases]);

  // Get unique suppliers
  const suppliers = [...new Set(purchases.map(purchase => purchase.supplierName))];

  // Calculate statistics
  const totalPurchases = filteredPurchases.length;
  const totalAmount = filteredPurchases.reduce((sum, purchase) => sum + purchase.total, 0);
  const pendingPurchases = filteredPurchases.filter(p => p.status === 'pending').length;
  const completedPurchases = filteredPurchases.filter(p => p.status === 'completed').length;
  // Pagination
  const paginatedPurchases = filteredPurchases.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (purchase) => {
    setSelectedPurchase(purchase);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, purchase) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(purchase.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = (purchase) => {
    // In real app, open edit dialog
    console.log('Edit purchase:', purchase.purchaseNumber);
    handleMenuClose();
  };

  const handlePrint = (purchase) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (purchase) => {
    // In real app, trigger download
    if (purchase) {
      console.log('Download purchase:', purchase.purchaseNumber);
    }
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'সম্পন্ন';
      case 'pending':
        return 'অপেক্ষমাণ';
      case 'cancelled':
        return 'বাতিল';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cash':
        return 'নগদ';
      case 'bank_transfer':
        return 'ব্যাংক ট্রান্সফার';
      case 'check':
        return 'চেক';
      case 'credit':
        return 'ক্রেডিট';
      default:
        return method;
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ক্রয় তালিকা
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
          >
            রিফ্রেশ করুন
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
          >
            এক্সপোর্ট
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            নতুন ক্রয়
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    মোট ক্রয়
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalPurchases}
                  </Typography>
                </Box>
                <PurchaseIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    মোট পরিমাণ
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ৳{totalAmount.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    সম্পন্ন
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {completedPurchases}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', opacity: 0.7 }}>
                  <CheckCircleIcon />
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
                  <Typography variant="body2" color="text.secondary">
                    অপেক্ষমাণ
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {pendingPurchases}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', opacity: 0.7 }}>
                  ⏱
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="ক্রয় নম্বর, সরবরাহকারীর নাম বা ফোন দিয়ে খুঁজুন..."
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
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>স্ট্যাটাস</InputLabel>
              <Select
                value={statusFilter}
                label="স্ট্যাটাস"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">সকল</MenuItem>
                <MenuItem value="completed">সম্পন্ন</MenuItem>
                <MenuItem value="pending">অপেক্ষমাণ</MenuItem>
                <MenuItem value="cancelled">বাতিল</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>সরবরাহকারী</InputLabel>
              <Select
                value={supplierFilter}
                label="সরবরাহকারী"
                onChange={(e) => setSupplierFilter(e.target.value)}
              >
                <MenuItem value="all">সকল</MenuItem>
                {suppliers.map(supplier => (
                  <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleDownload(null)}
            >
              এক্সপোর্ট
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Purchases Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ক্রয় নম্বর</TableCell>
              <TableCell>সরবরাহকারী</TableCell>
              <TableCell>তারিখ</TableCell>
              <TableCell>আইটেম</TableCell>
              <TableCell>মোট পরিমাণ</TableCell>
              <TableCell>পেমেন্ট</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPurchases.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন ক্রয় পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPurchases.map((purchase) => (
                <TableRow key={purchase.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {purchase.purchaseNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {purchase.supplierName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {purchase.supplierPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(purchase.date).toLocaleDateString('bn-BD')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {purchase.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {purchase.items.length} টি আইটেম
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ৳{purchase.total.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentMethodText(purchase.paymentMethod)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(purchase.status)}
                      color={getStatusColor(purchase.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(purchase)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, purchase)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredPurchases.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredPurchases.length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const purchase = purchases.find(p => p.id === selectedRow);
          if (purchase) handleView(purchase);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        <MenuItem onClick={() => {
          const purchase = purchases.find(p => p.id === selectedRow);
          if (purchase) handleEdit(purchase);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          সম্পাদনা করুন
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
      </Menu>

      {/* View Purchase Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              ক্রয় বিবরণ - {selectedPurchase?.purchaseNumber}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                startIcon={<PrintIcon />}
                onClick={() => handlePrint(selectedPurchase)}
              >
                প্রিন্ট
              </Button>
              <Button
                size="small"
                startIcon={<DownloadIcon />}
                onClick={() => handleDownload(selectedPurchase)}
              >
                ডাউনলোড
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPurchase && (
            <Box>
              {/* Supplier Information */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    সরবরাহকারীর তথ্য
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedPurchase.supplierName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedPurchase.supplierPhone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    ক্রয় তথ্য
                  </Typography>
                  <Typography variant="body2">
                    তারিখ: {new Date(selectedPurchase.date).toLocaleDateString('bn-BD')} {selectedPurchase.time}
                  </Typography>
                  <Typography variant="body2">
                    ক্রয়কারী: {selectedPurchase.purchaseBy}
                  </Typography>
                  {selectedPurchase.deliveryDate && (
                    <Typography variant="body2">
                      ডেলিভারি তারিখ: {new Date(selectedPurchase.deliveryDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* Items Table */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>পণ্যের নাম</TableCell>
                      <TableCell align="right">পরিমাণ</TableCell>
                      <TableCell align="right">দর</TableCell>
                      <TableCell align="right">মোট</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedPurchase.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell align="right">
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell align="right">৳{item.price.toLocaleString('bn-BD')}</TableCell>
                        <TableCell align="right">৳{item.total.toLocaleString('bn-BD')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 600 }}>
                        উপমোট:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        ৳{selectedPurchase.subtotal.toLocaleString('bn-BD')}
                      </TableCell>
                    </TableRow>
                    {selectedPurchase.discount > 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="right">
                          ছাড়:
                        </TableCell>
                        <TableCell align="right">
                          ৳{selectedPurchase.discount.toLocaleString('bn-BD')}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={3} align="right">
                        কর:
                      </TableCell>
                      <TableCell align="right">
                        ৳{selectedPurchase.tax.toLocaleString('bn-BD')}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        মোট:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                        ৳{selectedPurchase.total.toLocaleString('bn-BD')}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Information */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2" gutterBottom>
                  পেমেন্ট তথ্য
                </Typography>
                <Typography variant="body2">
                  পেমেন্ট পদ্ধতি: {getPaymentMethodText(selectedPurchase.paymentMethod)}
                </Typography>
                <Typography variant="body2">
                  স্ট্যাটাস: <Chip label={getStatusText(selectedPurchase.status)} color={getStatusColor(selectedPurchase.status)} size="small" sx={{ ml: 1 }} />
                </Typography>
                {selectedPurchase.notes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    নোট: {selectedPurchase.notes}
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PurchasePage;

