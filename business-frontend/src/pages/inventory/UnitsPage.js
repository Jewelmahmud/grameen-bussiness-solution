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
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { getApiBaseUrl } from '../../config/api';

const UnitsPage = () => {
  const [units, setUnits] = useState([]);
  const [filteredUnits, setFilteredUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    baseUnit: 'গ্রাম',
    conversionFactor: 1,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fetch units from API on component mount
  useEffect(() => {
    fetchUnits();
  }, []);

  // Filter units based on search term
  useEffect(() => {
    const filtered = units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.abbreviation.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUnits(filtered);
  }, [searchTerm, units]);

  // Fetch units from API
  const fetchUnits = async () => {
    try {
      setLoading(true);
      
      // Get API base URL and access token
      const apiBaseUrl = getApiBaseUrl();
      const accessToken = localStorage.getItem('accessToken');
      
      // Get tenant_uuid and business_type_uuid from localStorage
      const tenantUuid = localStorage.getItem('tenant_uuid');
      const businessTypeUuid = localStorage.getItem('business_type_uuid');
      
      if (!tenantUuid || !businessTypeUuid) {
        throw new Error('Tenant UUID বা Business Type UUID পাওয়া যায়নি। দয়া করে আবার লগইন করুন।');
      }

      if (!accessToken) {
        throw new Error('Authentication token পাওয়া যায়নি। দয়া করে আবার লগইন করুন।');
      }

      // Build the API URL
      const apiUrl = `${apiBaseUrl}/catalog/units`;
      
      // Make API request with bearer token and query parameters
      const response = await axios.get(apiUrl, {
        params: {
          tenant_uuid: tenantUuid,
          business_type_uuid: businessTypeUuid,
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle the response - adjust based on your API response structure
      // Assuming the response structure is: { data: [...] } or { success: true, data: [...] } or just [...]
      let unitsData = [];
      
      if (Array.isArray(response.data)) {
        unitsData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        unitsData = response.data.data;
      } else if (response.data?.units && Array.isArray(response.data.units)) {
        unitsData = response.data.units;
      } else if (response.data?.success && response.data?.data) {
        unitsData = Array.isArray(response.data.data) ? response.data.data : [];
      }
      
      // Transform API data to match your component structure
      const transformedUnits = unitsData.map((unit, index) => {
        // Handle short_name JSONB field (can be object like {"en": "kg", "bn": "কেজি"} or string)
        let abbreviation = '';
        if (unit.short_name) {
          if (typeof unit.short_name === 'object') {
            // Prefer Bengali, fallback to English
            abbreviation = unit.short_name.bn || unit.short_name.en || '';
          } else {
            abbreviation = unit.short_name;
          }
        }
        
        return {
          id: unit.unit_uuid || unit.id || unit.uuid || unit._id || `unit-${index}`,
          name: unit.name || unit.name_bn || unit.display_name || '',
          abbreviation: abbreviation || unit.abbreviation || unit.code || '',
          baseUnit: unit.base_unit || unit.baseUnit || unit.base_unit_name || (unit.is_base_unit ? unit.name : '') || '',
          conversionFactor: unit.conversion_factor || unit.conversionFactor || unit.factor || 1,
          productCount: unit.product_count || unit.productCount || unit.products_count || 0,
        };
      });

      setUnits(transformedUnits);
      setFilteredUnits(transformedUnits);
      
    } catch (error) {
      console.error('Error fetching units:', error);
      
      let errorMessage = 'ইউনিট লোড করতে সমস্যা হয়েছে';
      
      if (error.response) {
        // API responded with error status
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      `API Error: ${error.response.status}`;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      
      // Keep empty array on error
      setUnits([]);
      setFilteredUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setSelectedUnit(null);
    setFormData({ name: '', abbreviation: '', baseUnit: 'গ্রাম', conversionFactor: 1 });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setFormData({
      name: unit.name,
      abbreviation: unit.abbreviation,
      baseUnit: unit.baseUnit,
      conversionFactor: unit.conversionFactor,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই ইউনিটটি মুছে ফেলতে চান?')) {
      setUnits(units.filter(unit => unit.id !== id));
      setSnackbar({ open: true, message: 'ইউনিট সফলভাবে মুছে ফেলা হয়েছে', severity: 'success' });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.abbreviation.trim()) {
      setSnackbar({ open: true, message: 'ইউনিটের নাম এবং সংক্ষিপ্ত নাম প্রয়োজন', severity: 'error' });
      return;
    }

    if (dialogMode === 'add') {
      const newUnit = {
        id: units.length + 1,
        ...formData,
        productCount: 0,
      };
      setUnits([...units, newUnit]);
      setSnackbar({ open: true, message: 'নতুন ইউনিট যোগ করা হয়েছে', severity: 'success' });
    } else {
      setUnits(units.map(unit =>
        unit.id === selectedUnit.id ? { ...unit, ...formData } : unit
      ));
      setSnackbar({ open: true, message: 'ইউনিট আপডেট করা হয়েছে', severity: 'success' });
    }
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ইউনিট সমূহ
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchUnits}
            disabled={loading}
            sx={{ minWidth: 120 }}
          >
            রিফ্রেশ
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #ea609a 0%, #eed130 100%)',
              },
            }}
          >
            নতুন ইউনিট যোগ করুন
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="ইউনিটের নাম বা সংক্ষিপ্ত নাম দিয়ে খুঁজুন..."
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
                <TableCell sx={{ fontWeight: 600 }}>ইউনিটের নাম</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>সংক্ষিপ্ত নাম</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ভিত্তি ইউনিট</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>রূপান্তর গুণনীয়ক</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>পণ্য সংখ্যা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }} color="text.secondary">
                      ইউনিট লোড হচ্ছে...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchTerm ? 'খোঁজার সাথে মিলে যাওয়া কোন ইউনিট পাওয়া যায়নি' : 'কোন ইউনিট পাওয়া যায়নি'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredUnits.map((unit) => (
                  <TableRow key={unit.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {unit.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={unit.abbreviation} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{unit.baseUnit}</TableCell>
                    <TableCell align="right">{unit.conversionFactor}</TableCell>
                    <TableCell align="center">
                      <Chip label={unit.productCount} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="সম্পাদনা">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(unit)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="মুছুন">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(unit.id)}
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
          {dialogMode === 'add' ? 'নতুন ইউনিট যোগ করুন' : 'ইউনিট সম্পাদনা করুন'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="ইউনিট নাম"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="সংক্ষিপ্ত নাম"
              value={formData.abbreviation}
              onChange={(e) => setFormData({ ...formData, abbreviation: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="ভিত্তি ইউনিট"
              value={formData.baseUnit}
              onChange={(e) => setFormData({ ...formData, baseUnit: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="রূপান্তর গুণনীয়ক"
              type="number"
              value={formData.conversionFactor}
              onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1 })}
              margin="normal"
              required
              helperText="ভিত্তি ইউনিটের সাপেক্ষে কত গুণ"
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

export default UnitsPage;

