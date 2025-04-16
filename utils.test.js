import {
  normalizeAffiliation,
  addNormalizationMapping,
  getNormalizationCache,
  normalizeString,
  levenshteinDistance,
} from './utils.js';
import distance from 'jaro-winkler';

describe('String Normalization', () => {
  beforeEach(() => {
    // Clear the cache before each test
    getNormalizationCache().clear();
  });

  describe('normalizeString', () => {
    test('Lowercase', () => {
      expect(normalizeString('Hello World')).toBe('hello world');
      expect(normalizeString('HELLO WORLD')).toBe('hello world');
    });

    test('Normalize whitespaces', () => {
      expect(normalizeString('hello   world')).toBe('hello world');
      expect(normalizeString('hello\nworld')).toBe('hello world');
      expect(normalizeString('hello\tworld')).toBe('hello world');
    });

    test('Replace special chars w/ spaces', () => {
      expect(normalizeString('hello-world')).toBe('hello world');
      expect(normalizeString('hello.world')).toBe('hello world');
      expect(normalizeString('hello@world#123')).toBe('hello world 123');
    });
  });

  describe('Jaro-Winkler Similarity', () => {
    test('should return 1 for identical strings', () => {
      expect(distance('hello', 'hello')).toBe(1);
    });

    test('should return high similarity for similar strings', () => {
      expect(distance('hello', 'helloo')).toBeGreaterThan(0.8);
      expect(distance('hello', 'hallo')).toBeGreaterThan(0.8);
    });

    test('should return low similarity for different strings', () => {
      expect(distance('hello', 'world')).toBeLessThan(0.8);
      expect(distance('abc', 'xyz')).toBeLessThan(0.8);
    });

    test('should handle empty strings', () => {
      expect(distance('', 'hello')).toBeLessThan(8);
      expect(distance('hello', '')).toBeLessThan(8);
    });
  });

  //   describe('Levenshtein Distance', () => {
  //     test('should return high similarity for similar strings', () => {
  //       expect(levenshteinDistance('hello', 'helloo')).toBeGreaterThan(0.8);
  //       expect(levenshteinDistance('hello', 'hallo')).toBeGreaterThan(0.8);
  //     });

  //     test('should return low similarity for different strings', () => {
  //       expect(levenshteinDistance('hello', 'world')).toBeLessThan(0.8);
  //       expect(levenshteinDistance('abc', 'xyz')).toBeLessThan(0.8);
  //     });

  //     test('should handle empty strings', () => {
  //       expect(levenshteinDistance('', 'hello')).toBeLessThan(8);
  //       expect(levenshteinDistance('hello', '')).toBeLessThan(8);
  //     });
  //   });

  //   describe('normalizeAffiliation', () => {
  //     test('should use cache for similar strings', () => {
  //       addNormalizationMapping(
  //         'Mass. Inst. of Tech',
  //         'massachusetts institute of technology'
  //       );

  //       expect(normalizeAffiliation('Mass. Inst. of Tech')).toBe(
  //         'massachusetts institute of technology'
  //       );
  //       expect(normalizeAffiliation('mass inst of tech')).toBe(
  //         'massachusetts institute of technology'
  //       );
  //       expect(normalizeAffiliation('Mass Inst of Technology')).toBe(
  //         'massachusetts institute of technology'
  //       );
  //     });

  //     test('should handle new strings', () => {
  //       const result = normalizeAffiliation('New University');
  //       expect(result).toBe('new university');

  //       const cache = getNormalizationCache();
  //       expect(cache.has('new university')).toBe(true);
  //     });

  //     test('should respect similarity threshold', () => {
  //       addNormalizationMapping('MIT', 'massachusetts institute of technology');

  //       // With default threshold (0.8)
  //       expect(normalizeAffiliation('MIT')).toBe(
  //         'massachusetts institute of technology'
  //       );

  //       // With higher threshold
  //       expect(normalizeAffiliation('MIT', 0.9)).toBe('mit');
  //     });

  //     test('should handle edge cases', () => {
  //       expect(normalizeAffiliation('')).toBe('');
  //       expect(normalizeAffiliation(null)).toBe('');
  //       expect(normalizeAffiliation(undefined)).toBe('');
  //     });
  //   });

  //   describe('addNormalizationMapping', () => {
  //     test('should add mappings correctly', () => {
  //       addNormalizationMapping('MIT', 'massachusetts institute of technology');

  //       const cache = getNormalizationCache();
  //       expect(cache.get('mit')).toBe('massachusetts institute of technology');
  //     });

  //     test('should normalize both input and output', () => {
  //       addNormalizationMapping('M.I.T.', 'Mass. Inst. of Tech');

  //       const cache = getNormalizationCache();
  //       expect(cache.get('m i t')).toBe('mass inst of tech');
  //     });

  //     test('should overwrite existing mappings', () => {
  //       addNormalizationMapping('MIT', 'first mapping');
  //       addNormalizationMapping('MIT', 'second mapping');

  //       const cache = getNormalizationCache();
  //       expect(cache.get('mit')).toBe('second mapping');
  //     });
  //   });

  //   describe('getNormalizationCache', () => {
  //     test('should return the cache object', () => {
  //       const cache = getNormalizationCache();
  //       expect(cache instanceof Map).toBe(true);
  //     });

  //     test('should allow cache modification', () => {
  //       const cache = getNormalizationCache();
  //       cache.set('test', 'value');
  //       expect(cache.get('test')).toBe('value');
  //     });
  //   });
});
