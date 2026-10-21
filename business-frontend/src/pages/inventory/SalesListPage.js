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
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';

const SalesListPage = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'completed', 'pending', 'cancelled'
  const [sourceFilter] = useState('all'); // 'all', 'pos', 'grameen_bazar', 'website'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [selectedSale, setSelectedSale] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock sales data
  useEffect(() => {
    const mockSales = [
      {
        id: 1,
        invoiceNumber: 'INV-2024-001',
        customerName: 'রহিম উদ্দিন',
        customerPhone: '+880 1712-345678',
        date: '2024-01-15',
        time: '10:30 AM',
        items: [
          { name: 'বাসমতি চাল', quantity: 5, unit: 'কেজি', price: 120, total: 600 },
          { name: 'মসুর ডাল', quantity: 2, unit: 'কেজি', price: 180, total: 360 }
        ],
        subtotal: 960,
        discount: 50,
        tax: 136.5,
        total: 1046.5,
        paymentMethod: 'cash',
        status: 'completed',
        salesPerson: 'আব্দুল করিম',
        source: 'pos' // 'pos', 'grameen_bazar', 'website'
      },
      {
        id: 2,
        invoiceNumber: 'INV-2024-002',
        customerName: 'করিম উদ্দিন',
        customerPhone: '+880 1713-456789',
        date: '2024-01-15',
        time: '11:15 AM',
        items: [
          { name: 'চিনি', quantity: 3, unit: 'কেজি', price: 95, total: 285 },
          { name: 'আটা', quantity: 5, unit: 'কেজি', price: 55, total: 275 },
          { name: 'তেল', quantity: 2, unit: 'লিটার', price: 180, total: 360 }
        ],
        subtotal: 920,
        discount: 0,
        tax: 138,
        total: 1058,
        paymentMethod: 'card',
        status: 'completed',
        salesPerson: 'আব্দুল করিম'
      },
      {
        id: 3,
        invoiceNumber: 'INV-2024-003',
        customerName: 'মহম্মদ আলী',
        customerPhone: '+880 1714-567890',
        date: '2024-01-14',
        time: '02:45 PM',
        items: [
          { name: 'হলুদ গুঁড়ো', quantity: 1, unit: 'কেজি', price: 220, total: 220 },
          { name: 'ধনিয়া গুঁড়ো', quantity: 1, unit: 'কেজি', price: 200, total: 200 }
        ],
        subtotal: 420,
        discount: 20,
        tax: 60,
        total: 460,
        paymentMethod: 'cash',
        status: 'completed',
        salesPerson: 'আব্দুল করিম',
        source: 'pos' // 'pos', 'grameen_bazar', 'website'
      },
      {
        id: 4,
        invoiceNumber: 'INV-2024-004',
        customerName: 'ফজলুল হক',
        customerPhone: '+880 1715-678901',
        date: '2024-01-14',
        time: '04:20 PM',
        items: [
          { name: 'বাসমতি চাল', quantity: 10, unit: 'কেজি', price: 120, total: 1200 },
          { name: 'মসুর ডাল', quantity: 3, unit: 'কেজি', price: 180, total: 540 }
        ],
        subtotal: 1740,
        discount: 100,
        tax: 246,
        total: 1886,
        paymentMethod: 'mobile',
        status: 'completed',
        salesPerson: 'আব্দুল করিম',
        source: 'grameen_bazar'
      },
      {
        id: 5,
        invoiceNumber: 'INV-2024-005',
        customerName: 'আবুল কালাম',
        customerPhone: '+880 1716-789012',
        date: '2024-01-13',
        time: '09:15 AM',
        items: [
          { name: 'চিনি', quantity: 2, unit: 'কেজি', price: 95, total: 190 },
          { name: 'তেল', quantity: 1, unit: 'লিটার', price: 180, total: 180 }
        ],
        subtotal: 370,
        discount: 0,
        tax: 55.5,
        total: 425.5,
        paymentMethod: 'cash',
        status: 'pending',
        salesPerson: 'আব্দুল করিম',
        source: 'website'
      },
      {
        id: 6,
        invoiceNumber: 'INV-2024-006',
        customerName: 'মনির হোসেন',
        customerPhone: '+880 1717-890123',
        date: '2024-01-13',
        time: '01:30 PM',
        items: [
          { name: 'আটা', quantity: 3, unit: 'কেজি', price: 55, total: 165 }
        ],
        subtotal: 165,
        discount: 0,
        tax: 24.75,
        total: 189.75,
        paymentMethod: 'cash',
        status: 'cancelled',
        salesPerson: 'আব্দুল করিম',
        source: 'pos'
      },
      {
        id: 7,
        invoiceNumber: 'INV-2024-007',
        customerName: 'ইকবাল আহমেদ',
        customerPhone: '+880 1718-901234',
        date: '2024-01-12',
        time: '03:45 PM',
        items: [
          { name: 'বাসমতি চাল', quantity: 8, unit: 'কেজি', price: 120, total: 960 },
          { name: 'মসুর ডাল', quantity: 2, unit: 'কেজি', price: 180, total: 360 },
          { name: 'চিনি', quantity: 2, unit: 'কেজি', price: 95, total: 190 }
        ],
        subtotal: 1510,
        discount: 75,
        tax: 215.25,
        total: 1650.25,
        paymentMethod: 'card',
        status: 'completed',
        salesPerson: 'আব্দুল করিম',
        source: 'website'
      },
      {
        id: 8,
        invoiceNumber: 'INV-2024-008',
        customerName: 'শফিকুর রহমান',
        customerPhone: '+880 1719-012345',
        date: '2024-01-12',
        time: '10:00 AM',
        items: [
          { name: 'হলুদ গুঁড়ো', quantity: 2, unit: 'কেজি', price: 220, total: 440 },
          { name: 'ধনিয়া গুঁড়ো', quantity: 2, unit: 'কেজি', price: 200, total: 400 }
        ],
        subtotal: 840,
        discount: 40,
        tax: 120,
        total: 920,
        paymentMethod: 'cash',
        status: 'completed',
        salesPerson: 'আব্দুল করিম',
        source: 'grameen_bazar'
      }
    ];
    
    setSales(mockSales);
    setFilteredSales(mockSales);
  }, []);

  // Filter sales based on search and filters
  useEffect(() => {
    let filtered = [...sales];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.customerPhone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(sale => {
        const saleDate = new Date(sale.date);
        saleDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return saleDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return saleDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return saleDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredSales(filtered);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, sourceFilter, dateFilter, sales]);

  // Calculate statistics
  const totalSales = filteredSales.length;
  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.total, 0);
  const completedSales = filteredSales.filter(s => s.status === 'completed').length;
  const pendingSales = filteredSales.filter(s => s.status === 'pending').length;

  // Pagination
  const paginatedSales = filteredSales.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (sale) => {
    setSelectedSale(sale);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, sale) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(sale.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handlePrint = (sale) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (sale) => {
    // In real app, trigger download
    console.log('Download invoice:', sale.invoiceNumber);
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
      case 'card':
        return 'কার্ড';
      case 'mobile':
        return 'মোবাইল';
      default:
        return method;
    }
  };

  const getSourceText = (source) => {
    switch (source) {
      case 'pos':
        return 'POS';
      case 'grameen_bazar':
        return 'গ্রামীণ বাজার';
      case 'website':
        return 'ওয়েবসাইট';
      default:
        return source || 'N/A';
    }
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'pos':
        return 'primary';
      case 'grameen_bazar':
        return 'success';
      case 'website':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          বিক্রয় তালিকা
        </Typography>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    মোট বিক্রয়
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalSales}
                  </Typography>
                </Box>
                <CartIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    {completedSales}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', opacity: 0.7 }}>
                  ✓
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
                    {pendingSales}
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
              placeholder="ইনভয়েস নম্বর, গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
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
            <TextField
              fullWidth
              select
              label="স্ট্যাটাস"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              <option value="completed">সম্পন্ন</option>
              <option value="pending">অপেক্ষমাণ</option>
              <option value="cancelled">বাতিল</option>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="তারিখ"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              <option value="today">আজ</option>
              <option value="week">সপ্তাহ</option>
              <option value="month">মাস</option>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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

      {/* Sales Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ইনভয়েস নম্বর</TableCell>
              <TableCell>গ্রাহক</TableCell>
              <TableCell>তারিখ</TableCell>
              <TableCell>সোর্স</TableCell>
              <TableCell>আইটেম</TableCell>
              <TableCell>মোট পরিমাণ</TableCell>
              <TableCell>পেমেন্ট</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedSales.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন বিক্রয় পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedSales.map((sale) => (
                <TableRow key={sale.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {sale.invoiceNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {sale.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sale.customerPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(sale.date).toLocaleDateString('bn-BD')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {sale.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getSourceText(sale.source)}
                      color={getSourceColor(sale.source)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {sale.items.length} টি আইটেম
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ৳{sale.total.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getPaymentMethodText(sale.paymentMethod)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(sale.status)}
                      color={getStatusColor(sale.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(sale)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, sale)}
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
      {filteredSales.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredSales.length / rowsPerPage)}
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
          const sale = sales.find(s => s.id === selectedRow);
          if (sale) handleView(sale);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        <MenuItem onClick={() => {
          const sale = sales.find(s => s.id === selectedRow);
          if (sale) handlePrint(sale);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const sale = sales.find(s => s.id === selectedRow);
          if (sale) handleDownload(sale);
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          ডাউনলোড করুন
        </MenuItem>
      </Menu>

      {/* View Sale Details Dialog - Invoice Format */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogContent sx={{ p: 0 }}>
          {selectedSale && (
            <Box
              id="invoice-to-print"
              sx={{
                px: 3,
                py: 2,
                '@media print': {
                  width: '80mm',
                  maxWidth: '80mm',
                  padding: '5mm 3mm',
                  fontSize: '10px',
                  '@page': {
                    size: '80mm auto',
                    margin: '0mm',
                  },
                },
              }}
            >
              {/* Invoice Header */}
              <Box
                sx={{
                  textAlign: 'center',
                  borderBottom: '1px solid',
                  borderColor: 'primary.main',
                  pb: 1,
                  mb: 1,
                  '@media print': {
                    pb: '3mm',
                    mb: '3mm',
                  },
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700, 
                    mb: 0.5,
                    fontSize: '16px',
                    '@media print': {
                      fontSize: '14px',
                      mb: '2mm',
                    },
                  }}
                >
                  হাবিব ট্রেডার্স
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: '11px',
                    '@media print': {
                      fontSize: '9px',
                      lineHeight: 1.2,
                    },
                  }}
                >
                  ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: '11px',
                    '@media print': {
                      fontSize: '9px',
                      lineHeight: 1.2,
                    },
                  }}
                >
                  ফোন: +৮৮০ ১৭১২-৩৪৫৬৭৮
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{
                    fontSize: '11px',
                    '@media print': {
                      fontSize: '9px',
                      lineHeight: 1.2,
                      display: 'none',
                    },
                  }}
                >
                  ইমেইল: info@habibtraders.com
                </Typography>
                {selectedSale.source === 'grameen_bazar' && (
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      mt: 0.5,
                      fontSize: '11px',
                      '@media print': {
                        fontSize: '9px',
                        mt: '1mm',
                      },
                    }}
                  >
                    BIN: ১২৩-৪৫৬-৭৮৯
                  </Typography>
                )}
              </Box>

              {/* Invoice Details */}
              <TableContainer sx={{ mb: 1, '@media print': { mb: '3mm' } }}>
                <Table size="small" sx={{ border: 'none', '@media print': { fontSize: '9px' } }}>
                  <TableBody>
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell 
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '8px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          চালান নম্বর
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '11px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          {selectedSale.invoiceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '8px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          তারিখ ও সময়
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '11px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          {new Date(selectedSale.date).toLocaleDateString('bn-BD')} {selectedSale.time}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Box 
                sx={{ 
                  borderBottom: '1px dashed', 
                  borderColor: 'divider',
                  mb: 1,
                  pb: 1,
                  '@media print': {
                    mb: '3mm',
                    pb: '3mm',
                  },
                }}
              />

              {/* Customer Information */}
              <TableContainer sx={{ mb: 1, '@media print': { mb: '3mm' } }}>
                <Table size="small" sx={{ border: 'none', '@media print': { fontSize: '9px' } }}>
                  <TableBody>
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell 
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '8px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          গ্রাহকের নাম: {selectedSale.customerName}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '8px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          {selectedSale.customerPhone}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Box 
                sx={{ 
                  borderBottom: '1px dashed', 
                  borderColor: 'divider',
                  mb: 1,
                  pb: 1,
                  '@media print': {
                    mb: '3mm',
                    pb: '3mm',
                  },
                }}
              />

              {/* Items Table */}
              <TableContainer>
                <Table 
                  size="small" 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider',
                    '@media print': {
                      fontSize: '9px',
                      '& th, & td': {
                        padding: '2mm 1mm',
                        fontSize: '9px',
                      },
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell 
                        sx={{ 
                          fontWeight: 600, 
                          py: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '2mm 1mm',
                            py: '2mm',
                          },
                        }}
                      >
                        পণ্য
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          fontWeight: 600, 
                          py: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '2mm 1mm',
                            py: '2mm',
                          },
                        }}
                      >
                        পরিমাণ
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          fontWeight: 600, 
                          py: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '2mm 1mm',
                            py: '2mm',
                          },
                        }}
                      >
                        দর
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          fontWeight: 600, 
                          py: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '2mm 1mm',
                            py: '2mm',
                          },
                        }}
                      >
                        মোট
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedSale.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell 
                          sx={{ 
                            py: 0.5,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              padding: '2mm 1mm',
                              py: '2mm',
                            },
                          }}
                        >
                          {item.name}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            py: 0.5,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              padding: '2mm 1mm',
                              py: '2mm',
                            },
                          }}
                        >
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            py: 0.5,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              padding: '2mm 1mm',
                              py: '2mm',
                            },
                          }}
                        >
                          ৳{item.price.toLocaleString('bn-BD')}
                        </TableCell>
                        <TableCell 
                          align="right" 
                          sx={{ 
                            py: 0.5,
                            fontWeight: 500,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              padding: '2mm 1mm',
                              py: '2mm',
                            },
                          }}
                        >
                          ৳{item.total.toLocaleString('bn-BD')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary Section */}
              <TableContainer sx={{ mt: 1, '@media print': { mt: '3mm' } }}>
                <Table 
                  size="small" 
                  sx={{ 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderTop: 'none',
                    '@media print': { 
                      fontSize: '9px',
                      border: '1px solid #ddd',
                      borderTop: 'none',
                    },
                  }}
                >
                  <TableBody>
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          border: 'none',
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '9px',
                            padding: '2mm 1mm',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          উপমোট:
                        </Typography>
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          border: 'none',
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '9px',
                            padding: '2mm 1mm',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          ৳{selectedSale.subtotal.toLocaleString('bn-BD')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {selectedSale.discount > 0 && (
                      <TableRow>
                        <TableCell 
                          sx={{ 
                            border: 'none',
                            p: 0.5,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              padding: '2mm 1mm',
                            },
                          }}
                        >
                          <Typography 
                            variant="body2"
                            sx={{
                              fontSize: '10px',
                              '@media print': {
                                fontSize: '9px',
                                lineHeight: 1.2,
                              },
                            }}
                          >
                            ছাড়:
                          </Typography>
                        </TableCell>
                        <TableCell 
                          align="right"
                          sx={{ 
                            border: 'none',
                            p: 0.5,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              padding: '2mm 1mm',
                            },
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontWeight: 500,
                              fontSize: '10px',
                              '@media print': {
                                fontSize: '9px',
                                lineHeight: 1.2,
                              },
                            }}
                          >
                            ৳{selectedSale.discount.toLocaleString('bn-BD')}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell 
                        sx={{ 
                          border: 'none',
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '9px',
                            padding: '2mm 1mm',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          ভ্যাট/কর:
                        </Typography>
                      </TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          border: 'none',
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '9px',
                            padding: '2mm 1mm',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 500,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          ৳{selectedSale.tax.toLocaleString('bn-BD')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell 
                        colSpan={2}
                        sx={{ 
                          border: 'none',
                          borderTop: '2px solid',
                          borderColor: 'primary.main',
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '9px',
                            padding: '3mm 1mm',
                          },
                        }}
                      >
                        <Table size="small" sx={{ border: 'none' }}>
                          <TableBody>
                            <TableRow sx={{ border: 'none' }}>
                              <TableCell 
                                sx={{ 
                                  border: 'none',
                                  p: 0,
                                  '@media print': {
                                    padding: 0,
                                  },
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700,
                                    fontSize: '16px',
                                    '@media print': {
                                      fontSize: '12px',
                                      lineHeight: 1.2,
                                    },
                                  }}
                                >
                                  সর্বমোট:
                                </Typography>
                              </TableCell>
                              <TableCell 
                                align="right"
                                sx={{ 
                                  border: 'none',
                                  p: 0,
                                  '@media print': {
                                    padding: 0,
                                  },
                                }}
                              >
                                <Typography 
                                  variant="h6" 
                                  sx={{ 
                                    fontWeight: 700, 
                                    color: 'primary.main',
                                    fontSize: '16px',
                                    '@media print': {
                                      fontSize: '12px',
                                      lineHeight: 1.2,
                                    },
                                  }}
                                >
                                  ৳{selectedSale.total.toLocaleString('bn-BD')}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Payment Information */}
              <TableContainer sx={{ mt: 1, '@media print': { mt: '3mm' } }}>
                <Table size="small" sx={{ border: 'none', '@media print': { fontSize: '9px' } }}>
                  <TableBody>
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell 
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          পেমেন্ট: {getPaymentMethodText(selectedSale.paymentMethod)}
                        </Typography>
                      </TableCell>
                      <TableCell 
                        align="right" 
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          পরিশোধিত: ৳{selectedSale.total.toLocaleString('bn-BD')}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    {selectedSale.paymentMethod === 'cash' && (
                      <TableRow sx={{ border: 'none' }}>
                        <TableCell 
                          sx={{ 
                            border: 'none', 
                            p: 0.5,
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '8px',
                              padding: '1mm 0',
                            },
                          }}
                        >
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{
                              fontSize: '10px',
                              '@media print': {
                                fontSize: '9px',
                                lineHeight: 1.2,
                              },
                            }}
                          >
                            ফেরত: ৳০.০০
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ border: 'none', p: 0.5 }} />
                      </TableRow>
                    )}
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell 
                        colSpan={2}
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '10px',
                            '@media print': {
                              fontSize: '9px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          মোট আইটেম: {selectedSale.items.reduce((sum, item) => sum + item.quantity, 0)} টি
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Transaction Details */}
              <TableContainer sx={{ mt: 1, '@media print': { mt: '3mm' } }}>
                <Table size="small" sx={{ border: 'none', '@media print': { fontSize: '9px' } }}>
                  <TableBody>
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell 
                        colSpan={2}
                        align="center"
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          borderTop: '1px dashed',
                          borderColor: 'divider',
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '3mm 0 1mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            fontSize: '9px',
                            '@media print': {
                              fontSize: '8px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          বিক্রয়কারী: {selectedSale.salesPerson}
                        </Typography>
                        {selectedSale.source && (
                          <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            sx={{ 
                              mt: 0.5,
                              fontSize: '9px',
                              '@media print': {
                                fontSize: '8px',
                                mt: '1mm',
                                lineHeight: 1.2,
                              },
                            }}
                          >
                            সোর্স: {getSourceText(selectedSale.source)}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer */}
              <TableContainer sx={{ mt: 1, '@media print': { mt: '3mm' } }}>
                <Table size="small" sx={{ border: 'none', '@media print': { fontSize: '9px' } }}>
                  <TableBody>
                    <TableRow sx={{ border: 'none' }}>
                      <TableCell 
                        colSpan={2}
                        align="center"
                        sx={{ 
                          border: 'none', 
                          p: 0.5,
                          borderTop: '1px solid',
                          borderColor: 'primary.main',
                          fontSize: '10px',
                          '@media print': {
                            fontSize: '8px',
                            padding: '3mm 0',
                          },
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 600, 
                            mb: 0.5,
                            fontSize: '11px',
                            '@media print': {
                              fontSize: '9px',
                              mb: '2mm',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          আপনার ব্যবসায়িক কার্যক্রমে ধন্যবাদ
                        </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{
                            fontSize: '9px',
                            '@media print': {
                              fontSize: '8px',
                              lineHeight: 1.2,
                            },
                          }}
                        >
                          www.habibtraders.com
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              const printContent = document.getElementById('invoice-to-print');
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Invoice - ${selectedSale?.invoiceNumber}</title>
                    <style>
                      @media print {
                        @page {
                          size: 80mm auto;
                          margin: 0mm;
                        }
                        * {
                          margin: 0;
                          padding: 0;
                          box-sizing: border-box;
                        }
                        body {
                          margin: 0;
                          padding: 0;
                          width: 80mm;
                          font-family: 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
                          font-size: 10px;
                          line-height: 1.2;
                        }
                      }
                      body {
                        font-family: 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
                        padding: 0;
                        width: 80mm;
                        max-width: 80mm;
                        margin: 0 auto;
                        font-size: 10px;
                      }
                      #invoice-to-print {
                        padding: 5mm 3mm;
                        width: 80mm;
                        max-width: 80mm;
                        font-size: 10px;
                      }
                      #invoice-to-print * {
                        font-size: inherit;
                      }
                      table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        font-size: 9px;
                        margin: 3mm 0;
                        table-layout: fixed;
                      }
                      th, td {
                        padding: 2mm 1mm !important;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                        font-size: 9px;
                        line-height: 1.2;
                        word-wrap: break-word;
                        overflow-wrap: break-word;
                      }
                      th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                        font-size: 8px;
                      }
                      td[align="right"] {
                        text-align: right !important;
                      }
                      td[align="center"] {
                        text-align: center !important;
                      }
                      .text-right {
                        text-align: right;
                      }
                      .text-center {
                        text-align: center;
                      }
                      h1, h2, h3, h4, h5, h6 {
                        margin: 2mm 0;
                        line-height: 1.2;
                      }
                      p {
                        margin: 1mm 0;
                        line-height: 1.2;
                      }
                      .MuiTableCell-root {
                        padding: 2mm 1mm !important;
                      }
                    </style>
                  </head>
                  <body>
                    ${printContent.innerHTML}
                  </body>
                </html>
              `);
              printWindow.document.close();
              printWindow.focus();
              setTimeout(() => {
                printWindow.print();
                printWindow.close();
              }, 250);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            প্রিন্ট করুন
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => handleDownload(selectedSale)}
          >
            ডাউনলোড
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalesListPage;

