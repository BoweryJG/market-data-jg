-- Create provider_locations table for Phase 2: Local Market Intelligence
CREATE TABLE IF NOT EXISTS provider_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name TEXT NOT NULL,
  practice_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip_code TEXT NOT NULL,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  phone TEXT,
  website TEXT,
  email TEXT,
  industry TEXT NOT NULL CHECK (industry IN ('dental', 'aesthetic', 'both')),
  specialties TEXT[],
  procedures_offered TEXT[],
  insurance_accepted TEXT[],
  rating DECIMAL(3, 2),
  review_count INTEGER DEFAULT 0,
  years_in_practice INTEGER,
  provider_type TEXT CHECK (provider_type IN ('solo', 'group', 'hospital', 'clinic', 'spa')),
  ownership_type TEXT CHECK (ownership_type IN ('independent', 'dso', 'franchise', 'hospital_owned')),
  annual_revenue_estimate DECIMAL(12, 2),
  patient_volume_monthly INTEGER,
  tech_adoption_score INTEGER CHECK (tech_adoption_score >= 0 AND tech_adoption_score <= 100),
  equipment_brands TEXT[],
  software_systems TEXT[],
  marketing_channels TEXT[],
  social_media JSONB DEFAULT '{}',
  competitor_density INTEGER DEFAULT 0,
  market_share_estimate DECIMAL(5, 2),
  growth_potential_score INTEGER CHECK (growth_potential_score >= 0 AND growth_potential_score <= 100),
  last_equipment_purchase DATE,
  decision_makers JSONB DEFAULT '[]',
  notes TEXT,
  data_source TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_provider_locations_city_state ON provider_locations(city, state);
CREATE INDEX idx_provider_locations_industry ON provider_locations(industry);
CREATE INDEX idx_provider_locations_specialties ON provider_locations USING GIN(specialties);
CREATE INDEX idx_provider_locations_procedures ON provider_locations USING GIN(procedures_offered);
CREATE INDEX idx_provider_locations_geo ON provider_locations(lat, lng);
CREATE INDEX idx_provider_locations_revenue ON provider_locations(annual_revenue_estimate);
CREATE INDEX idx_provider_locations_growth ON provider_locations(growth_potential_score);

-- Create provider_equipment table for tracking equipment purchases
CREATE TABLE IF NOT EXISTS provider_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_location_id UUID REFERENCES provider_locations(id) ON DELETE CASCADE,
  equipment_category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  financing_type TEXT CHECK (financing_type IN ('cash', 'lease', 'loan', 'unknown')),
  replacement_due DATE,
  condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'fair', 'poor')),
  usage_frequency TEXT CHECK (usage_frequency IN ('daily', 'weekly', 'monthly', 'rarely')),
  maintenance_contract BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_provider_equipment_provider ON provider_equipment(provider_location_id);
CREATE INDEX idx_provider_equipment_replacement ON provider_equipment(replacement_due);

-- Create market_territories table for territory insights
CREATE TABLE IF NOT EXISTS market_territories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  population INTEGER,
  median_income DECIMAL(10, 2),
  provider_count INTEGER DEFAULT 0,
  provider_density DECIMAL(8, 4), -- providers per 10,000 population
  market_size_dental DECIMAL(12, 2),
  market_size_aesthetic DECIMAL(12, 2),
  growth_rate_annual DECIMAL(5, 2),
  competition_level TEXT CHECK (competition_level IN ('low', 'medium', 'high', 'saturated')),
  opportunity_score INTEGER CHECK (opportunity_score >= 0 AND opportunity_score <= 100),
  demographics JSONB DEFAULT '{}',
  key_employers TEXT[],
  insurance_penetration DECIMAL(5, 2),
  aesthetic_spending_index INTEGER DEFAULT 100, -- 100 = national average
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_market_territories_city_state ON market_territories(city, state);
CREATE INDEX idx_market_territories_opportunity ON market_territories(opportunity_score DESC);

-- Create provider_relationships table for referral networks
CREATE TABLE IF NOT EXISTS provider_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_from_id UUID REFERENCES provider_locations(id) ON DELETE CASCADE,
  provider_to_id UUID REFERENCES provider_locations(id) ON DELETE CASCADE,
  relationship_type TEXT CHECK (relationship_type IN ('referral', 'partnership', 'same_group', 'competitor')),
  strength INTEGER CHECK (strength >= 1 AND strength <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(provider_from_id, provider_to_id)
);

CREATE INDEX idx_provider_relationships_from ON provider_relationships(provider_from_id);
CREATE INDEX idx_provider_relationships_to ON provider_relationships(provider_to_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_provider_locations_updated_at BEFORE UPDATE ON provider_locations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_territories_updated_at BEFORE UPDATE ON market_territories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial NYC market data (sample - we'll expand to 500+)
INSERT INTO market_territories (name, city, state, population, median_income, market_size_dental, market_size_aesthetic, growth_rate_annual, competition_level, opportunity_score, demographics, aesthetic_spending_index) VALUES
('Manhattan - Upper East Side', 'New York', 'NY', 207543, 138649, 125000000, 89000000, 7.5, 'high', 85, '{"age_median": 44, "household_size": 1.9, "college_educated_pct": 78}', 165),
('Manhattan - Midtown', 'New York', 'NY', 312896, 95876, 187000000, 125000000, 8.2, 'saturated', 65, '{"age_median": 38, "household_size": 1.7, "college_educated_pct": 72}', 145),
('Manhattan - Chelsea', 'New York', 'NY', 125431, 125000, 95000000, 78000000, 9.1, 'high', 75, '{"age_median": 36, "household_size": 1.8, "college_educated_pct": 81}', 155),
('Brooklyn - Park Slope', 'New York', 'NY', 89234, 112000, 67000000, 45000000, 11.2, 'medium', 90, '{"age_median": 35, "household_size": 2.4, "college_educated_pct": 75}', 130),
('Queens - Astoria', 'New York', 'NY', 154289, 72000, 89000000, 34000000, 12.5, 'medium', 92, '{"age_median": 33, "household_size": 2.2, "college_educated_pct": 62}', 110);

-- Insert sample NYC provider data (we'll expand to 500+)
INSERT INTO provider_locations (
  provider_name, practice_name, address, city, state, zip_code, lat, lng,
  phone, website, industry, specialties, procedures_offered,
  rating, review_count, years_in_practice, provider_type, ownership_type,
  annual_revenue_estimate, patient_volume_monthly, tech_adoption_score,
  growth_potential_score, data_source, verified
) VALUES 
(
  'Dr. Sarah Chen, DDS', 'Manhattan Smile Design', '635 Madison Ave', 'New York', 'NY', '10022',
  40.7637, -73.9712, '(212) 555-0100', 'www.manhattansmiledesign.com', 'dental',
  ARRAY['cosmetic dentistry', 'prosthodontics'], 
  ARRAY['veneers', 'dental implants', 'teeth whitening', 'invisalign'],
  4.9, 287, 15, 'group', 'independent', 3500000, 450, 85, 78,
  'web_research', true
),
(
  'Dr. Michael Rodriguez, MD', 'Park Avenue Aesthetics', '1045 Park Ave', 'New York', 'NY', '10028',
  40.7794, -73.9571, '(212) 555-0200', 'www.parkaveaesthetics.com', 'aesthetic',
  ARRAY['plastic surgery', 'dermatology'],
  ARRAY['botox', 'dermal fillers', 'laser treatments', 'coolsculpting', 'facial rejuvenation'],
  4.8, 412, 20, 'solo', 'independent', 4200000, 380, 90, 82,
  'web_research', true
),
(
  'Dr. Jennifer Park, DDS', 'Brooklyn Modern Dentistry', '345 Court St', 'Brooklyn', 'NY', '11231',
  40.6869, -73.9917, '(718) 555-0300', 'www.brooklynmoderndentistry.com', 'dental',
  ARRAY['general dentistry', 'orthodontics'],
  ARRAY['cleanings', 'fillings', 'crowns', 'root canals', 'braces', 'invisalign'],
  4.7, 523, 12, 'group', 'dso', 2800000, 680, 75, 85,
  'web_research', true
),
(
  'Dr. Anthony Russo, MD', 'Chelsea Dermatology', '156 10th Ave', 'New York', 'NY', '10011',
  40.7433, -74.0078, '(212) 555-0400', 'www.chelseadermatology.com', 'aesthetic',
  ARRAY['dermatology', 'cosmetic dermatology'],
  ARRAY['acne treatment', 'rosacea treatment', 'laser hair removal', 'chemical peels', 'microneedling'],
  4.6, 289, 18, 'group', 'independent', 3100000, 520, 82, 80,
  'web_research', true
),
(
  'Dr. Lisa Wong, DDS', 'Astoria Family Dental', '31-15 Broadway', 'Queens', 'NY', '11106',
  40.7617, -73.9251, '(718) 555-0500', 'www.astoriafamilydental.com', 'dental',
  ARRAY['general dentistry', 'pediatric dentistry'],
  ARRAY['cleanings', 'sealants', 'fluoride treatments', 'fillings', 'emergency care'],
  4.5, 412, 8, 'solo', 'independent', 1200000, 420, 65, 88,
  'web_research', true
);

-- Insert some equipment data
INSERT INTO provider_equipment (
  provider_location_id, equipment_category, brand, model, 
  purchase_date, purchase_price, financing_type, replacement_due,
  condition, usage_frequency, maintenance_contract
) VALUES 
(
  (SELECT id FROM provider_locations WHERE provider_name = 'Dr. Sarah Chen, DDS' LIMIT 1),
  'Digital Scanner', 'iTero', 'Element 5D Plus', '2023-03-15', 45000, 'lease', '2028-03-15',
  'excellent', 'daily', true
),
(
  (SELECT id FROM provider_locations WHERE provider_name = 'Dr. Michael Rodriguez, MD' LIMIT 1),
  'Laser System', 'Candela', 'GentleMax Pro Plus', '2022-11-20', 125000, 'loan', '2027-11-20',
  'excellent', 'daily', true
),
(
  (SELECT id FROM provider_locations WHERE provider_name = 'Dr. Jennifer Park, DDS' LIMIT 1),
  'CBCT Scanner', 'Carestream', 'CS 9600', '2021-06-10', 185000, 'lease', '2026-06-10',
  'good', 'weekly', true
);

-- Create views for easy querying
CREATE OR REPLACE VIEW provider_market_insights AS
SELECT 
  pl.*,
  mt.market_size_dental + mt.market_size_aesthetic as territory_market_size,
  mt.growth_rate_annual as territory_growth_rate,
  mt.competition_level,
  mt.opportunity_score as territory_opportunity_score,
  COUNT(DISTINCT pe.id) as equipment_count,
  AVG(pe.purchase_price) as avg_equipment_value
FROM provider_locations pl
LEFT JOIN market_territories mt ON pl.city = mt.city AND pl.state = mt.state
LEFT JOIN provider_equipment pe ON pl.id = pe.provider_location_id
GROUP BY pl.id, mt.market_size_dental, mt.market_size_aesthetic, mt.growth_rate_annual, 
         mt.competition_level, mt.opportunity_score;

-- Grant permissions
GRANT ALL ON provider_locations TO authenticated;
GRANT ALL ON provider_equipment TO authenticated;
GRANT ALL ON market_territories TO authenticated;
GRANT ALL ON provider_relationships TO authenticated;
GRANT ALL ON provider_market_insights TO authenticated;