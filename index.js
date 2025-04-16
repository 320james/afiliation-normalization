import fs from 'fs';
import {
  normalizeAffiliation,
  // addNormalizationMapping,
  getNormalizationCache,
} from './utils.js';
import { createObjectCsvWriter } from 'csv-writer';

if (process.argv.length < 4 || process.argv.length > 5) {
  console.error(
    'Usage: node index.js <inputfile.jsonl> <output.csv> [threshold]'
  );
  process.exit(1);
}

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const threshold = process.argv[4] ? parseFloat(process.argv[4]) : undefined;

if (threshold && (threshold < 0 || threshold > 1)) {
  console.error('Error: Threshold must be between 0 and 1');
  process.exit(1);
}

// If we want to drastically improve mappings, we can add mappings manually.
// addNormalizationMapping(
//   'Mass. Inst. of Tech',
//   'massachusetts institute of technology'
// );
// addNormalizationMapping('MIT', 'massachusetts institute of technology');
// addNormalizationMapping(
//   'Mass. Inst. of Technology',
//   'massachusetts institute of technology'
// );

const csvWriter = createObjectCsvWriter({
  path: outputFile,
  header: [
    { id: 'original_affiliation', title: 'original_affiliation' },
    { id: 'normalized_affiliation', title: 'normalized_affiliation' },
  ],
});

try {
  // Read the JSONL data
  const jsonlContent = fs.readFileSync(inputFile, 'utf8');

  // Parse lines
  const lines = jsonlContent.split('\n').filter((line) => line.trim() !== '');
  const jsonObjects = [];

  // Parse each line as json obj
  for (let i = 0; i < lines.length; i++) {
    try {
      const line = lines[i];
      const obj = JSON.parse(line);
      jsonObjects.push(obj);
    } catch (error) {
      console.error(`Error parsing line ${i + 1}:`);
      console.error(`Line content: ${lines[i]}`);
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  }

  console.log('Processing...');

  // Normalize
  const records = jsonObjects.map(({ author_affiliation }) => {
    const originalAffiliation = author_affiliation;
    const normalizedAffiliation = normalizeAffiliation(
      originalAffiliation,
      threshold
    );
    return {
      original_affiliation: originalAffiliation,
      normalized_affiliation: normalizedAffiliation,
    };
  });

  // Write to CSV
  await csvWriter.writeRecords(records);
  console.log(
    `Normalized author affiliations from ${inputFile} to ${outputFile}`
  );

  // Display normalization statistics
  console.log('\nSome normalization stats:');
  const cache = getNormalizationCache();

  console.log(`Number of original strings: ${records.length}`);
  console.log(`Number of normalized values: ${cache.size}`);
  console.log(
    `Estimated reduction ratio: ${(
      (1 - cache.size / records.length) *
      100
    ).toFixed(2)}%`
  );
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
