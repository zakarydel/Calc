import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Tabs,
  Tab,
  Button,
} from '@mui/material';
import AssetLiabilityForm from './components/AssetLiabilityForm';
import NetWorthSummary from './components/NetWorthSummary';
import SpendingTracker from './components/SpendingTracker';
import BudgetPlanner from './components/BudgetPlanner';
import InvestmentTracker from './components/InvestmentTracker';
import Auth from './components/Auth';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

// Add version number
const APP_VERSION = '1.0.1';

export interface FinancialItem {
  name: string;
  value: number;
  date: string;
}

export interface SpendingItem extends FinancialItem {
  category: string;
}

export interface BudgetItem {
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
}

export interface Investment {
  id: string;
  symbol: string;
  type: 'stock' | 'crypto';
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  lastUpdated?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function Dashboard() {
  const [assets, setAssets] = useState<FinancialItem[]>([]);
  const [liabilities, setLiabilities] = useState<FinancialItem[]>([]);
  const [expenses, setExpenses] = useState<SpendingItem[]>([]);
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { currentUser, logout } = useAuth();

  // Load user data when component mounts
  useEffect(() => {
    async function loadUserData() {
      if (currentUser) {
        try {
          setIsLoading(true);
          const userDoc = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(userDoc);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            setAssets(data.assets || []);
            setLiabilities(data.liabilities || []);
            setExpenses(data.expenses || []);
            setBudgets(data.budgets || []);
            setInvestments(data.investments || []);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadUserData();
  }, [currentUser]);

  // Save user data whenever it changes
  useEffect(() => {
    const saveUserData = async () => {
      if (currentUser && !isLoading) {
        try {
          const userDoc = doc(db, 'users', currentUser.uid);
          await setDoc(userDoc, {
            assets,
            liabilities,
            expenses,
            budgets,
            investments,
            lastUpdated: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          console.error('Error saving user data:', error);
        }
      }
    };

    const debounceTimer = setTimeout(saveUserData, 1000);
    return () => clearTimeout(debounceTimer);
  }, [currentUser, assets, liabilities, expenses, budgets, investments, isLoading]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  const calculateTotalSpending = () => {
    return expenses.reduce((sum, expense) => sum + expense.value, 0);
  };

  const calculateInvestmentValue = () => {
    return investments.reduce((sum, investment) => {
      const currentValue = investment.currentPrice 
        ? investment.quantity * investment.currentPrice
        : investment.quantity * investment.purchasePrice;
      return sum + currentValue;
    }, 0);
  };

  const calculateNetWorth = () => {
    const totalAssets = assets.reduce((sum, asset) => sum + asset.value, 0);
    const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.value, 0);
    const totalExpenses = calculateTotalSpending();
    const investmentsValue = calculateInvestmentValue();
    return totalAssets + investmentsValue - totalLiabilities - totalExpenses;
  };

  const calculateMonthlySpending = (category: string) => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return expenses
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.category === category && expenseDate >= firstDayOfMonth;
      })
      .reduce((sum, expense) => sum + expense.value, 0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h5">Loading your financial data...</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h2" component="h1">
            Financial Dashboard
          </Typography>
          <Button variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>

        <Typography variant="h6" color="text.secondary" align="center" paragraph>
          Track your financial health and spending
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab label="Net Worth" />
            <Tab label="Spending" />
            <Tab label="Budget" />
            <Tab label="Investments" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <AssetLiabilityForm
              assets={assets}
              liabilities={liabilities}
              setAssets={setAssets}
              setLiabilities={setLiabilities}
            />
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <NetWorthSummary
              assets={assets}
              liabilities={liabilities}
              netWorth={calculateNetWorth()}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <SpendingTracker
              expenses={expenses}
              setExpenses={setExpenses}
              totalSpending={calculateTotalSpending()}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <BudgetPlanner
              budgets={budgets}
              setBudgets={setBudgets}
              calculateMonthlySpending={calculateMonthlySpending}
            />
          </Paper>
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <InvestmentTracker
              investments={investments}
              setInvestments={setInvestments}
            />
          </Paper>
        </TabPanel>
      </Box>
    </Container>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { currentUser } = useAuth();

  return currentUser ? <Dashboard /> : <Auth />;
}

export default App; 