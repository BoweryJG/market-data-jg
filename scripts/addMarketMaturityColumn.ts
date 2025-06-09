import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://cbopynuvhcymbumjnvay.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNib3B5bnV2aGN5bWJ1bWpudmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5OTUxNzMsImV4cCI6MjA1OTU3MTE3M30.UZElMkoHugIt984RtYWyfrRuv2rB67opQdCrFVPCfzU';
const supabase = createClient(supabaseUrl, supabaseKey);

// Define market maturity stages
const MATURITY_STAGES = {
  EMERGING: { name: 'Emerging', minGrowth: 15, description: 'High growth, early adopter phase' },
  GROWTH: { name: 'Growth', minGrowth: 10, description: 'Rapid expansion, increasing adoption' },
  EXPANSION: { name: 'Expansion', minGrowth: 5, description: 'Steady growth, mainstream market' },
  MATURE: { name: 'Mature', minGrowth: 2, description: 'Established market, stable returns' },
  SATURATED: { name: 'Saturated', minGrowth: 0, description: 'Low growth, market consolidation' }
};

function calculateMaturityStage(growthRate: number | null): string | null {
  if (growthRate === null) return null;
  
  if (growthRate > 15) return MATURITY_STAGES.EMERGING.name;
  if (growthRate > 10) return MATURITY_STAGES.GROWTH.name;
  if (growthRate > 5) return MATURITY_STAGES.EXPANSION.name;
  if (growthRate > 2) return MATURITY_STAGES.MATURE.name;
  return MATURITY_STAGES.SATURATED.name;
}

async function addMarketMaturityColumn() {
  console.log('🚀 Starting market maturity column migration...\n');
  
  try {
    // Step 1: Test the update with a small batch first
    console.log('📋 Testing update on small batch...');
    
    // Get 5 aesthetic procedures to test
    const { data: testAesthetic, error: testError1 } = await supabase
      .from('aesthetic_procedures')
      .select('id, procedure_name, yearly_growth_percentage')
      .limit(5);
      
    if (testError1) {
      console.error('❌ Error fetching test data:', testError1);
      return;
    }
    
    console.log('Test procedures:', testAesthetic);
    
    // Step 2: Update all aesthetic procedures
    console.log('\n📊 Updating aesthetic procedures...');
    
    const { data: aestheticProcedures, error: aestheticError } = await supabase
      .from('aesthetic_procedures')
      .select('id, procedure_name, yearly_growth_percentage');
      
    if (aestheticError) {
      console.error('❌ Error fetching aesthetic procedures:', aestheticError);
      return;
    }
    
    let aestheticUpdated = 0;
    const aestheticBatchSize = 10;
    
    for (let i = 0; i < aestheticProcedures.length; i += aestheticBatchSize) {
      const batch = aestheticProcedures.slice(i, i + aestheticBatchSize);
      
      for (const proc of batch) {
        const maturityStage = calculateMaturityStage(proc.yearly_growth_percentage);
        
        if (maturityStage) {
          const { error: updateError } = await supabase
            .from('aesthetic_procedures')
            .update({ market_maturity_stage: maturityStage })
            .eq('id', proc.id);
            
          if (updateError) {
            console.error(`❌ Error updating ${proc.procedure_name}:`, updateError);
          } else {
            aestheticUpdated++;
            console.log(`✓ Updated ${proc.procedure_name}: ${maturityStage} (${proc.yearly_growth_percentage}% growth)`);
          }
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Updated ${aestheticUpdated} aesthetic procedures`);
    
    // Step 3: Update all dental procedures
    console.log('\n🦷 Updating dental procedures...');
    
    const { data: dentalProcedures, error: dentalError } = await supabase
      .from('dental_procedures')
      .select('id, procedure_name, yearly_growth_percentage');
      
    if (dentalError) {
      console.error('❌ Error fetching dental procedures:', dentalError);
      return;
    }
    
    let dentalUpdated = 0;
    const dentalBatchSize = 10;
    
    for (let i = 0; i < dentalProcedures.length; i += dentalBatchSize) {
      const batch = dentalProcedures.slice(i, i + dentalBatchSize);
      
      for (const proc of batch) {
        const maturityStage = calculateMaturityStage(proc.yearly_growth_percentage);
        
        if (maturityStage) {
          const { error: updateError } = await supabase
            .from('dental_procedures')
            .update({ market_maturity_stage: maturityStage })
            .eq('id', proc.id);
            
          if (updateError) {
            console.error(`❌ Error updating ${proc.procedure_name}:`, updateError);
          } else {
            dentalUpdated++;
            console.log(`✓ Updated ${proc.procedure_name}: ${maturityStage} (${proc.yearly_growth_percentage}% growth)`);
          }
        }
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n✅ Updated ${dentalUpdated} dental procedures`);
    
    // Step 4: Verify the results
    console.log('\n📊 Verification Report:');
    
    // Get summary for aesthetic procedures
    const { data: aestheticSummary } = await supabase
      .from('aesthetic_procedures')
      .select('market_maturity_stage')
      .not('market_maturity_stage', 'is', null);
      
    // Get summary for dental procedures  
    const { data: dentalSummary } = await supabase
      .from('dental_procedures')
      .select('market_maturity_stage')
      .not('market_maturity_stage', 'is', null);
    
    // Count by stage
    const aestheticCounts = aestheticSummary?.reduce((acc, item) => {
      acc[item.market_maturity_stage] = (acc[item.market_maturity_stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    const dentalCounts = dentalSummary?.reduce((acc, item) => {
      acc[item.market_maturity_stage] = (acc[item.market_maturity_stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};
    
    console.log('\nAesthetic Procedures by Maturity Stage:');
    Object.entries(aestheticCounts).forEach(([stage, count]) => {
      console.log(`  ${stage}: ${count} procedures`);
    });
    
    console.log('\nDental Procedures by Maturity Stage:');
    Object.entries(dentalCounts).forEach(([stage, count]) => {
      console.log(`  ${stage}: ${count} procedures`);
    });
    
    console.log('\n✨ Market maturity column migration complete!');
    console.log(`Total procedures updated: ${aestheticUpdated + dentalUpdated}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Add helper function to display sample data
async function displaySampleData() {
  console.log('\n📋 Sample Data with Market Maturity:');
  
  const { data: samples } = await supabase
    .from('aesthetic_procedures')
    .select('procedure_name, market_size_2025_usd_millions, yearly_growth_percentage, market_maturity_stage')
    .not('market_maturity_stage', 'is', null)
    .order('yearly_growth_percentage', { ascending: false })
    .limit(10);
    
  console.table(samples);
}

// Run the migration
addMarketMaturityColumn()
  .then(() => displaySampleData())
  .catch(console.error);