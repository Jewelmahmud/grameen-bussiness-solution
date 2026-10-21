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
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  AccountBalance as AccountingIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const AccountingPage = () => {
  const [journalEntries, setJournalEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'debit', 'credit'
  const [accountFilter, setAccountFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock journal entries data
  useEffect(() => {
    const mockEntries = [
      {
        id: 1,
        entryNumber: 'JE-2024-001',
        date: '2024-01-16',
        description: 'বিক্রয় থেকে প্রাপ্তি',
        reference: 'INV-2024-001',
        account: 'নগদ',
        accountCode: '101',
        debit: 1046.50,
        credit: 0,
        type: 'debit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 2,
        entryNumber: 'JE-2024-002',
        date: '2024-01-16',
        description: 'বিক্রয় থেকে প্রাপ্তি',
        reference: 'INV-2024-001',
        account: 'বিক্রয়',
        accountCode: '401',
        debit: 0,
        credit: 1046.50,
        type: 'credit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 3,
        entryNumber: 'JE-2024-003',
        date: '2024-01-15',
        description: 'ক্রয় পেমেন্ট',
        reference: 'PO-2024-001',
        account: 'ক্রয়',
        accountCode: '501',
        debit: 2500.00,
        credit: 0,
        type: 'debit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 4,
        entryNumber: 'JE-2024-004',
        date: '2024-01-15',
        description: 'ক্রয় পেমেন্ট',
        reference: 'PO-2024-001',
        account: 'নগদ',
        accountCode: '101',
        debit: 0,
        credit: 2500.00,
        type: 'credit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 5,
        entryNumber: 'JE-2024-005',
        date: '2024-01-14',
        description: 'বেতন প্রদান',
        reference: 'PAY-2024-001',
        account: 'বেতন',
        accountCode: '601',
        debit: 15000.00,
        credit: 0,
        type: 'debit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 6,
        entryNumber: 'JE-2024-006',
        date: '2024-01-14',
        description: 'বেতন প্রদান',
        reference: 'PAY-2024-001',
        account: 'নগদ',
        accountCode: '101',
        debit: 0,
        credit: 15000.00,
        type: 'credit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 7,
        entryNumber: 'JE-2024-007',
        date: '2024-01-13',
        description: 'ভাড়া প্রদান',
        reference: 'RENT-2024-001',
        account: 'ভাড়া',
        accountCode: '602',
        debit: 5000.00,
        credit: 0,
        type: 'debit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 8,
        entryNumber: 'JE-2024-008',
        date: '2024-01-13',
        description: 'ভাড়া প্রদান',
        reference: 'RENT-2024-001',
        account: 'নগদ',
        accountCode: '101',
        debit: 0,
        credit: 5000.00,
        type: 'credit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 9,
        entryNumber: 'JE-2024-009',
        date: '2024-01-12',
        description: 'গ্রাহক থেকে প্রাপ্তি',
        reference: 'REC-2024-001',
        account: 'নগদ',
        accountCode: '101',
        debit: 5000.00,
        credit: 0,
        type: 'debit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      },
      {
        id: 10,
        entryNumber: 'JE-2024-010',
        date: '2024-01-12',
        description: 'গ্রাহক থেকে প্রাপ্তি',
        reference: 'REC-2024-001',
        account: 'প্রাপ্তিযোগ্য',
        accountCode: '201',
        debit: 0,
        credit: 5000.00,
        type: 'credit',
        createdBy: 'আব্দুল করিম',
        status: 'posted'
      }
    ];
    
    setJournalEntries(mockEntries);
    setFilteredEntries(mockEntries);
  }, []);

  // Filter entries based on search and filters
  useEffect(() => {
    let filtered = [...journalEntries];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.accountCode.includes(searchTerm)
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(entry => entry.type === typeFilter);
    }

    // Account filter
    if (accountFilter !== 'all') {
      filtered = filtered.filter(entry => entry.accountCode === accountFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      filtered = filtered.filter(entry => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        
        switch (dateFilter) {
          case 'today':
            return entryDate.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            return entryDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            return entryDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredEntries(filtered);
    setPage(1);
  }, [searchTerm, typeFilter, accountFilter, dateFilter, journalEntries]);

  // Calculate statistics
  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);
  const balance = totalDebit - totalCredit;
  const totalEntries = filteredEntries.length;

  // Get unique accounts for filter
  const accounts = [...new Set(journalEntries.map(e => `${e.accountCode} - ${e.account}`))];

  // Pagination
  const paginatedEntries = filteredEntries.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (entry) => {
    setSelectedEntry(entry);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, entry) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(entry.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handlePrint = (entry) => {
    window.print();
    handleMenuClose();
  };

  const handleDownload = (entry) => {
    console.log('Download entry:', entry?.entryNumber || 'all');
    handleMenuClose();
  };

  const handleEdit = (entry) => {
    console.log('Edit entry:', entry.entryNumber);
    handleMenuClose();
  };

  const handleDelete = (entry) => {
    console.log('Delete entry:', entry.entryNumber);
    handleMenuClose();
  };

  const getAccountTypeColor = (accountCode) => {
    const firstDigit = accountCode[0];
    switch (firstDigit) {
      case '1': return 'primary'; // Assets
      case '2': return 'error'; // Liabilities
      case '3': return 'info'; // Equity
      case '4': return 'success'; // Revenue
      case '5': return 'warning'; // Cost of Goods Sold
      case '6': return 'secondary'; // Expenses
      default: return 'default';
    }
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          হিসাবনিকাশ
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<DescriptionIcon />}
          >
            চার্ট অফ একাউন্টস
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
            নতুন জার্নাল এন্ট্রি
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
                    মোট দেনা
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                    ৳{totalDebit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <TrendingDownIcon sx={{ fontSize: 40, color: 'error.main', opacity: 0.7 }} />
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
                    মোট পাওনা
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ৳{totalCredit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
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
                    ব্যালেন্স
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: balance >= 0 ? 'info.main' : 'error.main' }}>
                    ৳{Math.abs(balance).toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                  </Typography>
                </Box>
                <AccountingIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
                    মোট এন্ট্রি
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalEntries}
                  </Typography>
                </Box>
                <DescriptionIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
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
              placeholder="এন্ট্রি নম্বর, বিবরণ, রেফারেন্স, একাউন্ট বা কোড দিয়ে খুঁজুন..."
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
              label="ধরন"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              <option value="debit">দেনা</option>
              <option value="credit">পাওনা</option>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="একাউন্ট"
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              {accounts.map((account, index) => (
                <option key={index} value={account.split(' - ')[0]}>
                  {account}
                </option>
              ))}
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
          
          <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
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

      {/* Journal Entries Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>এন্ট্রি নম্বর</TableCell>
              <TableCell>তারিখ</TableCell>
              <TableCell>বিবরণ</TableCell>
              <TableCell>রেফারেন্স</TableCell>
              <TableCell>একাউন্ট</TableCell>
              <TableCell align="right">দেনা</TableCell>
              <TableCell align="right">পাওনা</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন জার্নাল এন্ট্রি পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEntries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {entry.entryNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(entry.date).toLocaleDateString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {entry.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {entry.reference}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Chip
                        label={entry.accountCode}
                        size="small"
                        color={getAccountTypeColor(entry.accountCode)}
                        sx={{ mb: 0.5, mr: 0.5 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {entry.account}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    {entry.debit > 0 && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
                        ৳{entry.debit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {entry.credit > 0 && (
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        ৳{entry.credit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status === 'posted' ? 'পোস্ট করা' : 'খসড়া'}
                      size="small"
                      color={entry.status === 'posted' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(entry)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, entry)}
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

      {/* Summary Row */}
      {filteredEntries.length > 0 && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableBody>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell colSpan={5} align="right">
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    মোট:
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                    ৳{totalDebit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                    ৳{totalCredit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {filteredEntries.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredEntries.length / rowsPerPage)}
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
          const entry = journalEntries.find(e => e.id === selectedRow);
          if (entry) handleView(entry);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        <MenuItem onClick={() => {
          const entry = journalEntries.find(e => e.id === selectedRow);
          if (entry) handleEdit(entry);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          সম্পাদনা করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const entry = journalEntries.find(e => e.id === selectedRow);
          if (entry) handlePrint(entry);
        }}>
          <ListItemIcon>
            <PrintIcon fontSize="small" />
          </ListItemIcon>
          প্রিন্ট করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const entry = journalEntries.find(e => e.id === selectedRow);
          if (entry) handleDownload(entry);
        }}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          ডাউনলোড করুন
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          const entry = journalEntries.find(e => e.id === selectedRow);
          if (entry) handleDelete(entry);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          মুছে ফেলুন
        </MenuItem>
      </Menu>

      {/* View Entry Details Dialog */}
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
              <AccountingIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                জার্নাল এন্ট্রি বিবরণ
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedEntry && (
            <Box
              sx={{
                px: 3,
                py: 2,
                '@media print': {
                  '@page': {
                    size: 'A4',
                    margin: '10mm',
                  },
                  body: {
                    margin: 0,
                    padding: '0 10mm',
                    fontFamily: "'Kalpurush', 'SolaimanLipi', Arial, sans-serif",
                  },
                  '#entry-to-print': {
                    padding: '0 15px',
                  },
                },
              }}
              id="entry-to-print"
            >
              {/* Entry Header */}
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
                  জার্নাল এন্ট্রি
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  হাবিব ট্রেডার্স
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ধানমন্ডি, ঢাকা-১২০৫, বাংলাদেশ
                </Typography>
              </Box>

              {/* Entry Details */}
              <Grid container spacing={2} sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    এন্ট্রি নম্বর
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedEntry.entryNumber}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    তারিখ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {new Date(selectedEntry.date).toLocaleDateString('bn-BD')}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    বিবরণ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedEntry.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    রেফারেন্স
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedEntry.reference}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    স্ট্যাটাস
                  </Typography>
                  <Chip
                    label={selectedEntry.status === 'posted' ? 'পোস্ট করা' : 'খসড়া'}
                    size="small"
                    color={selectedEntry.status === 'posted' ? 'success' : 'default'}
                  />
                </Grid>
              </Grid>

              {/* Account Information */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  একাউন্ট তথ্য:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Chip
                    label={selectedEntry.accountCode}
                    size="small"
                    color={getAccountTypeColor(selectedEntry.accountCode)}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {selectedEntry.account}
                  </Typography>
                </Box>
              </Box>

              {/* Amount Information */}
              <Box sx={{ mb: 2, pb: 2, borderBottom: '1px dashed', borderColor: 'divider' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      দেনা
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main' }}>
                      {selectedEntry.debit > 0 ? `৳${selectedEntry.debit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}` : '৳০.০০'}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      পাওনা
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                      {selectedEntry.credit > 0 ? `৳${selectedEntry.credit.toLocaleString('bn-BD', { minimumFractionDigits: 2 })}` : '৳০.০০'}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Created By */}
              <Box sx={{ mb: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary">
                  তৈরি করেছেন:
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedEntry.createdBy}
                </Typography>
              </Box>

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
                  হিসাবনিকাশ ব্যবস্থাপনায় ধন্যবাদ
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
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={() => {
              const printContent = document.getElementById('entry-to-print');
              const printWindow = window.open('', '_blank');
              printWindow.document.write(`
                <html>
                  <head>
                    <title>Journal Entry - ${selectedEntry?.entryNumber}</title>
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
                      #entry-to-print {
                        padding: 0 15px;
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
            onClick={() => handleDownload(selectedEntry)}
          >
            ডাউনলোড
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AccountingPage;

