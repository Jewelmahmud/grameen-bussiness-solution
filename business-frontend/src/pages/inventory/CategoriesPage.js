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
  SubdirectoryArrowRight as SubCategoryIcon,
  Folder as FolderIcon,
} from '@mui/icons-material';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'খাদ্যশস্য', description: 'ধান, চাল, গম', productCount: 320, color: '#4CAF50', parentId: null },
    { id: 2, name: 'ডাল', description: 'বিভিন্ন ধরনের ডাল', productCount: 180, color: '#FF9800', parentId: null },
    { id: 3, name: 'মসলা', description: 'হলুদ, জিরা, ধনিয়া', productCount: 95, color: '#F44336', parentId: null },
    { id: 4, name: 'তেল', description: 'সরিষার তেল, সয়াবিন তেল', productCount: 75, color: '#9C27B0', parentId: null },
    { id: 5, name: 'খাবার', description: 'বিভিন্ন প্রকার খাবার', productCount: 120, color: '#2196F3', parentId: null },
    { id: 6, name: 'চাল', description: 'বাসমতি, নাজিরশাইল', productCount: 150, color: '#4CAF50', parentId: 1 },
    { id: 7, name: 'গম', description: 'গমের আটা, সুজি', productCount: 85, color: '#4CAF50', parentId: 1 },
    { id: 8, name: 'মসুর ডাল', description: 'সাধারণ মসুর ডাল', productCount: 95, color: '#FF9800', parentId: 2 },
    { id: 9, name: 'ছোলা', description: 'ভাজা ছোলা, কাঁচা ছোলা', productCount: 60, color: '#FF9800', parentId: 2 },
    { id: 10, name: 'হলুদ', description: 'হলুদ গুঁড়ো', productCount: 45, color: '#F44336', parentId: 3 },
    { id: 11, name: 'জিরা', description: 'জিরা গুঁড়ো, গোটা জিরা', productCount: 35, color: '#F44336', parentId: 3 },
  ]);
  const [filteredCategories, setFilteredCategories] = useState(categories);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all', 'main', 'sub'
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#4CAF50', parentId: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter by category type (main or sub)
    if (categoryFilter === 'main') {
      filtered = filtered.filter(cat => cat.parentId === null);
    } else if (categoryFilter === 'sub') {
      filtered = filtered.filter(cat => cat.parentId !== null);
    }

    setFilteredCategories(filtered);
  }, [searchTerm, categories, categoryFilter]);

  // Get parent category name
  const getParentName = (parentId) => {
    if (!parentId) return null;
    const parent = categories.find(cat => cat.id === parentId);
    return parent ? parent.name : null;
  };

  // Check if category has sub-categories
  const hasSubCategories = (categoryId) => {
    return categories.some(cat => cat.parentId === categoryId);
  };

  // Get all main categories for dropdown
  const getMainCategories = () => {
    return categories.filter(cat => cat.parentId === null);
  };

  const handleAdd = () => {
    setSelectedCategory(null);
    setFormData({ name: '', description: '', color: '#4CAF50', parentId: '' });
    setDialogMode('add');
    setOpenDialog(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      parentId: category.parentId || '',
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const handleDelete = (id) => {
    // Check if it has sub-categories
    if (hasSubCategories(id)) {
      setSnackbar({
        open: true,
        message: 'এই বিভাগের উপ-বিভাগ আছে। প্রথমে উপ-বিভাগগুলো মুছুন।',
        severity: 'error',
      });
      return;
    }

    if (window.confirm('আপনি কি এই বিভাগটি মুছে ফেলতে চান?')) {
      setCategories(categories.filter(cat => cat.id !== id));
      setSnackbar({ open: true, message: 'বিভাগ সফলভাবে মুছে ফেলা হয়েছে', severity: 'success' });
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      setSnackbar({ open: true, message: 'বিভাগের নাম প্রয়োজন', severity: 'error' });
      return;
    }

    // Validate parent selection - can't set itself as parent
    if (dialogMode === 'edit' && formData.parentId && parseInt(formData.parentId) === selectedCategory.id) {
      setSnackbar({ open: true, message: 'বিভাগ নিজেই নিজের মাতৃ-বিভাগ হতে পারে না', severity: 'error' });
      return;
    }

    if (dialogMode === 'add') {
      const newCategory = {
        id: Math.max(...categories.map(c => c.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        color: formData.color,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        productCount: 0,
      };
      setCategories([...categories, newCategory]);
      setSnackbar({ open: true, message: 'নতুন বিভাগ যোগ করা হয়েছে', severity: 'success' });
    } else {
      setCategories(categories.map(cat =>
        cat.id === selectedCategory.id
          ? {
              ...cat,
              name: formData.name,
              description: formData.description,
              color: formData.color,
              parentId: formData.parentId ? parseInt(formData.parentId) : null,
            }
          : cat
      ));
      setSnackbar({ open: true, message: 'বিভাগ আপডেট করা হয়েছে', severity: 'success' });
    }
    setOpenDialog(false);
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          পন্য ক্যাটাগরি
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #e084ea 0%, #e5475c 100%)',
            },
          }}
        >
          নতুন বিভাগ যোগ করুন
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            fullWidth
            placeholder="বিভাগের নাম বা বর্ণনা দিয়ে খুঁজুন..."
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
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>ফিল্টার</InputLabel>
            <Select
              value={categoryFilter}
              label="ফিল্টার"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <MenuItem value="all">সকল বিভাগ</MenuItem>
              <MenuItem value="main">মূল বিভাগ</MenuItem>
              <MenuItem value="sub">উপ-বিভাগ</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.100' }}>
                <TableCell sx={{ fontWeight: 600 }}>বিভাগের নাম</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>ধরন</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>মাতৃ-বিভাগ</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>বর্ণনা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>পণ্য সংখ্যা</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>রঙ</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>কার্যক্রম</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">কোন বিভাগ পাওয়া যায়নি</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => {
                  const isSubCategory = category.parentId !== null;
                  const parentName = getParentName(category.parentId);
                  
                  return (
                    <TableRow key={category.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: isSubCategory ? 3 : 0 }}>
                          {isSubCategory && (
                            <SubCategoryIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                          )}
                          <Box
                            sx={{
                              width: 24,
                              height: 24,
                              borderRadius: '4px',
                              backgroundColor: category.color,
                            }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {category.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={isSubCategory ? <SubCategoryIcon /> : <FolderIcon />}
                          label={isSubCategory ? 'উপ-বিভাগ' : 'মূল বিভাগ'}
                          size="small"
                          color={isSubCategory ? 'secondary' : 'primary'}
                          variant={isSubCategory ? 'outlined' : 'filled'}
                        />
                      </TableCell>
                      <TableCell>
                        {parentName ? (
                          <Chip label={parentName} size="small" variant="outlined" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell align="center">
                        <Chip label={category.productCount} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: '4px',
                            backgroundColor: category.color,
                            margin: '0 auto',
                            border: '1px solid #ddd',
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Tooltip title="সম্পাদনা">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(category)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="মুছুন">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(category.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'নতুন বিভাগ যোগ করুন' : 'বিভাগ সম্পাদনা করুন'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="বিভাগের নাম"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>মাতৃ-বিভাগ (ঐচ্ছিক)</InputLabel>
              <Select
                value={formData.parentId || ''}
                label="মাতৃ-বিভাগ (ঐচ্ছিক)"
                onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
              >
                <MenuItem value="">মূল বিভাগ (কোনো মাতৃ-বিভাগ নেই)</MenuItem>
                {getMainCategories()
                  .filter(cat => !selectedCategory || cat.id !== selectedCategory.id)
                  .map((cat) => (
                    <MenuItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
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
              label="রঙ"
              type="color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              margin="normal"
              InputLabelProps={{ shrink: true }}
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

export default CategoriesPage;

