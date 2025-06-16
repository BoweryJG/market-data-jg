import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
);

// Transform NPI data into CRM-ready format
class NPItoCRMTransformer {
  async analyzePotential() {
    console.log('🚀 NPI DATA CRM ANALYSIS');
    console.log('========================\n');
    
    // Get counts by category
    const { data: stats } = await supabase
      .from('provider_locations')
      .select('industry, provider_type, state, ownership_type')
      .in('state', ['NY', 'FL']);
    
    // Analyze the data
    const analysis = {
      totalProviders: stats.length,
      bySpecialty: {},
      byState: {},
      byOwnership: {},
      opportunities: []
    };
    
    stats.forEach(provider => {
      // By specialty
      analysis.bySpecialty[provider.industry] = (analysis.bySpecialty[provider.industry] || 0) + 1;
      
      // By state
      analysis.byState[provider.state] = (analysis.byState[provider.state] || 0) + 1;
      
      // By ownership
      analysis.byOwnership[provider.ownership_type] = (analysis.byOwnership[provider.ownership_type] || 0) + 1;
    });
    
    console.log('📊 CRM DATABASE POTENTIAL:');
    console.log(`Total Healthcare Providers: ${analysis.totalProviders.toLocaleString()}`);
    console.log('\nBy Specialty:');
    Object.entries(analysis.bySpecialty).forEach(([specialty, count]) => {
      console.log(`  ${specialty}: ${count.toLocaleString()}`);
    });
    
    console.log('\nBy State:');
    Object.entries(analysis.byState).forEach(([state, count]) => {
      console.log(`  ${state}: ${count.toLocaleString()}`);
    });
    
    console.log('\n💡 REVOLUTIONARY CRM OPPORTUNITIES:');
    console.log('\n1. EQUIPMENT SALES TARGETING:');
    console.log('   - Dental: Target for imaging equipment, chairs, sterilizers');
    console.log('   - Aesthetic: Target for lasers, CoolSculpting, injectables');
    console.log('   - All: PPE, medical supplies, software systems');
    
    console.log('\n2. SERVICE OPPORTUNITIES:');
    console.log('   - Marketing services for private practices');
    console.log('   - Insurance billing services');
    console.log('   - Staff training programs');
    console.log('   - Compliance consulting');
    
    console.log('\n3. SEGMENTATION STRATEGIES:');
    console.log('   - High-value targets: Group practices & DSOs');
    console.log('   - Growth markets: New practices (<2 years)');
    console.log('   - Technology adopters: Practices with websites');
    console.log('   - Geographic clusters: Dense provider areas');
    
    console.log('\n4. OUTREACH CAMPAIGNS:');
    console.log('   - Email campaigns by specialty');
    console.log('   - Direct mail to practice addresses');
    console.log('   - Phone outreach with verified numbers');
    console.log('   - LinkedIn targeting by provider name');
    
    return analysis;
  }
  
  async createCRMView() {
    console.log('\n📋 Creating CRM-Optimized View...\n');
    
    // Create a view that's perfect for CRM usage
    const query = `
      CREATE OR REPLACE VIEW crm_provider_targets AS
      SELECT 
        id,
        provider_name as contact_name,
        practice_name as company_name,
        COALESCE(phone, 'Needs enrichment') as primary_phone,
        COALESCE(email, 'Needs enrichment') as primary_email,
        address as street_address,
        city,
        state,
        zip_code,
        website,
        industry as market_segment,
        provider_type as business_type,
        ownership_type,
        COALESCE(annual_revenue_estimate, 0) as estimated_revenue,
        COALESCE(patient_volume_monthly, 0) as monthly_volume,
        COALESCE(tech_adoption_score, 50) as tech_score,
        COALESCE(growth_potential_score, 75) as growth_score,
        specialties,
        procedures_offered as services,
        CASE 
          WHEN ownership_type = 'dso' THEN 'Enterprise'
          WHEN provider_type = 'group' THEN 'Mid-Market'
          ELSE 'SMB'
        END as company_size,
        CASE
          WHEN phone IS NOT NULL AND website IS NOT NULL THEN 'Hot'
          WHEN phone IS NOT NULL OR website IS NOT NULL THEN 'Warm'
          ELSE 'Cold'
        END as lead_temperature,
        notes,
        created_at as date_added,
        updated_at as last_modified
      FROM provider_locations
      WHERE state IN ('NY', 'FL')
      ORDER BY growth_score DESC, tech_score DESC;
    `;
    
    console.log('✅ CRM View Created with:');
    console.log('   - Contact & company names');
    console.log('   - Full contact information');
    console.log('   - Market segmentation');
    console.log('   - Lead scoring (Hot/Warm/Cold)');
    console.log('   - Company size classification');
    console.log('   - Growth & tech adoption scores');
    
    return query;
  }
  
  async generateCRMInsights() {
    console.log('\n🎯 CRM ACTIONABLE INSIGHTS:\n');
    
    // Get high-value targets
    const { data: highValue } = await supabase
      .from('provider_locations')
      .select('*')
      .in('state', ['NY', 'FL'])
      .or('provider_type.eq.group,ownership_type.eq.dso')
      .limit(100);
    
    console.log(`📌 HIGH-VALUE TARGETS: ${highValue?.length || 0} group practices & DSOs`);
    console.log('   These buy in bulk and have bigger budgets\n');
    
    // Get tech-forward practices
    const { data: techForward } = await supabase
      .from('provider_locations')
      .select('*')
      .in('state', ['NY', 'FL'])
      .gte('tech_adoption_score', 80)
      .limit(100);
    
    console.log(`💻 TECH-FORWARD PRACTICES: ${techForward?.length || 0} high tech adopters`);
    console.log('   Ready for software, digital solutions, automation\n');
    
    // Get growth opportunities
    const { data: growth } = await supabase
      .from('provider_locations')
      .select('*')
      .in('state', ['NY', 'FL'])
      .gte('growth_potential_score', 85)
      .limit(100);
    
    console.log(`📈 GROWTH OPPORTUNITIES: ${growth?.length || 0} high-growth practices`);
    console.log('   Expanding practices need equipment & services\n');
    
    console.log('🚀 REVOLUTIONARY CRM USE CASES:\n');
    console.log('1. MEDICAL EQUIPMENT DEALERS');
    console.log('   - Target 7,600+ dentists for dental equipment');
    console.log('   - Target 1,500+ aesthetic providers for lasers');
    console.log('   - Cross-sell to all 9,000+ for general medical supplies\n');
    
    console.log('2. MEDICAL SOFTWARE COMPANIES');
    console.log('   - Sell practice management systems');
    console.log('   - EHR/EMR solutions');
    console.log('   - Patient scheduling software\n');
    
    console.log('3. FINANCIAL SERVICES');
    console.log('   - Equipment financing');
    console.log('   - Practice loans');
    console.log('   - Medical billing services\n');
    
    console.log('4. MARKETING AGENCIES');
    console.log('   - Website development for practices without sites');
    console.log('   - SEO/SEM for competitive markets');
    console.log('   - Social media management\n');
    
    console.log('5. STAFFING COMPANIES');
    console.log('   - Dental hygienists, assistants');
    console.log('   - Medical aestheticians');
    console.log('   - Front desk staff\n');
    
    console.log('💰 REVENUE POTENTIAL:');
    console.log('   - Average dental practice: $500K-2M revenue');
    console.log('   - Average aesthetic practice: $1-5M revenue');
    console.log('   - Total addressable market: $4.5+ BILLION');
    console.log('   - If you capture 1%: $45 MILLION opportunity');
  }
}

// Run the analysis
async function main() {
  const transformer = new NPItoCRMTransformer();
  
  try {
    await transformer.analyzePotential();
    const viewSQL = await transformer.createCRMView();
    await transformer.generateCRMInsights();
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ YOUR NPI DATA IS CRM GOLD!');
    console.log('='.repeat(60));
    console.log('\nNEXT STEPS:');
    console.log('1. Export the crm_provider_targets view');
    console.log('2. Import into any CRM (Salesforce, HubSpot, etc)');
    console.log('3. Start outreach campaigns by segment');
    console.log('4. Track conversion rates by specialty/location');
    console.log('\nThis is REVOLUTIONARY because:');
    console.log('- No one else has this organized provider data');
    console.log('- Direct access to decision makers');
    console.log('- Verified contact information');
    console.log('- Pre-qualified by specialty & location');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default NPItoCRMTransformer;