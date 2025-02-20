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
  Tab,
  Tabs,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FinancialItem } from '../App';

interface AssetLiabilityFormProps {
  assets: FinancialItem[];
  liabilities: FinancialItem[];
  setAssets: React.Dispatch<React.SetStateAction<FinancialItem[]>>;
  setLiabilities: React.Dispatch<React.SetStateAction<FinancialItem[]>>;
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

function AssetLiabilityForm({ assets, liabilities, setAssets, setLiabilities }: AssetLiabilityFormProps) {
  const [tabValue, setTabValue] = useState(0);
  const [itemName, setItemName] = useState('');
  const [itemValue, setItemValue] = useState('');
  const [itemDate, setItemDate] = useState(new Date().toISOString().split('T')[0]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemValue || !itemDate) return;

    const newItem: FinancialItem = {
      name: itemName,
      value: parseFloat(itemValue),
      date: itemDate,
    };

    if (tabValue === 0) {
      setAssets([...assets, newItem]);
    } else {
      setLiabilities([...liabilities, newItem]);
    }

    setItemName('');
    setItemValue('');
    setItemDate(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = (index: number, isAsset: boolean) => {
    if (isAsset) {
      setAssets(assets.filter((_, i) => i !== index));
    } else {
      setLiabilities(liabilities.filter((_, i) => i !== index));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Tabs value={tabValue} onChange={handleTabChange} centered>
        <Tab label="Assets" />
        <Tab label="Liabilities" />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          Add Asset
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Asset Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Add Asset
              </Button>
            </Grid>
          </Grid>
        </form>
        <List>
          {assets.map((asset, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={asset.name}
                secondary={
                  <>
                    ${asset.value.toLocaleString()} • Added {formatDate(asset.date)}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(index, true)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Add Liability
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Liability Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Value"
                type="number"
                value={itemValue}
                onChange={(e) => setItemValue(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={itemDate}
                onChange={(e) => setItemDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="secondary">
                Add Liability
              </Button>
            </Grid>
          </Grid>
        </form>
        <List>
          {liabilities.map((liability, index) => (
            <ListItem key={index}>
              <ListItemText
                primary={liability.name}
                secondary={
                  <>
                    ${liability.value.toLocaleString()} • Added {formatDate(liability.date)}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => handleDelete(index, false)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </TabPanel>
    </Box>
  );
}

export default AssetLiabilityForm; 