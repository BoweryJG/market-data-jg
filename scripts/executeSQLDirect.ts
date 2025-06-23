import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

// Method 1: Try using Supabase admin client
async function executeWithSupabaseAdmin() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || '';
  
  if (!supabaseServiceKey) {
    console.log('No service key found, trying direct connection...');
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
    const { data, error } = await supabase.from('aesthetic_procedures').select('id').limit(1);
    if (error) throw error;
    console.log('✓ Connected to Supabase');
    return true;
  } catch (error) {
    console.error('Supabase admin method failed:', error);
    return false;
  }
}

// Method 2: Direct PostgreSQL connection
async function executeWithDirectConnection() {
  // Try to construct database URL from Supabase URL
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  
  if (!match) {
    console.error('Could not parse Supabase URL');
    return false;
  }
  
  const projectRef = match[1];
  const dbHost = `db.${projectRef}.supabase.co`;
  const dbPassword = process.env.DATABASE_PASSWORD || process.env.POSTGRES_PASSWORD || '';
  
  if (!dbPassword) {
    console.log('No database password found in environment variables');
    console.log('Please set DATABASE_PASSWORD or POSTGRES_PASSWORD');
    return false;
  }
  
  const connectionString = `postgresql://postgres:${dbPassword}@${dbHost}:5432/postgres`;
  
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    console.log('✓ Connected directly to PostgreSQL');
    
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
    console.log('✓ Migration executed successfully!');
    
    // Verify columns were added
    const checkQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'aesthetic_procedures' 
      AND column_name LIKE 'realself%'
      ORDER BY column_name;
    `;
    
    const result = await client.query(checkQuery);
    console.log('\nAdded columns:');
    result.rows.forEach(row => console.log(`  - ${row.column_name}`));
    
    await client.end();
    return true;
  } catch (error) {
    console.error('Direct connection failed:', error);
    await client.end();
    return false;
  }
}

// Method 3: Generate connection instructions
function generateConnectionInstructions() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = match ? match[1] : 'YOUR_PROJECT_REF';
  
  console.log('\n=== Manual Connection Instructions ===\n');
  console.log('1. Get your database password from Supabase dashboard:');
  console.log('   - Go to Settings > Database');
  console.log('   - Copy the password\n');
  
  console.log('2. Connect using psql or any PostgreSQL client:');
  console.log(`   Host: db.${projectRef}.supabase.co`);
  console.log('   Port: 5432');
  console.log('   Database: postgres');
  console.log('   User: postgres');
  console.log('   Password: [from step 1]\n');
  
  console.log('3. Run this SQL:');
  console.log(`
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
  console.log('Attempting to add RealSelf columns to database...\n');
  
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