import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  Card,
  CardContent,
  MenuItem,
  LinearProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { BudgetItem } from '../App';

interface BudgetPlannerProps {
  budgets: BudgetItem[];
  setBudgets: React.Dispatch<React.SetStateAction<BudgetItem[]>>;
  calculateMonthlySpending: (category: string) => number;
}

const categories = [
  'Food & Dining',
  'Transportation',
  'Housing',
  'Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Travel',
  'Education',
  'Other'
];

function BudgetPlanner({ budgets, setBudgets, calculateMonthlySpending }: BudgetPlannerProps) {
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !limit) return;

    const newBudget: BudgetItem = {
      category,
      limit: parseFloat(limit),
      period,
    };

    setBudgets([...budgets, newBudget]);
    setCategory('');
    setLimit('');
    setPeriod('monthly');
  };

  const handleDelete = (index: number) => {
    setBudgets(budgets.filter((_, i) => i !== index));
  };

  const calculateProgress = (budget: BudgetItem) => {
    const spent = calculateMonthlySpending(budget.category);
    const monthlyLimit = budget.period === 'yearly' ? budget.limit / 12 : budget.limit;
    return (spent / monthlyLimit) * 100;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'error';
    if (progress >= 75) return 'warning';
    return 'primary';
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Budget Planner
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories
                .filter(cat => !budgets.some(budget => budget.category === cat))
                .map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Budget Limit"
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              select
              label="Period"
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'monthly' | 'yearly')}
              required
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Add Budget
            </Button>
          </Grid>
        </Grid>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Budget Overview
        </Typography>
        <List>
          {budgets.map((budget, index) => {
            const progress = calculateProgress(budget);
            const spent = calculateMonthlySpending(budget.category);
            const monthlyLimit = budget.period === 'yearly' ? budget.limit / 12 : budget.limit;

            return (
              <Card key={index} sx={{ mb: 2 }}>
                <CardContent>
                  <ListItem>
                    <ListItemText
                      primary={budget.category}
                      secondary={
                        <>
                          ${spent.toLocaleString()} spent of ${monthlyLimit.toLocaleString()} {budget.period === 'yearly' ? '(monthly average)' : ''}
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                            color={getProgressColor(progress)}
                            sx={{ mt: 1, mb: 1, height: 8, borderRadius: 4 }}
                          />
                          {progress >= 100 && (
                            <Typography color="error" variant="body2">
                              Budget exceeded by ${(spent - monthlyLimit).toLocaleString()}
                            </Typography>
                          )}
                        </>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(index)}
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

export default BudgetPlanner; 