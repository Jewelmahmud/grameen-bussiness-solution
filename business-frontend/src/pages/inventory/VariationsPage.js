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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

const VariationsPage = () => {
  const [variations, setVariations] = useState([
    {
      id: 1,
      name: 'আকার',
      type: 'size',
      values: ['ছোট', 'মাঝারি', 'বড়'],
      productCount: 120,
    },
    {
      id: 2,
      name: 'রঙ',
      type: 'color',
      values: ['লাল', 'নীল', 'সবুজ', 'কালো'],
      productCount: 85,
    },
    {
      id: 3,
      name: 'ওজন',
      type: 'weight',
      values: ['৫০০ গ্রাম', '১ কেজি', '২ কেজি'],
      productCount: 95,
    },
    {
      id: 4,
      name: 'ফ্লেভার',
      type: 'flavor',
      values: ['ভ্যানিলা', 'চকোলেট', 'স্ট্রবেরি'],
      productCount: 45,
    },
  ]);
  const [filteredVariations, setFilteredVariations] = useState(variations);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'size',
    values: [],
    newValue: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const filtered = variations.filter(variation =>
      variation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variation.values.some(val => val.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredVariations(filtered);
  }, [searchTerm, variations]);

  const handleAdd = () => {
    setSelectedVariation(null);
    setFormData({ name: '', type: 'size', values: [], newValue: '' });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleEdit = (variation) => {
    setSelectedVariation(variation);
    setFormData({
      name: variation.name,
      type: variation.type,
      values: [...variation.values],
      newValue: '',
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('আপনি কি এই বৈচিত্র্যটি মুছে ফেলতে চান?')) {
      setVariations(variations.filter(variation => variation.id !== id));
      setSnackbar({ open: true, message: 'বৈচিত্র্য সফলভাবে মুছে ফেলা হয়েছে', severity: 'success' });
    }
  };

  const handleAddValue = () => {
    if (formData.newValue.trim() && !formData.values.includes(formData.newValue.trim())) {
      setFormData({
        ...formData,
        values: [...formData.values, formData.newValue.trim()],
        newValue: '',
      });
    }
  };

  const handleRemoveValue = (valueToRemove) => {
    setFormData({
      ...formData,
      values: formData.values.filter(val => val !== valueToRemove),
    });
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'বৈচিত্র্যের নাম প্রয়োজন', severity: 'error' });
      return;
    }
    if (formData.values.length === 0) {
      setSnackbar({ open: true, message: 'অন্তত একটি মান যোগ করুন', severity: 'error' });
      return;
    }

    if (dialogMode === 'add') {
      const newVariation = {
        id: variations.length + 1,
        name: formData.name,
        type: formData.type,
        values: formData.values,
        productCount: 0,
      };
      setVariations([...variations, newVariation]);
      setSnackbar({ open: true, message: 'নতুন বৈচিত্র্য যোগ করা হয়েছে', severity: 'success' });
    } else {
      setVariations(variations.map(variation =>
        variation.id === selectedVariation.id
          ? { ...variation, name: formData.name, type: formData.type, values: formData.values }
          : variation
      ));
      setSnackbar({ open: true, message: 'বৈচিত্র্য আপডেট করা হয়েছে', severity: 'success' });
    }
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          ভ্যারিয়েশান
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#333',
            '&:hover': {
              background: 'linear-gradient(135deg, #98ddea 0%, #eec6d3 100%)',
            },
          }}
        >
          নতুন বৈচিত্র্য যোগ করুন
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="বৈচিত্র্যের নাম বা মান দিয়ে খুঁজুন..."
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
                <TableCell sx={{ fontWeight: 600 }}>বৈচিত্র্যের নাম</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>প্রকার</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>মানসমূহ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>পণ্য সংখ্যা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVariations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">কোন বৈচিত্র্য পাওয়া যায়নি</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredVariations.map((variation) => (
                  <TableRow key={variation.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {variation.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={variation.type} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {variation.values.map((value, idx) => (
                          <Chip key={idx} label={value} size="small" />
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={variation.productCount} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title="সম্পাদনা">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(variation)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="মুছুন">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(variation.id)}
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
          {dialogMode === 'add' ? 'নতুন বৈচিত্র্য যোগ করুন' : 'বৈচিত্র্য সম্পাদনা করুন'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="বৈচিত্র্যের নাম"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>প্রকার</InputLabel>
              <Select
                value={formData.type}
                label="প্রকার"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="size">আকার</MenuItem>
                <MenuItem value="color">রঙ</MenuItem>
                <MenuItem value="weight">ওজন</MenuItem>
                <MenuItem value="flavor">ফ্লেভার</MenuItem>
                <MenuItem value="other">অন্যান্য</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ mt: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label="মান যোগ করুন"
                  value={formData.newValue}
                  onChange={(e) => setFormData({ ...formData, newValue: e.target.value })}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddValue}
                  sx={{ minWidth: 100 }}
                >
                  যোগ করুন
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: 50, p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                {formData.values.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    কোন মান যোগ করা হয়নি
                  </Typography>
                ) : (
                  formData.values.map((value, idx) => (
                    <Chip
                      key={idx}
                      label={value}
                      onDelete={() => handleRemoveValue(value)}
                      color="primary"
                      variant="outlined"
                    />
                  ))
                )}
              </Box>
            </Box>
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

export default VariationsPage;

