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
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  VerifiedUser as WarrantyIcon,
  Add as AddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Build as BuildIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const WarrantyPage = () => {
  const [warranties, setWarranties] = useState([]);
  const [filteredWarranties, setFilteredWarranties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved', 'in_progress', 'completed', 'rejected'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [selectedWarranty, setSelectedWarranty] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock warranty data
  useEffect(() => {
    const mockWarranties = [
      {
        id: 1,
        warrantyNumber: 'WAR-2024-001',
        originalInvoice: 'INV-2024-001',
        customerName: 'রহিম উদ্দিন',
        customerPhone: '+880 1712-345678',
        productName: 'বাসমতি চাল',
        productSerial: 'RICE-001-2024',
        purchaseDate: '2024-01-10',
        warrantyPeriod: '6 মাস',
        claimDate: '2024-01-16',
        time: '10:30 AM',
        issueDescription: 'পণ্যের গুণগত মান ভালো নয়',
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        resolution: null,
        serviceCenter: null,
        estimatedCost: null,
        actualCost: null,
        completedDate: null,
        notes: 'গ্রাহক অভিযোগ করেছেন যে পণ্যের মান ভালো নয়'
      },
      {
        id: 2,
        warrantyNumber: 'WAR-2024-002',
        originalInvoice: 'INV-2024-003',
        customerName: 'মহম্মদ আলী',
        customerPhone: '+880 1714-567890',
        productName: 'হলুদ গুঁড়ো',
        productSerial: 'SPICE-004-2024',
        purchaseDate: '2024-01-12',
        warrantyPeriod: '3 মাস',
        claimDate: '2024-01-15',
        time: '02:45 PM',
        issueDescription: 'পণ্য ক্ষতিগ্রস্ত',
        status: 'approved',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-15',
        resolution: 'মেরামত',
        serviceCenter: 'মূল সেবা কেন্দ্র',
        estimatedCost: 500,
        actualCost: 450,
        completedDate: null,
        notes: 'পণ্য মেরামতের জন্য অনুমোদিত'
      },
      {
        id: 3,
        warrantyNumber: 'WAR-2024-003',
        originalInvoice: 'INV-2024-004',
        customerName: 'ফজলুল হক',
        customerPhone: '+880 1715-678901',
        productName: 'বাসমতি চাল',
        productSerial: 'RICE-001-2024',
        purchaseDate: '2024-01-08',
        warrantyPeriod: '6 মাস',
        claimDate: '2024-01-14',
        time: '04:20 PM',
        issueDescription: 'পণ্য ত্রুটিপূর্ণ',
        status: 'in_progress',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-14',
        resolution: 'প্রতিস্থাপন',
        serviceCenter: 'মূল সেবা কেন্দ্র',
        estimatedCost: 1200,
        actualCost: null,
        completedDate: null,
        notes: 'পণ্য প্রতিস্থাপনের প্রক্রিয়া চলছে'
      },
      {
        id: 4,
        warrantyNumber: 'WAR-2024-004',
        originalInvoice: 'INV-2024-007',
        customerName: 'ইকবাল আহমেদ',
        customerPhone: '+880 1718-901234',
        productName: 'মসুর ডাল',
        productSerial: 'DAL-002-2024',
        purchaseDate: '2024-01-05',
        warrantyPeriod: '3 মাস',
        claimDate: '2024-01-13',
        time: '11:15 AM',
        issueDescription: 'পণ্য ব্যবহারযোগ্য নয়',
        status: 'completed',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-13',
        resolution: 'প্রতিস্থাপন',
        serviceCenter: 'মূল সেবা কেন্দ্র',
        estimatedCost: 360,
        actualCost: 360,
        completedDate: '2024-01-15',
        notes: 'পণ্য সফলভাবে প্রতিস্থাপন করা হয়েছে'
      },
      {
        id: 5,
        warrantyNumber: 'WAR-2024-005',
        originalInvoice: 'INV-2024-002',
        customerName: 'করিম উদ্দিন',
        customerPhone: '+880 1713-456789',
        productName: 'চিনি',
        productSerial: 'SUGAR-003-2024',
        purchaseDate: '2024-01-11',
        warrantyPeriod: '3 মাস',
        claimDate: '2024-01-12',
        time: '09:30 AM',
        issueDescription: 'পণ্য নিম্নমানের',
        status: 'rejected',
        approvedBy: 'আব্দুল করিম',
        approvedDate: '2024-01-12',
        resolution: null,
        serviceCenter: null,
        estimatedCost: null,
        actualCost: null,
        completedDate: null,
        notes: 'ওয়ারেন্টি মেয়াদ শেষ হয়ে গেছে'
      },
      {
        id: 6,
        warrantyNumber: 'WAR-2024-006',
        originalInvoice: 'INV-2024-008',
        customerName: 'শফিকুর রহমান',
        customerPhone: '+880 1719-012345',
        productName: 'ধনিয়া গুঁড়ো',
        productSerial: 'SPICE-008-2024',
        purchaseDate: '2024-01-09',
        warrantyPeriod: '3 মাস',
        claimDate: '2024-01-11',
        time: '03:00 PM',
        issueDescription: 'পণ্য ত্রুটিপূর্ণ',
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        resolution: null,
        serviceCenter: null,
        estimatedCost: null,
        actualCost: null,
        completedDate: null,
        notes: 'নতুন ওয়ারেন্টি দাবি'
      }
    ];
    
    setWarranties(mockWarranties);
    setFilteredWarranties(mockWarranties);
  }, []);

  // Filter warranties based on search and filters
  useEffect(() => {
    let filtered = [...warranties];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(warranty =>
        warranty.warrantyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.customerPhone.includes(searchTerm) ||
        warranty.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        warranty.productSerial.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(warranty => warranty.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(warranty => {
        const claimDate = new Date(warranty.claimDate);
        claimDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return claimDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return claimDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return claimDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredWarranties(filtered);
    setPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, dateFilter, warranties]);

  // Calculate statistics
  const totalWarranties = filteredWarranties.length;
  const pendingWarranties = filteredWarranties.filter(w => w.status === 'pending').length;
  const inProgressWarranties = filteredWarranties.filter(w => w.status === 'in_progress').length;
  const completedWarranties = filteredWarranties.filter(w => w.status === 'completed').length;
  // Pagination
  const paginatedWarranties = filteredWarranties.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (warranty) => {
    setSelectedWarranty(warranty);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, warranty) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(warranty.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handlePrint = (warranty) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (warranty) => {
    // In real app, trigger download
    console.log('Download warranty:', warranty.warrantyNumber);
    handleMenuClose();
  };

  const handleApprove = (warranty) => {
    // In real app, approve the warranty claim
    console.log('Approve warranty:', warranty.warrantyNumber);
    handleMenuClose();
  };

  const handleReject = (warranty) => {
    // In real app, reject the warranty claim
    console.log('Reject warranty:', warranty.warrantyNumber);
    handleMenuClose();
  };

  const handleComplete = (warranty) => {
    // In real app, mark warranty as completed
    console.log('Complete warranty:', warranty.warrantyNumber);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'approved':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'default';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'সম্পন্ন';
      case 'approved':
        return 'অনুমোদিত';
      case 'in_progress':
        return 'চলমান';
      case 'pending':
        return 'অপেক্ষমাণ';
      case 'rejected':
        return 'প্রত্যাখ্যাত';
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" />;
      case 'approved':
        return <WarrantyIcon fontSize="small" />;
      case 'in_progress':
        return <BuildIcon fontSize="small" />;
      case 'pending':
        return <WarningIcon fontSize="small" />;
      case 'rejected':
        return <CancelIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const isWarrantyExpired = (warranty) => {
    const purchaseDate = new Date(warranty.purchaseDate);
    const warrantyMonths = parseInt(warranty.warrantyPeriod);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + warrantyMonths);
    return new Date() > expiryDate;
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ওয়ারেন্টি ও গ্যারান্টি
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
          নতুন ওয়ারেন্টি দাবি
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
                    মোট দাবি
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalWarranties}
                  </Typography>
                </Box>
                <WarrantyIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    {pendingWarranties}
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
                    চলমান
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'info.main' }}>
                    {inProgressWarranties}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main', opacity: 0.7 }}>
                  <BuildIcon />
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
                    সম্পন্ন
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {completedWarranties}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', opacity: 0.7 }}>
                  ✓
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
              placeholder="ওয়ারেন্টি নম্বর, ইনভয়েস, গ্রাহক, পণ্য বা সিরিয়াল নম্বর দিয়ে খুঁজুন..."
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
              <option value="pending">অপেক্ষমাণ</option>
              <option value="approved">অনুমোদিত</option>
              <option value="in_progress">চলমান</option>
              <option value="completed">সম্পন্ন</option>
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

      {/* Warranty Claims Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ওয়ারেন্টি নম্বর</TableCell>
              <TableCell>মূল ইনভয়েস</TableCell>
              <TableCell>গ্রাহক</TableCell>
              <TableCell>পণ্য</TableCell>
              <TableCell>ক্রয় তারিখ</TableCell>
              <TableCell>দাবি তারিখ</TableCell>
              <TableCell>ওয়ারেন্টি মেয়াদ</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedWarranties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন ওয়ারেন্টি দাবি পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedWarranties.map((warranty) => {
                const expired = isWarrantyExpired(warranty);
                return (
                  <TableRow key={warranty.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {warranty.warrantyNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {warranty.originalInvoice}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {warranty.customerName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {warranty.customerPhone}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {warranty.productName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {warranty.productSerial}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(warranty.purchaseDate).toLocaleDateString('bn-BD')}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {new Date(warranty.claimDate).toLocaleDateString('bn-BD')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {warranty.time}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={warranty.warrantyPeriod}
                        size="small"
                        variant="outlined"
                        color={expired ? 'error' : 'default'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(warranty.status)}
                        label={getStatusText(warranty.status)}
                        color={getStatusColor(warranty.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="দেখুন">
                        <IconButton
                          size="small"
                          onClick={() => handleView(warranty)}
                          color="primary"
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, warranty)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredWarranties.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredWarranties.length / rowsPerPage)}
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
          const warranty = warranties.find(w => w.id === selectedRow);
          if (warranty) handleView(warranty);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        {(() => {
          const warranty = warranties.find(w => w.id === selectedRow);
          if (warranty && warranty.status === 'pending') {
            return (
              <>
                <MenuItem onClick={() => {
                  if (warranty) handleApprove(warranty);
                }}>
                  <ListItemIcon>
                    <CheckCircleIcon fontSize="small" />
                  </ListItemIcon>
                  অনুমোদন করুন
                </MenuItem>
                <MenuItem onClick={() => {
                  if (warranty) handleReject(warranty);
                }}>
                  <ListItemIcon>
                    <CancelIcon fontSize="small" />
                  </ListItemIcon>
                  প্রত্যাখ্যান করুন
                </MenuItem>
              </>
            );
          }
          if (warranty && (warranty.status === 'approved' || warranty.status === 'in_progress')) {
            return (
              <MenuItem onClick={() => {
                if (warranty) handleComplete(warranty);
              }}>
                <ListItemIcon>
                  <CheckCircleIcon fontSize="small" />
                </ListItemIcon>
                সম্পন্ন করুন
              </MenuItem>
            );
          }
          return null;
        })()}
        <MenuItem onClick={() => {
          const warranty = warranties.find(w => w.id === selectedRow);
          if (warranty) handlePrint(warranty);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const warranty = warranties.find(w => w.id === selectedRow);
          if (warranty) handleDownload(warranty);
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          ডাউনলোড করুন
        </MenuItem>
      </Menu>

      {/* View Warranty Details Dialog */}
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
              <WarrantyIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                ওয়ারেন্টি দাবি বিবরণ
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedWarranty && (
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
                  '#warranty-to-print': {
                    padding: '0 15px',
                  },
                },
              }}
              id="warranty-to-print"
            >
              {/* Warranty Header */}
              <Box
                sx={{
                  textAlign: 'center',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 2,
                  mb: 2,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
                  ওয়ারেন্টি দাবি
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  হাবিব ট্রেডার্স
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ
                </Typography>
              </Box>

              {/* Warranty Details */}
              <Grid container spacing={2} sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    ওয়ারেন্টি নম্বর
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedWarranty.warrantyNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    মূল ইনভয়েস
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedWarranty.originalInvoice}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    দাবি তারিখ ও সময়
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedWarranty.claimDate).toLocaleDateString('bn-BD')} {selectedWarranty.time}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    স্ট্যাটাস
                  </Typography>
                  <Chip
                    icon={getStatusIcon(selectedWarranty.status)}
                    label={getStatusText(selectedWarranty.status)}
                    color={getStatusColor(selectedWarranty.status)}
                    size="small"
                  />
                </Grid>
              </Grid>

              {/* Customer Information */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  গ্রাহকের তথ্য:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedWarranty.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedWarranty.customerPhone}
                </Typography>
              </Box>

              {/* Product Information */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  পণ্যের তথ্য:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {selectedWarranty.productName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  সিরিয়াল নম্বর: {selectedWarranty.productSerial}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ক্রয় তারিখ:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {new Date(selectedWarranty.purchaseDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      ওয়ারেন্টি মেয়াদ:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedWarranty.warrantyPeriod}
                    </Typography>
                  </Box>
                </Box>
                {isWarrantyExpired(selectedWarranty) && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    ওয়ারেন্টি মেয়াদ শেষ হয়ে গেছে
                  </Alert>
                )}
              </Box>

              {/* Issue Description */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  সমস্যার বিবরণ:
                </Typography>
                <Typography variant="body1">
                  {selectedWarranty.issueDescription}
                </Typography>
              </Box>

              {/* Resolution Information */}
              {selectedWarranty.status !== 'pending' && selectedWarranty.status !== 'rejected' && (
                <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    সমাধান:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    {selectedWarranty.resolution}
                  </Typography>
                  {selectedWarranty.serviceCenter && (
                    <Typography variant="body2" color="text.secondary">
                      সেবা কেন্দ্র: {selectedWarranty.serviceCenter}
                    </Typography>
                  )}
                  {selectedWarranty.estimatedCost && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      আনুমানিক খরচ: ৳{selectedWarranty.estimatedCost.toLocaleString('bn-BD')}
                    </Typography>
                  )}
                  {selectedWarranty.actualCost && (
                    <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
                      প্রকৃত খরচ: ৳{selectedWarranty.actualCost.toLocaleString('bn-BD')}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Approval Information */}
              {selectedWarranty.approvedBy && (
                <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    {selectedWarranty.status === 'rejected' ? 'প্রত্যাখ্যান করেছেন:' : 'অনুমোদন করেছেন:'}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedWarranty.approvedBy}
                  </Typography>
                  {selectedWarranty.approvedDate && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      তারিখ: {new Date(selectedWarranty.approvedDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  )}
                </Box>
              )}

              {/* Completion Information */}
              {selectedWarranty.status === 'completed' && selectedWarranty.completedDate && (
                <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary">
                    সম্পন্ন হয়েছে:
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedWarranty.completedDate).toLocaleDateString('bn-BD')}
                  </Typography>
                </Box>
              )}

              {/* Notes */}
              {selectedWarranty.notes && (
                <Box sx={{ mb: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    মন্তব্য:
                  </Typography>
                  <Typography variant="body2">
                    {selectedWarranty.notes}
                  </Typography>
                </Box>
              )}

              {/* Footer */}
              <Box
                sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: '2px solid',
                  borderColor: 'primary.main',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                  ওয়ারেন্টি প্রক্রিয়াকরণে ধন্যবাদ
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
          {selectedWarranty && selectedWarranty.status === 'pending' && (
            <>
              <Button
                variant="outlined"
                color="error"
                startIcon={<CancelIcon />}
                onClick={() => handleReject(selectedWarranty)}
              >
                প্রত্যাখ্যান
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckCircleIcon />}
                onClick={() => handleApprove(selectedWarranty)}
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
          {selectedWarranty && (selectedWarranty.status === 'approved' || selectedWarranty.status === 'in_progress') && (
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              onClick={() => handleComplete(selectedWarranty)}
              sx={{
                background: 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #43a047 0%, #1b5e20 100%)',
                },
              }}
            >
              সম্পন্ন করুন
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              const printContent = document.getElementById('warranty-to-print');
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Warranty - ${selectedWarranty?.warrantyNumber}</title>
                    <style>
                      @media print {
                        @page {
                          size: A4;
                          margin: 10mm;
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
                      }
                      #warranty-to-print {
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
            onClick={() => handleDownload(selectedWarranty)}
          >
            ডাউনলোড
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarrantyPage;

