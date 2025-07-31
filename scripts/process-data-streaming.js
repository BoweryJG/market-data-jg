import { logger } from '@/services/logging/logger';

const fs = require('fs');
const readline = require('readline');
const { Transform } = require('stream');

// Stream process large CSV files without loading into memory
async function processLargeCSV(inputPath, outputPath, processRow) {
  const readStream = fs.createReadStream(inputPath);
  const writeStream = fs.createWriteStream(outputPath);
  
  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
  });
  
  let isFirstLine = true;
  let headers = [];
  let processedCount = 0;
  
  for await (const line of rl) {
    if (isFirstLine) {
      headers = line.split(',').map(h => h.replace(/"/g, ''));
      writeStream.write(line + '\n');
      isFirstLine = false;
      continue;
    }
    
    const row = parseCsvLine(line);
    const processedRow = processRow ? processRow(row, headers) : row;
    
    if (processedRow) {
      writeStream.write(formatCsvLine(processedRow) + '\n');
      processedCount++;
      
      if (processedCount % 1000 === 0) {
        logger.info(`Processed ${processedCount} rows...`);
      }
    }
  }
  
  writeStream.end();
  logger.info(`Total processed: ${processedCount} rows`);
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}

function formatCsvLine(values) {
  return values.map(val => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  }).join(',');
}

module.exports = { processLargeCSV };

// Example usage:
if (require.main === module) {
  const inputFile = process.argv[2];
  const outputFile = process.argv[3];
  
  if (!inputFile || !outputFile) {
    logger.info('Usage: node process-data-streaming.js <input.csv> <output.csv>');
    process.exit(1);
  }
  
  // Example: Filter only NY and FL dentists
  processLargeCSV(inputFile, outputFile, (row, headers) => {
    const stateIndex = headers.indexOf('practiceState');
    if (stateIndex !== -1) {
      const state = row[stateIndex];
      return (state === 'NY' || state === 'FL') ? row : null;
    }
    return row;
  });
}