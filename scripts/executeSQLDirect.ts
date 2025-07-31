import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Client } from 'pg';
import { logger } from '@/services/logging/logger';


dotenv.config();

// Method 1: Try using Supabase admin client
async function executeWithSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  
  if (!supabaseServiceKey) {
    logger.info('No service key found, trying direct connection...');
    return false;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  try {
    // Test if we can access the table
    const { error } = await supabase.from('aesthetic_procedures').select('id').limit(1);
    if (error) throw error;
    logger.info('✓ Connected to Supabase');
    return true;
  } catch (error) {
    logger.error('Supabase admin method failed:', error);
    return false;
  }
}

// Method 2: Direct PostgreSQL connection
async function executeWithDirectConnection() {
  // Try to construct database URL from Supabase URL
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  
  if (!match) {
    logger.error('Could not parse Supabase URL');
    return false;
  }
  
  const projectRef = match[1];
  const dbHost = `db.${projectRef}.supabase.co`;
  const dbPassword = process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || '';
  
  if (!dbPassword) {
    logger.info('No database password found in environment variables');
    logger.info('Please set DATABASE_PASSWORD or POSTGRES_PASSWORD');
    return false;
  }
  
  const connectionString = `postgresql://postgres:${dbPassword}@${dbHost}:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    logger.info('✓ Connected directly to PostgreSQL');
    
    // Execute the migration
    const migrationSQL = `
      -- Add RealSelf columns if they don't exist
      ALTER TABLE aesthetic_procedures 
      ADD COLUMN IF NOT EXISTS realself_worth_it_rating INTEGER CHECK (realself_worth_it_rating >= 0 AND realself_worth_it_rating <= 100),
      ADD COLUMN IF NOT EXISTS realself_total_reviews INTEGER CHECK (realself_total_reviews >= 0),
      ADD COLUMN IF NOT EXISTS realself_average_cost NUMERIC,
      ADD COLUMN IF NOT EXISTS realself_url TEXT,
      ADD COLUMN IF NOT EXISTS realself_last_updated DATE;
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_aesthetic_realself_rating ON aesthetic_procedures(realself_worth_it_rating);
      CREATE INDEX IF NOT EXISTS idx_aesthetic_realself_reviews ON aesthetic_procedures(realself_total_reviews);
    `;
    
    await client.query(migrationSQL);
    logger.info('✓ Migration executed successfully!');
    
    // Verify columns were added
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'aesthetic_procedures' 
      AND column_name LIKE 'realself%'
      ORDER BY column_name;
    `;
    
    const result = await client.query(checkQuery);
    logger.info('\nAdded columns:');
    result.rows.forEach(row => logger.info(`  - ${row.column_name}`));
    
    await client.end();
    return true;
  } catch (error) {
    logger.error('Direct connection failed:', error);
    await client.end();
    return false;
  }
}

// Method 3: Generate connection instructions
function generateConnectionInstructions() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = match ? match[1] : 'YOUR_PROJECT_REF';
  
  logger.info('\n=== Manual Connection Instructions ===\n');
  logger.info('1. Get your database password from Supabase dashboard:');
  logger.info('   - Go to Settings > Database');
  logger.info('   - Copy the password\n');
  
  logger.info('2. Connect using psql or any PostgreSQL client:');
  logger.info(`   Host: db.${projectRef}.supabase.co`);
  logger.info('   Port: 5432');
  logger.info('   Database: postgres');
  logger.info('   User: postgres');
  logger.info('   Password: [from step 1]\n');
  
  logger.info('3. Run this SQL:');
  logger.info(`
ALTER TABLE aesthetic_procedures 
ADD COLUMN IF NOT EXISTS realself_worth_it_rating INTEGER CHECK (realself_worth_it_rating >= 0 AND realself_worth_it_rating <= 100),
ADD COLUMN IF NOT EXISTS realself_total_reviews INTEGER CHECK (realself_total_reviews >= 0),
ADD COLUMN IF NOT EXISTS realself_average_cost NUMERIC,
ADD COLUMN IF NOT EXISTS realself_url TEXT,
ADD COLUMN IF NOT EXISTS realself_last_updated DATE;

CREATE INDEX IF NOT EXISTS idx_aesthetic_realself_rating ON aesthetic_procedures(realself_worth_it_rating);
CREATE INDEX IF NOT EXISTS idx_aesthetic_realself_reviews ON aesthetic_procedures(realself_total_reviews);
  `);
}

// Main execution
async function main() {
  logger.info('Attempting to add RealSelf columns to database...\n');
  
  // Try Supabase admin first
  const adminSuccess = await executeWithSupabaseAdmin();
  
  if (!adminSuccess) {
    // Try direct connection
    const directSuccess = await executeWithDirectConnection();
    
    if (!directSuccess) {
      // Show manual instructions
      generateConnectionInstructions();
    }
  }
}

// Run main
main().catch(console.error);