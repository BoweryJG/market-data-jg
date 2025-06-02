-- Migration to create category hierarchy table for rich category data
-- Date: 2025-06-02

-- Create category hierarchy table to store the rich category structure
CREATE TABLE IF NOT EXISTS category_hierarchy (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  icon_name VARCHAR(50),
  color_code VARCHAR(20),
  market_size_usd_millions DECIMAL(15,2),
  yearly_growth_percentage DECIMAL(5,2),
  procedure_count INTEGER DEFAULT 0,
  parent_id INTEGER REFERENCES category_hierarchy(id),
  industry VARCHAR(20) CHECK (industry IN ('dental', 'aesthetic', 'both')),
  applicable_to VARCHAR(20) CHECK (applicable_to IN ('dental', 'aesthetic', 'both')),
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  avg_growth_rate DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert dental categories from CategoryMapping.ts
INSERT INTO category_hierarchy (id, name, description, industry, applicable_to, is_featured, display_order) VALUES
(1, 'Diagnostic', 'Dental diagnostic procedures for assessment and evaluation', 'dental', 'dental', true, 1),
(2, 'Preventive', 'Preventive dental care and maintenance procedures', 'dental', 'dental', true, 2),
(3, 'Restorative', 'Procedures to restore tooth function and structure', 'dental', 'dental', true, 3),
(4, 'Cosmetic', 'Cosmetic and aesthetic dental procedures', 'dental', 'dental', true, 4),
(5, 'Oral Surgery', 'Surgical dental procedures and extractions', 'dental', 'dental', true, 5),
(6, 'Endodontic', 'Root canal and pulp-related treatments', 'dental', 'dental', true, 6),
(7, 'Periodontic', 'Gum and periodontal treatments', 'dental', 'dental', true, 7),
(8, 'Prosthodontic', 'Dental prosthetics and replacements', 'dental', 'dental', true, 8),
(9, 'Orthodontic', 'Teeth alignment and bite correction', 'dental', 'dental', true, 9),
(10, 'Implantology', 'Dental implant procedures and treatments', 'dental', 'dental', true, 10),
(11, 'Digital Dentistry', 'Technology-enhanced dental procedures', 'dental', 'dental', true, 11);

-- Insert aesthetic categories from CategoryMapping.ts
INSERT INTO category_hierarchy (id, name, description, industry, applicable_to, is_featured, display_order) VALUES
(12, 'Facial Aesthetic', 'Facial rejuvenation and enhancement procedures', 'aesthetic', 'aesthetic', true, 12),
(13, 'Injectables', 'Botox, fillers, and other injectable treatments', 'aesthetic', 'aesthetic', true, 13),
(14, 'Body', 'Body contouring and enhancement procedures', 'aesthetic', 'aesthetic', true, 14),
(15, 'Skin', 'Skin treatments and rejuvenation', 'aesthetic', 'aesthetic', true, 15),
(16, 'Hair', 'Hair restoration and treatment procedures', 'aesthetic', 'aesthetic', true, 16),
(17, 'Minimally Invasive', 'Non-surgical aesthetic procedures', 'aesthetic', 'aesthetic', true, 17),
(18, 'Regenerative', 'Regenerative and biotech aesthetic treatments', 'aesthetic', 'aesthetic', true, 18),
(19, 'Lasers', 'Laser-based aesthetic treatments', 'aesthetic', 'aesthetic', true, 19),
(20, 'Combination', 'Multi-modal aesthetic treatment approaches', 'aesthetic', 'aesthetic', true, 20);

-- Insert specific aesthetic subcategories
INSERT INTO category_hierarchy (id, name, description, industry, applicable_to, parent_id, display_order) VALUES
(47, 'Body Contouring', 'Body sculpting and fat reduction procedures', 'aesthetic', 'aesthetic', 14, 47),
(48, 'Skin Resurfacing', 'Procedures to improve skin texture and appearance', 'aesthetic', 'aesthetic', 15, 48),
(49, 'Skin Tightening', 'Non-surgical skin firming treatments', 'aesthetic', 'aesthetic', 15, 49),
(51, 'Pigmentation', 'Treatments for skin discoloration and pigmentation issues', 'aesthetic', 'aesthetic', 15, 51);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_category_hierarchy_industry ON category_hierarchy(industry);
CREATE INDEX IF NOT EXISTS idx_category_hierarchy_parent ON category_hierarchy(parent_id);
CREATE INDEX IF NOT EXISTS idx_category_hierarchy_featured ON category_hierarchy(is_featured);

-- Update dental_procedures to reference category_hierarchy
ALTER TABLE dental_procedures 
ADD COLUMN IF NOT EXISTS category_hierarchy_id INTEGER REFERENCES category_hierarchy(id);

-- Update aesthetic_procedures to reference category_hierarchy  
ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS category_hierarchy_id INTEGER REFERENCES category_hierarchy(id);

-- Create a function to update procedure counts
CREATE OR REPLACE FUNCTION update_category_procedure_counts()
RETURNS VOID AS $$
BEGIN
  -- Update procedure counts for dental categories
  UPDATE category_hierarchy 
  SET procedure_count = (
    SELECT COUNT(*) 
    FROM dental_procedures dp 
    WHERE dp.category_hierarchy_id = category_hierarchy.id
  )
  WHERE industry = 'dental';
  
  -- Update procedure counts for aesthetic categories
  UPDATE category_hierarchy 
  SET procedure_count = (
    SELECT COUNT(*) 
    FROM aesthetic_procedures ap 
    WHERE ap.category_hierarchy_id = category_hierarchy.id
  )
  WHERE industry = 'aesthetic';
END;
$$ LANGUAGE plpgsql;

-- Create a view for easy category-procedure joins
CREATE OR REPLACE VIEW v_procedures_with_categories AS
SELECT 
  p.*,
  ch.name as category_name,
  ch.description as category_description,
  ch.icon as category_icon,
  ch.color_code as category_color,
  ch.market_size_usd_millions as category_market_size,
  ch.yearly_growth_percentage as category_growth_rate,
  ch.parent_id as category_parent_id,
  parent_ch.name as parent_category_name
FROM (
  -- Dental procedures
  SELECT 
    id, procedure_name, category, industry, 
    clinical_category_id, aesthetic_category_id,
    category_hierarchy_id, market_size_usd_millions,
    yearly_growth_percentage, average_cost_usd,
    'dental' as source_table
  FROM dental_procedures
  
  UNION ALL
  
  -- Aesthetic procedures  
  SELECT 
    id, procedure_name, category, industry,
    clinical_category_id, aesthetic_category_id, 
    category_hierarchy_id, market_size_usd_millions,
    yearly_growth_percentage, average_cost_usd,
    'aesthetic' as source_table
  FROM aesthetic_procedures
) p
LEFT JOIN category_hierarchy ch ON p.category_hierarchy_id = ch.id
LEFT JOIN category_hierarchy parent_ch ON ch.parent_id = parent_ch.id;

-- Add comments
COMMENT ON TABLE category_hierarchy IS 'Rich category hierarchy for dental and aesthetic procedures with market data';
COMMENT ON VIEW v_procedures_with_categories IS 'Unified view of all procedures with their rich category information';