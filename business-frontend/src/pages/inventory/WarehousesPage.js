import React from 'react';
import { Box, Typography } from '@mui/material';
import { Warehouse as WarehouseIcon } from '@mui/icons-material';

/**
 * Placeholder for গুদাম (Warehouses) management.
 * Accepts embedded prop when used inside BusinessSettingsPage tabs.
 */
const WarehousesPage = ({ embedded = false } = {}) => (
  <Box sx={{ py: embedded ? 0 : 2 }}>
    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <WarehouseIcon />
      গুদাম তালিকা
    </Typography>
    <Typography color="text.secondary">
      গুদাম ও স্টক স্থান পরিচালনা। এই বিভাগটি শীঘ্রই যুক্ত হবে।
    </Typography>
  </Box>
);

export default WarehousesPage;
