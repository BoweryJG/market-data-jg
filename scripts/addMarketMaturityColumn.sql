-- Safe Migration Script: Add market_maturity_stage column
-- Date: 2025-01-08
-- Purpose: Add market maturity stage classification to procedures tables

-- STEP 1: Create backup tables with timestamp
CREATE TABLE IF NOT EXISTS aesthetic_procedures_backup_maturity_20250108 AS 
SELECT * FROM aesthetic_procedures;

CREATE TABLE IF NOT EXISTS dental_procedures_backup_maturity_20250108 AS 
SELECT * FROM dental_procedures;

-- STEP 2: Add the new column to both tables
-- Using VARCHAR(20) to store: Emerging, Growth, Expansion, Mature, Saturated
ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS market_maturity_stage VARCHAR(20);

ALTER TABLE dental_procedures 
ADD COLUMN IF NOT EXISTS market_maturity_stage VARCHAR(20);

-- STEP 3: Create a function to calculate market maturity
CREATE OR REPLACE FUNCTION calculate_market_maturity(growth_rate NUMERIC)
RETURNS VARCHAR(20) AS $$
BEGIN
    IF growth_rate IS NULL THEN
        RETURN NULL;
    ELSIF growth_rate > 15 THEN
        RETURN 'Emerging';
    ELSIF growth_rate > 10 THEN
        RETURN 'Growth';
    ELSIF growth_rate > 5 THEN
        RETURN 'Expansion';
    ELSIF growth_rate > 2 THEN
        RETURN 'Mature';
    ELSE
        RETURN 'Saturated';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Update aesthetic_procedures with market maturity
UPDATE aesthetic_procedures
SET market_maturity_stage = calculate_market_maturity(yearly_growth_percentage)
WHERE yearly_growth_percentage IS NOT NULL;

-- STEP 5: Update dental_procedures with market maturity
UPDATE dental_procedures
SET market_maturity_stage = calculate_market_maturity(yearly_growth_percentage)
WHERE yearly_growth_percentage IS NOT NULL;

-- STEP 6: Add check constraint to ensure valid values
ALTER TABLE aesthetic_procedures
ADD CONSTRAINT check_market_maturity_stage_aesthetic
CHECK (market_maturity_stage IN ('Emerging', 'Growth', 'Expansion', 'Mature', 'Saturated') OR market_maturity_stage IS NULL);

ALTER TABLE dental_procedures
ADD CONSTRAINT check_market_maturity_stage_dental
CHECK (market_maturity_stage IN ('Emerging', 'Growth', 'Expansion', 'Mature', 'Saturated') OR market_maturity_stage IS NULL);

-- STEP 7: Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_aesthetic_market_maturity ON aesthetic_procedures(market_maturity_stage);
CREATE INDEX IF NOT EXISTS idx_dental_market_maturity ON dental_procedures(market_maturity_stage);

-- STEP 8: Create a trigger to automatically update market_maturity_stage when growth rate changes
CREATE OR REPLACE FUNCTION update_market_maturity_trigger()
RETURNS TRIGGER AS $$
BEGIN
    NEW.market_maturity_stage := calculate_market_maturity(NEW.yearly_growth_percentage);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to aesthetic_procedures
DROP TRIGGER IF EXISTS update_aesthetic_market_maturity ON aesthetic_procedures;
CREATE TRIGGER update_aesthetic_market_maturity
BEFORE INSERT OR UPDATE OF yearly_growth_percentage ON aesthetic_procedures
FOR EACH ROW
EXECUTE FUNCTION update_market_maturity_trigger();

-- Apply trigger to dental_procedures
DROP TRIGGER IF EXISTS update_dental_market_maturity ON dental_procedures;
CREATE TRIGGER update_dental_market_maturity
BEFORE INSERT OR UPDATE OF yearly_growth_percentage ON dental_procedures
FOR EACH ROW
EXECUTE FUNCTION update_market_maturity_trigger();

-- STEP 9: Verify the migration
SELECT 
    'Migration Summary' as report,
    (SELECT COUNT(*) FROM aesthetic_procedures WHERE market_maturity_stage IS NOT NULL) as aesthetic_with_maturity,
    (SELECT COUNT(*) FROM dental_procedures WHERE market_maturity_stage IS NOT NULL) as dental_with_maturity,
    (SELECT COUNT(DISTINCT market_maturity_stage) FROM aesthetic_procedures) as aesthetic_unique_stages,
    (SELECT COUNT(DISTINCT market_maturity_stage) FROM dental_procedures) as dental_unique_stages;

-- STEP 10: Sample data verification
SELECT 
    'aesthetic' as table_name,
    market_maturity_stage,
    COUNT(*) as count,
    AVG(yearly_growth_percentage) as avg_growth,
    MIN(yearly_growth_percentage) as min_growth,
    MAX(yearly_growth_percentage) as max_growth
FROM aesthetic_procedures
WHERE market_maturity_stage IS NOT NULL
GROUP BY market_maturity_stage

UNION ALL

SELECT 
    'dental' as table_name,
    market_maturity_stage,
    COUNT(*) as count,
    AVG(yearly_growth_percentage) as avg_growth,
    MIN(yearly_growth_percentage) as min_growth,
    MAX(yearly_growth_percentage) as max_growth
FROM dental_procedures
WHERE market_maturity_stage IS NOT NULL
GROUP BY market_maturity_stage
ORDER BY table_name, market_maturity_stage;

-- ROLLBACK SCRIPT (if needed)
-- To rollback this migration, run:
/*
-- Remove triggers
DROP TRIGGER IF EXISTS update_aesthetic_market_maturity ON aesthetic_procedures;
DROP TRIGGER IF EXISTS update_dental_market_maturity ON dental_procedures;

-- Remove function
DROP FUNCTION IF EXISTS update_market_maturity_trigger();
DROP FUNCTION IF EXISTS calculate_market_maturity(NUMERIC);

-- Remove constraints
ALTER TABLE aesthetic_procedures DROP CONSTRAINT IF EXISTS check_market_maturity_stage_aesthetic;
ALTER TABLE dental_procedures DROP CONSTRAINT IF EXISTS check_market_maturity_stage_dental;

-- Remove indexes
DROP INDEX IF EXISTS idx_aesthetic_market_maturity;
DROP INDEX IF EXISTS idx_dental_market_maturity;

-- Remove columns
ALTER TABLE aesthetic_procedures DROP COLUMN IF EXISTS market_maturity_stage;
ALTER TABLE dental_procedures DROP COLUMN IF EXISTS market_maturity_stage;

-- Restore from backup if needed
-- DROP TABLE aesthetic_procedures;
-- CREATE TABLE aesthetic_procedures AS SELECT * FROM aesthetic_procedures_backup_maturity_20250108;
-- DROP TABLE dental_procedures;
-- CREATE TABLE dental_procedures AS SELECT * FROM dental_procedures_backup_maturity_20250108;
*/