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
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Description as ReportIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountingIcon,
  PictureAsPdf as PdfIcon,
  TableChart as TableIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

const ReportPage = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openGenerateDialog, setOpenGenerateDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock reports data
  useEffect(() => {
    const mockReports = [
      {
        id: 1,
        reportNumber: 'RPT-2024-001',
        name: 'মাসিক বিক্রয় রিপোর্ট',
        type: 'sales',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        totalSales: 1250000,
        totalOrders: 1250,
        status: 'completed',
        format: 'pdf'
      },
      {
        id: 2,
        reportNumber: 'RPT-2024-002',
        name: 'স্টক রিপোর্ট',
        type: 'inventory',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        totalProducts: 1250,
        lowStockItems: 45,
        status: 'completed',
        format: 'excel'
      },
      {
        id: 3,
        reportNumber: 'RPT-2024-003',
        name: 'আর্থিক রিপোর্ট',
        type: 'financial',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        totalRevenue: 1250000,
        totalExpenses: 850000,
        status: 'completed',
        format: 'pdf'
      },
      {
        id: 4,
        reportNumber: 'RPT-2024-004',
        name: 'গ্রাহক রিপোর্ট',
        type: 'customer',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        totalCustomers: 850,
        newCustomers: 45,
        status: 'completed',
        format: 'pdf'
      },
      {
        id: 5,
        reportNumber: 'RPT-2024-005',
        name: 'ক্রয় রিপোর্ট',
        type: 'purchase',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        totalPurchases: 950000,
        totalOrders: 85,
        status: 'completed',
        format: 'excel'
      },
      {
        id: 6,
        reportNumber: 'RPT-2024-006',
        name: 'পণ্য পারফরম্যান্স রিপোর্ট',
        type: 'product',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        topProducts: 20,
        totalRevenue: 1250000,
        status: 'completed',
        format: 'pdf'
      },
      {
        id: 7,
        reportNumber: 'RPT-2024-007',
        name: 'বেতন রিপোর্ট',
        type: 'payroll',
        period: 'জানুয়ারি ২০২৪',
        generatedDate: '2024-02-01',
        generatedBy: 'আব্দুল করিম',
        totalEmployees: 8,
        totalSalary: 200000,
        status: 'completed',
        format: 'pdf'
      },
      {
        id: 8,
        reportNumber: 'RPT-2024-008',
        name: 'সাপ্তাহিক বিক্রয় রিপোর্ট',
        type: 'sales',
        period: 'সপ্তাহ ১, জানুয়ারি ২০২৪',
        generatedDate: '2024-01-08',
        generatedBy: 'আব্দুল করিম',
        totalSales: 320000,
        totalOrders: 320,
        status: 'completed',
        format: 'pdf'
      }
    ];
    
    setReports(mockReports);
    setFilteredReports(mockReports);
  }, []);

  // Filter reports based on search and filters
  useEffect(() => {
    let filtered = [...reports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.period.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(report => report.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.generatedDate);
        reportDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return reportDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reportDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return reportDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredReports(filtered);
    setPage(1);
  }, [searchTerm, typeFilter, dateFilter, reports]);

  // Calculate statistics
  const totalReports = filteredReports.length;
  const salesReports = filteredReports.filter(r => r.type === 'sales').length;
  const inventoryReports = filteredReports.filter(r => r.type === 'inventory').length;
  const financialReports = filteredReports.filter(r => r.type === 'financial').length;

  // Pagination
  const paginatedReports = filteredReports.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (report) => {
    setSelectedReport(report);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(report.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handlePrint = (report) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (report) => {
    console.log('Download report:', report?.reportNumber || 'all');
    handleMenuClose();
  };

  const handleGenerate = () => {
    setOpenGenerateDialog(true);
  };

  const getTypeColor = (type) => {
    const colors = {
      'sales': 'success',
      'inventory': 'primary',
      'financial': 'info',
      'customer': 'warning',
      'purchase': 'secondary',
      'product': 'default',
      'payroll': 'error'
    };
    return colors[type] || 'default';
  };

  const getTypeText = (type) => {
    const texts = {
      'sales': 'বিক্রয়',
      'inventory': 'স্টক',
      'financial': 'আর্থিক',
      'customer': 'গ্রাহক',
      'purchase': 'ক্রয়',
      'product': 'পণ্য',
      'payroll': 'বেতন'
    };
    return texts[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'sales': <CartIcon />,
      'inventory': <InventoryIcon />,
      'financial': <AccountingIcon />,
      'customer': <CartIcon />,
      'purchase': <CartIcon />,
      'product': <InventoryIcon />,
      'payroll': <MoneyIcon />
    };
    return icons[type] || <ReportIcon />;
  };

  const getFormatIcon = (format) => {
    return format === 'pdf' ? <PdfIcon /> : <TableIcon />;
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          রিপোর্ট
        </Typography>
        <Button
          variant="contained"
          startIcon={<AssessmentIcon />}
          onClick={handleGenerate}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            },
          }}
        >
          নতুন রিপোর্ট তৈরি করুন
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    মোট রিপোর্ট
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalReports}
                  </Typography>
                </Box>
                <ReportIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    বিক্রয় রিপোর্ট
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {salesReports}
                  </Typography>
                </Box>
                <CartIcon sx={{ fontSize: 40, color: 'success.main', opacity: 0.7 }} />
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
                    স্টক রিপোর্ট
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {inventoryReports}
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
                    আর্থিক রিপোর্ট
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {financialReports}
                  </Typography>
                </Box>
                <AccountingIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
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
              placeholder="রিপোর্ট নম্বর, নাম বা সময়কাল দিয়ে খুঁজুন..."
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
              <InputLabel>ধরন</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="ধরন"
              >
                <MenuItem value="all">সকল</MenuItem>
                <MenuItem value="sales">বিক্রয়</MenuItem>
                <MenuItem value="inventory">স্টক</MenuItem>
                <MenuItem value="financial">আর্থিক</MenuItem>
                <MenuItem value="customer">গ্রাহক</MenuItem>
                <MenuItem value="purchase">ক্রয়</MenuItem>
                <MenuItem value="product">পণ্য</MenuItem>
                <MenuItem value="payroll">বেতন</MenuItem>
              </Select>
            </FormControl>
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

      {/* Reports Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>রিপোর্ট নম্বর</TableCell>
              <TableCell>রিপোর্ট নাম</TableCell>
              <TableCell>ধরন</TableCell>
              <TableCell>সময়কাল</TableCell>
              <TableCell>তৈরি করেছেন</TableCell>
              <TableCell>তৈরির তারিখ</TableCell>
              <TableCell>ফরম্যাট</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন রিপোর্ট পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {report.reportNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {report.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getTypeIcon(report.type)}
                      label={getTypeText(report.type)}
                      color={getTypeColor(report.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report.period}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {report.generatedBy}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(report.generatedDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getFormatIcon(report.format)}
                      label={report.format.toUpperCase()}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(report)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, report)}
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
      {filteredReports.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredReports.length / rowsPerPage)}
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
          const report = reports.find(r => r.id === selectedRow);
          if (report) handleView(report);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        <MenuItem onClick={() => {
          const report = reports.find(r => r.id === selectedRow);
          if (report) handlePrint(report);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const report = reports.find(r => r.id === selectedRow);
          if (report) handleDownload(report);
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          ডাউনলোড করুন
        </MenuItem>
      </Menu>

      {/* View Report Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ReportIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                রিপোর্ট বিবরণ
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedReport && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  রিপোর্ট নম্বর
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedReport.reportNumber}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  রিপোর্ট নাম
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedReport.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ধরন
                </Typography>
                <Chip
                  icon={getTypeIcon(selectedReport.type)}
                  label={getTypeText(selectedReport.type)}
                  color={getTypeColor(selectedReport.type)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  সময়কাল
                </Typography>
                <Typography variant="body1">
                  {selectedReport.period}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  তৈরি করেছেন
                </Typography>
                <Typography variant="body1">
                  {selectedReport.generatedBy}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  তৈরির তারিখ
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedReport.generatedDate).toLocaleDateString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ফরম্যাট
                </Typography>
                <Chip
                  icon={getFormatIcon(selectedReport.format)}
                  label={selectedReport.format.toUpperCase()}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>
              
              {/* Report-specific data */}
              {selectedReport.type === 'sales' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট বিক্রয়
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                      ৳{selectedReport.totalSales?.toLocaleString('bn-BD')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট অর্ডার
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedReport.totalOrders}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {selectedReport.type === 'inventory' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট পণ্য
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedReport.totalProducts}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      কম স্টক আইটেম
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {selectedReport.lowStockItems}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {selectedReport.type === 'financial' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট আয়
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                      ৳{selectedReport.totalRevenue?.toLocaleString('bn-BD')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট ব্যয়
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                      ৳{selectedReport.totalExpenses?.toLocaleString('bn-BD')}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {selectedReport.type === 'customer' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট গ্রাহক
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedReport.totalCustomers}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      নতুন গ্রাহক
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {selectedReport.newCustomers}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {selectedReport.type === 'purchase' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট ক্রয়
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                      ৳{selectedReport.totalPurchases?.toLocaleString('bn-BD')}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট অর্ডার
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedReport.totalOrders}
                    </Typography>
                  </Grid>
                </>
              )}
              
              {selectedReport.type === 'payroll' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট কর্মচারী
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {selectedReport.totalEmployees}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      মোট বেতন
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      ৳{selectedReport.totalSalary?.toLocaleString('bn-BD')}
                    </Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => handlePrint(selectedReport)}
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
            onClick={() => handleDownload(selectedReport)}
          >
            ডাউনলোড
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Report Dialog */}
      <Dialog
        open={openGenerateDialog}
        onClose={() => setOpenGenerateDialog(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AssessmentIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                নতুন রিপোর্ট তৈরি করুন
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>রিপোর্ট ধরন</InputLabel>
                <Select
                  label="রিপোর্ট ধরন"
                  defaultValue=""
                >
                  <MenuItem value="sales">বিক্রয় রিপোর্ট</MenuItem>
                  <MenuItem value="inventory">স্টক রিপোর্ট</MenuItem>
                  <MenuItem value="financial">আর্থিক রিপোর্ট</MenuItem>
                  <MenuItem value="customer">গ্রাহক রিপোর্ট</MenuItem>
                  <MenuItem value="purchase">ক্রয় রিপোর্ট</MenuItem>
                  <MenuItem value="product">পণ্য পারফরম্যান্স রিপোর্ট</MenuItem>
                  <MenuItem value="payroll">বেতন রিপোর্ট</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="শুরু তারিখ"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="date"
                label="শেষ তারিখ"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>ফরম্যাট</InputLabel>
                <Select
                  label="ফরম্যাট"
                  defaultValue="pdf"
                >
                  <MenuItem value="pdf">PDF</MenuItem>
                  <MenuItem value="excel">Excel</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenGenerateDialog(false)}>বাতিল</Button>
          <Button
            variant="contained"
            startIcon={<AssessmentIcon />}
            onClick={() => {
              console.log('Generate report');
              setOpenGenerateDialog(false);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            রিপোর্ট তৈরি করুন
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReportPage;

