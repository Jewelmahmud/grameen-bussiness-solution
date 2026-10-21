import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Sync as SyncIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import posService from '../../services/posService';

const InventorySync = () => {
  const [loading, setLoading] = useState(false);
  const [syncHistory, setSyncHistory] = useState([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [lastSync, setLastSync] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [settingsDialog, setSettingsDialog] = useState(false);
  const [syncSettings, setSyncSettings] = useState({
    autoSync: true,
    syncInterval: 5,
    conflictResolution: 'manual'
  });

  useEffect(() => {
    loadSyncHistory();
    loadSyncStatus();
    if (syncSettings.autoSync) {
      const interval = setInterval(performAutoSync, syncSettings.syncInterval * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [syncSettings]);

  const loadSyncHistory = async () => {
    try {
      // This would typically come from your backend
      const mockHistory = [
        {
          id: 1,
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          type: 'inventory_sync',
          status: 'success',
          itemsProcessed: 150,
          conflicts: 0
        },
        {
          id: 2,
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          type: 'sale_sync',
          status: 'success',
          itemsProcessed: 25,
          conflicts: 0
        },
        {
          id: 3,
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          type: 'inventory_sync',
          status: 'error',
          itemsProcessed: 0,
          conflicts: 3
        }
      ];
      setSyncHistory(mockHistory);
    } catch (error) {
      console.error('Error loading sync history:', error);
    }
  };

  const loadSyncStatus = async () => {
    try {
      // This would typically come from your backend
      setLastSync(new Date(Date.now() - 1000 * 60 * 15));
      setSyncStatus('connected');
    } catch (error) {
      console.error('Error loading sync status:', error);
    }
  };

  const performManualSync = async () => {
    setLoading(true);
    setSyncStatus('syncing');
    
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update inventory changes
      await posService.syncInventoryChanges([]);
      
      setSyncStatus('success');
      setLastSync(new Date());
      
      // Add to history
      const newSync = {
        id: Date.now(),
        timestamp: new Date(),
        type: 'manual_sync',
        status: 'success',
        itemsProcessed: Math.floor(Math.random() * 100) + 50,
        conflicts: 0
      };
      setSyncHistory([newSync, ...syncHistory]);
      
    } catch (error) {
      console.error('Sync error:', error);
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const performAutoSync = async () => {
    try {
      await posService.syncInventoryChanges([]);
      setLastSync(new Date());
    } catch (error) {
      console.error('Auto sync error:', error);
    }
  };

  const resolveConflict = async (conflictId, resolution) => {
    try {
      // This would typically call your backend to resolve the conflict
      setConflicts(conflicts.filter(c => c.id !== conflictId));
    } catch (error) {
      console.error('Error resolving conflict:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'error': return 'error';
      case 'syncing': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircleIcon />;
      case 'error': return <ErrorIcon />;
      case 'syncing': return <CircularProgress size={16} />;
      default: return <WarningIcon />;
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          ইনভেন্টরি সিঙ্ক
        </Typography>
        <Box display="flex" gap={2}>
          <Tooltip title="Sync Settings">
            <IconButton onClick={() => setSettingsDialog(true)}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <SyncIcon />}
            onClick={performManualSync}
            disabled={loading}
          >
            {loading ? 'সিঙ্ক হচ্ছে...' : 'ম্যানুয়াল সিঙ্ক'}
          </Button>
        </Box>
      </Box>

      {/* Status Overview */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Chip
                icon={getStatusIcon(syncStatus)}
                label={syncStatus}
                color={getStatusColor(syncStatus)}
                size="large"
              />
            </Box>
            <Typography variant="h6" gutterBottom>
              সিঙ্ক অবস্থা
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {lastSync ? `সর্বশেষ সিঙ্ক: ${lastSync.toLocaleString()}` : 'কোন সিঙ্ক নেই'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {syncHistory.length}
            </Typography>
            <Typography variant="h6" gutterBottom>
              মোট সিঙ্ক
            </Typography>
            <Typography variant="body2" color="text.secondary">
              আজকের সিঙ্ক সংখ্যা
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'error.main' }}>
              {conflicts.length}
            </Typography>
            <Typography variant="h6" gutterBottom>
              দ্বন্দ্ব
            </Typography>
            <Typography variant="body2" color="text.secondary">
              সমাধান প্রয়োজন
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Conflicts Section */}
      {conflicts.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            দ্বন্দ্ব সমাধান
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>পণ্য</TableCell>
                  <TableCell>POS স্টক</TableCell>
                  <TableCell>ইনভেন্টরি স্টক</TableCell>
                  <TableCell>কারণ</TableCell>
                  <TableCell>অ্যাকশন</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conflicts.map((conflict) => (
                  <TableRow key={conflict.id}>
                    <TableCell>{conflict.productName}</TableCell>
                    <TableCell>{conflict.posStock}</TableCell>
                    <TableCell>{conflict.inventoryStock}</TableCell>
                    <TableCell>{conflict.reason}</TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => resolveConflict(conflict.id, 'pos')}
                        >
                          POS ব্যবহার করুন
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => resolveConflict(conflict.id, 'inventory')}
                        >
                          ইনভেন্টরি ব্যবহার করুন
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Sync History */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            সিঙ্ক ইতিহাস
          </Typography>
          <IconButton onClick={loadSyncHistory}>
            <RefreshIcon />
          </IconButton>
        </Box>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>সময়</TableCell>
                <TableCell>ধরন</TableCell>
                <TableCell>অবস্থা</TableCell>
                <TableCell>প্রক্রিয়াকৃত আইটেম</TableCell>
                <TableCell>দ্বন্দ্ব</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {syncHistory.map((sync) => (
                <TableRow key={sync.id}>
                  <TableCell>{sync.timestamp.toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={sync.type.replace('_', ' ')} 
                      size="small" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      icon={getStatusIcon(sync.status)}
                      label={sync.status} 
                      color={getStatusColor(sync.status)}
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{sync.itemsProcessed}</TableCell>
                  <TableCell>
                    {sync.conflicts > 0 ? (
                      <Chip 
                        label={sync.conflicts} 
                        color="error" 
                        size="small" 
                      />
                    ) : (
                      <Chip 
                        label="0" 
                        color="success" 
                        size="small" 
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Settings Dialog */}
      <Dialog open={settingsDialog} onClose={() => setSettingsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>সিঙ্ক সেটিংস</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>স্বয়ংক্রিয় সিঙ্ক</InputLabel>
              <Select
                value={syncSettings.autoSync}
                onChange={(e) => setSyncSettings({ ...syncSettings, autoSync: e.target.value })}
              >
                <MenuItem value={true}>সক্রিয়</MenuItem>
                <MenuItem value={false}>নিষ্ক্রিয়</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              type="number"
              label="সিঙ্ক ব্যবধান (মিনিট)"
              value={syncSettings.syncInterval}
              onChange={(e) => setSyncSettings({ ...syncSettings, syncInterval: parseInt(e.target.value) })}
              disabled={!syncSettings.autoSync}
            />

            <FormControl fullWidth>
              <InputLabel>দ্বন্দ্ব সমাধান</InputLabel>
              <Select
                value={syncSettings.conflictResolution}
                onChange={(e) => setSyncSettings({ ...syncSettings, conflictResolution: e.target.value })}
              >
                <MenuItem value="manual">ম্যানুয়াল</MenuItem>
                <MenuItem value="pos">POS অগ্রাধিকার</MenuItem>
                <MenuItem value="inventory">ইনভেন্টরি অগ্রাধিকার</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialog(false)}>বাতিল</Button>
          <Button onClick={() => setSettingsDialog(false)} variant="contained">
            সংরক্ষণ করুন
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InventorySync; 