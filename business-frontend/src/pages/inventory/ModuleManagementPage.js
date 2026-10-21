import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Switch,
  FormControlLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Divider,
  Snackbar,
  Tooltip,
  LinearProgress
} from '@mui/material';
import {
  Lock as LockIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useModules } from '../../contexts/ModuleContext';
import { MODULES, MODULE_CATEGORIES, getModuleById } from '../../config/modules';
import ModuleIcon from '../../components/ModuleIcon';

const ModuleManagementPage = () => {
  const { 
    enabledModules, 
    isModuleEnabled, 
    canEnableModule, 
    enableModule, 
    disableModule,
    loading: modulesLoading 
  } = useModules();
  
  const [selectedModule, setSelectedModule] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [action, setAction] = useState(null); // 'enable' or 'disable'
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleToggleModule = (moduleId, currentState) => {
    setSelectedModule(moduleId);
    setAction(currentState ? 'disable' : 'enable');
    setConfirmDialog(true);
  };

  const confirmToggle = async () => {
    if (!selectedModule) return;
    
    setProcessing(true);
    try {
      let success = false;
      if (action === 'enable') {
        await enableModule(selectedModule);
        setSnackbar({
          open: true,
          message: `${getModuleById(selectedModule)?.nameBn || selectedModule} সফলভাবে সক্রিয় করা হয়েছে`,
          severity: 'success'
        });
        success = true;
      } else {
        await disableModule(selectedModule);
        setSnackbar({
          open: true,
          message: `${getModuleById(selectedModule)?.nameBn || selectedModule} সফলভাবে নিষ্ক্রিয় করা হয়েছে`,
          severity: 'info'
        });
        success = true;
      }
      
      if (success) {
        setConfirmDialog(false);
        setSelectedModule(null);
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'একটি ত্রুটি হয়েছে',
        severity: 'error'
      });
    } finally {
      setProcessing(false);
    }
  };

  // Group modules by category
  const modulesByCategory = Object.values(MODULES).reduce((acc, module) => {
    if (module.required) return acc; // Skip required modules (they're always enabled)
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {});

  if (modulesLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Loading modules...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
          Module Management
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          আপনার ব্যবসার প্রয়োজন অনুযায়ী মডিউলগুলি নির্বাচন করুন। যেকোনো সময় মডিউল সক্রিয় বা নিষ্ক্রিয় করতে পারেন।
        </Typography>
        <Alert severity="info" icon={<InfoIcon />}>
          বর্তমানে {enabledModules.length} টি মডিউল সক্রিয় রয়েছে
        </Alert>
      </Box>

      {/* Core Modules Info */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Core Modules (সবসময় সক্রিয়)
        </Typography>
        <Grid container spacing={2}>
          {Object.values(MODULES)
            .filter(module => module.required)
            .map((module) => (
              <Grid item xs={12} sm={6} md={4} key={module.id}>
                <Card sx={{ border: '2px solid', borderColor: 'success.main' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Box
                        sx={{
                          mr: 2,
                          color: 'success.main',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        <ModuleIcon moduleId={module.id} />
                      </Box>
                      <Box>
                        <Typography variant="h6">{module.nameBn}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {module.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {module.descriptionBn}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Chip label="Always Active" color="success" size="small" />
                  </CardActions>
                </Card>
              </Grid>
            ))}
        </Grid>
      </Box>

      {/* Module Categories */}
      {Object.entries(MODULE_CATEGORIES).map(([categoryKey, category]) => {
        const categoryModules = modulesByCategory[categoryKey] || [];
        if (categoryModules.length === 0) return null;

        return (
          <Box key={categoryKey} sx={{ mb: 5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 4,
                  height: 32,
                  backgroundColor: category.color,
                  mr: 2,
                  borderRadius: 1
                }}
              />
              <Typography variant="h5" sx={{ fontWeight: 600, color: category.color }}>
                {category.nameBn} ({category.name})
              </Typography>
            </Box>
            
            <Grid container spacing={3}>
              {categoryModules.map((module) => {
                const enabled = isModuleEnabled(module.id);
                const canEnable = canEnableModule(module.id);
                const hasDependencies = module.dependencies && module.dependencies.length > 0;
                const dependenciesMet = hasDependencies
                  ? module.dependencies.every(dep => isModuleEnabled(dep))
                  : true;

                return (
                  <Grid item xs={12} sm={6} md={4} key={module.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        border: enabled ? '2px solid' : '1px solid',
                        borderColor: enabled ? category.color : 'divider',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-2px)'
                        }
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                          <Box
                            sx={{
                              mr: 2,
                              color: enabled ? category.color : 'text.secondary',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                          >
                            <ModuleIcon moduleId={module.id} />
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {module.nameBn}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {module.name}
                            </Typography>
                          </Box>
                          {enabled && (
                            <CheckCircleIcon sx={{ color: category.color }} />
                          )}
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {module.descriptionBn}
                        </Typography>

                        {hasDependencies && (
                          <Alert 
                            severity={dependenciesMet ? 'info' : 'warning'} 
                            sx={{ mb: 2 }}
                            icon={<InfoIcon />}
                          >
                            <Typography variant="caption">
                              প্রয়োজন: {module.dependencies
                                .map(dep => {
                                  const depModule = getModuleById(dep);
                                  return depModule ? depModule.nameBn : dep;
                                })
                                .join(', ')}
                            </Typography>
                          </Alert>
                        )}
                        
                        {!dependenciesMet && !enabled && (
                          <Alert severity="error" sx={{ mb: 2 }} icon={<ErrorIcon />}>
                            <Typography variant="caption">
                              প্রথমে নির্ভরতা সক্রিয় করুন
                            </Typography>
                          </Alert>
                        )}
                      </CardContent>
                      
                      <Divider />
                      
                      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={enabled}
                              onChange={() => handleToggleModule(module.id, enabled)}
                              disabled={!canEnable && !enabled}
                              sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                  color: category.color,
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                  backgroundColor: category.color,
                                },
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Typography>
                          }
                        />
                        {enabled && (
                          <Chip 
                            label="Active" 
                            sx={{ 
                              backgroundColor: category.color,
                              color: 'white',
                            }}
                            size="small"
                            icon={<CheckCircleIcon sx={{ color: 'white !important' }} />}
                          />
                        )}
                        {!canEnable && !enabled && (
                          <Tooltip title="ডিপেন্ডেন্সি সক্রিয় করুন">
                            <LockIcon color="disabled" />
                          </Tooltip>
                        )}
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        );
      })}

      {/* Confirmation Dialog */}
      <Dialog 
        open={confirmDialog} 
        onClose={() => !processing && setConfirmDialog(false)}
        maxWidth="sm"
        fullWidth
        disableScrollLock={true}
      >
        <DialogTitle>
          {action === 'enable' ? 'Module সক্রিয় করুন' : 'Module নিষ্ক্রিয় করুন'}
        </DialogTitle>
        <DialogContent>
          {processing && <LinearProgress sx={{ mb: 2 }} />}
          <Typography variant="body1" sx={{ mb: 2 }}>
            আপনি কি নিশ্চিত যে আপনি "{getModuleById(selectedModule)?.nameBn || selectedModule}" 
            মডিউলটি {action === 'enable' ? 'সক্রিয়' : 'নিষ্ক্রিয়'} করতে চান?
          </Typography>
          {action === 'disable' && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              <Typography variant="body2">
                এই মডিউলটি নিষ্ক্রিয় করলে সম্পর্কিত সমস্ত ফিচার এবং রাউট গুলো লুকিয়ে যাবে।
              </Typography>
            </Alert>
          )}
          {action === 'enable' && selectedModule && getModuleById(selectedModule)?.dependencies && (
            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                এই মডিউলটি সক্রিয় করার জন্য নিম্নলিখিত মডিউলগুলি প্রয়োজন:
              </Typography>
              <Box component="ul" sx={{ mt: 1, pl: 2 }}>
                {getModuleById(selectedModule).dependencies.map(dep => {
                  const depModule = getModuleById(dep);
                  return (
                    <li key={dep}>
                      <Typography variant="body2">
                        {depModule ? depModule.nameBn : dep}
                      </Typography>
                    </li>
                  );
                })}
              </Box>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setConfirmDialog(false)} 
            disabled={processing}
          >
            বাতিল
          </Button>
          <Button
            onClick={confirmToggle}
            variant="contained"
            disabled={processing}
            color={action === 'enable' ? 'primary' : 'warning'}
          >
            {processing ? 'প্রসেসিং...' : 'নিশ্চিত করুন'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ModuleManagementPage;

