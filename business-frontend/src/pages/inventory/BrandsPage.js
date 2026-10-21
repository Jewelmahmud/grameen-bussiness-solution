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
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Label as BrandIcon,
} from '@mui/icons-material';

const BrandsPage = () => {
  const [brands, setBrands] = useState([
    { id: 1, name: 'আরশী', logo: null, description: 'আরশী ব্র্যান্ড', productCount: 45 },
    { id: 2, name: 'প্রাণ', logo: null, description: 'প্রাণ ফুড', productCount: 32 },
    { id: 3, name: 'রুপচান্ডা', logo: null, description: 'রুপচান্ডা তেল', productCount: 28 },
    { id: 4, name: 'বিশ্বাস', logo: null, description: 'বিশ্বাস গ্রুপ', productCount: 20 },
  ]);
  const [filteredBrands, setFilteredBrands] = useState(brands);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', logo: null });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const filtered = brands.filter(brand =>
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [searchTerm, brands]);

  const handleAdd = () => {
    setSelectedBrand(null);
    setFormData({ name: '', description: '', logo: null });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleEdit = (brand) => {
    setSelectedBrand(brand);
    setFormData({ name: brand.name, description: brand.description, logo: brand.logo });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই ব্র্যান্ডটি মুছে ফেলতে চান?')) {
      setBrands(brands.filter(brand => brand.id !== id));
      setSnackbar({ open: true, message: 'ব্র্যান্ড সফলভাবে মুছে ফেলা হয়েছে', severity: 'success' });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'ব্র্যান্ডের নাম প্রয়োজন', severity: 'error' });
      return;
    }

    if (dialogMode === 'add') {
      const newBrand = {
        id: brands.length + 1,
        ...formData,
        productCount: 0,
      };
      setBrands([...brands, newBrand]);
      setSnackbar({ open: true, message: 'নতুন ব্র্যান্ড যোগ করা হয়েছে', severity: 'success' });
    } else {
      setBrands(brands.map(brand =>
        brand.id === selectedBrand.id ? { ...brand, ...formData } : brand
      ));
      setSnackbar({ open: true, message: 'ব্র্যান্ড আপডেট করা হয়েছে', severity: 'success' });
    }
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ব্র্যান্ড
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #3e9bee 0%, #00d2ee 100%)',
            },
          }}
        >
          নতুন ব্র্যান্ড যোগ করুন
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="ব্র্যান্ডের নাম বা বর্ণনা দিয়ে খুঁজুন..."
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
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>লোগো</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ব্র্যান্ডের নাম</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>বর্ণনা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>পণ্য সংখ্যা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBrands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">কোন ব্র্যান্ড পাওয়া যায়নি</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBrands.map((brand) => (
                  <TableRow key={brand.id} hover>
                    <TableCell>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%' }} />
                        ) : (
                          <BrandIcon />
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {brand.name}
                      </Typography>
                    </TableCell>
                    <TableCell>{brand.description}</TableCell>
                    <TableCell align="center">
                      <Chip label={brand.productCount} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="সম্পাদনা">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(brand)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="মুছুন">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(brand.id)}
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
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'নতুন ব্র্যান্ড যোগ করুন' : 'ব্র্যান্ড সম্পাদনা করুন'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="ব্র্যান্ডের নাম"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="বর্ণনা"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="লোগো URL"
              value={formData.logo || ''}
              onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              margin="normal"
              placeholder="https://example.com/logo.png"
            />
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

export default BrandsPage;

