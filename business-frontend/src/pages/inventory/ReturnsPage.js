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
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  AssignmentReturn as ReturnsIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon
} from '@mui/icons-material';

const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'approved', 'pending', 'rejected'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock returns data
  useEffect(() => {
    const mockReturns = [
      {
        id: 1,
        returnNumber: 'RET-2024-001',
        originalInvoice: 'INV-2024-001',
        customerName: 'রহিম উদ্দিন',
        customerPhone: '+880 1712-345678',
        date: '2024-01-16',
        time: '11:30 AM',
        reason: 'পণ্য ত্রুটিপূর্ণ',
        items: [
          { name: 'বাসমতি চাল', quantity: 2, unit: 'কেজি', price: 120, total: 240, returnedQuantity: 2 }
        ],
        subtotal: 240,
        refundAmount: 240,
        status: 'approved',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-16',
        notes: 'পণ্য ত্রুটিপূর্ণ ছিল, ফেরত গ্রহণ করা হয়েছে'
      },
      {
        id: 2,
        returnNumber: 'RET-2024-002',
        originalInvoice: 'INV-2024-003',
        customerName: 'মহম্মদ আলী',
        customerPhone: '+880 1714-567890',
        date: '2024-01-15',
        time: '03:15 PM',
        reason: 'গ্রাহক সন্তুষ্ট নন',
        items: [
          { name: 'হলুদ গুঁড়ো', quantity: 1, unit: 'কেজি', price: 220, total: 220, returnedQuantity: 1 }
        ],
        subtotal: 220,
        refundAmount: 220,
        status: 'approved',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-15',
        notes: 'গ্রাহকের অনুরোধে ফেরত'
      },
      {
        id: 3,
        returnNumber: 'RET-2024-003',
        originalInvoice: 'INV-2024-004',
        customerName: 'ফজলুল হক',
        customerPhone: '+880 1715-678901',
        date: '2024-01-14',
        time: '05:00 PM',
        reason: 'ভুল পণ্য',
        items: [
          { name: 'বাসমতি চাল', quantity: 10, unit: 'কেজি', price: 120, total: 1200, returnedQuantity: 5 }
        ],
        subtotal: 600,
        refundAmount: 600,
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        notes: 'আংশিক ফেরত অনুরোধ'
      },
      {
        id: 4,
        returnNumber: 'RET-2024-004',
        originalInvoice: 'INV-2024-007',
        customerName: 'ইকবাল আহমেদ',
        customerPhone: '+880 1718-901234',
        date: '2024-01-13',
        time: '04:30 PM',
        reason: 'পণ্য ক্ষতিগ্রস্ত',
        items: [
          { name: 'মসুর ডাল', quantity: 2, unit: 'কেজি', price: 180, total: 360, returnedQuantity: 2 }
        ],
        subtotal: 360,
        refundAmount: 360,
        status: 'rejected',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-13',
        notes: 'পণ্য ব্যবহার করা হয়েছে, ফেরত গ্রহণযোগ্য নয়'
      },
      {
        id: 5,
        returnNumber: 'RET-2024-005',
        originalInvoice: 'INV-2024-002',
        customerName: 'করিম উদ্দিন',
        customerPhone: '+880 1713-456789',
        date: '2024-01-12',
        time: '02:00 PM',
        reason: 'পণ্য ত্রুটিপূর্ণ',
        items: [
          { name: 'চিনি', quantity: 3, unit: 'কেজি', price: 95, total: 285, returnedQuantity: 3 },
          { name: 'তেল', quantity: 1, unit: 'লিটার', price: 180, total: 180, returnedQuantity: 1 }
        ],
        subtotal: 465,
        refundAmount: 465,
        status: 'approved',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-12',
        notes: 'পণ্য ত্রুটিপূর্ণ ছিল'
      },
      {
        id: 6,
        returnNumber: 'RET-2024-006',
        originalInvoice: 'INV-2024-008',
        customerName: 'শফিকুর রহমান',
        customerPhone: '+880 1719-012345',
        date: '2024-01-11',
        time: '10:15 AM',
        reason: 'গ্রাহক সন্তুষ্ট নন',
        items: [
          { name: 'ধনিয়া গুঁড়ো', quantity: 2, unit: 'কেজি', price: 200, total: 400, returnedQuantity: 1 }
        ],
        subtotal: 200,
        refundAmount: 200,
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        notes: 'আংশিক ফেরত অনুরোধ'
      }
    ];
    
    setReturns(mockReturns);
    setFilteredReturns(mockReturns);
  }, []);

  // Filter returns based on search and filters
  useEffect(() => {
    let filtered = [...returns];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(returnItem =>
        returnItem.returnNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        returnItem.customerPhone.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(returnItem => returnItem.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(returnItem => {
        const returnDate = new Date(returnItem.date);
        returnDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return returnDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return returnDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return returnDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredReturns(filtered);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, dateFilter, returns]);

  // Calculate statistics
  const totalReturns = filteredReturns.length;
  const totalRefundAmount = filteredReturns.reduce((sum, returnItem) => sum + returnItem.refundAmount, 0);
  const approvedReturns = filteredReturns.filter(r => r.status === 'approved').length;
  const pendingReturns = filteredReturns.filter(r => r.status === 'pending').length;

  // Pagination
  const paginatedReturns = filteredReturns.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (returnItem) => {
    setSelectedReturn(returnItem);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, returnItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(returnItem.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handlePrint = (returnItem) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (returnItem) => {
    // In real app, trigger download
    console.log('Download return:', returnItem.returnNumber);
    handleMenuClose();
  };

  const handleApprove = (returnItem) => {
    // In real app, approve the return
    console.log('Approve return:', returnItem.returnNumber);
    handleMenuClose();
  };

  const handleReject = (returnItem) => {
    // In real app, reject the return
    console.log('Reject return:', returnItem.returnNumber);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'অনুমোদিত';
      case 'pending':
        return 'অপেক্ষমাণ';
      case 'rejected':
        return 'প্রত্যাখ্যাত';
      default:
        return status;
    }
  };

  const getReasonText = (reason) => {
    const reasons = {
      'পণ্য ত্রুটিপূর্ণ': 'ত্রুটিপূর্ণ',
      'গ্রাহক সন্তুষ্ট নন': 'অসন্তুষ্ট',
      'ভুল পণ্য': 'ভুল পণ্য',
      'পণ্য ক্ষতিগ্রস্ত': 'ক্ষতিগ্রস্ত'
    };
    return reasons[reason] || reason;
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ফেরত তালিকা
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
          নতুন ফেরত
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
                    মোট ফেরত
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalReturns}
                  </Typography>
                </Box>
                <ReturnsIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    মোট ফেরত পরিমাণ
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ৳{totalRefundAmount.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.7 }} />
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
                    অনুমোদিত
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {approvedReturns}
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
                    {pendingReturns}
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
              placeholder="ফেরত নম্বর, ইনভয়েস নম্বর, গ্রাহকের নাম বা ফোন দিয়ে খুঁজুন..."
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
              <option value="approved">অনুমোদিত</option>
              <option value="pending">অপেক্ষমাণ</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
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

      {/* Returns Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ফেরত নম্বর</TableCell>
              <TableCell>মূল ইনভয়েস</TableCell>
              <TableCell>গ্রাহক</TableCell>
              <TableCell>তারিখ</TableCell>
              <TableCell>কারণ</TableCell>
              <TableCell>আইটেম</TableCell>
              <TableCell>ফেরত পরিমাণ</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedReturns.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন ফেরত পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedReturns.map((returnItem) => (
                <TableRow key={returnItem.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {returnItem.returnNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {returnItem.originalInvoice}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {returnItem.customerName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {returnItem.customerPhone}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {new Date(returnItem.date).toLocaleDateString('bn-BD')}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {returnItem.time}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getReasonText(returnItem.reason)}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {returnItem.items.length} টি আইটেম
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                      ৳{returnItem.refundAmount.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(returnItem.status)}
                      color={getStatusColor(returnItem.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(returnItem)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, returnItem)}
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
      {filteredReturns.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredReturns.length / rowsPerPage)}
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
          const returnItem = returns.find(r => r.id === selectedRow);
          if (returnItem) handleView(returnItem);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        {(() => {
          const returnItem = returns.find(r => r.id === selectedRow);
          if (returnItem && returnItem.status === 'pending') {
            return (
              <>
                <MenuItem onClick={() => {
                  if (returnItem) handleApprove(returnItem);
                }}>
                  <ListItemIcon>
                    <ReturnsIcon fontSize="small" />
                  </ListItemIcon>
                  অনুমোদন করুন
                </MenuItem>
                <MenuItem onClick={() => {
                  if (returnItem) handleReject(returnItem);
                }}>
                  <ListItemIcon>
                    <ReturnsIcon fontSize="small" />
                  </ListItemIcon>
                  প্রত্যাখ্যান করুন
                </MenuItem>
              </>
            );
          }
          return null;
        })()}
        <MenuItem onClick={() => {
          const returnItem = returns.find(r => r.id === selectedRow);
          if (returnItem) handlePrint(returnItem);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const returnItem = returns.find(r => r.id === selectedRow);
          if (returnItem) handleDownload(returnItem);
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          ডাউনলোড করুন
        </MenuItem>
      </Menu>

      {/* View Return Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
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
              <ReturnsIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ফেরত বিবরণ
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedReturn && (
            <Box
              sx={{
                px: 3,
                py: 2,
                '@media print': {
                  '@page': {
                    size: 'auto',
                    margin: '0mm',
                  },
                  body: {
                    margin: 0,
                    padding: '0 10mm',
                  },
                  '#return-to-print': {
                    padding: '0 15px',
                  },
                },
              }}
              id="return-to-print"
            >
              {/* Return Header */}
              <Box
                sx={{
                  textAlign: 'center',
                  borderBottom: '2px solid',
                  borderColor: 'error.main',
                  pb: 2,
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'error.main' }}>
                  ফেরত নোটিশ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  হাবিব ট্রেডার্স
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ
                </Typography>
              </Box>

              {/* Return Details */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ফেরত নম্বর
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReturn.returnNumber}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    মূল ইনভয়েস
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReturn.originalInvoice}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    তারিখ ও সময়
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedReturn.date).toLocaleDateString('bn-BD')} {selectedReturn.time}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    স্ট্যাটাস
                  </Typography>
                  <Chip
                    label={getStatusText(selectedReturn.status)}
                    color={getStatusColor(selectedReturn.status)}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Customer Information */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  গ্রাহকের নাম:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedReturn.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedReturn.customerPhone}
                </Typography>
              </Box>

              {/* Return Reason */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  ফেরতের কারণ:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedReturn.reason}
                </Typography>
              </Box>

              {/* Items Table */}
              <TableContainer>
                <Table size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600, py: 1 }}>পণ্যের নাম</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 1 }}>ফেরত পরিমাণ</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 1 }}>দর</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, py: 1 }}>মোট</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedReturn.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ py: 1 }}>{item.name}</TableCell>
                        <TableCell align="right" sx={{ py: 1 }}>
                          {item.returnedQuantity} {item.unit}
                        </TableCell>
                        <TableCell align="right" sx={{ py: 1 }}>৳{item.price.toLocaleString('bn-BD')}</TableCell>
                        <TableCell align="right" sx={{ py: 1, fontWeight: 500 }}>৳{(item.price * item.returnedQuantity).toLocaleString('bn-BD')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Summary Section */}
              <Box sx={{ mt: 2, border: '1px solid', borderColor: 'divider', borderTop: 'none', p: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 2,
                    pt: 2,
                    borderTop: '2px solid',
                    borderColor: 'error.main',
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    ফেরত পরিমাণ:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ৳{selectedReturn.refundAmount.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
              </Box>

              {/* Approval Information */}
              {selectedReturn.status === 'approved' && selectedReturn.approvedBy && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1, opacity: 0.8 }}>
                  <Typography variant="body2" color="text.secondary">
                    অনুমোদন করেছেন:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReturn.approvedBy}
                  </Typography>
                  {selectedReturn.approvedDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      তারিখ: {new Date(selectedReturn.approvedDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  )}
                </Box>
              )}

              {selectedReturn.status === 'rejected' && selectedReturn.approvedBy && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1, opacity: 0.8 }}>
                  <Typography variant="body2" color="text.secondary">
                    প্রত্যাখ্যান করেছেন:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedReturn.approvedBy}
                  </Typography>
                  {selectedReturn.approvedDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      তারিখ: {new Date(selectedReturn.approvedDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Notes */}
              {selectedReturn.notes && (
                <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    মন্তব্য:
                  </Typography>
                  <Typography variant="body2">
                    {selectedReturn.notes}
                  </Typography>
                </Box>
              )}

              {/* Footer */}
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: '2px solid',
                  borderColor: 'error.main',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  ফেরত প্রক্রিয়াকরণে ধন্যবাদ
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  www.habibtraders.com
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid', borderColor: 'divider', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
          {selectedReturn && selectedReturn.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                onClick={() => handleReject(selectedReturn)}
              >
                প্রত্যাখ্যান
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleApprove(selectedReturn)}
                sx={{
                  background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
                  },
                }}
              >
                অনুমোদন করুন
              </Button>
            </>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              const printContent = document.getElementById('return-to-print');
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Return - ${selectedReturn?.returnNumber}</title>
                    <style>
                      @media print {
                        @page {
                          size: 80mm auto;
                          margin: 5mm;
                        }
                        body {
                          margin: 0;
                          padding: 0;
                          font-family: 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
                        }
                      }
                      body {
                        font-family: 'Kalpurush', 'SolaimanLipi', Arial, sans-serif;
                        padding: 10px 15px;
                        max-width: 80mm;
                        margin: 0 auto;
                      }
                      #return-to-print {
                        padding: 0 15px;
                      }
                      table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 12px;
                      }
                      th, td {
                        padding: 5px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                      }
                      th {
                        background-color: #f5f5f5;
                        font-weight: bold;
                      }
                      .text-right {
                        text-align: right;
                      }
                      .text-center {
                        text-align: center;
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
            onClick={() => handleDownload(selectedReturn)}
          >
            ডাউনলোড
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReturnsPage;

