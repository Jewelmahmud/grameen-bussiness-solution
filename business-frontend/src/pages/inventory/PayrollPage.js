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
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

const PayrollPage = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock payroll data
  useEffect(() => {
    const mockPayrolls = [
      {
        id: 1,
        payrollNumber: 'PAY-2024-01-001',
        employeeId: 'EMP-001',
        employeeName: 'আব্দুল করিম',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 20000,
        allowances: 3000,
        deductions: 2000,
        overtime: 2000,
        netSalary: 23000,
        status: 'paid',
        paymentDate: '2024-02-05',
        paymentMethod: 'bank_transfer',
        remarks: 'সম্পূর্ণ পরিশোধিত'
      },
      {
        id: 2,
        payrollNumber: 'PAY-2024-01-002',
        employeeId: 'EMP-002',
        employeeName: 'রহিম উদ্দিন',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 30000,
        allowances: 4000,
        deductions: 2500,
        overtime: 1000,
        netSalary: 32500,
        status: 'paid',
        paymentDate: '2024-02-05',
        paymentMethod: 'bank_transfer',
        remarks: 'সম্পূর্ণ পরিশোধিত'
      },
      {
        id: 3,
        payrollNumber: 'PAY-2024-01-003',
        employeeId: 'EMP-003',
        employeeName: 'ফাতেমা বেগম',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 25000,
        allowances: 3500,
        deductions: 2000,
        overtime: 1500,
        netSalary: 28000,
        status: 'paid',
        paymentDate: '2024-02-05',
        paymentMethod: 'cash',
        remarks: 'সম্পূর্ণ পরিশোধিত'
      },
      {
        id: 4,
        payrollNumber: 'PAY-2024-01-004',
        employeeId: 'EMP-004',
        employeeName: 'করিম উদ্দিন',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 15000,
        allowances: 3000,
        deductions: 1000,
        overtime: 2000,
        netSalary: 19000,
        status: 'pending',
        paymentDate: null,
        paymentMethod: null,
        remarks: 'অপেক্ষমাণ'
      },
      {
        id: 5,
        payrollNumber: 'PAY-2024-01-005',
        employeeId: 'EMP-005',
        employeeName: 'মহম্মদ আলী',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 35000,
        allowances: 5000,
        deductions: 3000,
        overtime: 0,
        netSalary: 37000,
        status: 'paid',
        paymentDate: '2024-02-05',
        paymentMethod: 'bank_transfer',
        remarks: 'সম্পূর্ণ পরিশোধিত'
      },
      {
        id: 6,
        payrollNumber: 'PAY-2024-01-006',
        employeeId: 'EMP-006',
        employeeName: 'আয়েশা খাতুন',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 18000,
        allowances: 2500,
        deductions: 1500,
        overtime: 0,
        netSalary: 19000,
        status: 'pending',
        paymentDate: null,
        paymentMethod: null,
        remarks: 'ছুটিতে থাকায় বিলম্ব'
      },
      {
        id: 7,
        payrollNumber: 'PAY-2024-01-007',
        employeeId: 'EMP-007',
        employeeName: 'ইকবাল আহমেদ',
        month: '2024-01',
        monthName: 'জানুয়ারি ২০২৪',
        basicSalary: 28000,
        allowances: 4000,
        deductions: 2000,
        overtime: 0,
        netSalary: 30000,
        status: 'paid',
        paymentDate: '2024-02-05',
        paymentMethod: 'bank_transfer',
        remarks: 'সম্পূর্ণ পরিশোধিত'
      },
      {
        id: 8,
        payrollNumber: 'PAY-2024-02-001',
        employeeId: 'EMP-001',
        employeeName: 'আব্দুল করিম',
        month: '2024-02',
        monthName: 'ফেব্রুয়ারি ২০২৪',
        basicSalary: 20000,
        allowances: 3000,
        deductions: 2000,
        overtime: 1000,
        netSalary: 22000,
        status: 'pending',
        paymentDate: null,
        paymentMethod: null,
        remarks: 'অপেক্ষমাণ'
      }
    ];
    
    setPayrolls(mockPayrolls);
    setFilteredPayrolls(mockPayrolls);
  }, []);

  // Filter payrolls based on search and filters
  useEffect(() => {
    let filtered = [...payrolls];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payroll =>
        payroll.payrollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payroll.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payroll.employeeName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(payroll => payroll.status === statusFilter);
    }

    // Month filter
    if (monthFilter !== 'all') {
      filtered = filtered.filter(payroll => payroll.month === monthFilter);
    }

    setFilteredPayrolls(filtered);
    setPage(1);
  }, [searchTerm, statusFilter, monthFilter, payrolls]);

  // Calculate statistics
  const totalPayrolls = filteredPayrolls.length;
  const paidPayrolls = filteredPayrolls.filter(p => p.status === 'paid').length;
  const pendingPayrolls = filteredPayrolls.filter(p => p.status === 'pending').length;
  const totalAmount = filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  // Get unique months for filter
  const months = [...new Set(payrolls.map(p => `${p.month} - ${p.monthName}`))];

  // Pagination
  const paginatedPayrolls = filteredPayrolls.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (payroll) => {
    setSelectedPayroll(payroll);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, payroll) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(payroll.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleProcess = (payroll) => {
    console.log('Process payroll:', payroll.payrollNumber);
    handleMenuClose();
  };

  const handlePrint = (payroll) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (payroll) => {
    console.log('Download payroll:', payroll?.payrollNumber || 'all');
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'পরিশোধিত';
      case 'pending':
        return 'অপেক্ষমাণ';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon fontSize="small" />;
      case 'pending':
        return <PendingIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'bank_transfer':
        return 'ব্যাংক ট্রান্সফার';
      case 'cash':
        return 'নগদ';
      default:
        return 'N/A';
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          বেতন ব্যবস্থাপনা
        </Typography>
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
          নতুন বেতন এন্ট্রি
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
                    মোট বেতন
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalPayrolls}
                  </Typography>
                </Box>
                <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    পরিশোধিত
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {paidPayrolls}
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
                    {pendingPayrolls}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', opacity: 0.7 }}>
                  ⏱
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
                    মোট পরিমাণ
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ৳{totalAmount.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
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
              placeholder="বেতন নম্বর, কর্মচারী আইডি বা নাম দিয়ে খুঁজুন..."
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
              <option value="paid">পরিশোধিত</option>
              <option value="pending">অপেক্ষমাণ</option>
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="মাস"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              {months.map((month, index) => (
                <option key={index} value={month.split(' - ')[0]}>
                  {month.split(' - ')[1]}
                </option>
              ))}
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

      {/* Payroll Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>বেতন নম্বর</TableCell>
              <TableCell>কর্মচারী</TableCell>
              <TableCell>মাস</TableCell>
              <TableCell>মূল বেতন</TableCell>
              <TableCell>ভাতা</TableCell>
              <TableCell>কাটা</TableCell>
              <TableCell>নেট বেতন</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedPayrolls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন বেতন রেকর্ড পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedPayrolls.map((payroll) => (
                <TableRow key={payroll.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {payroll.payrollNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {payroll.employeeName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {payroll.employeeId}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {payroll.monthName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      ৳{payroll.basicSalary.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'success.main' }}>
                      +৳{payroll.allowances.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: 'error.main' }}>
                      -৳{payroll.deductions.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      ৳{payroll.netSalary.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(payroll.status)}
                      label={getStatusText(payroll.status)}
                      color={getStatusColor(payroll.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(payroll)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, payroll)}
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
      {filteredPayrolls.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredPayrolls.length / rowsPerPage)}
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
          const payroll = payrolls.find(p => p.id === selectedRow);
          if (payroll) handleView(payroll);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        {(() => {
          const payroll = payrolls.find(p => p.id === selectedRow);
          if (payroll && payroll.status === 'pending') {
            return (
              <MenuItem onClick={() => {
                if (payroll) handleProcess(payroll);
              }}>
                <ListItemIcon>
                  <CheckCircleIcon fontSize="small" />
                </ListItemIcon>
                প্রক্রিয়াকরণ করুন
              </MenuItem>
            );
          }
          return null;
        })()}
        <MenuItem onClick={() => {
          const payroll = payrolls.find(p => p.id === selectedRow);
          if (payroll) handlePrint(payroll);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const payroll = payrolls.find(p => p.id === selectedRow);
          if (payroll) handleDownload(payroll);
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          ডাউনলোড করুন
        </MenuItem>
      </Menu>

      {/* View Payroll Details Dialog */}
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
              <MoneyIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                বেতন বিবরণ
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedPayroll && (
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  বেতন নম্বর
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedPayroll.payrollNumber}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  মাস
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedPayroll.monthName}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  কর্মচারী আইডি
                </Typography>
                <Typography variant="body1">
                  {selectedPayroll.employeeId}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  কর্মচারীর নাম
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedPayroll.employeeName}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  মূল বেতন
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  ৳{selectedPayroll.basicSalary.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ভাতা
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main' }}>
                  +৳{selectedPayroll.allowances.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  কাটা
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'error.main' }}>
                  -৳{selectedPayroll.deductions.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  ওভারটাইম
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'info.main' }}>
                  +৳{selectedPayroll.overtime.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ 
                  p: 2, 
                  bgcolor: 'primary.light', 
                  borderRadius: 1,
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    নেট বেতন
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    ৳{selectedPayroll.netSalary.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  স্ট্যাটাস
                </Typography>
                <Chip
                  icon={getStatusIcon(selectedPayroll.status)}
                  label={getStatusText(selectedPayroll.status)}
                  color={getStatusColor(selectedPayroll.status)}
                  size="small"
                />
              </Grid>
              
              {selectedPayroll.status === 'paid' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      পরিশোধের তারিখ
                    </Typography>
                    <Typography variant="body1">
                      {selectedPayroll.paymentDate ? new Date(selectedPayroll.paymentDate).toLocaleDateString('bn-BD') : 'N/A'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      পেমেন্ট পদ্ধতি
                    </Typography>
                    <Typography variant="body1">
                      {getPaymentMethodText(selectedPayroll.paymentMethod)}
                    </Typography>
                  </Grid>
                </>
              )}
              
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  মন্তব্য
                </Typography>
                <Typography variant="body1">
                  {selectedPayroll.remarks}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
          {selectedPayroll && selectedPayroll.status === 'pending' && (
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={() => {
                if (selectedPayroll) handleProcess(selectedPayroll);
                setOpenDialog(false);
              }}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
                },
              }}
            >
              প্রক্রিয়াকরণ করুন
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => handlePrint(selectedPayroll)}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            প্রিন্ট করুন
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollPage;

