-- Add RealSelf patient satisfaction data columns to aesthetic_procedures
ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS realself_worth_it_rating INTEGER CHECK (realself_worth_it_rating >= 0 AND realself_worth_it_rating <= 100),
ADD COLUMN IF NOT EXISTS realself_total_reviews INTEGER CHECK (realself_total_reviews >= 0),
ADD COLUMN IF NOT EXISTS realself_average_cost NUMERIC,
ADD COLUMN IF NOT EXISTS realself_url TEXT,
ADD COLUMN IF NOT EXISTS realself_last_updated DATE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_aesthetic_realself_rating ON aesthetic_procedures(realself_worth_it_rating);
CREATE INDEX IF NOT EXISTS idx_aesthetic_realself_reviews ON aesthetic_procedures(realself_total_reviews);

-- Add comments for documentation
COMMENT ON COLUMN aesthetic_procedures.realself_worth_it_rating IS 'Percentage of RealSelf users who rated procedure as Worth It (0-100)';
COMMENT ON COLUMN aesthetic_procedures.realself_total_reviews IS 'Total number of patient reviews on RealSelf';
COMMENT ON COLUMN aesthetic_procedures.realself_average_cost IS 'Average cost reported by RealSelf users in USD';
COMMENT ON COLUMN aesthetic_procedures.realself_url IS 'Direct URL to RealSelf procedure page';
COMMENT ON COLUMN aesthetic_procedures.realself_last_updated IS 'Date when RealSelf data was last scraped';