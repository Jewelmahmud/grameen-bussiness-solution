import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CreditCard as CardIcon,
  AccountBalance as BankIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as DateIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import multiBankPOSService from '../../services/multiBankPOSService';

const mockTransactions = [
  {
    id: 'TXN001',
    bankId: 'dbbl',
    bankName: 'Dutch-Bangla Bank',
    amount: 1500.00,
    cardType: 'nexus',
    cardNumber: '****1234',
    status: 'success',
    transactionId: 'DBBL123456789',
    approvalCode: '123456',
    timestamp: '2024-01-15T10:30:00Z',
    merchantId: 'MERCH001',
    terminalId: 'TERM001'
  },
  {
    id: 'TXN002',
    bankId: 'citybank',
    bankName: 'City Bank',
    amount: 2500.00,
    cardType: 'mastercard',
    cardNumber: '****5678',
    status: 'success',
    transactionId: 'CITY987654321',
    approvalCode: '654321',
    timestamp: '2024-01-15T11:15:00Z',
    merchantId: 'MERCH001',
    terminalId: 'TERM002'
  },
  {
    id: 'TXN003',
    bankId: 'islamibank',
    bankName: 'Islami Bank Bangladesh',
    amount: 800.00,
    cardType: 'visa',
    cardNumber: '****9012',
    status: 'pending',
    transactionId: 'IBBL456789123',
    approvalCode: null,
    timestamp: '2024-01-15T12:00:00Z',
    merchantId: 'MERCH001',
    terminalId: 'TERM003'
  },
  {
    id: 'TXN004',
    bankId: 'bracbank',
    bankName: 'BRAC Bank',
    amount: 3200.00,
    cardType: 'unionpay',
    cardNumber: '****3456',
    status: 'failed',
    transactionId: 'BRAC789123456',
    approvalCode: null,
    timestamp: '2024-01-15T13:45:00Z',
    merchantId: 'MERCH001',
    terminalId: 'TERM004'
  }
];

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedBank, setSelectedBank] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadTransactions = useCallback(async () => {
    try {
      // In real app, this would fetch from API
      // For now, using mock data
      setTransactions(mockTransactions);
      
      // Test multi-bank service functionality
      const banks = multiBankPOSService.getSupportedBanks();
      console.log('Multi-bank POS service loaded successfully:', banks.length, 'banks supported');
      
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setSnackbar({
        open: true,
        message: 'লেনদেন লোড করতে ব্যর্থ',
        severity: 'error'
      });
    }
  }, []);

  const filterTransactions = useCallback(() => {
    let filtered = [...transactions];

    // Filter by bank
    if (selectedBank !== 'all') {
      filtered = filtered.filter(txn => txn.bankId === selectedBank);
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(txn => txn.status === statusFilter);
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(txn => new Date(txn.timestamp) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(txn => new Date(txn.timestamp) <= endDate);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(txn => 
        txn.transactionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        txn.cardNumber.includes(searchTerm) ||
        txn.bankName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  }, [transactions, selectedBank, statusFilter, startDate, endDate, searchTerm]);

  useEffect(() => {
    loadTransactions();
    // Test multi-bank service
    console.log('Supported banks:', multiBankPOSService.getSupportedBanks());
    console.log('All card types:', multiBankPOSService.getAllSupportedCardTypes());
  }, [loadTransactions]);

  useEffect(() => {
    filterTransactions();
  }, [filterTransactions]);

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionDetails(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <SuccessIcon color="success" />;
      case 'failed': return <ErrorIcon color="error" />;
      case 'pending': return <PendingIcon color="warning" />;
      default: return <PendingIcon />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'success': return 'সফল';
      case 'failed': return 'ব্যর্থ';
      case 'pending': return 'অপেক্ষমান';
      default: return 'অজানা';
    }
  };

  const getCardTypeText = (cardType) => {
    const cardTypes = {
      nexus: 'Nexus',
      mastercard: 'MasterCard',
      visa: 'Visa',
      unionpay: 'UnionPay',
      amex: 'American Express'
    };
    return cardTypes[cardType] || cardType;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('bn-BD');
  };

  const formatAmount = (amount) => {
    return `৳${amount.toFixed(2)}`;
  };

  const handleExportTransactions = () => {
    // Export functionality would go here
    setSnackbar({
      open: true,
      message: 'লেনদেন রিপোর্ট ডাউনলোড করা হয়েছে',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        <ReceiptIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
        লেনদেনের ইতিহাস
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">মোট লেনদেন</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {filteredTransactions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SuccessIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="h6">সফল</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {filteredTransactions.filter(t => t.status === 'success').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">ব্যর্থ</Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {filteredTransactions.filter(t => t.status === 'failed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <MoneyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">মোট মূল্য</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatAmount(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="অনুসন্ধান করুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>ব্যাংক</InputLabel>
              <Select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                label="ব্যাংক"
              >
                <MenuItem value="all">সব ব্যাংক</MenuItem>
                {multiBankPOSService.getSupportedBanks().map((bank) => (
                  <MenuItem key={bank.id} value={bank.id}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>স্ট্যাটাস</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="স্ট্যাটাস"
              >
                <MenuItem value="all">সব স্ট্যাটাস</MenuItem>
                <MenuItem value="success">সফল</MenuItem>
                <MenuItem value="failed">ব্যর্থ</MenuItem>
                <MenuItem value="pending">অপেক্ষমান</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="শুরুর তারিখ"
              type="date"
              value={startDate ? startDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              placeholder="শেষের তারিখ"
              type="date"
              value={endDate ? endDate.toISOString().split('T')[0] : ''}
              onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadTransactions}
                size="small"
              >
                রিফ্রেশ
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportTransactions}
                size="small"
              >
                রিপোর্ট
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Transactions Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>লেনদেন আইডি</TableCell>
                <TableCell>ব্যাংক</TableCell>
                <TableCell>কার্ড টাইপ</TableCell>
                <TableCell>কার্ড নম্বর</TableCell>
                <TableCell align="right">পরিমাণ</TableCell>
                <TableCell>স্ট্যাটাস</TableCell>
                <TableCell>তারিখ</TableCell>
                <TableCell align="center">অ্যাকশন</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {transaction.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: multiBankPOSService.getBank(transaction.bankId)?.color || '#ccc',
                            mr: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          {multiBankPOSService.getBank(transaction.bankId)?.shortName || 'N/A'}
                        </Box>
                        {transaction.bankName}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<CardIcon />}
                        label={getCardTypeText(transaction.cardType)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{transaction.cardNumber}</TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatAmount(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={getStatusIcon(transaction.status)}
                        label={getStatusText(transaction.status)}
                        color={getStatusColor(transaction.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(transaction.timestamp)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="বিস্তারিত দেখুন">
                        <IconButton
                          size="small"
                          onClick={() => handleViewTransaction(transaction)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredTransactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="প্রতি পৃষ্ঠায় সারি:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
        />
      </Paper>

      {/* Transaction Details Dialog */}
      <Dialog
        open={showTransactionDetails}
        onClose={() => setShowTransactionDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 1 }} />
            লেনদেনের বিস্তারিত
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Alert severity={getStatusColor(selectedTransaction.status)}>
                  <Typography variant="h6">
                    {getStatusText(selectedTransaction.status)}
                  </Typography>
                </Alert>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <ReceiptIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="লেনদেন আইডি"
                      secondary={selectedTransaction.transactionId}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <BankIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="ব্যাংক"
                      secondary={selectedTransaction.bankName}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="কার্ড টাইপ"
                      secondary={getCardTypeText(selectedTransaction.cardType)}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <CardIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="কার্ড নম্বর"
                      secondary={selectedTransaction.cardNumber}
                    />
                  </ListItem>
                </List>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <MoneyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="পরিমাণ"
                      secondary={formatAmount(selectedTransaction.amount)}
                    />
                  </ListItem>
                  
                  {selectedTransaction.approvalCode && (
                    <ListItem>
                      <ListItemIcon>
                        <SuccessIcon />
                      </ListItemIcon>
                      <ListItemText
                        primary="অনুমোদন কোড"
                        secondary={selectedTransaction.approvalCode}
                      />
                    </ListItem>
                  )}
                  
                  <ListItem>
                    <ListItemIcon>
                      <DateIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="তারিখ"
                      secondary={formatDate(selectedTransaction.timestamp)}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <TimeIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary="সময়"
                      secondary={new Date(selectedTransaction.timestamp).toLocaleTimeString('bn-BD')}
                    />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransactionDetails(false)}>
            বন্ধ করুন
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Alert
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        sx={{ position: 'fixed', bottom: 16, right: 16, zIndex: 9999 }}
      >
        {snackbar.message}
      </Alert>
    </Box>
  );
};

export default TransactionHistory; 