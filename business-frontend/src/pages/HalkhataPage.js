import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  IconButton,
  Divider,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  Tooltip,
  Autocomplete,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Print as PrintIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalanceWallet as WalletIcon,
  Person as PersonIcon,
  Send as GiveIcon,
  CallReceived as CollectIcon,
  Payment as PaymentIcon
} from '@mui/icons-material';

const HalkhataPage = () => {
  const [customers] = useState([
    { id: 1, name: 'রহিম মিয়া', phone: '01712345678', address: 'ঢাকা' },
    { id: 2, name: 'করিম উদ্দিন', phone: '01812345678', address: 'চট্টগ্রাম' },
    { id: 3, name: 'আবুল কালাম', phone: '01912345678', address: 'সিলেট' },
    { id: 4, name: 'মোছলেম উদ্দিন', phone: '01512345678', address: 'কুমিল্লা' },
    { id: 5, name: 'নুর ইসলাম', phone: '01612345678', address: 'রাজশাহী' },
    { id: 6, name: 'আব্দুল হক', phone: '01312345678', address: 'খুলনা' },
    { id: 7, name: 'সালাউদ্দিন', phone: '01412345678', address: 'বরিশাল' },
    { id: 8, name: 'জাহাঙ্গীর আলম', phone: '01112345678', address: 'ঢাকা' },
    { id: 9, name: 'শফিকুল ইসলাম', phone: '01212345678', address: 'চট্টগ্রাম' },
    { id: 10, name: 'ইব্রাহিম হোসেন', phone: '01012345678', address: 'সিলেট' },
  ]);

  const [entries, setEntries] = useState([
    {
      id: 1,
      customerId: 1,
      customerName: 'রহিম মিয়া',
      date: '2024-01-15',
      dena: 5000,
      pawna: 0,
      balance: 5000,
      description: 'চাল বিক্রয়'
    },
    {
      id: 2,
      customerId: 1,
      customerName: 'রহিম মিয়া',
      date: '2024-01-20',
      dena: 0,
      pawna: 3000,
      balance: 2000,
      description: 'পরিশোধ'
    },
    {
      id: 3,
      customerId: 2,
      customerName: 'করিম উদ্দিন',
      date: '2024-01-18',
      dena: 8000,
      pawna: 0,
      balance: 8000,
      description: 'ডাল বিক্রয়'
    },
    {
      id: 4,
      customerId: 2,
      customerName: 'করিম উদ্দিন',
      date: '2024-01-25',
      dena: 0,
      pawna: 5000,
      balance: 3000,
      description: 'আংশিক পরিশোধ'
    },
    {
      id: 5,
      customerId: 3,
      customerName: 'আবুল কালাম',
      date: '2024-01-12',
      dena: 12000,
      pawna: 0,
      balance: 12000,
      description: 'তেল বিক্রয়'
    },
    {
      id: 6,
      customerId: 3,
      customerName: 'আবুল কালাম',
      date: '2024-01-22',
      dena: 0,
      pawna: 12000,
      balance: 0,
      description: 'পরিশোধ'
    },
    {
      id: 7,
      customerId: 4,
      customerName: 'মোছলেম উদ্দিন',
      date: '2024-01-10',
      dena: 6000,
      pawna: 0,
      balance: 6000,
      description: 'মসলা বিক্রয়'
    },
    {
      id: 8,
      customerId: 4,
      customerName: 'মোছলেম উদ্দিন',
      date: '2024-01-28',
      dena: 0,
      pawna: 4000,
      balance: 2000,
      description: 'পরিশোধ'
    },
    {
      id: 9,
      customerId: 5,
      customerName: 'নুর ইসলাম',
      date: '2024-01-14',
      dena: 0,
      pawna: 3500,
      balance: -3500,
      description: 'অগ্রিম প্রদান'
    },
    {
      id: 10,
      customerId: 5,
      customerName: 'নুর ইসলাম',
      date: '2024-01-20',
      dena: 2500,
      pawna: 0,
      balance: -1000,
      description: 'পণ্য প্রদান'
    },
    {
      id: 11,
      customerId: 6,
      customerName: 'আব্দুল হক',
      date: '2024-01-16',
      dena: 9500,
      pawna: 0,
      balance: 9500,
      description: 'চাল ও ডাল বিক্রয়'
    },
    {
      id: 12,
      customerId: 7,
      customerName: 'সালাউদ্দিন',
      date: '2024-01-11',
      dena: 0,
      pawna: 5000,
      balance: -5000,
      description: 'অগ্রিম'
    },
    {
      id: 13,
      customerId: 7,
      customerName: 'সালাউদ্দিন',
      date: '2024-01-24',
      dena: 3000,
      pawna: 0,
      balance: -2000,
      description: 'পণ্য প্রদান'
    },
    {
      id: 14,
      customerId: 8,
      customerName: 'জাহাঙ্গীর আলম',
      date: '2024-01-13',
      dena: 7500,
      pawna: 0,
      balance: 7500,
      description: 'তেল ও মসলা'
    },
    {
      id: 15,
      customerId: 8,
      customerName: 'জাহাঙ্গীর আলম',
      date: '2024-01-26',
      dena: 0,
      pawna: 7500,
      balance: 0,
      description: 'পরিশোধ'
    },
    {
      id: 16,
      customerId: 9,
      customerName: 'শফিকুল ইসলাম',
      date: '2024-01-17',
      dena: 4500,
      pawna: 0,
      balance: 4500,
      description: 'চিনি বিক্রয়'
    },
    {
      id: 17,
      customerId: 10,
      customerName: 'ইব্রাহিম হোসেন',
      date: '2024-01-19',
      dena: 0,
      pawna: 6000,
      balance: -6000,
      description: 'অগ্রিম প্রদান'
    },
    {
      id: 18,
      customerId: 10,
      customerName: 'ইব্রাহিম হোসেন',
      date: '2024-01-27',
      dena: 4000,
      pawna: 0,
      balance: -2000,
      description: 'পণ্য প্রদান'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'dena', 'pawna'
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('give'); // 'give' or 'collect'
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Calculate customer balances - net dena/pawna (only one can exist)
  const customerBalances = customers.map(customer => {
    const customerEntries = entries.filter(e => e.customerId === customer.id);
    const totalDena = customerEntries.reduce((sum, e) => sum + (e.dena || 0), 0);
    const totalPawna = customerEntries.reduce((sum, e) => sum + (e.pawna || 0), 0);
    const balance = totalDena - totalPawna;
    
    // Calculate net dena and net pawna (only one can be non-zero)
    let netDena = 0;
    let netPawna = 0;
    
    if (balance > 0) {
      // Customer owes us (dena > pawna)
      netDena = balance;
      netPawna = 0;
    } else if (balance < 0) {
      // We owe customer (pawna > dena)
      netDena = 0;
      netPawna = Math.abs(balance);
    } else {
      // Balanced (dena = pawna)
      netDena = 0;
      netPawna = 0;
    }
    
    return {
      ...customer,
      totalDena: netDena,
      totalPawna: netPawna,
      balance
    };
  });

  const filteredCustomers = customerBalances.filter(customer => {
    // Search filter
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    // Type filter (পাওনাদার/দেনাদার)
    if (filterType === 'dena' && customer.totalDena === 0) return false;
    if (filterType === 'pawna' && customer.totalPawna === 0) return false;
    
    // Amount filter
    const amountToCheck = customer.totalDena > 0 ? customer.totalDena : customer.totalPawna;
    
    if (minAmount && parseFloat(minAmount) > 0) {
      if (amountToCheck < parseFloat(minAmount)) return false;
    }
    
    if (maxAmount && parseFloat(maxAmount) > 0) {
      if (amountToCheck > parseFloat(maxAmount)) return false;
    }
    
    return true;
  });

  // Calculate net totals (only one type per customer)
  const totalDena = customerBalances.reduce((sum, customer) => sum + customer.totalDena, 0);
  const totalPawna = customerBalances.reduce((sum, customer) => sum + customer.totalPawna, 0);
  const totalBalance = totalDena - totalPawna;

  const handleOpenDialog = (type, customer = null) => {
    setDialogType(type);
    setSelectedCustomer(customer);
    
    // Pre-fill amount with outstanding balance if customer has one
    let prefillAmount = '';
    if (customer) {
      const customerBalance = customerBalances.find(c => c.id === customer.id);
      if (customerBalance) {
        if (type === 'collect' && customerBalance.totalDena > 0) {
          // Opening for payment - pre-fill with outstanding dena
          prefillAmount = customerBalance.totalDena.toString();
        } else if (type === 'give' && customerBalance.totalPawna > 0) {
          // Opening for collection - pre-fill with outstanding pawna
          prefillAmount = customerBalance.totalPawna.toString();
        }
      }
    }
    
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: prefillAmount,
      description: '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCustomer(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
    });
  };

  const handleSaveEntry = () => {
    if (!selectedCustomer) {
      setSnackbar({ open: true, message: 'গ্রাহক নির্বাচন করুন', severity: 'error' });
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setSnackbar({ open: true, message: 'বৈধ পরিমাণ প্রদান করুন', severity: 'error' });
      return;
    }

    const amount = parseFloat(formData.amount);
    const newEntry = {
      id: Date.now(),
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: formData.date,
      dena: dialogType === 'give' ? amount : 0,
      pawna: dialogType === 'collect' ? amount : 0,
      balance: 0,
      description: formData.description
    };

    // Sort by date and recalculate balances
    const updatedEntries = [...entries, newEntry].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Recalculate balances for each customer
    const entriesWithBalances = [];
    const customerBalancesMap = {};
    
    updatedEntries.forEach(entry => {
      if (!customerBalancesMap[entry.customerId]) {
        customerBalancesMap[entry.customerId] = 0;
      }
      customerBalancesMap[entry.customerId] += (entry.dena || 0) - (entry.pawna || 0);
      entriesWithBalances.push({
        ...entry,
        balance: customerBalancesMap[entry.customerId]
      });
    });

    setEntries(entriesWithBalances);
    
    const customerBalance = customerBalances.find(c => c.id === selectedCustomer.id);
    const message = customerBalance?.totalDena > 0
      ? 'পরিশোধ সফলভাবে যোগ করা হয়েছে'
      : customerBalance?.totalPawna > 0
      ? 'কালেক্ট সফলভাবে যোগ করা হয়েছে'
      : dialogType === 'give'
      ? 'দেনা সফলভাবে যোগ করা হয়েছে'
      : 'পাওনা সফলভাবে যোগ করা হয়েছে';
    
    setSnackbar({
      open: true,
      message: message,
      severity: 'success'
    });
    
    handleCloseDialog();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          হালখাতা
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
          >
            প্রিন্ট
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog('give')}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            নতুন গ্রাহক যোগ করুন
          </Button>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    মোট দেনা
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    ৳{totalDena.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.light', width: 56, height: 56 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    মোট পাওনা
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                    ৳{totalPawna.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.light', width: 56, height: 56 }}>
                  <TrendingDownIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    মোট ব্যালেন্স
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 600, color: totalBalance >= 0 ? 'warning.main' : 'info.main' }}>
                    ৳{totalBalance.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: totalBalance >= 0 ? 'warning.light' : 'info.light', width: 56, height: 56 }}>
                  <WalletIcon />
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
              placeholder="গ্রাহকের নাম বা ফোন নম্বর দিয়ে খুঁজুন..."
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
              <InputLabel>ফিল্টার</InputLabel>
              <Select
                value={filterType}
                label="ফিল্টার"
                onChange={(e) => setFilterType(e.target.value)}
                MenuProps={{
                  disableScrollLock: true,
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="all">সকল</MenuItem>
                <MenuItem value="dena">পাওনাদার</MenuItem>
                <MenuItem value="pawna">দেনাদার</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="ন্যূনতম পরিমাণ"
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">৳</InputAdornment>
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="সর্বোচ্চ পরিমাণ"
              type="number"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start">৳</InputAdornment>
              }}
            />
          </Grid>
        </Grid>
        {(filterType !== 'all' || minAmount || maxAmount) && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setFilterType('all');
                setMinAmount('');
                setMaxAmount('');
              }}
            >
              ফিল্টার রিসেট করুন
            </Button>
          </Box>
        )}
      </Paper>

      {/* Customers Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>গ্রাহকের নাম</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>দেনা</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>পাওনা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      কোন গ্রাহক পাওয়া যায়নি
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                          {customer.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {customer.totalDena > 0 ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ৳{customer.totalDena.toLocaleString('bn-BD')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {customer.totalPawna > 0 ? (
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                          ৳{customer.totalPawna.toLocaleString('bn-BD')}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {customer.totalDena > 0 || customer.totalPawna > 0 ? (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          {customer.totalDena > 0 ? (
                            // Customer owes us (has dena) - show পরিশোধ button (add pawna to settle)
                            <Tooltip title="পরিশোধ">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<PaymentIcon />}
                                onClick={() => handleOpenDialog('collect', customer)}
                                sx={{
                                  bgcolor: '#42a5f5',
                                  '&:hover': { bgcolor: '#1976d2' },
                                  minWidth: 120
                                }}
                              >
                                পরিশোধ
                              </Button>
                            </Tooltip>
                          ) : (
                            // We owe customer (has pawna) - show কালেক্ট button (add dena to settle)
                            <Tooltip title="কালেক্ট">
                              <Button
                                variant="contained"
                                size="small"
                                startIcon={<CollectIcon />}
                                onClick={() => handleOpenDialog('give', customer)}
                                sx={{
                                  bgcolor: '#4caf50',
                                  '&:hover': { bgcolor: '#388e3c' },
                                  minWidth: 120
                                }}
                              >
                                কালেক্ট
                              </Button>
                            </Tooltip>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Give/Collect Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
        PaperProps={{
          sx: {
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {dialogType === 'give' ? (
              <GiveIcon color="primary" />
            ) : (
              <PaymentIcon color="warning" />
            )}
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {selectedCustomer?.totalDena > 0 
                ? 'টাকা পরিষোধ  করুন' 
                : selectedCustomer?.totalPawna > 0 
                ? 'টাকা কালেক্ট করুন'
                : dialogType === 'give' 
                ? 'দেনা পরিষোধ  করুন' 
                : 'পাওনা সংগ্রহ করুন'}
            </Typography>
          </Box>
          <IconButton
            onClick={handleCloseDialog}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) => option.name}
              value={selectedCustomer}
              onChange={(event, newValue) => setSelectedCustomer(newValue)}
              disablePortal={false}
              ListboxProps={{
                style: { maxHeight: 300 }
              }}
              componentsProps={{
                popper: {
                  style: { zIndex: 1400 }
                }
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="গ্রাহক নির্বাচন করুন"
                  required
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.main' }}>
                      {option.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.phone}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            />
            <TextField
              label="তারিখ"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label={
                selectedCustomer?.totalDena > 0
                  ? 'পরিশোধের পরিমাণ'
                  : selectedCustomer?.totalPawna > 0
                  ? 'কালেক্টের পরিমাণ'
                  : dialogType === 'give'
                  ? 'দেনার পরিমাণ'
                  : 'পাওনার পরিমাণ'
              }
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              fullWidth
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>৳</Typography>
              }}
            />
            <TextField
              label="বিবরণ (ঐচ্ছিক)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">
            বাতিল
          </Button>
          <Button
            onClick={handleSaveEntry}
            variant="contained"
            sx={{
              background: dialogType === 'give' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              '&:hover': {
                background: dialogType === 'give'
                  ? 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)'
                  : 'linear-gradient(135deg, #0f8980 0%, #2edf6d 100%)',
              },
            }}
          >
            {selectedCustomer?.totalDena > 0 
              ? 'পরিষোধ করুন' 
              : selectedCustomer?.totalPawna > 0 
              ? 'কালেক্ট করুন'
              : 'সংরক্ষণ করুন'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HalkhataPage;
