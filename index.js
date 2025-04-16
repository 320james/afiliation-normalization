import fs from 'fs';
import {
  normalizeAffiliation,
  addNormalizationMapping,
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
// // Add some known mappings (optional)
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
  // Read the JSONL file
  const jsonlContent = fs.readFileSync(inputFile, 'utf8');

  // Split by newlines and parse each line as JSON
  const lines = jsonlContent.split('\n').filter((line) => line.trim() !== '');
  const jsonObjects = [];

  // Parse each line as JSON
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

  const records = jsonObjects.map((obj) => {
    const originalAffiliation = obj.author_affiliation_string;
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

  console.log('\nNormalization mappings:');
  const cache = getNormalizationCache();
  for (const [original, normalized] of cache) {
    console.log(`${original} -> ${normalized}`);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
