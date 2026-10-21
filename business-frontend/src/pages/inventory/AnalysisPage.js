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
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Speed as SpeedIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Inventory as InventoryIcon,
  AccountBalance as AccountBalanceIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  ShoppingBag as PurchaseIcon,
  Timeline as TimelineIcon,
  CompareArrows as CompareIcon,
  AssignmentReturn as ReturnIcon,
  AccountTree as AccountTreeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
  Line,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  '&:hover': {
    transform: 'translateY(-4px)',
    transition: 'transform 0.3s ease-in-out',
    boxShadow: theme.shadows[8]
  }
}));

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const AnalysisPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [anchorEl, setAnchorEl] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  const [analysisData] = useState({
    businessMetrics: {
      totalRevenue: 2500000,
      totalExpenses: 1800000,
      netProfit: 700000,
      profitMargin: 28,
      revenueGrowth: 15.5,
      expenseGrowth: 8.2,
      profitGrowth: 32.1
    },
    salesTrend: [
      { month: 'জানুয়ারি', sales: 450000, profit: 125000, expenses: 325000 },
      { month: 'ফেব্রুয়ারি', sales: 520000, profit: 145000, expenses: 375000 },
      { month: 'মার্চ', sales: 480000, profit: 135000, expenses: 345000 },
      { month: 'এপ্রিল', sales: 610000, profit: 170000, expenses: 440000 },
      { month: 'মে', sales: 550000, profit: 155000, expenses: 395000 },
      { month: 'জুন', sales: 670000, profit: 185000, expenses: 485000 }
    ],
    topProducts: [
      { id: 1, name: 'মসুর ডাল', revenue: 125000, cost: 85000, profit: 40000, margin: 32, units: 1250 },
      { id: 2, name: 'চাল', revenue: 98000, cost: 65000, profit: 33000, margin: 33.7, units: 980 },
      { id: 3, name: 'চিনি', revenue: 85000, cost: 60000, profit: 25000, margin: 29.4, units: 850 },
      { id: 4, name: 'আটা', revenue: 72000, cost: 48000, profit: 24000, margin: 33.3, units: 720 },
      { id: 5, name: 'তেল', revenue: 68000, cost: 45000, profit: 23000, margin: 33.8, units: 680 }
    ],
    categoryPerformance: [
      { category: 'ডাল', revenue: 320000, cost: 220000, profit: 100000, margin: 31.25 },
      { category: 'চাল', revenue: 280000, cost: 190000, profit: 90000, margin: 32.14 },
      { category: 'মিষ্টি', revenue: 220000, cost: 160000, profit: 60000, margin: 27.27 },
      { category: 'আটা', revenue: 180000, cost: 120000, profit: 60000, margin: 33.33 },
      { category: 'তেল', revenue: 150000, cost: 100000, profit: 50000, margin: 33.33 }
    ],
    inventoryAnalysis: {
      totalValue: 2500000,
      lowStockItems: 45,
      outOfStockItems: 12,
      slowMovingItems: 28,
      fastMovingItems: 156,
      turnoverRate: 4.2,
      averageDaysInStock: 87
    },
    customerAnalysis: {
      totalCustomers: 850,
      newCustomers: 45,
      repeatCustomers: 805,
      averageOrderValue: 1470,
      customerRetentionRate: 94.7,
      averageOrdersPerCustomer: 3.2
    },
    expenseBreakdown: [
      { category: 'পণ্য ক্রয়', amount: 1200000, percentage: 66.7 },
      { category: 'পরিবহন', amount: 180000, percentage: 10.0 },
      { category: 'কর্মচারী বেতন', amount: 240000, percentage: 13.3 },
      { category: 'ভাড়া', amount: 120000, percentage: 6.7 },
      { category: 'অন্যান্য', amount: 60000, percentage: 3.3 }
    ],
    financialAnalysis: {
      cashFlow: [
        { month: 'জানুয়ারি', inflow: 450000, outflow: 325000, net: 125000 },
        { month: 'ফেব্রুয়ারি', inflow: 520000, outflow: 375000, net: 145000 },
        { month: 'মার্চ', inflow: 480000, outflow: 345000, net: 135000 },
        { month: 'এপ্রিল', inflow: 610000, outflow: 440000, net: 170000 },
        { month: 'মে', inflow: 550000, outflow: 395000, net: 155000 },
        { month: 'জুন', inflow: 670000, outflow: 485000, net: 185000 }
      ],
      roi: 35.2,
      currentRatio: 1.85,
      quickRatio: 1.42,
      debtToEquity: 0.45,
      workingCapital: 850000
    },
    purchaseAnalysis: {
      totalPurchases: 1800000,
      totalSuppliers: 25,
      averagePurchaseOrder: 72000,
      topSuppliers: [
        { id: 1, name: 'আরিফ ট্রেডার্স', purchases: 320000, orders: 12, avgOrderValue: 26667, rating: 4.8 },
        { id: 2, name: 'করিম এন্ড কোং', purchases: 280000, orders: 10, avgOrderValue: 28000, rating: 4.6 },
        { id: 3, name: 'রহমান সাপ্লাই', purchases: 250000, orders: 15, avgOrderValue: 16667, rating: 4.5 },
        { id: 4, name: 'ইসলাম ট্রেডিং', purchases: 220000, orders: 8, avgOrderValue: 27500, rating: 4.7 },
        { id: 5, name: 'হোসেন এন্ড সন্স', purchases: 180000, orders: 9, avgOrderValue: 20000, rating: 4.4 }
      ],
      purchaseTrend: [
        { month: 'জানুয়ারি', amount: 280000, quantity: 3500 },
        { month: 'ফেব্রুয়ারি', amount: 320000, quantity: 4000 },
        { month: 'মার্চ', amount: 290000, quantity: 3650 },
        { month: 'এপ্রিল', amount: 350000, quantity: 4400 },
        { month: 'মে', amount: 310000, quantity: 3900 },
        { month: 'জুন', amount: 380000, quantity: 4750 }
      ]
    },
    salesForecast: {
      nextMonth: 720000,
      nextQuarter: 2100000,
      nextYear: 8500000,
      growthRate: 12.5,
      confidence: 85,
      forecastData: [
        { month: 'জুলাই', forecast: 720000, actual: null, lower: 650000, upper: 790000 },
        { month: 'আগস্ট', forecast: 750000, actual: null, lower: 680000, upper: 820000 },
        { month: 'সেপ্টেম্বর', forecast: 780000, actual: null, lower: 710000, upper: 850000 },
        { month: 'অক্টোবর', forecast: 800000, actual: null, lower: 730000, upper: 870000 }
      ]
    },
    performanceComparison: {
      currentPeriod: {
        revenue: 2500000,
        profit: 700000,
        orders: 1250,
        customers: 850
      },
      previousPeriod: {
        revenue: 2165000,
        profit: 530000,
        orders: 1080,
        customers: 720
      },
      changes: {
        revenue: 15.5,
        profit: 32.1,
        orders: 15.7,
        customers: 18.1
      }
    },
    returnAnalysis: {
      totalReturns: 125,
      returnRate: 10.0,
      returnValue: 125000,
      topReturnedProducts: [
        { id: 1, name: 'চিনি', returns: 25, returnValue: 25000, returnRate: 12.5, reason: 'দোষযুক্ত' },
        { id: 2, name: 'আটা', returns: 18, returnValue: 18000, returnRate: 10.2, reason: 'মেয়াদ শেষ' },
        { id: 3, name: 'তেল', returns: 15, returnValue: 15000, returnRate: 8.5, reason: 'প্যাকেজিং সমস্যা' },
        { id: 4, name: 'মসুর ডাল', returns: 12, returnValue: 12000, returnRate: 6.8, reason: 'গ্রাহক অসন্তুষ্ট' },
        { id: 5, name: 'চাল', returns: 10, returnValue: 10000, returnRate: 5.2, reason: 'অন্যান্য' }
      ],
      returnReasons: [
        { reason: 'দোষযুক্ত', count: 45, percentage: 36 },
        { reason: 'মেয়াদ শেষ', count: 32, percentage: 25.6 },
        { reason: 'প্যাকেজিং সমস্যা', count: 25, percentage: 20 },
        { reason: 'গ্রাহক অসন্তুষ্ট', count: 15, percentage: 12 },
        { reason: 'অন্যান্য', count: 8, percentage: 6.4 }
      ]
    },
    profitabilityAnalysis: {
      grossProfit: 700000,
      grossMargin: 28,
      operatingProfit: 580000,
      operatingMargin: 23.2,
      netProfit: 700000,
      netMargin: 28,
      ebitda: 650000,
      profitabilityByCategory: [
        { category: 'ডাল', profit: 100000, margin: 31.25, roi: 45.5 },
        { category: 'চাল', profit: 90000, margin: 32.14, roi: 47.4 },
        { category: 'আটা', profit: 60000, margin: 33.33, roi: 50.0 },
        { category: 'তেল', profit: 50000, margin: 33.33, roi: 50.0 },
        { category: 'মিষ্টি', profit: 60000, margin: 27.27, roi: 37.5 }
      ]
    }
  });

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
          ব্যবসায়িক বিশ্লেষণ (Business Analysis)
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

      {/* Key Business Metrics */}
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
                    মোট আয়
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analysisData.businessMetrics.totalRevenue)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={getGrowthIcon(analysisData.businessMetrics.revenueGrowth)}
                  label={`${analysisData.businessMetrics.revenueGrowth}%`}
                  color={getGrowthColor(analysisData.businessMetrics.revenueGrowth)}
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
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    মোট খরচ
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analysisData.businessMetrics.totalExpenses)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={getGrowthIcon(analysisData.businessMetrics.expenseGrowth)}
                  label={`${analysisData.businessMetrics.expenseGrowth}%`}
                  color={getGrowthColor(analysisData.businessMetrics.expenseGrowth)}
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
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    নিট লাভ
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(analysisData.businessMetrics.netProfit)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={getGrowthIcon(analysisData.businessMetrics.profitGrowth)}
                  label={`${analysisData.businessMetrics.profitGrowth}%`}
                  color={getGrowthColor(analysisData.businessMetrics.profitGrowth)}
                  size="small"
                  sx={{ color: 'white' }}
                />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  লাভের হার: {analysisData.businessMetrics.profitMargin}%
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
                  <SpeedIcon />
                </Avatar>
                <Box>
                  <Typography color="inherit" variant="body2" gutterBottom>
                    লাভের হার
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analysisData.businessMetrics.profitMargin}%
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip 
                  icon={<CheckCircleIcon />}
                  label="স্বাস্থ্যকর"
                  color="success"
                  size="small"
                  sx={{ color: 'white' }}
                />
                <Typography variant="body2" sx={{ ml: 1, opacity: 0.8 }}>
                  শিল্প গড়: ২০%
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      {/* Tabs for different analysis views */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<BarChartIcon />} label="বিক্রয় বিশ্লেষণ" />
          <Tab icon={<PieChartIcon />} label="পণ্য বিশ্লেষণ" />
          <Tab icon={<InventoryIcon />} label="স্টক বিশ্লেষণ" />
          <Tab icon={<PeopleIcon />} label="গ্রাহক বিশ্লেষণ" />
          <Tab icon={<AccountBalanceIcon />} label="খরচ বিশ্লেষণ" />
          <Tab icon={<AccountTreeIcon />} label="আর্থিক বিশ্লেষণ" />
          <Tab icon={<PurchaseIcon />} label="ক্রয় বিশ্লেষণ" />
          <Tab icon={<TimelineIcon />} label="বিক্রয় পূর্বাভাস" />
          <Tab icon={<CompareIcon />} label="পারফরম্যান্স তুলনা" />
          <Tab icon={<ReturnIcon />} label="ফেরত বিশ্লেষণ" />
          <Tab icon={<TrendingUpIcon />} label="লাভজনকতা বিশ্লেষণ" />
        </Tabs>
      </Paper>

      {/* Sales Analysis Tab */}
      {tabValue === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                মাসিক বিক্রয় ও লাভের প্রবণতা
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={analysisData.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip 
                    formatter={(value, name) => {
                      if (name === 'sales' || name === 'profit' || name === 'expenses') {
                        return formatCurrency(value);
                      }
                      return value;
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="বিক্রয়" />
                  <Bar yAxisId="left" dataKey="expenses" fill="#ff8042" name="খরচ" />
                  <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#82ca9d" strokeWidth={3} name="লাভ" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Product Analysis Tab */}
      {tabValue === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                শীর্ষ পণ্যের পারফরম্যান্স
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>পণ্য</TableCell>
                      <TableCell align="right">আয়</TableCell>
                      <TableCell align="right">খরচ</TableCell>
                      <TableCell align="right">লাভ</TableCell>
                      <TableCell align="right">লাভের হার</TableCell>
                      <TableCell align="right">বিক্রিত ইউনিট</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.topProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(product.revenue)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(product.cost)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={formatCurrency(product.profit)}
                            color="success"
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${product.margin}%`}
                            color={product.margin > 30 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          {product.units.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                বিভাগ অনুযায়ী পারফরম্যান্স
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analysisData.categoryPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, margin }) => `${category}: ${margin.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                  >
                    {analysisData.categoryPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Inventory Analysis Tab */}
      {tabValue === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                স্টক পরিসংখ্যান
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InventoryIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          মোট স্টক মূল্য
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {formatCurrency(analysisData.inventoryAnalysis.totalValue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <SpeedIcon color="primary" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          টার্নওভার রেট
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {analysisData.inventoryAnalysis.turnoverRate}x
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WarningIcon color="warning" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          কম স্টক
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                        {analysisData.inventoryAnalysis.lowStockItems}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WarningIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          স্টক শেষ
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {analysisData.inventoryAnalysis.outOfStockItems}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingDownIcon color="error" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          ধীর গতির পণ্য
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                        {analysisData.inventoryAnalysis.slowMovingItems}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          দ্রুত বিক্রয়
                        </Typography>
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {analysisData.inventoryAnalysis.fastMovingItems}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                গড় স্টকে থাকার দিন
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {analysisData.inventoryAnalysis.averageDaysInStock}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    দিন
                  </Typography>
                </Box>
              </Box>
              <Alert severity="info" sx={{ mt: 2 }}>
                গড় স্টকে থাকার দিন কম হলে স্টক টার্নওভার ভালো
              </Alert>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Customer Analysis Tab */}
      {tabValue === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                গ্রাহক পরিসংখ্যান
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          মোট গ্রাহক
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {analysisData.customerAnalysis.totalCustomers}
                        </Typography>
                      </Box>
                      <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          নতুন গ্রাহক
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                          {analysisData.customerAnalysis.newCustomers}
                        </Typography>
                      </Box>
                      <PeopleIcon color="success" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          পুনরায় ক্রয়
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {analysisData.customerAnalysis.repeatCustomers}
                        </Typography>
                      </Box>
                      <PeopleIcon color="primary" sx={{ fontSize: 40 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                গ্রাহক মূল্য
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      গড় অর্ডার মূল্য
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(analysisData.customerAnalysis.averageOrderValue)}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      গ্রাহক ধরে রাখার হার
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                      {analysisData.customerAnalysis.customerRetentionRate}%
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      গ্রাহক প্রতি গড় অর্ডার
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {analysisData.customerAnalysis.averageOrdersPerCustomer}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                গ্রাহক ধরে রাখা
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h2" sx={{ fontWeight: 700, color: 'success.main' }}>
                    {analysisData.customerAnalysis.customerRetentionRate}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                    গ্রাহক ধরে রাখার হার
                  </Typography>
                  <Chip 
                    icon={<CheckCircleIcon />}
                    label="চমৎকার"
                    color="success"
                    sx={{ mt: 2 }}
                  />
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Expense Analysis Tab */}
      {tabValue === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                খরচের বিভাজন
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={analysisData.expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category}: ${percentage}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analysisData.expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                খরচের বিবরণ
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>খরচের ধরন</TableCell>
                      <TableCell align="right">পরিমাণ</TableCell>
                      <TableCell align="right">শতকরা হার</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.expenseBreakdown.map((expense, index) => (
                      <TableRow key={expense.category}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box
                              sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                bgcolor: COLORS[index % COLORS.length],
                                mr: 1
                              }}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {expense.category}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(expense.amount)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${expense.percentage}%`}
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
        </Grid>
      )}

      {/* Financial Analysis Tab */}
      {tabValue === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                নগদ প্রবাহ বিশ্লেষণ
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={analysisData.financialAnalysis.cashFlow}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="inflow" fill="#8884d8" name="আয়" />
                  <Bar dataKey="outflow" fill="#ff8042" name="খরচ" />
                  <Line type="monotone" dataKey="net" stroke="#82ca9d" strokeWidth={3} name="নিট" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  ROI (Return on Investment)
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {analysisData.financialAnalysis.roi}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Ratio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {analysisData.financialAnalysis.currentRatio}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quick Ratio
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {analysisData.financialAnalysis.quickRatio}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Working Capital
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analysisData.financialAnalysis.workingCapital)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Purchase Analysis Tab */}
      {tabValue === 6 && (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                শীর্ষ সরবরাহকারী
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>সরবরাহকারী</TableCell>
                      <TableCell align="right">মোট ক্রয়</TableCell>
                      <TableCell align="right">অর্ডার সংখ্যা</TableCell>
                      <TableCell align="right">গড় অর্ডার মূল্য</TableCell>
                      <TableCell align="right">রেটিং</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.purchaseAnalysis.topSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {supplier.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(supplier.purchases)}
                        </TableCell>
                        <TableCell align="right">
                          {supplier.orders}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(supplier.avgOrderValue)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            icon={<StarIcon />}
                            label={supplier.rating}
                            color="warning"
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

          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                ক্রয় পরিসংখ্যান
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      মোট ক্রয়
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(analysisData.purchaseAnalysis.totalPurchases)}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      মোট সরবরাহকারী
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {analysisData.purchaseAnalysis.totalSuppliers}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      গড় ক্রয় অর্ডার
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {formatCurrency(analysisData.purchaseAnalysis.averagePurchaseOrder)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                মাসিক ক্রয় প্রবণতা
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analysisData.purchaseAnalysis.purchaseTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="amount" fill="#8884d8" name="ক্রয় পরিমাণ" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Sales Forecast Tab */}
      {tabValue === 7 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                বিক্রয় পূর্বাভাস
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={analysisData.salesForecast.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Area dataKey="upper" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.2} name="উচ্চ সীমা" />
                  <Area dataKey="lower" stackId="1" stroke="#82ca9d" fill="#fff" fillOpacity={0.2} name="নিম্ন সীমা" />
                  <Line type="monotone" dataKey="forecast" stroke="#8884d8" strokeWidth={3} name="পূর্বাভাস" />
                  <Line type="monotone" dataKey="actual" stroke="#ff8042" strokeWidth={2} strokeDasharray="5 5" name="প্রকৃত" />
                </ComposedChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  পরবর্তী মাসের পূর্বাভাস
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analysisData.salesForecast.nextMonth)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  পরবর্তী ত্রৈমাসিকের পূর্বাভাস
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analysisData.salesForecast.nextQuarter)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  পূর্বাভাসের নির্ভরযোগ্যতা
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {analysisData.salesForecast.confidence}%
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  বৃদ্ধির হার: {analysisData.salesForecast.growthRate}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Performance Comparison Tab */}
      {tabValue === 8 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                সময়কাল তুলনা
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>মেট্রিক</TableCell>
                          <TableCell align="right">বর্তমান সময়কাল</TableCell>
                          <TableCell align="right">পূর্ববর্তী সময়কাল</TableCell>
                          <TableCell align="right">পরিবর্তন</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>মোট আয়</TableCell>
                          <TableCell align="right">
                            {formatCurrency(analysisData.performanceComparison.currentPeriod.revenue)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(analysisData.performanceComparison.previousPeriod.revenue)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              icon={getGrowthIcon(analysisData.performanceComparison.changes.revenue)}
                              label={`${analysisData.performanceComparison.changes.revenue}%`}
                              color={getGrowthColor(analysisData.performanceComparison.changes.revenue)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>নিট লাভ</TableCell>
                          <TableCell align="right">
                            {formatCurrency(analysisData.performanceComparison.currentPeriod.profit)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(analysisData.performanceComparison.previousPeriod.profit)}
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              icon={getGrowthIcon(analysisData.performanceComparison.changes.profit)}
                              label={`${analysisData.performanceComparison.changes.profit}%`}
                              color={getGrowthColor(analysisData.performanceComparison.changes.profit)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>মোট অর্ডার</TableCell>
                          <TableCell align="right">
                            {analysisData.performanceComparison.currentPeriod.orders}
                          </TableCell>
                          <TableCell align="right">
                            {analysisData.performanceComparison.previousPeriod.orders}
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              icon={getGrowthIcon(analysisData.performanceComparison.changes.orders)}
                              label={`${analysisData.performanceComparison.changes.orders}%`}
                              color={getGrowthColor(analysisData.performanceComparison.changes.orders)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>মোট গ্রাহক</TableCell>
                          <TableCell align="right">
                            {analysisData.performanceComparison.currentPeriod.customers}
                          </TableCell>
                          <TableCell align="right">
                            {analysisData.performanceComparison.previousPeriod.customers}
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              icon={getGrowthIcon(analysisData.performanceComparison.changes.customers)}
                              label={`${analysisData.performanceComparison.changes.customers}%`}
                              color={getGrowthColor(analysisData.performanceComparison.changes.customers)}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, height: '100%' }}>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                      পারফরম্যান্স চার্ট
                    </Typography>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'আয়', current: analysisData.performanceComparison.currentPeriod.revenue / 1000, previous: analysisData.performanceComparison.previousPeriod.revenue / 1000 },
                        { name: 'লাভ', current: analysisData.performanceComparison.currentPeriod.profit / 1000, previous: analysisData.performanceComparison.previousPeriod.profit / 1000 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip formatter={(value) => formatCurrency(value * 1000)} />
                        <Legend />
                        <Bar dataKey="current" fill="#8884d8" name="বর্তমান" />
                        <Bar dataKey="previous" fill="#82ca9d" name="পূর্ববর্তী" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Return Analysis Tab */}
      {tabValue === 9 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                ফেরত পরিসংখ্যান
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      মোট ফেরত
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                      {analysisData.returnAnalysis.totalReturns}
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ফেরতের হার
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                      {analysisData.returnAnalysis.returnRate}%
                    </Typography>
                  </CardContent>
                </Card>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      ফেরতের মূল্য
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                      {formatCurrency(analysisData.returnAnalysis.returnValue)}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                শীর্ষ ফেরতকৃত পণ্য
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>পণ্য</TableCell>
                      <TableCell align="right">ফেরত সংখ্যা</TableCell>
                      <TableCell align="right">ফেরত মূল্য</TableCell>
                      <TableCell align="right">ফেরতের হার</TableCell>
                      <TableCell>কারণ</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.returnAnalysis.topReturnedProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {product.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {product.returns}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(product.returnValue)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${product.returnRate}%`}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {product.reason}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                ফেরতের কারণ
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analysisData.returnAnalysis.returnReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ reason, percentage }) => `${reason}: ${percentage}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analysisData.returnAnalysis.returnReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Profitability Analysis Tab */}
      {tabValue === 10 && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Gross Profit
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analysisData.profitabilityAnalysis.grossProfit)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Margin: {analysisData.profitabilityAnalysis.grossMargin}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Operating Profit
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analysisData.profitabilityAnalysis.operatingProfit)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Margin: {analysisData.profitabilityAnalysis.operatingMargin}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Net Profit
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {formatCurrency(analysisData.profitabilityAnalysis.netProfit)}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Margin: {analysisData.profitabilityAnalysis.netMargin}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  EBITDA
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {formatCurrency(analysisData.profitabilityAnalysis.ebitda)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                বিভাগ অনুযায়ী লাভজনকতা
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>বিভাগ</TableCell>
                      <TableCell align="right">লাভ</TableCell>
                      <TableCell align="right">লাভের হার</TableCell>
                      <TableCell align="right">ROI</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {analysisData.profitabilityAnalysis.profitabilityByCategory.map((category) => (
                      <TableRow key={category.category}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {category.category}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(category.profit)}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${category.margin}%`}
                            color={category.margin > 30 ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${category.roi}%`}
                            color={category.roi > 40 ? 'success' : 'default'}
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

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 3 }}>
                লাভজনকতা তুলনা
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analysisData.profitabilityAnalysis.profitabilityByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <RechartsTooltip formatter={(value, name) => {
                    if (name === 'profit') return formatCurrency(value);
                    return `${value}%`;
                  }} />
                  <Legend />
                  <Bar dataKey="margin" fill="#8884d8" name="লাভের হার (%)" />
                  <Bar dataKey="roi" fill="#82ca9d" name="ROI (%)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      )}

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

export default AnalysisPage;

