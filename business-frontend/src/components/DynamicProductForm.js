import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  Scale as ScaleIcon
} from '@mui/icons-material';
import { 
  getStoreTypeConfig, 
  getCategoriesForStoreType, 
  getUnitsForStoreType,
  getSubCategoriesForCategory,
  getUnitsForCategory
} from '../config/storeTypeConfig';

const DynamicProductForm = ({ storeType, language = 'bn', onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    nameEn: '',
    sku: '',
    category: '',
    subCategory: '',
    price: '',
    unit: '',
    stockLevel: '',
    reorderPoint: '',
    description: '',
    brand: '',
    weight: '',
    dimensions: '',
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Get store type configuration
  const storeConfig = getStoreTypeConfig(storeType);
  const categories = getCategoriesForStoreType(storeType);
  const defaultUnits = getUnitsForStoreType(storeType);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    // Auto-generate SKU when category and subcategory are selected
    if (formData.category && formData.subCategory) {
      const categoryCode = formData.category.substring(0, 3).toUpperCase();
      const subCategoryCode = formData.subCategory.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setFormData(prev => ({
        ...prev,
        sku: `${categoryCode}-${subCategoryCode}-${randomNum}`
      }));
    }
  }, [formData.category, formData.subCategory]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear related fields when category changes
    if (field === 'category') {
      setFormData(prev => ({ 
        ...prev, 
        category: value, 
        subCategory: '', 
        unit: '' 
      }));
    }
    
    // Clear subcategory when it changes
    if (field === 'subCategory') {
      setFormData(prev => ({ 
        ...prev, 
        subCategory: value, 
        unit: '' 
      }));
    }

    // Clear validation errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAddTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === 'bn' ? 'পণ্যের নাম প্রয়োজন' : 'Product name is required';
    }
    
    if (!formData.category) {
      newErrors.category = language === 'bn' ? 'ক্যাটেগরি নির্বাচন করুন' : 'Please select a category';
    }
    
    if (!formData.subCategory) {
      newErrors.subCategory = language === 'bn' ? 'উপ-ক্যাটেগরি নির্বাচন করুন' : 'Please select a sub-category';
    }
    
    if (!formData.price || formData.price <= 0) {
      newErrors.price = language === 'bn' ? 'সঠিক মূল্য দিন' : 'Please enter a valid price';
    }
    
    if (!formData.unit) {
      newErrors.unit = language === 'bn' ? 'মাপের ইউনিট নির্বাচন করুন' : 'Please select a unit';
    }
    
    if (!formData.stockLevel || formData.stockLevel < 0) {
      newErrors.stockLevel = language === 'bn' ? 'সঠিক স্টক লেভেল দিন' : 'Please enter a valid stock level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({
        name: '',
        nameEn: '',
        sku: '',
        category: '',
        subCategory: '',
        price: '',
        unit: '',
        stockLevel: '',
        reorderPoint: '',
        description: '',
        brand: '',
        weight: '',
        dimensions: '',
        tags: []
      });
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      nameEn: '',
      sku: '',
      category: '',
      subCategory: '',
      price: '',
      unit: '',
      stockLevel: '',
      reorderPoint: '',
      description: '',
      brand: '',
      weight: '',
      dimensions: '',
      tags: []
    });
    setErrors({});
  };

  const translations = {
    bn: {
      title: 'নতুন পণ্য যোগ করুন',
      subtitle: 'আপনার দোকানের জন্য নতুন পণ্য যোগ করুন',
      basicInfo: 'মৌলিক তথ্য',
      pricing: 'মূল্য ও স্টক',
      additional: 'অতিরিক্ত তথ্য',
      name: 'পণ্যের নাম (বাংলা)',
      nameEn: 'পণ্যের নাম (ইংরেজি)',
      sku: 'SKU',
      category: 'ক্যাটেগরি',
      subCategory: 'উপ-ক্যাটেগরি',
      price: 'মূল্য (৳)',
      unit: 'মাপের ইউনিট',
      stockLevel: 'বর্তমান স্টক',
      reorderPoint: 'রিঅর্ডার পয়েন্ট',
      description: 'বিবরণ',
      brand: 'ব্র্যান্ড',
      weight: 'ওজন',
      dimensions: 'মাত্রা',
      tags: 'ট্যাগ',
      addTag: 'ট্যাগ যোগ করুন',
      submit: 'পণ্য সংরক্ষণ করুন',
      reset: 'ফর্ম রিসেট করুন',
      loading: 'সংরক্ষণ হচ্ছে...',
      selectCategory: 'ক্যাটেগরি নির্বাচন করুন',
      selectSubCategory: 'উপ-ক্যাটেগরি নির্বাচন করুন',
      selectUnit: 'মাপের ইউনিট নির্বাচন করুন'
    },
    en: {
      title: 'Add New Product',
      subtitle: 'Add a new product to your store',
      basicInfo: 'Basic Information',
      pricing: 'Pricing & Stock',
      additional: 'Additional Information',
      name: 'Product Name (Bengali)',
      nameEn: 'Product Name (English)',
      sku: 'SKU',
      category: 'Category',
      subCategory: 'Sub-Category',
      price: 'Price (৳)',
      unit: 'Unit',
      stockLevel: 'Current Stock',
      reorderPoint: 'Reorder Point',
      description: 'Description',
      brand: 'Brand',
      weight: 'Weight',
      dimensions: 'Dimensions',
      tags: 'Tags',
      addTag: 'Add Tag',
      submit: 'Save Product',
      reset: 'Reset Form',
      loading: 'Saving...',
      selectCategory: 'Select Category',
      selectSubCategory: 'Select Sub-Category',
      selectUnit: 'Select Unit'
    }
  };

  const t = translations[language];

  if (!storeConfig) {
    return (
      <Alert severity="error">
        Invalid store type: {storeType}
      </Alert>
    );
  }

  // Get available subcategories and units based on selected category
  const availableSubCategories = formData.category 
    ? getSubCategoriesForCategory(storeType, formData.category)
    : [];
  
  const availableUnits = formData.category 
    ? getUnitsForCategory(storeType, formData.category)
    : defaultUnits;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            {t.title}
          </Typography>
          <Typography variant="body1" color="textSecondary">
            {storeConfig.name[language]} • {t.subtitle}
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CategoryIcon sx={{ mr: 1 }} />
                {t.basicInfo}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.name}
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.nameEn}
                    value={formData.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.sku}
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                    helperText={language === 'bn' ? 'স্বয়ংক্রিয়ভাবে তৈরি হবে' : 'Will be generated automatically'}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.category} required>
                    <InputLabel>{t.category}</InputLabel>
                    <Select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      label={t.category}
                    >
                      {categories.map((category, index) => (
                        <MenuItem key={index} value={category.name[language]}>
                          {category.name[language]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.subCategory} required>
                    <InputLabel>{t.subCategory}</InputLabel>
                    <Select
                      value={formData.subCategory}
                      onChange={(e) => handleInputChange('subCategory', e.target.value)}
                      label={t.subCategory}
                      disabled={!formData.category}
                    >
                      {availableSubCategories.map((subCat, index) => (
                        <MenuItem key={index} value={subCat[language]}>
                          {subCat[language]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.unit} required>
                    <InputLabel>{t.unit}</InputLabel>
                    <Select
                      value={formData.unit}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      label={t.unit}
                      disabled={!formData.category}
                    >
                      {availableUnits.map((unit, index) => (
                        <MenuItem key={index} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Pricing & Stock */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ScaleIcon sx={{ mr: 1 }} />
                {t.pricing}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.price}
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                    error={!!errors.price}
                    helperText={errors.price}
                    required
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.stockLevel}
                    type="number"
                    value={formData.stockLevel}
                    onChange={(e) => handleInputChange('stockLevel', parseInt(e.target.value))}
                    error={!!errors.stockLevel}
                    helperText={errors.stockLevel}
                    required
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.reorderPoint}
                    type="number"
                    value={formData.reorderPoint}
                    onChange={(e) => handleInputChange('reorderPoint', parseInt(e.target.value))}
                    inputProps={{ min: 0 }}
                    helperText={language === 'bn' ? 'কখন পুনরায় অর্ডার দিতে হবে' : 'When to reorder'}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t.additional}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t.description}
                    multiline
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.brand}
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t.weight}
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ৫০০ গ্রাম' : 'e.g., 500g'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t.dimensions}
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: ১০ x ৫ x ২ সেমি' : 'e.g., 10 x 5 x 2 cm'}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      {t.tags}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        size="small"
                        placeholder={t.addTag}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag(e.target.value);
                            e.target.value = '';
                          }
                        }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const input = document.querySelector('input[placeholder="' + t.addTag + '"]');
                          if (input && input.value) {
                            handleAddTag(input.value);
                            input.value = '';
                          }
                        }}
                      >
                        {t.addTag}
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          onDelete={() => handleRemoveTag(tag)}
                          deleteIcon={<DeleteIcon />}
                        />
                      ))}
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SaveIcon />}
              disabled={loading}
            >
              {loading ? t.loading : t.submit}
            </Button>
            
            <Button
              type="button"
              variant="outlined"
              size="large"
              startIcon={<ClearIcon />}
              onClick={handleReset}
              disabled={loading}
            >
              {t.reset}
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default DynamicProductForm;
