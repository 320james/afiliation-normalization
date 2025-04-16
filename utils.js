import distance from 'jaro-winkler';

// Cache to store normalized versions of previously seen affiliations
const normalizationCache = new Map();

// Function to calculate string similarity. Uses Levenshtein distance, which is most frequently used algorithm.
// https://www.analyticsvidhya.com/blog/2021/02/a-simple-guide-to-metrics-for-calculating-string-similarity/#h-edit-based-algorithms
export function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1)
    .fill()
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // Delete
        matrix[i][j - 1] + 1, // Insert
        matrix[i - 1][j - 1] + cost // Sub
      );
    }
  }

  const maxLength = Math.max(len1, len2);
  return 1 - matrix[len1][len2] / maxLength;
}

// Basic string normalization removing special characters and extra spaces. Not sure if we should remove all spaces?
export function normalizeString(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove special chars
    .replace(/\s+/g, ' ') // Remove spaces
    .trim();
}

// Threshold is the minimum similarity score to consider a match
// I set the default to 0.8, but this can be adjusted
// One downside of this way of normalizing data is that it depends on the order of data entry of what each
// string will normalize to. For example, if "Massachusetts Institute of Technology, Cambridge, MA, USA",
// is entered first, and then "Massachusetts Institute of Technology" is entered second,
// The second string will map to the first string. Same with other strings that are found to be similar.
// For the given data, lowering the threshold will result in less unique mappings, but lowers the accuracy of normalization.
export function normalizeAffiliation(affiliation, threshold = 0.7) {
  if (!affiliation) return '';

  // Basic normalization
  const normalized = normalizeString(affiliation);

  // Check cache for similar strings
  for (const [cached, normalizedVersion] of normalizationCache) {
    // const similarity = distance(normalized, cached); // Jaro-Winkler distance.
    const similarity = levenshteinDistance(normalized, cached);
    if (similarity >= threshold) {
      return normalizedVersion;
    }
  }

  // If no similar string found, use the normalized version
  // and add it to the cache
  normalizationCache.set(normalized, normalized);
  return normalized;
}

// Function to manually add known mappings
export function addNormalizationMapping(original, normalized) {
  const normOriginal = normalizeString(original);
  const normNormalized = normalizeString(normalized);
  normalizationCache.set(normOriginal, normNormalized);
}

// Function to get the current cache (for debugging)
export function getNormalizationCache() {
  return normalizationCache;
}
