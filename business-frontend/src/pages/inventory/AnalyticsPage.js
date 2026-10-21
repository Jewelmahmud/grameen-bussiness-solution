import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Card, 
  CardContent, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  AttachMoney as MoneyIcon,
  ShoppingCart as CartIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'transform 0.3s ease-in-out',
    boxShadow: theme.shadows[8]
  }
}));

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);

  const [analyticsData] = useState({
    salesOverview: {
      totalSales: 1250000,
      totalOrders: 1250,
      averageOrderValue: 1000,
      growthRate: 12.5
    },
    topProducts: [
      { id: 1, name: 'মসুর ডাল', sales: 125000, quantity: 1250, growth: 15.2 },
      { id: 2, name: 'চাল', sales: 98000, quantity: 980, growth: 8.7 },
      { id: 3, name: 'চিনি', sales: 85000, quantity: 850, growth: -2.1 },
      { id: 4, name: 'আটা', sales: 72000, quantity: 720, growth: 12.3 },
      { id: 5, name: 'তেল', sales: 68000, quantity: 680, growth: 5.8 }
    ],
    salesByCategory: [
      { category: 'ডাল', sales: 320000, percentage: 25.6 },
      { category: 'চাল', sales: 280000, percentage: 22.4 },
      { category: 'মিষ্টি', sales: 220000, percentage: 17.6 },
      { category: 'আটা', sales: 180000, percentage: 14.4 },
      { category: 'তেল', sales: 150000, percentage: 12.0 },
      { category: 'অন্যান্য', sales: 100000, percentage: 8.0 }
    ],
    dailySales: [
      { date: '2024-01-01', sales: 45000, orders: 45 },
      { date: '2024-01-02', sales: 52000, orders: 52 },
      { date: '2024-01-03', sales: 48000, orders: 48 },
      { date: '2024-01-04', sales: 61000, orders: 61 },
      { date: '2024-01-05', sales: 55000, orders: 55 },
      { date: '2024-01-06', sales: 67000, orders: 67 },
      { date: '2024-01-07', sales: 72000, orders: 72 }
    ],
    paymentMethods: [
      { method: 'নগদ', amount: 750000, percentage: 60 },
      { method: 'কার্ড', amount: 375000, percentage: 30 },
      { method: 'মোবাইল ব্যাংকিং', amount: 125000, percentage: 10 }
    ],
    customerInsights: {
      totalCustomers: 850,
      newCustomers: 45,
      repeatCustomers: 805,
      averageCustomerValue: 1470
    }
  });

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getGrowthColor = (growth) => {
    return growth >= 0 ? 'success' : 'error';
  };

  const getGrowthIcon = (growth) => {
    return growth >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          বিক্রয় বিশ্লেষণ (Sales Analytics)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>সময়কাল</InputLabel>
            <Select
              value={timeRange}
              label="সময়কাল"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="7d">গত ৭ দিন</MenuItem>
              <MenuItem value="30d">গত ৩০ দিন</MenuItem>
              <MenuItem value="90d">গত ৯০ দিন</MenuItem>
              <MenuItem value="1y">গত ১ বছর</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>বিভাগ</InputLabel>
            <Select
              value={selectedCategory}
              label="বিভাগ"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="all">সব বিভাগ</MenuItem>
              <MenuItem value="dal">ডাল</MenuItem>
              <MenuItem value="rice">চাল</MenuItem>
              <MenuItem value="sweet">মিষ্টি</MenuItem>
              <MenuItem value="flour">আটা</MenuItem>
              <MenuItem value="oil">তেল</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="small"
          >
            রিফ্রেশ
          </Button>
          
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            size="small"
            sx={{ 
              background: 'linear-gradient(45deg, #4e279d 30%, #1275cb 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #3d1789 30%, #0a6abd 90%)'
              }
            }}
          >
            রিপোর্ট ডাউনলোড
          </Button>
        </Box>
      </Box>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <MoneyIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট বিক্রয়
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analyticsData.salesOverview.totalSales)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={getGrowthIcon(analyticsData.salesOverview.growthRate)}
                  label={`${analyticsData.salesOverview.growthRate}%`}
                  color={getGrowthColor(analyticsData.salesOverview.growthRate)}
                  size="small"
                  sx={{ color: 'white' }}
                />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  গত সময়কাল থেকে
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <CartIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট অর্ডার
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analyticsData.salesOverview.totalOrders.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<TrendingUpIcon />}
                  label="8.2%"
                  color="success"
                  size="small"
                  sx={{ color: 'white' }}
                />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  গত সময়কাল থেকে
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    গড় অর্ডার মূল্য
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analyticsData.salesOverview.averageOrderValue)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<TrendingUpIcon />}
                  label="5.1%"
                  color="success"
                  size="small"
                  sx={{ color: 'white' }}
                />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  গত সময়কাল থেকে
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.3)', mr: 2, width: 48, height: 48 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট গ্রাহক
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analyticsData.customerInsights.totalCustomers.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<TrendingUpIcon />}
                  label="12.3%"
                  color="success"
                  size="small"
                  sx={{ color: 'white' }}
                />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  নতুন গ্রাহক
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Top Products */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                শীর্ষ বিক্রয় পণ্য
              </Typography>
              <IconButton onClick={handleMenuOpen}>
                <MoreIcon />
              </IconButton>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>পণ্য</TableCell>
                    <TableCell align="right">বিক্রয়</TableCell>
                    <TableCell align="right">পরিমাণ</TableCell>
                    <TableCell align="right">বৃদ্ধি</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(product.sales)}
                      </TableCell>
                      <TableCell align="right">
                        {product.quantity.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          icon={getGrowthIcon(product.growth)}
                          label={`${product.growth}%`}
                          color={getGrowthColor(product.growth)}
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

        {/* Sales by Category */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                বিভাগ অনুযায়ী বিক্রয়
              </Typography>
              <IconButton>
                <PieChartIcon />
              </IconButton>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>বিভাগ</TableCell>
                    <TableCell align="right">বিক্রয়</TableCell>
                    <TableCell align="right">শতকরা হার</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.salesByCategory.map((category) => (
                    <TableRow key={category.category}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {category.category}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(category.sales)}
                      </TableCell>
                      <TableCell align="right">
                        <Chip 
                          label={`${category.percentage}%`}
                          size="small"
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Daily Sales Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                দৈনিক বিক্রয়
              </Typography>
              <IconButton>
                <ShowChartIcon />
              </IconButton>
            </Box>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
              <Box sx={{ textAlign: 'center' }}>
                <ShowChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  বিক্রয় চার্ট
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  চার্ট লাইব্রেরি যোগ করার পর এখানে দৈনিক বিক্রয় চার্ট দেখানো হবে
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Payment Methods */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
              পেমেন্ট পদ্ধতি
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {analyticsData.paymentMethods.map((method) => (
                <Box key={method.method} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {method.method}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {method.percentage}%
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formatCurrency(method.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Menu for additional actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          রিপোর্ট ডাউনলোড
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <RefreshIcon fontSize="small" />
          </ListItemIcon>
          ডেটা রিফ্রেশ
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <BarChartIcon fontSize="small" />
          </ListItemIcon>
          বিস্তারিত বিশ্লেষণ
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default AnalyticsPage; 