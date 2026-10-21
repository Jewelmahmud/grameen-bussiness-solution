import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Checkbox,
  FormControlLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  InputAdornment
} from '@mui/material';
import {
  Mail as MailIcon,
  WhatsApp as WhatsAppIcon,
  Send as SendIcon,
  Search as SearchIcon,
  Preview as PreviewIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const HalkhataInvitationPage = () => {
  
  // Sample customers data (should come from props or context)
  const [customers] = useState([
    { id: 1, name: 'রহিম মিয়া', phone: '01712345678', address: 'ঢাকা', totalDena: 2000, totalPawna: 0 },
    { id: 2, name: 'করিম উদ্দিন', phone: '01812345678', address: 'চট্টগ্রাম', totalDena: 3000, totalPawna: 0 },
    { id: 3, name: 'আবুল কালাম', phone: '01912345678', address: 'সিলেট', totalDena: 0, totalPawna: 0 },
    { id: 4, name: 'মোছলেম উদ্দিন', phone: '01512345678', address: 'কুমিল্লা', totalDena: 2000, totalPawna: 0 },
    { id: 5, name: 'নুর ইসলাম', phone: '01612345678', address: 'রাজশাহী', totalDena: 0, totalPawna: 1000 },
  ]);

  const [messageTemplate, setMessageTemplate] = useState(
    `প্রিয় {{customer_name}},
আসসালামু আলাইকুম। নতুন বছরের শুভ সূচনাকে কেন্দ্র করে আমাদের প্রতিষ্ঠানে হালখাতা আয়োজন করা হয়েছে। আপনার সহযোগিতা ও আস্থার প্রতি কৃতজ্ঞতা জানিয়ে আমরা এই অনুষ্ঠানে আপনার উপস্থিতি একান্তভাবে কামনা করছি।

তারিখ: {{date}}
সময়: {{time}}
স্থান: আমার প্রতিষ্ঠান প্রঙ্গন

আপনার আগমন একান্তভাবে কাম্য ।

— হাবিব ট্রেডার্স`
  );
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewDialog, setPreviewDialog] = useState(false);
  const [sendDialog, setSendDialog] = useState(false);
  const [sendMethod, setSendMethod] = useState('sms'); // 'sms' or 'whatsapp'
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [sending, setSending] = useState(false);

  // Available variables
  const availableVariables = [
    { key: 'customer_name', label: 'গ্রাহকের নাম', example: 'রহিম মিয়া' },
    { key: 'amount', label: 'পরিমাণ', example: '৫,০০০' },
    { key: 'date', label: 'তারিখ', example: '১৫ জানুয়ারি, ২০২৪' },
    { key: 'time', label: 'সময়', example: 'সকাল ১০টা' },
  ];

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    
    if (!matchesSearch) return false;
    
    if (filterType === 'dena' && customer.totalDena === 0) return false;
    if (filterType === 'pawna' && customer.totalPawna === 0) return false;
    
    return true;
  });

  // Handle select all
  const handleSelectAll = (event) => {
    setSelectAll(event.target.checked);
    if (event.target.checked) {
      setSelectedCustomers(filteredCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  // Handle individual customer selection
  const handleCustomerSelect = (customerId) => {
    if (selectedCustomers.includes(customerId)) {
      setSelectedCustomers(selectedCustomers.filter(id => id !== customerId));
      setSelectAll(false);
    } else {
      setSelectedCustomers([...selectedCustomers, customerId]);
      if (selectedCustomers.length + 1 === filteredCustomers.length) {
        setSelectAll(true);
      }
    }
  };

  // Replace variables in message
  const replaceVariables = (template, customer) => {
    const balance = customer.totalDena > 0 ? customer.totalDena : customer.totalPawna;
    const date = new Date().toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    // Default time if not set (can be made configurable)
    const time = 'সকাল ১০টা';
    
    return template
      .replace(/{{customer_name}}/g, customer.name)
      .replace(/{{amount}}/g, `৳${balance.toLocaleString('bn-BD')}`)
      .replace(/{{date}}/g, date)
      .replace(/{{time}}/g, time);
  };

  // Get preview message for a customer
  const getPreviewMessage = (customer) => {
    return replaceVariables(messageTemplate, customer);
  };

  // Insert variable into message
  const insertVariable = (variable) => {
    const textarea = document.getElementById('message-template');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = messageTemplate.substring(0, start) + 
                   `{{${variable}}}${messageTemplate.substring(end)}`;
      setMessageTemplate(text);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    } else {
      setMessageTemplate(messageTemplate + `{{${variable}}}`);
    }
  };

  // Handle send
  const handleSend = async () => {
    if (selectedCustomers.length === 0) {
      setSnackbar({ open: true, message: 'অনুগ্রহ করে অন্তত একজন গ্রাহক নির্বাচন করুন', severity: 'error' });
      return;
    }

    setSending(true);
    
    try {
      // Simulate sending
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const selectedCustomerData = customers.filter(c => selectedCustomers.includes(c.id));
      console.log('Sending invitations:', {
        method: sendMethod,
        customers: selectedCustomerData,
        messageTemplate
      });
      
      setSnackbar({ 
        open: true, 
        message: `${selectedCustomers.length} জন গ্রাহকের কাছে আমন্ত্রণ পাঠানো হয়েছে`, 
        severity: 'success' 
      });
      
      setSendDialog(false);
      setSelectedCustomers([]);
      setSelectAll(false);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'আমন্ত্রণ পাঠাতে সমস্যা হয়েছে', 
        severity: 'error' 
      });
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedCustomers, filteredCustomers]);

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          হালখাতা আমন্ত্রণ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewDialog(true)}
          >
            প্রিভিউ
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Message Template Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              বার্তা টেমপ্লেট
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              ব্যবহারযগ্য ভ্যারিয়েবল:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {availableVariables.map((variable) => (
                  <Chip
                    key={variable.key}
                    label={`{{${variable.key}}}`}
                    onClick={() => insertVariable(variable.key)}
                    size="small"
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            <TextField
              id="message-template"
              label="বার্তা"
              multiline
              rows={10}
              fullWidth
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              placeholder="আপনার বার্তা এখানে লিখুন..."
              sx={{ mb: 2 }}
            />

            <Alert severity="info" sx={{ mb: 2 }}>
              টিপ: ভ্যারিয়েবল যোগ করতে উপরের চিপগুলিতে ক্লিক করুন। প্রতিটি গ্রাহকের জন্য ভ্যারিয়েবল স্বয়ংক্রিয়ভাবে প্রতিস্থাপিত হবে।
            </Alert>
          </Paper>
        </Grid>

        {/* Customer Selection Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              গ্রাহক নির্বাচন করুন
            </Typography>

            {/* Filters */}
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="খুঁজুন..."
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
              
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>ফিল্টার</InputLabel>
                <Select
                  value={filterType}
                  label="ফিল্টার"
                  onChange={(e) => setFilterType(e.target.value)}
                  MenuProps={{
                    disableScrollLock: true,
                  }}
                >
                  <MenuItem value="all">সকল</MenuItem>
                  <MenuItem value="dena">পাওনাদার</MenuItem>
                  <MenuItem value="pawna">দেনাদার</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Customer List */}
            <Box sx={{ maxHeight: 500, overflowY: 'auto' }}>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  }
                  label="সকল নির্বাচন করুন"
                />
                <Chip
                  label={`${selectedCustomers.length} জন নির্বাচিত`}
                  color="primary"
                  size="small"
                />
              </Box>

              {filteredCustomers.map((customer) => {
                const balance = customer.totalDena > 0 ? customer.totalDena : customer.totalPawna;
                const isSelected = selectedCustomers.includes(customer.id);
                
                return (
                  <Card
                    key={customer.id}
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : 'grey.300',
                      bgcolor: isSelected ? 'primary.light' : 'white',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.light' : 'grey.50',
                      },
                    }}
                    onClick={() => handleCustomerSelect(customer.id)}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleCustomerSelect(customer.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {customer.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {customer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {customer.phone}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            ৳{balance.toLocaleString('bn-BD')}
                          </Typography>
                          <Chip
                            label={customer.totalDena > 0 ? 'পাওনাদার' : customer.totalPawna > 0 ? 'দেনাদার' : 'ব্যালেন্স'}
                            size="small"
                            color={customer.totalDena > 0 ? 'warning' : customer.totalPawna > 0 ? 'info' : 'default'}
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Send Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                fullWidth
                onClick={() => setSendDialog(true)}
                disabled={selectedCustomers.length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
                  },
                }}
              >
                SMS পাঠান
              </Button>
              <Button
                variant="contained"
                startIcon={<WhatsAppIcon />}
                fullWidth
                onClick={() => {
                  setSendMethod('whatsapp');
                  setSendDialog(true);
                }}
                disabled={selectedCustomers.length === 0}
                sx={{
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #1eb855 0%, #0f7a6d 100%)',
                  },
                }}
              >
                WhatsApp পাঠান
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialog}
        onClose={() => setPreviewDialog(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">বার্তা প্রিভিউ</Typography>
            <IconButton onClick={() => setPreviewDialog(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filteredCustomers.slice(0, 3).map((customer) => (
              <Card key={customer.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {customer.name.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {customer.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {customer.phone}
                      </Typography>
                    </Box>
                  </Box>
                  <Paper
                    sx={{
                      p: 2,
                      bgcolor: 'grey.50',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {getPreviewMessage(customer)}
                  </Paper>
                </CardContent>
              </Card>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialog(false)}>বন্ধ করুন</Button>
        </DialogActions>
      </Dialog>

      {/* Send Confirmation Dialog */}
      <Dialog
        open={sendDialog}
        onClose={() => !sending && setSendDialog(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {sendMethod === 'sms' ? 'SMS পাঠান' : 'WhatsApp পাঠান'}
            </Typography>
            <IconButton 
              onClick={() => setSendDialog(false)} 
              size="small"
              disabled={sending}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            আপনি কি {selectedCustomers.length} জন গ্রাহকের কাছে আমন্ত্রণ পাঠাতে চান?
          </Typography>
          <Alert severity="warning">
            এই কার্যক্রমটি বাতিল করা যাবে না। অনুগ্রহ করে নিশ্চিত করুন।
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSendDialog(false)} disabled={sending}>
            বাতিল
          </Button>
          <Button
            onClick={handleSend}
            variant="contained"
            disabled={sending}
            startIcon={sending ? null : sendMethod === 'sms' ? <MailIcon /> : <WhatsAppIcon />}
            sx={{
              background: sendMethod === 'sms' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
              '&:hover': {
                background: sendMethod === 'sms'
                  ? 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)'
                  : 'linear-gradient(135deg, #1eb855 0%, #0f7a6d 100%)',
              },
            }}
          >
            {sending ? 'পাঠানো হচ্ছে...' : 'পাঠান'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
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

export default HalkhataInvitationPage;
