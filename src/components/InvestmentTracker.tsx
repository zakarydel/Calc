import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  MenuItem,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Investment } from '../App';
import { v4 as uuidv4 } from 'uuid';

interface InvestmentTrackerProps {
  investments: Investment[];
  setInvestments: React.Dispatch<React.SetStateAction<Investment[]>>;
}

const ALPHA_VANTAGE_API_KEY = '5CN0UZ8EF7VS5RNA';

function InvestmentTracker({ investments, setInvestments }: InvestmentTrackerProps) {
  const [symbol, setSymbol] = useState('');
  const [type, setType] = useState<'stock' | 'crypto'>('stock');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const updatePrices = async () => {
      setLoading(true);
      setError('');

      try {
        const updatedInvestments = await Promise.all(
          investments.map(async (investment) => {
            try {
              if (investment.type === 'stock') {
                const response = await fetch(
                  `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${investment.symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
                );
                const data = await response.json();
                
                if (data['Global Quote'] && data['Global Quote']['05. price']) {
                  return {
                    ...investment,
                    currentPrice: parseFloat(data['Global Quote']['05. price']),
                    lastUpdated: new Date().toISOString(),
                  };
                } else if (data.Note) {
                  // API rate limit message
                  throw new Error(data.Note);
                }
              } else {
                const response = await fetch(
                  `https://api.coingecko.com/api/v3/simple/price?ids=${investment.symbol.toLowerCase()}&vs_currencies=usd`
                );
                const data = await response.json();
                if (data[investment.symbol.toLowerCase()]) {
                  return {
                    ...investment,
                    currentPrice: data[investment.symbol.toLowerCase()].usd,
                    lastUpdated: new Date().toISOString(),
                  };
                }
              }
              return investment;
            } catch (err) {
              console.error(`Error updating ${investment.symbol}:`, err);
              return investment;
            }
          })
        );

        setInvestments(updatedInvestments);
      } catch (err) {
        setError('Failed to update prices. Please try again later.');
        console.error('Price update error:', err);
      }

      setLoading(false);
    };

    if (investments.length > 0) {
      updatePrices();
      const interval = setInterval(updatePrices, 300000); // Update every 5 minutes
      return () => clearInterval(interval);
    }
  }, [investments, setInvestments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !quantity || !purchasePrice || !purchaseDate) return;

    const newInvestment: Investment = {
      id: uuidv4(),
      symbol: symbol.toUpperCase(),
      type,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate,
    };

    setInvestments([...investments, newInvestment]);
    setSymbol('');
    setQuantity('');
    setPurchasePrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = (id: string) => {
    setInvestments(investments.filter((investment) => investment.id !== id));
  };

  const calculateGainLoss = (investment: Investment) => {
    const currentValue = investment.currentPrice
      ? investment.quantity * investment.currentPrice
      : investment.quantity * investment.purchasePrice;
    const purchaseValue = investment.quantity * investment.purchasePrice;
    return currentValue - purchaseValue;
  };

  const calculateTotalValue = () => {
    return investments.reduce((sum, investment) => {
      const currentValue = investment.currentPrice
        ? investment.quantity * investment.currentPrice
        : investment.quantity * investment.purchasePrice;
      return sum + currentValue;
    }, 0);
  };

  const calculateTotalGainLoss = () => {
    return investments.reduce((sum, investment) => sum + calculateGainLoss(investment), 0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Investment Tracker
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              select
              label="Type"
              value={type}
              onChange={(e) => setType(e.target.value as 'stock' | 'crypto')}
              required
            >
              <MenuItem value="stock">Stock</MenuItem>
              <MenuItem value="crypto">Cryptocurrency</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Symbol"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              required
              helperText={type === 'stock' ? 'e.g., AAPL' : 'e.g., bitcoin'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Purchase Price"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="Purchase Date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ height: '100%' }}
            >
              Add Investment
            </Button>
          </Grid>
        </Grid>
      </form>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="primary" gutterBottom>
                  Total Portfolio Value
                </Typography>
                <Typography variant="h4">
                  ${calculateTotalValue().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography
                  color={calculateTotalGainLoss() >= 0 ? "primary" : "error"}
                  gutterBottom
                >
                  Total Gain/Loss
                </Typography>
                <Typography
                  variant="h4"
                  color={calculateTotalGainLoss() >= 0 ? "primary" : "error"}
                >
                  ${calculateTotalGainLoss().toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Investment List {loading && <CircularProgress size={20} sx={{ ml: 1 }} />}
        </Typography>
        <List>
          {investments.map((investment) => {
            const gainLoss = calculateGainLoss(investment);
            return (
              <Card key={investment.id} sx={{ mb: 2 }}>
                <CardContent>
                  <ListItem>
                    <ListItemText
                      primary={`${investment.symbol} (${investment.type.toUpperCase()})`}
                      secondary={
                        <>
                          <Typography component="span" display="block">
                            Quantity: {investment.quantity} • Purchase Price: ${investment.purchasePrice}
                          </Typography>
                          <Typography component="span" display="block">
                            Current Price: ${investment.currentPrice?.toLocaleString() ?? 'Loading...'}
                          </Typography>
                          <Typography
                            component="span"
                            display="block"
                            color={gainLoss >= 0 ? "primary" : "error"}
                          >
                            Gain/Loss: ${gainLoss.toLocaleString()} ({((gainLoss / (investment.quantity * investment.purchasePrice)) * 100).toFixed(2)}%)
                          </Typography>
                          {investment.lastUpdated && (
                            <Typography variant="caption" color="text.secondary">
                              Last updated: {new Date(investment.lastUpdated).toLocaleString()}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(investment.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </CardContent>
              </Card>
            );
          })}
        </List>
      </Box>
    </Box>
  );
}

export default InvestmentTracker; 