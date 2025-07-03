const { execSync } = require('child_process');

console.log('🔍 Netlify Site Debugger\n');

try {
  // Get site info
  const siteInfo = JSON.parse(execSync('npx netlify api getSite --data "{}"', { encoding: 'utf8' }));
  
  console.log('📌 Site Info:');
  console.log(`  - Name: ${siteInfo.name}`);
  console.log(`  - URL: ${siteInfo.url}`);
  console.log(`  - ID: ${siteInfo.id}`);
  console.log(`  - Account: ${siteInfo.account_slug}`);
  
  // Check for problematic features
  console.log('\n🔍 Checking for tracking features...\n');
  
  // Check plugins
  if (siteInfo.plugins && siteInfo.plugins.length > 0) {
    console.log('⚠️  Build Plugins found:');
    siteInfo.plugins.forEach(plugin => {
      console.log(`  - ${plugin.package}: ${plugin.version || 'unknown version'}`);
    });
  } else {
    console.log('✅ No build plugins found');
  }
  
  // Check for analytics
  if (siteInfo.analytics_id || siteInfo.analytics_enabled) {
    console.log('\n⚠️  Analytics detected!');
    console.log(`  - Analytics ID: ${siteInfo.analytics_id || 'unknown'}`);
    console.log(`  - Enabled: ${siteInfo.analytics_enabled}`);
  } else {
    console.log('✅ No analytics configuration found');
  }
  
  // Check processing settings
  if (siteInfo.processing_settings) {
    console.log('\n📦 Processing settings:');
    console.log(JSON.stringify(siteInfo.processing_settings, null, 2));
  }
  
  // Check for identity
  if (siteInfo.identity_instance_id || siteInfo.identity_enabled) {
    console.log('\n⚠️  Identity service detected!');
    console.log(`  - Instance ID: ${siteInfo.identity_instance_id || 'unknown'}`);
  } else {
    console.log('✅ No identity service found');
  }
  
  // Check functions
  if (siteInfo.functions_region || siteInfo.functions_enabled) {
    console.log('\n📡 Functions configuration:');
    console.log(`  - Region: ${siteInfo.functions_region || 'default'}`);
    console.log(`  - Enabled: ${siteInfo.functions_enabled !== false}`);
  }
  
  // Output full config for debugging
  console.log('\n📋 Full site configuration (check for suspicious fields):');
  const suspiciousKeys = Object.keys(siteInfo).filter(key => 
    key.toLowerCase().includes('analytics') ||
    key.toLowerCase().includes('subscription') ||
    key.toLowerCase().includes('usage') ||
    key.toLowerCase().includes('tracking') ||
    key.toLowerCase().includes('identity')
  );
  
  if (suspiciousKeys.length > 0) {
    console.log('\n⚠️  Suspicious configuration keys found:');
    suspiciousKeys.forEach(key => {
      console.log(`  - ${key}: ${JSON.stringify(siteInfo[key])}`);
    });
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('\nMake sure you run "netlify link" first!');
}