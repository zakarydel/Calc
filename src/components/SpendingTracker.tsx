import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  MenuItem,
  Card,
  CardContent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { SpendingItem } from '../App';

interface SpendingTrackerProps {
  expenses: SpendingItem[];
  setExpenses: React.Dispatch<React.SetStateAction<SpendingItem[]>>;
  totalSpending: number;
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

function SpendingTracker({ expenses, setExpenses, totalSpending }: SpendingTrackerProps) {
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Other');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseName || !expenseAmount || !expenseDate || !category) return;

    const newExpense: SpendingItem = {
      name: expenseName,
      value: parseFloat(expenseAmount),
      date: expenseDate,
      category: category,
    };

    setExpenses([...expenses, newExpense]);
    setExpenseName('');
    setExpenseAmount('');
    setExpenseDate(new Date().toISOString().split('T')[0]);
    setCategory('Other');
  };

  const handleDelete = (index: number) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const calculateCategoryTotal = (categoryName: string) => {
    return expenses
      .filter(expense => expense.category === categoryName)
      .reduce((sum, expense) => sum + expense.value, 0);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom align="center">
        Spending Tracker
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Expense Name"
              value={expenseName}
              onChange={(e) => setExpenseName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={expenseAmount}
              onChange={(e) => setExpenseAmount(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary">
              Add Expense
            </Button>
          </Grid>
        </Grid>
      </form>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Spending Summary
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="primary" gutterBottom>
                  Total Spending
                </Typography>
                <Typography variant="h4">
                  ${totalSpending.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography color="primary" gutterBottom>
                  Categories Breakdown
                </Typography>
                {categories.map((cat) => {
                  const total = calculateCategoryTotal(cat);
                  if (total > 0) {
                    return (
                      <Typography key={cat} variant="body2" sx={{ mb: 1 }}>
                        {cat}: ${total.toLocaleString()} ({((total / totalSpending) * 100).toFixed(1)}%)
                      </Typography>
                    );
                  }
                  return null;
                })}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Recent Expenses
        </Typography>
        <List>
          {expenses.map((expense, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={expense.name}
                secondary={
                  <>
                    ${expense.value.toLocaleString()} • {expense.category} • {formatDate(expense.date)}
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
          ))}
        </List>
      </Box>
    </Box>
  );
}

export default SpendingTracker; 