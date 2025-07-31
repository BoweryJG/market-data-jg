import { logger } from '@/services/logging/logger';

const fs = require('fs');
const csv = require('csv-parser');
const { parse } = require('json2csv');

// Streaming Data Fusion Pipeline for large datasets
class StreamingDataFusion {
  constructor() {
    this.processedCount = 0;
    this.duplicatesFound = 0;
    this.outputStream = null;
  }

  // Process dentist data only (faster)
  async processDentistsOnly() {
    const timestamp = new Date().toISOString().split('T')[0];
    const outputFile = `fused_dental_practices_NY_FL_${timestamp}.csv`;
    
    logger.info('Processing dentist data...');
    
    // Headers for output
    const headers = [
      'businessName', 'category', 'firstName', 'lastName', 'credential',
      'practiceAddress1', 'practiceCity', 'practiceState', 'practiceZip',
      'practicePhone', 'npi', 'taxonomyDescription', 'dataSources'
    ];
    
    // Write headers
    fs.writeFileSync(outputFile, headers.join(',') + '\n');
    
    // Process dentist file
    return new Promise((resolve, reject) => {
      fs.createReadStream('npi_dentists_complete_2025-06-04.csv')
        .pipe(csv())
        .on('data', (row) => {
          // Only process NY and FL
          if (row.practiceState === 'NY' || row.practiceState === 'FL') {
            const processed = {
              businessName: row.organizationName || `${row.firstName} ${row.lastName}, ${row.credential}`,
              category: 'Dental Practice',
              firstName: row.firstName,
              lastName: row.lastName,
              credential: row.credential,
              practiceAddress1: row.practiceAddress1,
              practiceCity: row.practiceCity,
              practiceState: row.practiceState,
              practiceZip: row.practiceZip,
              practicePhone: row.practicePhone,
              npi: row.npi,
              taxonomyDescription: row.taxonomyDescription,
              dataSources: 'NPI'
            };
            
            // Append to file
            const csvLine = headers.map(h => {
              const val = processed[h] || '';
              return val.includes(',') ? `"${val}"` : val;
            }).join(',');
            
            fs.appendFileSync(outputFile, csvLine + '\n');
            this.processedCount++;
            
            if (this.processedCount % 1000 === 0) {
              logger.info(`Processed ${this.processedCount} dentists...`);
            }
          }
        })
        .on('end', () => {
          logger.info(`\nCompleted! Processed ${this.processedCount} NY/FL dentists`);
          logger.info(`Output saved to: ${outputFile}`);
          
          // Generate summary
          const summary = {
            totalProcessed: this.processedCount,
            states: ['NY', 'FL'],
            category: 'Dental Practice',
            source: 'NPI Database',
            outputFile: outputFile,
            timestamp: new Date().toISOString()
          };
          
          fs.writeFileSync(
            `dentist_processing_summary_${timestamp}.json`,
            JSON.stringify(summary, null, 2)
          );
          
          resolve();
        })
        .on('error', reject);
    });
  }
}

// Run
async function main() {
  logger.info('Streaming Data Fusion - Dentist Data');
  logger.info('====================================\n');
  
  const fusion = new StreamingDataFusion();
  
  try {
    await fusion.processDentistsOnly();
    logger.info('\n✅ Processing complete!');
  } catch (error) {
    logger.error('Error:', error);
  }
}

main();