import React from 'react';
import {
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { FinancialItem, SpendingItem } from '../App';

interface NetWorthSummaryProps {
  assets: FinancialItem[];
  liabilities: FinancialItem[];
  netWorth: number;
}

function NetWorthSummary({ assets, liabilities, netWorth }: NetWorthSummaryProps) {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Financial Summary
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="primary" gutterBottom>
                Total Assets
              </Typography>
              <Typography variant="h4">
                ${totalAssets.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="error" gutterBottom>
                Total Liabilities
              </Typography>
              <Typography variant="h4" color="error">
                ${totalLiabilities.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color={netWorth >= 0 ? "primary" : "error"} gutterBottom>
                Net Worth
              </Typography>
              <Typography variant="h4" color={netWorth >= 0 ? "primary" : "error"}>
                ${netWorth.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                (Assets - Liabilities - Expenses)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NetWorthSummary; 