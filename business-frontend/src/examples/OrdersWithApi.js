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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import Header from '../components/Header';
import Footer from '../components/Footer';

const OrdersWithApi = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { loading, error, useOrders } = useApiService();
  const { orders, fetchOrders } = useOrders();
  
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Fetch orders
  useEffect(() => {
    const loadOrders = async () => {
      setOrdersLoading(true);
      try {
        await fetchOrders();
      } catch (err) {
        setOrdersError('Failed to load orders');
        console.error(err);
      } finally {
        setOrdersLoading(false);
      }
    };

    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated, fetchOrders]);

  // Get status color
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'processing':
        return 'primary';
      case 'cancelled':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <>
      <Header />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          My Orders
        </Typography>
        
        {ordersLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : ordersError ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {ordersError}
          </Alert>
        ) : orders.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              You haven't placed any orders yet
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Browse our products and place your first order!
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/bazars')}
            >
              Start Shopping
            </Button>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{order.items.length} items</TableCell>
                    <TableCell>৳{order.total}</TableCell>
                    <TableCell>
                      <Chip 
                        label={order.status} 
                        color={getStatusColor(order.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate(`/orders/${order.id}`)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
      <Footer />
    </>
  );
};

export default OrdersWithApi;
