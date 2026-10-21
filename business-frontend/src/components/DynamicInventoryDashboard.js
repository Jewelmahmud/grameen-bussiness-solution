import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  Inventory as InventoryIcon,
  ShoppingCart as ShoppingCartIcon,
  BarChart as BarChartIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Category as CategoryIcon,
  Scale as ScaleIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { 
  getStoreTypeConfig, 
  getCategoriesForStoreType, 
  getUnitsForStoreType 
} from '../config/storeTypeConfig';

const AppBarStyled = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
  position: 'fixed',
  zIndex: theme.zIndex.drawer + 1,
}));

const DynamicInventoryDashboard = ({ storeType, language = 'bn' }) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [inventoryData, setInventoryData] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalValue: 0,
    recentProducts: [],
    stockUtilization: 0
  });
  const [loading, setLoading] = useState(false);

  // Get store type configuration
  const storeConfig = getStoreTypeConfig(storeType);
  const categories = getCategoriesForStoreType(storeType);
  const defaultUnits = getUnitsForStoreType(storeType);

  useEffect(() => {
    if (storeType) {
      loadInventoryData();
    }
  }, [storeType]);

  const loadInventoryData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockData = {
        totalProducts: Math.floor(Math.random() * 1000) + 100,
        lowStockItems: Math.floor(Math.random() * 50) + 10,
        outOfStockItems: Math.floor(Math.random() * 20) + 5,
        totalValue: Math.floor(Math.random() * 1000000) + 100000,
        stockUtilization: Math.floor(Math.random() * 30) + 70,
        recentProducts: generateMockProducts(categories, defaultUnits)
      };
      
      setInventoryData(mockData);
    } catch (error) {
      console.error('Error loading inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockProducts = (categories, units) => {
    const products = [];
    categories.forEach((category, index) => {
      const subCategory = category.subCategories[0];
      const unit = category.units[0] || units[0];
      
      products.push({
        id: index + 1,
        name: subCategory.bn,
        sku: `${category.name.en.toUpperCase()}-${index + 1}`,
        stockLevel: Math.floor(Math.random() * 100) + 10,
        reorderPoint: 20,
        status: Math.random() > 0.7 ? 'low_stock' : 'in_stock',
        category: category.name.bn,
        price: Math.floor(Math.random() * 500) + 50,
        unit: unit
      });
    });
    return products;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'success';
      case 'low_stock': return 'warning';
      case 'out_of_stock': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    const translations = {
      bn: {
        in_stock: 'স্টকে আছে',
        low_stock: 'কম স্টক',
        out_of_stock: 'স্টক নেই'
      },
      en: {
        in_stock: 'In Stock',
        low_stock: 'Low Stock',
        out_of_stock: 'Out of Stock'
      }
    };
    return translations[language][status] || status;
  };

  const translations = {
    bn: {
      title: 'ইনভেন্টরি ড্যাশবোর্ড',
      dashboard: 'ড্যাশবোর্ড',
      products: 'পণ্যসমূহ',
      categories: 'ক্যাটেগরি',
      analytics: 'বিশ্লেষণ',
      settings: 'সেটিংস',
      addProduct: 'পণ্য যোগ করুন',
      totalProducts: 'মোট পণ্য',
      lowStock: 'কম স্টক',
      outOfStock: 'স্টক নেই',
      totalValue: 'মোট মূল্য',
      stockUtilization: 'স্টক ব্যবহার',
      recentProducts: 'সাম্প্রতিক পণ্য',
      productName: 'পণ্যের নাম',
      sku: 'SKU',
      stockLevel: 'স্টক লেভেল',
      category: 'ক্যাটেগরি',
      price: 'মূল্য',
      unit: 'ইউনিট',
      status: 'অবস্থা'
    },
    en: {
      title: 'Inventory Dashboard',
      dashboard: 'Dashboard',
      products: 'Products',
      categories: 'Categories',
      analytics: 'Analytics',
      settings: 'Settings',
      addProduct: 'Add Product',
      totalProducts: 'Total Products',
      lowStock: 'Low Stock',
      outOfStock: 'Out of Stock',
      totalValue: 'Total Value',
      stockUtilization: 'Stock Utilization',
      recentProducts: 'Recent Products',
      productName: 'Product Name',
      sku: 'SKU',
      stockLevel: 'Stock Level',
      category: 'Category',
      price: 'Price',
      unit: 'Unit',
      status: 'Status'
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      <AppBarStyled>
        <Toolbar>
          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1 }}
          >
            {storeConfig.name[language]} - {t.title}
          </Typography>
          
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            {t.addProduct}
          </Button>
        </Toolbar>
      </AppBarStyled>

      <Container maxWidth="xl" sx={{ mt: 10, mb: 4 }}>
        {/* Store Type Info */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.light', color: 'white' }}>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              {storeConfig.icon}
            </Grid>
            <Grid item xs>
              <Typography variant="h5">
                {storeConfig.name[language]}
              </Typography>
              <Typography variant="body2">
                {categories.length} {language === 'bn' ? 'ক্যাটেগরি' : 'Categories'} • {defaultUnits.length} {language === 'bn' ? 'মাপের ইউনিট' : 'Measurement Units'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t.totalProducts}
                </Typography>
                <Typography variant="h4">
                  {inventoryData.totalProducts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t.lowStock}
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {inventoryData.lowStockItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t.outOfStock}
                </Typography>
                <Typography variant="h4" color="error.main">
                  {inventoryData.outOfStockItems}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  {t.stockUtilization}
                </Typography>
                <Typography variant="h4" color="success.main">
                  {inventoryData.stockUtilization}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Categories Overview */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t.categories}
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom>
                      {category.name[language]}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {category.subCategories.length} {language === 'bn' ? 'উপ-ক্যাটেগরি' : 'Sub-categories'}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {category.units.slice(0, 3).map((unit, unitIndex) => (
                        <Chip
                          key={unitIndex}
                          label={unit}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Recent Products Table */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            {t.recentProducts}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t.productName}</TableCell>
                  <TableCell>{t.sku}</TableCell>
                  <TableCell>{t.stockLevel}</TableCell>
                  <TableCell>{t.category}</TableCell>
                  <TableCell>{t.price}</TableCell>
                  <TableCell>{t.unit}</TableCell>
                  <TableCell>{t.status}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryData.recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{product.stockLevel}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>৳{product.price}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(product.status)}
                        color={getStatusColor(product.status)}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>
    </Box>
  );
};

export default DynamicInventoryDashboard;
