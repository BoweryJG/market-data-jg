const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

// Data Fusion Pipeline
// Combines and deduplicates data from multiple sources

class DataFusionPipeline {
  constructor() {
    this.allRecords = [];
    this.fusedRecords = [];
    this.duplicateGroups = [];
  }
  
  // Load CSV files
  async loadCSV(filepath, source) {
    return new Promise((resolve, reject) => {
      const records = [];
      fs.createReadStream(filepath)
        .pipe(csv())
        .on('data', (row) => {
          row._source = source;
          row._sourceFile = filepath;
          records.push(row);
        })
        .on('end', () => {
          console.log(`Loaded ${records.length} records from ${filepath}`);
          resolve(records);
        })
        .on('error', reject);
    });
  }
  
  // Normalize text for comparison
  normalize(text) {
    if (!text) return '';
    return text.toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '');
  }
  
  // Calculate similarity score between two records
  calculateSimilarity(record1, record2) {
    let score = 0;
    
    // Business name similarity
    const name1 = this.normalize(record1.businessName || record1.organizationName || record1.firstName + record1.lastName);
    const name2 = this.normalize(record2.businessName || record2.organizationName || record2.firstName + record2.lastName);
    
    if (name1 && name2) {
      if (name1 === name2) score += 40;
      else if (name1.includes(name2) || name2.includes(name1)) score += 30;
      else {
        // Calculate string similarity
        const similarity = this.stringSimilarity(name1, name2);
        if (similarity > 0.8) score += 25;
        else if (similarity > 0.6) score += 15;
      }
    }
    
    // Phone number match
    const phone1 = this.normalizePhone(record1.phone || record1.practicePhone);
    const phone2 = this.normalizePhone(record2.phone || record2.practicePhone);
    if (phone1 && phone2 && phone1 === phone2) score += 30;
    
    // Address similarity
    const addr1 = this.normalize(record1.address || record1.practiceAddress1);
    const addr2 = this.normalize(record2.address || record2.practiceAddress2);
    if (addr1 && addr2) {
      if (addr1 === addr2) score += 20;
      else if (this.stringSimilarity(addr1, addr2) > 0.7) score += 10;
    }
    
    // Same city
    const city1 = this.normalize(record1.city || record1.practiceCity);
    const city2 = this.normalize(record2.city || record2.practiceCity);
    if (city1 && city2 && city1 === city2) score += 10;
    
    return score;
  }
  
  // Normalize phone numbers
  normalizePhone(phone) {
    if (!phone) return '';
    return phone.toString().replace(/\D/g, '');
  }
  
  // Calculate string similarity (Jaccard similarity)
  stringSimilarity(str1, str2) {
    const set1 = new Set(str1.split(''));
    const set2 = new Set(str2.split(''));
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    return intersection.size / union.size;
  }
  
  // Find duplicate groups
  findDuplicates() {
    const processed = new Set();
    
    for (let i = 0; i < this.allRecords.length; i++) {
      if (processed.has(i)) continue;
      
      const group = [i];
      const record1 = this.allRecords[i];
      
      for (let j = i + 1; j < this.allRecords.length; j++) {
        if (processed.has(j)) continue;
        
        const record2 = this.allRecords[j];
        const similarity = this.calculateSimilarity(record1, record2);
        
        if (similarity >= 60) { // 60% similarity threshold
          group.push(j);
          processed.add(j);
        }
      }
      
      if (group.length > 1) {
        this.duplicateGroups.push(group);
      }
      processed.add(i);
    }
    
    console.log(`Found ${this.duplicateGroups.length} duplicate groups`);
  }
  
  // Merge duplicate records
  mergeRecords(indices) {
    const records = indices.map(i => this.allRecords[i]);
    const merged = {};
    
    // Priority order for sources
    const sourcePriority = {
      'NPI': 5,
      'Comprehensive': 4,
      'Brave': 3,
      'MedSpa_Finder': 2,
      'Groupon': 1
    };
    
    // Sort by source priority
    records.sort((a, b) => {
      const priorityA = sourcePriority[a._source] || 0;
      const priorityB = sourcePriority[b._source] || 0;
      return priorityB - priorityA;
    });
    
    // Merge fields
    const fields = new Set();
    records.forEach(record => {
      Object.keys(record).forEach(key => fields.add(key));
    });
    
    fields.forEach(field => {
      // Skip internal fields
      if (field.startsWith('_')) return;
      
      // Find the first non-empty value
      for (const record of records) {
        if (record[field] && record[field].toString().trim()) {
          merged[field] = record[field];
          break;
        }
      }
    });
    
    // Special handling for certain fields
    
    // Combine services from all sources
    const allServices = new Set();
    records.forEach(record => {
      const services = record.servicesDetected || record.detectedServices || '';
      services.split(/[;,]/).forEach(service => {
        if (service.trim()) allServices.add(service.trim());
      });
    });
    merged.servicesDetected = Array.from(allServices).join('; ');
    
    // Use highest confidence score
    merged.confidenceScore = Math.max(...records.map(r => 
      parseInt(r.confidenceScore) || 0
    ));
    
    // Track all sources
    merged.dataSources = records.map(r => r._source).join(', ');
    merged.sourceCount = records.length;
    
    // Determine category
    merged.category = this.determineCategory(merged);
    
    return merged;
  }
  
  // Determine business category
  determineCategory(record) {
    const name = (record.businessName || record.organizationName || '').toLowerCase();
    const services = (record.servicesDetected || '').toLowerCase();
    
    if (record.category === 'dentist' || name.includes('dental') || name.includes('dentist')) {
      return 'Dental Practice';
    } else if (record.category === 'dermatologist' || name.includes('dermatology')) {
      return 'Dermatology Practice';
    } else if (record.category === 'plastic_surgeon' || name.includes('plastic surgery')) {
      return 'Plastic Surgery Practice';
    } else if (name.includes('medspa') || name.includes('medical spa') || name.includes('med spa')) {
      return 'Medical Spa';
    } else if (services.includes('laser') || services.includes('aesthetic')) {
      return 'Aesthetic Center';
    } else {
      return 'Healthcare Provider';
    }
  }
  
  // Process all loaded data
  async processData() {
    console.log(`\nProcessing ${this.allRecords.length} total records...`);
    
    // Find duplicates
    this.findDuplicates();
    
    // Process duplicate groups
    const processedIndices = new Set();
    
    // Add merged records
    this.duplicateGroups.forEach(group => {
      const merged = this.mergeRecords(group);
      this.fusedRecords.push(merged);
      group.forEach(idx => processedIndices.add(idx));
    });
    
    // Add unique records
    this.allRecords.forEach((record, idx) => {
      if (!processedIndices.has(idx)) {
        record.dataSources = record._source;
        record.sourceCount = 1;
        record.category = this.determineCategory(record);
        this.fusedRecords.push(record);
      }
    });
    
    console.log(`Created ${this.fusedRecords.length} fused records`);
  }
  
  // Save results
  saveResults() {
    const timestamp = new Date().toISOString().split('T')[0];
    
    // Define output fields
    const fields = [
      'businessName', 'organizationName', 'category',
      'firstName', 'lastName', 'credential',
      'address', 'practiceAddress1', 'city', 'practiceCity', 
      'state', 'practiceState', 'zip', 'practiceZip',
      'phone', 'practicePhone', 'fax', 'practiceFax',
      'website', 'email',
      'servicesDetected', 'confidenceScore',
      'dataSources', 'sourceCount',
      'npi', 'taxonomyCode', 'taxonomyDescription'
    ];
    
    // Save fused data
    if (this.fusedRecords.length > 0) {
      const csv = parse(this.fusedRecords, { fields });
      const filename = `fused_healthcare_providers_NY_FL_${timestamp}.csv`;
      fs.writeFileSync(filename, csv);
      console.log(`\nSaved ${this.fusedRecords.length} fused records to ${filename}`);
    }
    
    // Save by category
    const categories = {};
    this.fusedRecords.forEach(record => {
      const cat = record.category || 'Other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(record);
    });
    
    Object.entries(categories).forEach(([category, records]) => {
      const csv = parse(records, { fields });
      const catFilename = `fused_${category.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.csv`;
      fs.writeFileSync(catFilename, csv);
      console.log(`Saved ${records.length} ${category} records to ${catFilename}`);
    });
    
    // Generate summary
    const summary = {
      totalRecords: this.allRecords.length,
      fusedRecords: this.fusedRecords.length,
      duplicatesRemoved: this.allRecords.length - this.fusedRecords.length,
      byCategory: {},
      byState: {},
      bySource: {},
      withMultipleSources: this.fusedRecords.filter(r => r.sourceCount > 1).length
    };
    
    this.fusedRecords.forEach(record => {
      // Count by category
      const cat = record.category || 'Other';
      summary.byCategory[cat] = (summary.byCategory[cat] || 0) + 1;
      
      // Count by state
      const state = record.state || record.practiceState || 'Unknown';
      summary.byState[state] = (summary.byState[state] || 0) + 1;
      
      // Count by original source
      const sources = (record.dataSources || '').split(',');
      sources.forEach(source => {
        source = source.trim();
        if (source) {
          summary.bySource[source] = (summary.bySource[source] || 0) + 1;
        }
      });
    });
    
    fs.writeFileSync(
      `fusion_summary_${timestamp}.json`,
      JSON.stringify(summary, null, 2)
    );
    
    console.log('\n=== Fusion Summary ===');
    console.log(`Total Input Records: ${summary.totalRecords}`);
    console.log(`Fused Output Records: ${summary.fusedRecords}`);
    console.log(`Duplicates Removed: ${summary.duplicatesRemoved}`);
    console.log(`Records with Multiple Sources: ${summary.withMultipleSources}`);
    
    console.log('\nBy Category:');
    Object.entries(summary.byCategory)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
    
    console.log('\nBy State:');
    Object.entries(summary.byState).forEach(([state, count]) => {
      console.log(`  ${state}: ${count}`);
    });
  }
}

// Main execution
async function main() {
  console.log('Healthcare Provider Data Fusion Pipeline');
  console.log('=======================================\n');
  
  const pipeline = new DataFusionPipeline();
  
  // Load all available data files
  const dataFiles = [
    // NPI data
    { file: 'npi_all_providers_complete_2025-06-04.csv', source: 'NPI' },
    { file: 'npi_dentists_complete_2025-06-04.csv', source: 'NPI' },
    { file: 'npi_dermatologists_complete_2025-06-04.csv', source: 'NPI' },
    { file: 'npi_plastic_surgeons_complete_2025-06-04.csv', source: 'NPI' },
    
    // MedSpa searches
    { file: 'medspas_comprehensive_NY_FL_2025-06-05.csv', source: 'MedSpa_Finder' },
    { file: 'comprehensive_medspas_NY_FL_2025-06-05.csv', source: 'Comprehensive' },
    { file: 'verified_medspas_NY_FL_2025-06-05.csv', source: 'Comprehensive' }
  ];
  
  // Load each file
  for (const { file, source } of dataFiles) {
    try {
      const records = await pipeline.loadCSV(file, source);
      pipeline.allRecords.push(...records);
    } catch (error) {
      console.log(`Skipping ${file}: ${error.message}`);
    }
  }
  
  // Process and save
  await pipeline.processData();
  pipeline.saveResults();
  
  console.log('\nData fusion complete!');
}

// Run the pipeline
main().catch(console.error);