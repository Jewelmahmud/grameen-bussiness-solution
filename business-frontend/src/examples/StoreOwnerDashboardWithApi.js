import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiService } from '../hooks/useApiService';
import { useAuth } from '../contexts/AuthContext';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Button, 
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const StoreOwnerDashboardWithApi = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { loading, error, api } = useApiService();
  
  const [tabValue, setTabValue] = useState(0);
  const [dashboardData, setDashboardData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState(null);

  // Redirect to login if not authenticated or not a store owner
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (user && user.role !== 'store_owner') {
      navigate('/');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setDataLoading(true);
      try {
        // In a real implementation, this would be an API call
        // const response = await api.stores.getAnalytics(user.store_id);
        
        // For demo purposes, we'll use mock data
        const mockData = {
          store: {
            id: 1,
            name: 'Fresh Vegetables Store',
            rating: 4.8,
            total_products: 24,
            total_orders: 156,
            monthly_revenue: 45280,
            status: 'active'
          },
          recent_orders: [
            { id: 1, customer: 'John Doe', date: '2025-03-25', status: 'Delivered', amount: 250 },
            { id: 2, customer: 'Jane Smith', date: '2025-03-25', status: 'Processing', amount: 180 },
            { id: 3, customer: 'Bob Johnson', date: '2025-03-24', status: 'Pending', amount: 320 },
            { id: 4, customer: 'Alice Brown', date: '2025-03-24', status: 'Shipped', amount: 150 },
          ],
          low_stock_products: [
            { id: 1, name: 'Green Peppers', stock: 5, unit: 'kg' },
            { id: 2, name: 'Fresh Carrots', stock: 3, unit: 'kg' },
            { id: 3, name: 'Organic Lettuce', stock: 2, unit: 'bundle' },
          ],
          top_products: [
            { id: 1, name: 'Fresh Tomatoes', sold: 120, revenue: 14400, stock: 45 },
            { id: 2, name: 'Organic Potatoes', sold: 85, revenue: 6800, stock: 32 },
            { id: 3, name: 'Green Spinach', sold: 75, revenue: 4500, stock: 28 },
            { id: 4, name: 'Red Onions', sold: 65, revenue: 5850, stock: 40 },
          ]
        };
        
        setDashboardData(mockData);
      } catch (err) {
        setDataError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setDataLoading(false);
      }
    };

    if (isAuthenticated && user && user.role === 'store_owner') {
      loadDashboardData();
    }
  }, [isAuthenticated, user, api]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
      case 'active':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'primary';
      case 'cancelled':
      case 'inactive':
        return 'error';
      default:
        return 'warning';
    }
  };

  if (dataLoading) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress />
        </Container>
        <Footer />
      </>
    );
  }

  if (dataError || !dashboardData) {
    return (
      <>
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8, minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Alert severity="error">
            {dataError || 'Failed to load dashboard data'}
          </Alert>
        </Container>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Store Owner Dashboard
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4">{dashboardData.store.total_products}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Orders
                </Typography>
                <Typography variant="h4">{dashboardData.store.total_orders}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Monthly Revenue
                </Typography>
                <Typography variant="h4">৳{dashboardData.store.monthly_revenue}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Store Rating
                </Typography>
                <Typography variant="h4">{dashboardData.store.rating}/5</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab label="Overview" />
            <Tab label="Orders" />
            <Tab label="Products" />
          </Tabs>
          <Box sx={{ p: 3 }}>
            {tabValue === 0 && (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h2">
                        Store Status: <Alert 
                          severity={getStatusColor(dashboardData.store.status)} 
                          sx={{ display: 'inline', py: 0, px: 1 }}
                        >
                          {dashboardData.store.status}
                        </Alert>
                      </Typography>
                      <Typography variant="body2">
                        Your store is currently visible to customers
                      </Typography>
                    </Box>
                    <Button variant="contained">
                      View My Store
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Recent Orders
                    </Typography>
                    <List>
                      {dashboardData.recent_orders.map((order) => (
                        <React.Fragment key={order.id}>
                          <ListItem>
                            <ListItemText 
                              primary={`Order #${order.id} - ${order.customer}`} 
                              secondary={`${order.date} - ৳${order.amount}`} 
                            />
                            <Alert 
                              severity={getStatusColor(order.status)} 
                              sx={{ py: 0, px: 1 }}
                            >
                              {order.status}
                            </Alert>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/store-owner/orders')}
                    >
                      View All Orders
                    </Button>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, height: '100%' }}>
                    <Typography variant="h6" gutterBottom>
                      Low Stock Alert
                    </Typography>
                    <List>
                      {dashboardData.low_stock_products.map((product) => (
                        <React.Fragment key={product.id}>
                          <ListItem>
                            <ListItemText 
                              primary={product.name} 
                              secondary={`Only ${product.stock} ${product.unit} remaining`} 
                            />
                            <Button variant="contained" size="small">Restock</Button>
                          </ListItem>
                          <Divider />
                        </React.Fragment>
                      ))}
                    </List>
                    <Button 
                      variant="outlined" 
                      fullWidth 
                      sx={{ mt: 2 }}
                      onClick={() => navigate('/store-owner/products')}
                    >
                      Manage Inventory
                    </Button>
                  </Paper>
                </Grid>
              </Grid>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Recent Orders
                </Typography>
                <Paper variant="outlined">
                  <List>
                    {dashboardData.recent_orders.map((order) => (
                      <React.Fragment key={order.id}>
                        <ListItem>
                          <ListItemText 
                            primary={`Order #${order.id} - ${order.customer}`} 
                            secondary={`${order.date} - ৳${order.amount}`} 
                          />
                          <Alert 
                            severity={getStatusColor(order.status)} 
                            sx={{ py: 0, px: 1, mr: 2 }}
                          >
                            {order.status}
                          </Alert>
                          <Button variant="outlined" size="small">
                            View Details
                          </Button>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={() => navigate('/store-owner/orders')}
                  >
                    View All Orders
                  </Button>
                </Box>
              </Box>
            )}
            
            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Top Selling Products
                  </Typography>
                  <Button 
                    variant="contained"
                    onClick={() => navigate('/store-owner/products/add')}
                  >
                    Add New Product
                  </Button>
                </Box>
                <Paper variant="outlined">
                  <List>
                    {dashboardData.top_products.map((product) => (
                      <React.Fragment key={product.id}>
                        <ListItem>
                          <ListItemText 
                            primary={product.name} 
                            secondary={`Sold: ${product.sold} units | Revenue: ৳${product.revenue}`} 
                          />
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            Stock: {product.stock}
                          </Typography>
                          <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                            Edit
                          </Button>
                          <Button variant="contained" size="small">
                            View
                          </Button>
                        </ListItem>
                        <Divider />
                      </React.Fragment>
                    ))}
                  </List>
                </Paper>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button 
                    variant="contained"
                    onClick={() => navigate('/store-owner/products')}
                  >
                    Manage All Products
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Container>
      <Footer />
    </>
  );
};

export default StoreOwnerDashboardWithApi;
