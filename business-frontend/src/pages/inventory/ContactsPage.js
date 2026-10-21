import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Snackbar,
  Alert,
  Tooltip,
  Chip,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as BuyerIcon,
  Store as SellerIcon,
} from '@mui/icons-material';

const ContactsPage = () => {
  const [contacts, setContacts] = useState([
    {
      id: 1,
      name: 'রফিকুল ইসলাম',
      type: 'seller',
      phone: '01712345678',
      email: 'rafik@example.com',
      address: 'ঢাকা, বাংলাদেশ',
      company: 'রফিক ট্রেডিং',
      totalOrders: 45,
      totalAmount: 125000,
      status: 'active',
    },
    {
      id: 2,
      name: 'করিম আহমেদ',
      type: 'buyer',
      phone: '01812345679',
      email: 'karim@example.com',
      address: 'চট্টগ্রাম, বাংলাদেশ',
      company: 'করিম স্টোর',
      totalOrders: 32,
      totalAmount: 98000,
      status: 'active',
    },
    {
      id: 3,
      name: 'সালমা খাতুন',
      type: 'seller',
      phone: '01912345680',
      email: 'salma@example.com',
      address: 'সিলেট, বাংলাদেশ',
      company: 'সালমা ইন্ডাস্ট্রিজ',
      totalOrders: 78,
      totalAmount: 215000,
      status: 'active',
    },
    {
      id: 4,
      name: 'আনোয়ার হোসেন',
      type: 'buyer',
      phone: '01612345681',
      email: 'anwar@example.com',
      address: 'রাজশাহী, বাংলাদেশ',
      company: null,
      totalOrders: 15,
      totalAmount: 45000,
      status: 'active',
    },
    {
      id: 5,
      name: 'ফাতেমা বেগম',
      type: 'seller',
      phone: '01512345682',
      email: 'fatema@example.com',
      address: 'খুলনা, বাংলাদেশ',
      company: 'ফাতেমা ট্রেডিং',
      totalOrders: 56,
      totalAmount: 178000,
      status: 'inactive',
    },
  ]);

  const [filteredContacts, setFilteredContacts] = useState(contacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive'
  const [tabValue, setTabValue] = useState(0); // 0: all, 1: sellers, 2: buyers
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'buyer',
    phone: '',
    email: '',
    address: '',
    company: '',
    status: 'active',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let filtered = contacts;

    // Filter by type (seller/buyer)
    if (tabValue === 1) {
      filtered = filtered.filter(contact => contact.type === 'seller');
    } else if (tabValue === 2) {
      filtered = filtered.filter(contact => contact.type === 'buyer');
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(contact => contact.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.phone.includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
        contact.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredContacts(filtered);
  }, [searchTerm, contacts, tabValue, statusFilter]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAdd = () => {
    setSelectedContact(null);
    setFormData({
      name: '',
      type: tabValue === 1 ? 'seller' : tabValue === 2 ? 'buyer' : 'buyer',
      phone: '',
      email: '',
      address: '',
      company: '',
      status: 'active',
    });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      type: contact.type,
      phone: contact.phone,
      email: contact.email,
      address: contact.address,
      company: contact.company || '',
      status: contact.status,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই পরিচিতিটি মুছে ফেলতে চান?')) {
      setContacts(contacts.filter(contact => contact.id !== id));
      setSnackbar({ open: true, message: 'পরিচিতি সফলভাবে মুছে ফেলা হয়েছে', severity: 'success' });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      setSnackbar({ open: true, message: 'নাম এবং ফোন নম্বর প্রয়োজন', severity: 'error' });
      return;
    }

    if (dialogMode === 'add') {
      const newContact = {
        id: Math.max(...contacts.map(c => c.id), 0) + 1,
        ...formData,
        company: formData.company || null,
        totalOrders: 0,
        totalAmount: 0,
      };
      setContacts([...contacts, newContact]);
      setSnackbar({ open: true, message: 'নতুন পরিচিতি যোগ করা হয়েছে', severity: 'success' });
    } else {
      setContacts(contacts.map(contact =>
        contact.id === selectedContact.id ? { ...contact, ...formData } : contact
      ));
      setSnackbar({ open: true, message: 'পরিচিতি আপডেট করা হয়েছে', severity: 'success' });
    }
    setOpenDialog(false);
  };

  const getStats = () => {
    const sellers = contacts.filter(c => c.type === 'seller');
    const buyers = contacts.filter(c => c.type === 'buyer');
    const active = contacts.filter(c => c.status === 'active');
    
    return {
      total: contacts.length,
      sellers: sellers.length,
      buyers: buyers.length,
      active: active.length,
    };
  };

  const stats = getStats();

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          পরিচিতি
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            },
          }}
        >
          নতুন পরিচিতি যোগ করুন
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                মোট পরিচিতি
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                বিক্রেতা
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.sellers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                ক্রেতা
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.buyers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="body2" gutterBottom>
                সক্রিয়
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.active}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label={`সকল (${contacts.length})`} />
          <Tab label={`বিক্রেতা (${stats.sellers})`} icon={<SellerIcon />} iconPosition="start" />
          <Tab label={`ক্রেতা (${stats.buyers})`} icon={<BuyerIcon />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="নাম, ফোন, ইমেইল বা ঠিকানা দিয়ে খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1, minWidth: 200 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>স্ট্যাটাস</InputLabel>
            <Select
              value={statusFilter}
              label="স্ট্যাটাস"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">সকল</MenuItem>
              <MenuItem value="active">সক্রিয়</MenuItem>
              <MenuItem value="inactive">নিষ্ক্রিয়</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>পরিচিতি</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ধরন</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>যোগাযোগ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ঠিকানা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>মোট অর্ডার</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>মোট মূল্য</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>স্ট্যাটাস</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredContacts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">কোন পরিচিতি পাওয়া যায়নি</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredContacts.map((contact) => (
                  <TableRow key={contact.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ bgcolor: contact.type === 'seller' ? 'primary.main' : 'secondary.main' }}>
                          {contact.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {contact.name}
                          </Typography>
                          {contact.company && (
                            <Typography variant="caption" color="text.secondary">
                              {contact.company}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={contact.type === 'seller' ? <SellerIcon /> : <BuyerIcon />}
                        label={contact.type === 'seller' ? 'বিক্রেতা' : 'ক্রেতা'}
                        size="small"
                        color={contact.type === 'seller' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <PhoneIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="body2">{contact.phone}</Typography>
                        </Box>
                        {contact.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {contact.email}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {contact.address}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={contact.totalOrders} size="small" />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        ৳{contact.totalAmount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={contact.status === 'active' ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                        size="small"
                        color={contact.status === 'active' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="সম্পাদনা">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(contact)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="মুছুন">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(contact.id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'নতুন পরিচিতি যোগ করুন' : 'পরিচিতি সম্পাদনা করুন'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="নাম *"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>ধরন *</InputLabel>
                  <Select
                    value={formData.type}
                    label="ধরন *"
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <MenuItem value="seller">বিক্রেতা</MenuItem>
                    <MenuItem value="buyer">ক্রেতা</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ফোন নম্বর *"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ইমেইল"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="কোম্পানির নাম"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>স্ট্যাটাস</InputLabel>
                  <Select
                    value={formData.status}
                    label="স্ট্যাটাস"
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <MenuItem value="active">সক্রিয়</MenuItem>
                    <MenuItem value="inactive">নিষ্ক্রিয়</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="ঠিকানা"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>বাতিল</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            সংরক্ষণ করুন
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ContactsPage;

