#!/usr/bin/env tsx

/**
 * Category Integration Setup Script
 * 
 * This script helps you integrate the rich category system with your existing data.
 * 
 * Usage:
 * 1. First run the migration: supabase db push
 * 2. Then run this script: npx tsx scripts/setup-category-integration.ts
 */

import { supabase } from '../src/services/supabaseClient';
import { categoryHierarchyService } from '../src/services/categoryHierarchyService';

async function setupCategoryIntegration() {
  console.log('🚀 Starting Category Integration Setup...');
  
  try {
    // Step 1: Check if migration was applied
    console.log('\n📋 Step 1: Checking database schema...');
    const { data: tables, error: tableError } = await supabase
      .from('category_hierarchy')
      .select('count')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Category hierarchy table not found!');
      console.log('Please run: supabase db push');
      console.log('This will apply the migration: 20250602000000_create_category_hierarchy.sql');
      return;
    }
    
    console.log('✅ Category hierarchy table exists');
    
    // Step 2: Check if categories are populated
    console.log('\n📋 Step 2: Checking category data...');
    const categories = await categoryHierarchyService.getAllCategories();
    console.log(`Found ${categories.length} categories in hierarchy`);
    
    if (categories.length === 0) {
      console.log('⚠️  No categories found - they should be created by the migration');
      return;
    }
    
    // Display categories by industry
    const dentalCategories = categories.filter(c => c.industry === 'dental');
    const aestheticCategories = categories.filter(c => c.industry === 'aesthetic');
    
    console.log(`📊 Dental categories: ${dentalCategories.length}`);
    dentalCategories.forEach(cat => console.log(`   - ${cat.name} (ID: ${cat.id})`));
    
    console.log(`💄 Aesthetic categories: ${aestheticCategories.length}`);
    aestheticCategories.forEach(cat => console.log(`   - ${cat.name} (ID: ${cat.id})`));
    
    // Step 3: Auto-categorize procedures using mapping logic
    console.log('\n📋 Step 3: Auto-categorizing procedures...');
    await categoryHierarchyService.updateProcedureCategoryMappings();
    
    // Step 4: Get procedure counts for categories
    console.log('\n📋 Step 4: Calculating category statistics...');
    const categoriesWithCounts = await categoryHierarchyService.getCategoriesWithProcedureCounts();
    
    console.log('\n📊 Category Statistics:');
    categoriesWithCounts
      .filter(cat => cat.procedure_count_actual && cat.procedure_count_actual > 0)
      .sort((a, b) => (b.procedure_count_actual || 0) - (a.procedure_count_actual || 0))
      .forEach(cat => {
        console.log(`   ${cat.name}: ${cat.procedure_count_actual} procedures`);
      });
    
    // Step 5: Test the filtering functionality
    console.log('\n📋 Step 5: Testing category filtering...');
    
    // Test dental category filtering
    const injectablesCategory = categories.find(c => c.name === 'Injectables');
    if (injectablesCategory) {
      const injectableProcedures = await categoryHierarchyService.getProceduresForCategory(
        injectablesCategory.id, 
        'aesthetic'
      );
      console.log(`🧪 "Injectables" category test: ${injectableProcedures.length} procedures found`);
      if (injectableProcedures.length > 0) {
        console.log(`   Examples: ${injectableProcedures.slice(0, 3).map(p => p.procedure_name || p.name).join(', ')}`);
      }
    }
    
    // Test dental category filtering
    const implantCategory = categories.find(c => c.name === 'Implantology');
    if (implantCategory) {
      const implantProcedures = await categoryHierarchyService.getProceduresForCategory(
        implantCategory.id, 
        'dental'
      );
      console.log(`🦷 "Implantology" category test: ${implantProcedures.length} procedures found`);
      if (implantProcedures.length > 0) {
        console.log(`   Examples: ${implantProcedures.slice(0, 3).map(p => p.procedure_name || p.name).join(', ')}`);
      }
    }
    
    console.log('\n✅ Category Integration Setup Complete!');
    console.log('\n🎯 Next steps:');
    console.log('1. Restart your dev server: npm run dev');
    console.log('2. Visit your dashboard and test the category filtering');
    console.log('3. The industry toggle should now show rich categories with procedure counts');
    console.log('4. Each category chip will show tooltips with descriptions');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure your Supabase connection is working');
    console.log('2. Run: supabase db push (to apply migrations)');
    console.log('3. Check your environment variables');
  }
}

// Run the setup
setupCategoryIntegration().catch(console.error);