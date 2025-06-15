# Frontend Updates Required for Market Maturity Stage

## Summary
The `market_maturity_stage` column has been added to the database but won't automatically appear in your React app. Here are the changes needed:

## 1. Update Type Definitions

### Option A: Update database.types.ts
Add to the `aesthetic_procedures` and `dental_procedures` Row types:
```typescript
market_maturity_stage: string | null
```

### Option B: Create a custom type extension
```typescript
interface ProcedureWithMaturity extends Procedure {
  market_maturity_stage?: 'Emerging' | 'Growth' | 'Expansion' | 'Mature' | 'Saturated' | null;
}
```

## 2. Update MarketCommandCenter.tsx

### Add Table Header (after line 1368):
```tsx
<TableCell align="center">
  <TableSortLabel
    active={sortConfig.key === 'market_maturity_stage'}
    direction={sortConfig.direction}
    onClick={() => handleSort('market_maturity_stage')}
  >
    Maturity
  </TableSortLabel>
</TableCell>
```

### Add Table Cell (in the table body, after growth percentage):
```tsx
<TableCell align="center">
  <Chip
    label={procedure.market_maturity_stage || 'N/A'}
    size="small"
    color={
      procedure.market_maturity_stage === 'Emerging' ? 'success' :
      procedure.market_maturity_stage === 'Growth' ? 'primary' :
      procedure.market_maturity_stage === 'Expansion' ? 'info' :
      procedure.market_maturity_stage === 'Mature' ? 'warning' :
      'default'
    }
    sx={{
      fontWeight: 'bold',
      minWidth: 80
    }}
  />
</TableCell>
```

## 3. Update Data Fetching

Make sure your Supabase queries include the new column:

```typescript
const { data: procedures } = await supabase
  .from('aesthetic_procedures')
  .select('*, market_maturity_stage')  // Include the new column
  .order('market_maturity_stage', { ascending: true });
```

## 4. Add Visual Indicators

### Maturity Stage Icons
```tsx
const getMaturityIcon = (stage: string) => {
  switch(stage) {
    case 'Emerging': return <RocketLaunch color="success" />;
    case 'Growth': return <TrendingUp color="primary" />;
    case 'Expansion': return <ExpandCircleDown color="info" />;
    case 'Mature': return <Balance color="warning" />;
    case 'Saturated': return <Compress color="error" />;
    default: return null;
  }
};
```

## 5. Add Filtering Options

```tsx
// Add to filter state
const [maturityFilter, setMaturityFilter] = useState<string>('all');

// Add filter buttons
<ToggleButtonGroup
  value={maturityFilter}
  exclusive
  onChange={(e, value) => setMaturityFilter(value || 'all')}
>
  <ToggleButton value="all">All Stages</ToggleButton>
  <ToggleButton value="Emerging">Emerging</ToggleButton>
  <ToggleButton value="Growth">Growth</ToggleButton>
  <ToggleButton value="Expansion">Expansion</ToggleButton>
  <ToggleButton value="Mature">Mature</ToggleButton>
  <ToggleButton value="Saturated">Saturated</ToggleButton>
</ToggleButtonGroup>

// Apply filter
const filteredProcedures = procedures.filter(p => 
  maturityFilter === 'all' || p.market_maturity_stage === maturityFilter
);
```

## 6. Update ProcedureDetailsModal

Add maturity stage to the details view:

```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
  <Typography variant="subtitle2" color="text.secondary">
    Market Maturity:
  </Typography>
  <Chip
    label={procedure.market_maturity_stage || 'N/A'}
    color={getMaturityColor(procedure.market_maturity_stage)}
    icon={getMaturityIcon(procedure.market_maturity_stage)}
  />
</Box>
```

## 7. Add to Dashboard Metrics

```tsx
// Group procedures by maturity
const maturityDistribution = procedures.reduce((acc, proc) => {
  const stage = proc.market_maturity_stage || 'Unknown';
  acc[stage] = (acc[stage] || 0) + 1;
  return acc;
}, {});

// Display as chart or metric cards
```

## Quick Implementation

To quickly see the new column in action:

1. Add `market_maturity_stage: string | null` to your procedure type
2. Update your table headers and cells as shown above
3. Ensure your queries include the new column

The column is already populated in the database, so once you update the frontend, the data will appear immediately!