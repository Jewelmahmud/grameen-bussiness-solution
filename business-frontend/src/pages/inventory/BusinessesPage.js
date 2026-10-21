import React from 'react';
import { Box, Typography } from '@mui/material';
import { Store as StoreIcon } from '@mui/icons-material';

/**
 * Placeholder for শাখা / দোকান (Businesses) management.
 * Accepts embedded prop when used inside BusinessSettingsPage tabs.
 */
const BusinessesPage = ({ embedded = false } = {}) => (
  <Box sx={{ py: embedded ? 0 : 2 }}>
    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <StoreIcon />
      শাখা / দোকান তালিকা
    </Typography>
    <Typography color="text.secondary">
      ব্যবসার শাখা ও দোকান পরিচালনা। এই বিভাগটি শীঘ্রই যুক্ত হবে।
    </Typography>
  </Box>
);

export default BusinessesPage;
