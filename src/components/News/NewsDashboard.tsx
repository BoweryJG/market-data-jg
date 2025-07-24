import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Divider, 
  CircularProgress,
  Alert
} from '@mui/material';
import CategoryNewsSection from './CategoryNewsSection';
import { useTopProcedureCategoriesWithNews, ProcedureCategory } from '../../services/newsService';

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
      id={`news-tabpanel-${index}`}
      aria-labelledby={`news-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Fallback mock data in case the database doesn't have categories yet
const mockDentalCategories: ProcedureCategory[] = [
  {
    id: 1,
    category_name: 'Preventive',
    applicable_to: 'dental',
    market_size_usd_millions: 128700,
    avg_growth_rate: 7.8
  },
  {
    id: 2,
    category_name: 'Restorative',
    applicable_to: 'dental',
    market_size_usd_millions: 70000,
    avg_growth_rate: 4.5
  },
  {
    id: 3,
    category_name: 'Diagnostic',
    applicable_to: 'dental',
    market_size_usd_millions: 17000,
    avg_growth_rate: 10.11
  }
];

// Mock data for aesthetic categories
const mockAestheticCategories: ProcedureCategory[] = [
  {
    id: 4,
    category_name: 'Minimally Invasive',
    applicable_to: 'aesthetic',
    market_size_usd_millions: 74000,
    avg_growth_rate: 9.2
  },
  {
    id: 5,
    category_name: 'Body Procedures',
    applicable_to: 'aesthetic',
    market_size_usd_millions: 22500,
    avg_growth_rate: 8.9
  },
  {
    id: 6,
    category_name: 'Hair Procedures',
    applicable_to: 'aesthetic',
    market_size_usd_millions: 6460,
    avg_growth_rate: 16.6
  }
];

const NewsDashboard: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch dental categories using the custom hook
  const { 
    categories: dentalCategories, 
    loading: dentalLoading, 
    error: dentalError 
  } = useTopProcedureCategoriesWithNews('dental', 3);
  
  // Fetch aesthetic categories using the custom hook
  const { 
    categories: aestheticCategories, 
    loading: aestheticLoading, 
    error: aestheticError 
  } = useTopProcedureCategoriesWithNews('aesthetic', 3);
  
  // Determine overall loading and error state
  const loading = dentalLoading || aestheticLoading;
  const error = dentalError || aestheticError;
  
  // Fallback to mock data if no categories are found
  const displayDentalCategories = dentalCategories.length > 0 ? dentalCategories : mockDentalCategories;
  const displayAestheticCategories = aestheticCategories.length > 0 ? aestheticCategories : mockAestheticCategories;

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Industry News
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Latest news and updates from the dental and aesthetic industries, categorized by procedure types.
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="industry news tabs"
          sx={{ px: 3 }}
        >
          <Tab label="Dental" id="news-tab-0" aria-controls="news-tabpanel-0" />
          <Tab label="Aesthetic" id="news-tab-1" aria-controls="news-tabpanel-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {displayDentalCategories.length > 0 ? (
          displayDentalCategories.map((category) => (
            <CategoryNewsSection
              key={category.id}
              categoryId={category.id}
              categoryName={category.category_name}
              industry="dental"
              limit={3}
            />
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No dental news categories found.
            </Typography>
          </Box>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {displayAestheticCategories.length > 0 ? (
          displayAestheticCategories.map((category) => (
            <CategoryNewsSection
              key={category.id}
              categoryId={category.id}
              categoryName={category.category_name}
              industry="aesthetic"
              limit={3}
            />
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No aesthetic news categories found.
            </Typography>
          </Box>
        )}
      </TabPanel>
    </Paper>
  );
};

NewsDashboard.displayName = 'NewsDashboard';

export default NewsDashboard;
