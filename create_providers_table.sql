-- Create providers table for storing NPI provider data
-- This won't affect any existing tables

CREATE TABLE IF NOT EXISTS providers (
  id BIGSERIAL PRIMARY KEY,
  npi TEXT UNIQUE NOT NULL,
  name TEXT,
  first_name TEXT,
  last_name TEXT,
  organization_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  taxonomy TEXT,
  specialty TEXT,
  industry TEXT,
  provider_type TEXT,
  data_source TEXT,
  verified BOOLEAN DEFAULT false,
  notes TEXT,
  lat DECIMAL,
  lng DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_npi ON providers(npi);
CREATE INDEX IF NOT EXISTS idx_providers_state ON providers(state);
CREATE INDEX IF NOT EXISTS idx_providers_city ON providers(city);
CREATE INDEX IF NOT EXISTS idx_providers_specialty ON providers(specialty);
CREATE INDEX IF NOT EXISTS idx_providers_zip ON providers(zip_code);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow all operations for now
CREATE POLICY "Allow all operations on providers" ON providers
  FOR ALL USING (true);

-- Add a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_providers_updated_at BEFORE UPDATE
    ON providers FOR EACH ROW EXECUTE PROCEDURE 
    update_updated_at_column();