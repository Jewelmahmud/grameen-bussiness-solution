import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  Pagination
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Download as DownloadIcon,
  MoreVert as MoreVertIcon,
  Groups as HRIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon
} from '@mui/icons-material';

const HRPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Mock employees data
  useEffect(() => {
    const mockEmployees = [
      {
        id: 1,
        employeeId: 'EMP-001',
        name: 'আব্দুল করিম',
        phone: '+880 1712-345678',
        email: 'abdul.karim@habibtraders.com',
        department: 'বিক্রয়',
        position: 'বিক্রয় প্রতিনিধি',
        joinDate: '2023-01-15',
        status: 'active',
        salary: 25000,
        address: 'ধানমন্ডি, ঢাকা'
      },
      {
        id: 2,
        employeeId: 'EMP-002',
        name: 'রহিম উদ্দিন',
        phone: '+880 1713-456789',
        email: 'rahim.uddin@habibtraders.com',
        department: 'ক্রয়',
        position: 'ক্রয় ব্যবস্থাপক',
        joinDate: '2022-06-20',
        status: 'active',
        salary: 35000,
        address: 'গুলশান, ঢাকা'
      },
      {
        id: 3,
        employeeId: 'EMP-003',
        name: 'ফাতেমা বেগম',
        phone: '+880 1714-567890',
        email: 'fatema.begum@habibtraders.com',
        department: 'হিসাবনিকাশ',
        position: 'হিসাবরক্ষক',
        joinDate: '2023-03-10',
        status: 'active',
        salary: 30000,
        address: 'মিরপুর, ঢাকা'
      },
      {
        id: 4,
        employeeId: 'EMP-004',
        name: 'করিম উদ্দিন',
        phone: '+880 1715-678901',
        email: 'karim.uddin@habibtraders.com',
        department: 'গুদাম',
        position: 'গুদাম সহকারী',
        joinDate: '2023-08-05',
        status: 'active',
        salary: 20000,
        address: 'উত্তরা, ঢাকা'
      },
      {
        id: 5,
        employeeId: 'EMP-005',
        name: 'মহম্মদ আলী',
        phone: '+880 1716-789012',
        email: 'mohammad.ali@habibtraders.com',
        department: 'বিক্রয়',
        position: 'বিক্রয় ব্যবস্থাপক',
        joinDate: '2021-11-12',
        status: 'active',
        salary: 40000,
        address: 'বনানী, ঢাকা'
      },
      {
        id: 6,
        employeeId: 'EMP-006',
        name: 'আয়েশা খাতুন',
        phone: '+880 1717-890123',
        email: 'ayesha.khatun@habibtraders.com',
        department: 'হিসাবনিকাশ',
        position: 'হিসাব সহকারী',
        joinDate: '2023-09-01',
        status: 'on_leave',
        salary: 22000,
        address: 'ধানমন্ডি, ঢাকা'
      },
      {
        id: 7,
        employeeId: 'EMP-007',
        name: 'ইকবাল আহমেদ',
        phone: '+880 1718-901234',
        email: 'iqbal.ahmed@habibtraders.com',
        department: 'গুদাম',
        position: 'গুদাম ব্যবস্থাপক',
        joinDate: '2022-02-18',
        status: 'active',
        salary: 32000,
        address: 'মোহাম্মদপুর, ঢাকা'
      },
      {
        id: 8,
        employeeId: 'EMP-008',
        name: 'শফিকুর রহমান',
        phone: '+880 1719-012345',
        email: 'shafiqur.rahman@habibtraders.com',
        department: 'ক্রয়',
        position: 'ক্রয় সহকারী',
        joinDate: '2023-05-22',
        status: 'inactive',
        salary: 18000,
        address: 'লালবাগ, ঢাকা'
      }
    ];
    
    setEmployees(mockEmployees);
    setFilteredEmployees(mockEmployees);
  }, []);

  // Filter employees based on search and filters
  useEffect(() => {
    let filtered = [...employees];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(employee =>
        employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.phone.includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.position.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Department filter
    if (departmentFilter !== 'all') {
      filtered = filtered.filter(employee => employee.department === departmentFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(employee => employee.status === statusFilter);
    }

    setFilteredEmployees(filtered);
    setPage(1);
  }, [searchTerm, departmentFilter, statusFilter, employees]);

  // Calculate statistics
  const totalEmployees = filteredEmployees.length;
  const activeEmployees = filteredEmployees.filter(e => e.status === 'active').length;
  const onLeaveEmployees = filteredEmployees.filter(e => e.status === 'on_leave').length;
  const totalSalary = filteredEmployees.reduce((sum, emp) => sum + emp.salary, 0);

  // Get unique departments for filter
  const departments = [...new Set(employees.map(e => e.department))];

  // Pagination
  const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleView = (employee) => {
    setSelectedEmployee(employee);
    setOpenDialog(true);
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, employee) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(employee.id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  const handleEdit = (employee) => {
    console.log('Edit employee:', employee.employeeId);
    handleMenuClose();
  };

  const handleDelete = (employee) => {
    console.log('Delete employee:', employee.employeeId);
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'on_leave':
        return 'warning';
      case 'inactive':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'সক্রিয়';
      case 'on_leave':
        return 'ছুটিতে';
      case 'inactive':
        return 'নিষ্ক্রিয়';
      default:
        return status;
    }
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'বিক্রয়': 'primary',
      'ক্রয়': 'info',
      'হিসাবনিকাশ': 'success',
      'গুদাম': 'warning'
    };
    return colors[department] || 'default';
  };

  return (
    <Box>
      {/* Header Section */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          মানব সম্পদ
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
            },
          }}
        >
          নতুন কর্মচারী যোগ করুন
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    মোট কর্মচারী
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {totalEmployees}
                  </Typography>
                </Box>
                <HRIcon sx={{ fontSize: 40, color: 'primary.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    সক্রিয়
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
                    {activeEmployees}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main', opacity: 0.7 }}>
                  ✓
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    ছুটিতে
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
                    {onLeaveEmployees}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main', opacity: 0.7 }}>
                  ⏱
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    মোট বেতন
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    ৳{totalSalary.toLocaleString('bn-BD')}
                  </Typography>
                </Box>
                <MoneyIcon sx={{ fontSize: 40, color: 'info.main', opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="কর্মচারী আইডি, নাম, ফোন, ইমেইল, বিভাগ বা পদবী দিয়ে খুঁজুন..."
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
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="বিভাগ"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              {departments.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="স্ট্যাটাস"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              SelectProps={{
                native: true,
              }}
            >
              <option value="all">সকল</option>
              <option value="active">সক্রিয়</option>
              <option value="on_leave">ছুটিতে</option>
              <option value="inactive">নিষ্ক্রিয়</option>
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => console.log('Export employees')}
            >
              এক্সপোর্ট
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Employees Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>কর্মচারী আইডি</TableCell>
              <TableCell>নাম</TableCell>
              <TableCell>যোগাযোগ</TableCell>
              <TableCell>বিভাগ</TableCell>
              <TableCell>পদবী</TableCell>
              <TableCell>যোগদান তারিখ</TableCell>
              <TableCell>বেতন</TableCell>
              <TableCell>স্ট্যাটাস</TableCell>
              <TableCell align="right">কার্যক্রম</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    কোন কর্মচারী পাওয়া যায়নি
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEmployees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {employee.employeeId}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        {employee.name.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {employee.name}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <PhoneIcon fontSize="small" />
                        {employee.phone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <EmailIcon fontSize="small" />
                        {employee.email}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={employee.department}
                      size="small"
                      color={getDepartmentColor(employee.department)}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {employee.position}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(employee.joinDate).toLocaleDateString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      ৳{employee.salary.toLocaleString('bn-BD')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(employee.status)}
                      color={getStatusColor(employee.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="দেখুন">
                      <IconButton
                        size="small"
                        onClick={() => handleView(employee)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, employee)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredEmployees.length > rowsPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredEmployees.length / rowsPerPage)}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          const employee = employees.find(e => e.id === selectedRow);
          if (employee) handleView(employee);
        }}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          দেখুন
        </MenuItem>
        <MenuItem onClick={() => {
          const employee = employees.find(e => e.id === selectedRow);
          if (employee) handleEdit(employee);
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          সম্পাদনা করুন
        </MenuItem>
        <MenuItem onClick={() => {
          const employee = employees.find(e => e.id === selectedRow);
          if (employee) handleDelete(employee);
        }} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          মুছে ফেলুন
        </MenuItem>
      </Menu>

      {/* View Employee Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 2
        }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                কর্মচারী বিবরণ
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          {selectedEmployee && (
            <Grid container spacing={3}>
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main', fontSize: 40 }}>
                  {selectedEmployee.name.charAt(0)}
                </Avatar>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  কর্মচারী আইডি
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedEmployee.employeeId}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  নাম
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedEmployee.name}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <PhoneIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  ফোন
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.phone}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <EmailIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  ইমেইল
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.email}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  বিভাগ
                </Typography>
                <Chip
                  label={selectedEmployee.department}
                  size="small"
                  color={getDepartmentColor(selectedEmployee.department)}
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  পদবী
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {selectedEmployee.position}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <CalendarIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  যোগদান তারিখ
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedEmployee.joinDate).toLocaleDateString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <MoneyIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  বেতন
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  ৳{selectedEmployee.salary.toLocaleString('bn-BD')}
                </Typography>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  স্ট্যাটাস
                </Typography>
                <Chip
                  label={getStatusText(selectedEmployee.status)}
                  color={getStatusColor(selectedEmployee.status)}
                  size="small"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <WorkIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                  ঠিকানা
                </Typography>
                <Typography variant="body1">
                  {selectedEmployee.address}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenDialog(false)}>বন্ধ করুন</Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              if (selectedEmployee) handleEdit(selectedEmployee);
              setOpenDialog(false);
            }}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5568d3 0%, #6a4190 100%)',
              },
            }}
          >
            সম্পাদনা করুন
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HRPage;

