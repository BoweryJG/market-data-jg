# Safe Data Enrichment Plan for Market Data

## Phase 1: Data Quality Fixes (No Schema Changes)

### 1. Remove Duplicates
```sql
-- Identify and remove duplicate dental procedures
WITH duplicates AS (
  SELECT id, procedure_name,
    ROW_NUMBER() OVER(PARTITION BY procedure_name ORDER BY id) as rn
  FROM dental_procedures
)
DELETE FROM dental_procedures 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
```

### 2. Fix Category Mappings
```sql
-- Map dental procedures to correct categories based on procedure names
UPDATE dental_procedures SET category_id = 
  CASE 
    WHEN procedure_name ILIKE '%implant%' THEN (SELECT id FROM categories WHERE category_label = 'Implants' AND industry = 'dental')
    WHEN procedure_name ILIKE '%whitening%' THEN (SELECT id FROM categories WHERE category_label = 'Cosmetic Dentistry' AND industry = 'dental')
    WHEN procedure_name ILIKE '%root canal%' THEN (SELECT id FROM categories WHERE category_label = 'Endodontics' AND industry = 'dental')
    -- Add more mappings
    ELSE category_id
  END;
```

### 3. Add Missing Complexity Values
```sql
-- Add complexity to aesthetic procedures based on procedure characteristics
UPDATE aesthetic_procedures SET complexity = 
  CASE 
    WHEN average_cost_usd > 10000 THEN 'High'
    WHEN average_cost_usd > 5000 THEN 'Medium'
    ELSE 'Low'
  END
WHERE complexity IS NULL;
```

## Phase 2: Safe Data Enrichment Using MCP Tools

### 1. Market Size Validation (Brave/Perplexity Search)
```typescript
// Use MCP tools to get real market data
const enrichMarketData = async (procedureName: string) => {
  const searchQuery = `${procedureName} market size 2025 USD millions healthcare`;
  // Use mcp__brave__brave_web_search or mcp__perplexity__search
  // Update only where current data seems incorrect (all same values)
};
```

### 2. AI/Robotics Integration Flags (Firecrawl)
```typescript
// Search for procedures using robotic/AI technology
const enrichRoboticsData = async () => {
  const roboticProcedures = [
    'CEREC', 'CAD/CAM', 'Robotic Implant', 'AI-guided surgery'
  ];
  // Use mcp__firecrawl__firecrawl_search to find current robotic dental procedures
  // Update robotics_ai_used flag accordingly
};
```

### 3. Expanded Descriptions (OpenAI/Perplexity)
```typescript
// Generate clinical descriptions for procedures
const enrichDescriptions = async (procedure: any) => {
  const prompt = `Generate a 2-3 sentence clinical description for ${procedure.procedure_name} including benefits, typical duration, and recovery time`;
  // Use mcp__openai__openai_chat or mcp__perplexity__reason
  // Store in expanded_description field
};
```

### 4. Real Market Growth Rates (Brave Search)
```typescript
// Get current CAGR for each procedure category
const enrichGrowthRates = async (category: string) => {
  const searchQuery = `${category} procedures CAGR 2025 growth rate percent`;
  // Use mcp__brave__brave_web_search
  // Update yearly_growth_percentage with real data
};
```

## Phase 3: Monitoring & Validation

### Before Enrichment:
1. Create backup of current data
2. Test queries on a few records first
3. Validate that views still work

### During Enrichment:
1. Log all changes made
2. Update in small batches (10-20 records)
3. Verify application still functions

### After Enrichment:
1. Run validation queries
2. Check all dependent views
3. Test application functionality

## Safe SQL Examples:

```sql
-- Safe update - only touching NULL values
UPDATE dental_procedures 
SET expanded_description = 'Enriched description here'
WHERE id = 123 AND expanded_description IS NULL;

-- Safe update - using existing columns
UPDATE dental_procedures 
SET robotics_ai_used = true
WHERE procedure_name IN ('CEREC Crown', 'CAD/CAM Bridge')
AND robotics_ai_used IS NULL;

-- Safe update - fixing data quality
UPDATE aesthetic_procedures
SET market_size_us = 1250.5
WHERE procedure_name = 'Botox Injection'
AND market_size_us = 50201.315789473684; -- Replace placeholder
```

## What NOT to Do:
- ❌ ALTER TABLE statements
- ❌ DROP or RENAME columns
- ❌ Change data types
- ❌ Modify constraints
- ❌ Delete records (unless duplicates)