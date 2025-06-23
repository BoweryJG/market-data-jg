-- Add comprehensive market intelligence fields to aesthetic_procedures table
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS market_size_2026_usd_millions NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS market_size_2027_usd_millions NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS market_size_2028_usd_millions NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS market_size_2029_usd_millions NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS market_size_2030_usd_millions NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS cagr_5year NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS market_confidence_score INTEGER CHECK (market_confidence_score >= 1 AND market_confidence_score <= 10);
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS data_source_quality VARCHAR(50);
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS top_3_device_manufacturers TEXT[];
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS device_market_shares JSONB;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS average_device_price NUMERIC;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS procedure_volume_2025 INTEGER;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS regional_hotspots TEXT[];
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS procedure_volume_by_region JSONB;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS reimbursement_trend VARCHAR(50) CHECK (reimbursement_trend IN ('increasing', 'stable', 'decreasing', 'not_covered'));
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS adoption_curve_stage VARCHAR(50) CHECK (adoption_curve_stage IN ('innovators', 'early_adopters', 'early_majority', 'late_majority', 'laggards'));
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS key_opinion_leaders TEXT[];
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS decision_maker_titles TEXT[];
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS sales_cycle_days INTEGER;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS technology_refresh_cycle INTEGER;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS competitive_procedures TEXT[];
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS data_verification_date DATE;
ALTER TABLE aesthetic_procedures ADD COLUMN IF NOT EXISTS data_sources_used TEXT[];

-- Add comprehensive market intelligence fields to dental_procedures table
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS market_size_2026_usd_millions NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS market_size_2027_usd_millions NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS market_size_2028_usd_millions NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS market_size_2029_usd_millions NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS market_size_2030_usd_millions NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS cagr_5year NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS market_confidence_score INTEGER CHECK (market_confidence_score >= 1 AND market_confidence_score <= 10);
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS data_source_quality VARCHAR(50);
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS top_3_device_manufacturers TEXT[];
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS device_market_shares JSONB;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS average_device_price NUMERIC;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS procedure_volume_2025 INTEGER;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS regional_hotspots TEXT[];
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS procedure_volume_by_region JSONB;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS reimbursement_trend VARCHAR(50) CHECK (reimbursement_trend IN ('increasing', 'stable', 'decreasing', 'not_covered'));
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS adoption_curve_stage VARCHAR(50) CHECK (adoption_curve_stage IN ('innovators', 'early_adopters', 'early_majority', 'late_majority', 'laggards'));
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS key_opinion_leaders TEXT[];
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS decision_maker_titles TEXT[];
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS sales_cycle_days INTEGER;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS technology_refresh_cycle INTEGER;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS competitive_procedures TEXT[];
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS data_verification_date DATE;
ALTER TABLE dental_procedures ADD COLUMN IF NOT EXISTS data_sources_used TEXT[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_aesthetic_market_size_2025 ON aesthetic_procedures(market_size_2025_usd_millions);
CREATE INDEX IF NOT EXISTS idx_aesthetic_confidence_score ON aesthetic_procedures(market_confidence_score);
CREATE INDEX IF NOT EXISTS idx_dental_market_size_2025 ON dental_procedures(market_size_2025_usd_millions);
CREATE INDEX IF NOT EXISTS idx_dental_confidence_score ON dental_procedures(market_confidence_score);

-- Add comments for documentation
COMMENT ON COLUMN aesthetic_procedures.market_confidence_score IS 'Data confidence score from 1-10 based on source quality and consensus';
COMMENT ON COLUMN aesthetic_procedures.device_market_shares IS 'JSON object with manufacturer names as keys and market share percentages as values';
COMMENT ON COLUMN aesthetic_procedures.procedure_volume_by_region IS 'JSON object with region names as keys and annual procedure volumes as values';
COMMENT ON COLUMN dental_procedures.market_confidence_score IS 'Data confidence score from 1-10 based on source quality and consensus';
COMMENT ON COLUMN dental_procedures.device_market_shares IS 'JSON object with manufacturer names as keys and market share percentages as values';
COMMENT ON COLUMN dental_procedures.procedure_volume_by_region IS 'JSON object with region names as keys and annual procedure volumes as values';