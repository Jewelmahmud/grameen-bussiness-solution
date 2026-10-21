import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  PointOfSale as POSIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
  Sync as SyncIcon,
  Receipt as ReceiptIcon,
  LocalShipping as ShippingIcon
} from '@mui/icons-material';
import posService from '../../services/posService';

const POSDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posData, setPosData] = useState({
    todaySales: 0,
    todayTransactions: 0,
    lowStockItems: [],
    recentSales: [],
    inventoryUpdates: [],
    syncStatus: 'connected'
  });

  useEffect(() => {
    loadPOSData();
    setupRealTimeUpdates();
  }, []);

  const loadPOSData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load today's sales data
      const today = new Date().toISOString().split('T')[0];
      const salesReport = await posService.getSalesReport(today, today);
      
      // Load low stock items
      const inventory = await posService.getInventoryForPOS();
      const lowStockItems = inventory.filter(item => item.stockLevel <= item.reorderPoint);

      // Load recent sales
      const recentSales = await posService.getSales({ limit: 10 });

      setPosData({
        todaySales: salesReport.totalSales || 0,
        todayTransactions: salesReport.totalTransactions || 0,
        lowStockItems,
        recentSales: recentSales.data || [],
        inventoryUpdates: [],
        syncStatus: 'connected'
      });
    } catch (err) {
      setError('Failed to load POS data. Please check your connection.');
      console.error('Error loading POS data:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeUpdates = () => {
    const ws = posService.subscribeToUpdates((data) => {
      if (data.type === 'sale_created') {
        // Update today's sales count
        setPosData(prev => ({
          ...prev,
          todaySales: prev.todaySales + data.sale.amount,
          todayTransactions: prev.todayTransactions + 1,
          recentSales: [data.sale, ...prev.recentSales.slice(0, 9)]
        }));
      } else if (data.type === 'inventory_updated') {
        // Update inventory data
        setPosData(prev => ({
          ...prev,
          inventoryUpdates: [data.update, ...prev.inventoryUpdates.slice(0, 9)]
        }));
      } else if (data.type === 'low_stock_alert') {
        // Update low stock items
        setPosData(prev => ({
          ...prev,
          lowStockItems: [...prev.lowStockItems, data.item]
        }));
      }
    });

    return () => ws.close();
  };

  const handleSyncInventory = async () => {
    try {
      setPosData(prev => ({ ...prev, syncStatus: 'syncing' }));
      await posService.syncInventoryChanges([]);
      setPosData(prev => ({ ...prev, syncStatus: 'connected' }));
    } catch (err) {
      setPosData(prev => ({ ...prev, syncStatus: 'error' }));
      console.error('Sync error:', err);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Header with Sync Status */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          POS System Integration
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            label={posData.syncStatus}
            color={posData.syncStatus === 'connected' ? 'success' : 'error'}
            size="small"
          />
          <Tooltip title="Sync Inventory">
            <IconButton onClick={handleSyncInventory} disabled={posData.syncStatus === 'syncing'}>
              <SyncIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh Data">
            <IconButton onClick={loadPOSData}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <POSIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    ৳{posData.todaySales.toLocaleString()}
                  </Typography>
                  <Typography variant="body2">
                    আজকের বিক্রয়
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <ReceiptIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {posData.todayTransactions}
                  </Typography>
                  <Typography variant="body2">
                    আজকের লেনদেন
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <InventoryIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {posData.lowStockItems.length}
                  </Typography>
                  <Typography variant="body2">
                    কম স্টক আইটেম
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <TrendingUpIcon sx={{ mr: 2, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {posData.recentSales.length}
                  </Typography>
                  <Typography variant="body2">
                    সাম্প্রতিক বিক্রয়
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Sales */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                সাম্প্রতিক বিক্রয়
              </Typography>
              <Button variant="outlined" size="small">
                সব দেখুন
              </Button>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>লেনদেন আইডি</TableCell>
                    <TableCell>পরিমাণ</TableCell>
                    <TableCell>অবস্থা</TableCell>
                    <TableCell align="right">সময়</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posData.recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>#{sale.id}</TableCell>
                      <TableCell>৳{sale.amount}</TableCell>
                      <TableCell>
                        <Chip 
                          label={sale.status} 
                          color={sale.status === 'completed' ? 'success' : 'warning'}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell align="right">
                        {new Date(sale.createdAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Low Stock Alerts */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              কম স্টক সতর্কতা
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {posData.lowStockItems.slice(0, 5).map((item) => (
                <Paper key={item.id} sx={{ p: 2, bgcolor: '#fff3e0', border: '1px solid #ffcc02' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="warning.main">
                        মাত্র {item.stockLevel} {item.unit} বাকি
                      </Typography>
                    </Box>
                    <Button variant="contained" size="small" color="warning">
                      স্টক করুন
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Inventory Updates */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600 }}>
              সাম্প্রতিক ইনভেন্টরি আপডেট
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>পণ্য</TableCell>
                    <TableCell>পরিবর্তন</TableCell>
                    <TableCell>কারণ</TableCell>
                    <TableCell>সময়</TableCell>
                    <TableCell>অবস্থা</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {posData.inventoryUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>{update.productName}</TableCell>
                      <TableCell>
                        <Chip 
                          label={update.change > 0 ? `+${update.change}` : update.change}
                          color={update.change > 0 ? 'success' : 'error'}
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{update.reason}</TableCell>
                      <TableCell>{new Date(update.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip 
                          label={update.status} 
                          color={update.status === 'completed' ? 'success' : 'warning'}
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default POSDashboard; 