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
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const StockPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'in_stock', 'low_stock', 'out_of_stock'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock stock data
  useEffect(() => {
    const mockStock = [
      {
        id: 1,
        productName: 'বাসমতি চাল',
        sku: 'RICE-001',
        category: 'খাদ্যশস্য',
        currentStock: 150,
        unit: 'কেজি',
        reorderPoint: 50,
        status: 'in_stock',
        unitPrice: 120,
        totalValue: 18000,
        lastUpdated: '2024-01-15',
        supplier: 'হাবিব ট্রেডার্স'
      },
      {
        id: 2,
        productName: 'মসুর ডাল',
        sku: 'DAL-002',
        category: 'ডাল',
        currentStock: 25,
        unit: 'কেজি',
        reorderPoint: 30,
        status: 'low_stock',
        unitPrice: 180,
        totalValue: 4500,
        lastUpdated: '2024-01-14',
        supplier: 'করিম স্টোর'
      },
      {
        id: 3,
        productName: 'চিনি',
        sku: 'SUGAR-003',
        category: 'খাদ্যশস্য',
        currentStock: 0,
        unit: 'কেজি',
        reorderPoint: 20,
        status: 'out_of_stock',
        unitPrice: 95,
        totalValue: 0,
        lastUpdated: '2024-01-13',
        supplier: 'আলম ট্রেডার্স'
      },
      {
        id: 4,
        productName: 'হলুদ গুঁড়ো',
        sku: 'SPICE-004',
        category: 'মসলা',
        currentStock: 85,
        unit: 'কেজি',
        reorderPoint: 25,
        status: 'in_stock',
        unitPrice: 220,
        totalValue: 18700,
        lastUpdated: '2024-01-15',
        supplier: 'রহিম স্টোর'
      },
      {
        id: 5,
        productName: 'ধনিয়া গুঁড়ো',
        sku: 'SPICE-005',
        category: 'মসলা',
        currentStock: 120,
        unit: 'কেজি',
        reorderPoint: 30,
        status: 'in_stock',
        unitPrice: 200,
        totalValue: 24000,
        lastUpdated: '2024-01-15',
        supplier: 'রহিম স্টোর'
      },
      {
        id: 6,
        productName: 'আটা',
        sku: 'FLOUR-006',
        category: 'খাদ্যশস্য',
        currentStock: 200,
        unit: 'কেজি',
        reorderPoint: 50,
        status: 'in_stock',
        unitPrice: 55,
        totalValue: 11000,
        lastUpdated: '2024-01-14',
        supplier: 'হাবিব ট্রেডার্স'
      },
      {
        id: 7,
        productName: 'তেল',
        sku: 'OIL-007',
        category: 'তেল',
        currentStock: 75,
        unit: 'লিটার',
        reorderPoint: 40,
        status: 'in_stock',
        unitPrice: 180,
        totalValue: 13500,
        lastUpdated: '2024-01-15',
        supplier: 'করিম স্টোর'
      },
      {
        id: 8,
        productName: 'লবণ',
        sku: 'SALT-008',
        category: 'মসলা',
        currentStock: 18,
        unit: 'কেজি',
        reorderPoint: 20,
        status: 'low_stock',
        unitPrice: 35,
        totalValue: 630,
        lastUpdated: '2024-01-12',
        supplier: 'আলম ট্রেডার্স'
      },
      {
        id: 9,
        productName: 'মরিচ গুঁড়ো',
        sku: 'SPICE-009',
        category: 'মসলা',
        currentStock: 0,
        unit: 'কেজি',
        reorderPoint: 15,
        status: 'out_of_stock',
        unitPrice: 250,
        totalValue: 0,
        lastUpdated: '2024-01-10',
        supplier: 'রহিম স্টোর'
      },
      {
        id: 10,
        productName: 'চা পাতা',
        sku: 'TEA-010',
        category: 'পানীয়',
        currentStock: 95,
        unit: 'কেজি',
        reorderPoint: 30,
        status: 'in_stock',
        unitPrice: 280,
        totalValue: 26600,
        lastUpdated: '2024-01-15',
        supplier: 'হাবিব ট্রেডার্স'
      }
    ];
    
    setStockItems(mockStock);
    setFilteredStock(mockStock);
  }, []);

  // Filter stock based on search and filters
  useEffect(() => {
    let filtered = [...stockItems];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredStock(filtered);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, categoryFilter, stockItems]);

  // Get unique categories
  const categories = [...new Set(stockItems.map(item => item.category))];

  // Calculate statistics
  const totalItems = filteredStock.length;
  const totalValue = filteredStock.reduce((sum, item) => sum + item.totalValue, 0);
  const lowStockCount = filteredStock.filter(s => s.status === 'low_stock').length;
  const outOfStockCount = filteredStock.filter(s => s.status === 'out_of_stock').length;
  const inStockCount = filteredStock.filter(s => s.status === 'in_stock').length;

  // Pagination
  const paginatedStock = filteredStock.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (item) => {
    setSelectedItem(item);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(item.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleStockUpdate = (item) => {
    // In real app, open stock update dialog
    console.log('Update stock for:', item.productName);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock':
        return 'success';
      case 'low_stock':
        return 'warning';
      case 'out_of_stock':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'in_stock':
        return 'স্টকে আছে';
      case 'low_stock':
        return 'স্টক কম';
      case 'out_of_stock':
        return 'স্টক নেই';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_stock':
        return <CheckCircleIcon />;
      case 'low_stock':
        return <WarningIcon />;
      case 'out_of_stock':
        return <CancelIcon />;
      default:
        return <InventoryIcon />;
    }
  };

  const getStockPercentage = (item) => {
    if (item.status === 'out_of_stock') return 0;
    if (item.currentStock <= item.reorderPoint) {
      return (item.currentStock / item.reorderPoint) * 50; // Show as percentage up to 50% if below reorder point
    }
    // For in stock, show percentage relative to reorder point (could be improved with max stock)
    return Math.min(100, (item.currentStock / (item.reorderPoint * 3)) * 100);
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          স্টক ব্যবস্থাপনা
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
            স্টক আপডেট
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
                    মোট আইটেম
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalItems}
                  </Typography>
                </Box>
                <InventoryIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    মোট মূল্য
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ৳{totalValue.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <TrendingUpIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
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
                    স্টকে আছে
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {inStockCount}
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
                    সতর্কতা
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {lowStockCount + outOfStockCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    কম: {lowStockCount}, নেই: {outOfStockCount}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', opacity: 0.7 }}>
                  <WarningIcon />
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
              placeholder="পণ্যের নাম, SKU বা ক্যাটাগরি দিয়ে খুঁজুন..."
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
                <MenuItem value="in_stock">স্টকে আছে</MenuItem>
                <MenuItem value="low_stock">স্টক কম</MenuItem>
                <MenuItem value="out_of_stock">স্টক নেই</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>ক্যাটাগরি</InputLabel>
              <Select
                value={categoryFilter}
                label="ক্যাটাগরি"
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <MenuItem value="all">সকল</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Stock Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>পণ্যের নাম</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>ক্যাটাগরি</TableCell>
              <TableCell>বর্তমান স্টক</TableCell>
              <TableCell>রিওর্ডার পয়েন্ট</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell>একক মূল্য</TableCell>
              <TableCell>মোট মূল্য</TableCell>
              <TableCell>সর্বশেষ আপডেট</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedStock.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন স্টক আইটেম পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedStock.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.productName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={item.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.currentStock} {item.unit}
                      </Typography>
                      <Box
                        sx={{
                          width: 100,
                          height: 6,
                          bgcolor: 'grey.200',
                          borderRadius: 1,
                          mt: 0.5,
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            width: `${getStockPercentage(item)}%`,
                            height: '100%',
                            bgcolor: item.status === 'out_of_stock' ? 'error.main' : 
                                     item.status === 'low_stock' ? 'warning.main' : 'success.main',
                            transition: 'width 0.3s ease'
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {item.reorderPoint} {item.unit}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(item.status)}
                      label={getStatusText(item.status)}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ৳{item.unitPrice.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ৳{item.totalValue.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(item.lastUpdated).toLocaleDateString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(item)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, item)}
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
      {filteredStock.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredStock.length / rowsPerPage)}
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
          const item = stockItems.find(s => s.id === selectedRow);
          if (item) handleView(item);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        <MenuItem onClick={() => {
          const item = stockItems.find(s => s.id === selectedRow);
          if (item) handleStockUpdate(item);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          স্টক আপডেট
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
      </Menu>

      {/* View Stock Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InventoryIcon />
            <Typography variant="h6">
              স্টক বিবরণ - {selectedItem?.productName}
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  পণ্যের নাম
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedItem.productName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  SKU
                </Typography>
                <Typography variant="body1">
                  {selectedItem.sku}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  ক্যাটাগরি
                </Typography>
                <Typography variant="body1">
                  {selectedItem.category}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  স্ট্যাটাস
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedItem.status)}
                  label={getStatusText(selectedItem.status)}
                  color={getStatusColor(selectedItem.status)}
                  size="small"
                  sx={{ mt: 0.5 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  বর্তমান স্টক
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedItem.currentStock} {selectedItem.unit}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  রিওর্ডার পয়েন্ট
                </Typography>
                <Typography variant="body1">
                  {selectedItem.reorderPoint} {selectedItem.unit}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  একক মূল্য
                </Typography>
                <Typography variant="body1">
                  ৳{selectedItem.unitPrice.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  মোট মূল্য
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
                  ৳{selectedItem.totalValue.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  সরবরাহকারী
                </Typography>
                <Typography variant="body1">
                  {selectedItem.supplier}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  সর্বশেষ আপডেট
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedItem.lastUpdated).toLocaleDateString('bn-BD')}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (selectedItem) handleStockUpdate(selectedItem);
              setOpenDialog(false);
            }}
          >
            স্টক আপডেট করুন
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StockPage;

