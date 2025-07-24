import { describe, it, expect } from 'vitest';
import { formatCurrency, formatPercentage, formatDate, truncateText, formatNumber } from './formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('should format positive numbers as USD currency', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(50000)).toBe('$50,000');
      expect(formatCurrency(1234567)).toBe('$1,234,567');
    });

    it('should format negative numbers correctly', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000');
      expect(formatCurrency(-50000)).toBe('-$50,000');
    });

    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should round decimal values', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1234.49)).toBe('$1,234');
    });

    it('should handle very large numbers', () => {
      expect(formatCurrency(1000000000)).toBe('$1,000,000,000');
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal values as percentages', () => {
      expect(formatPercentage(0.25)).toBe('25.0%');
      expect(formatPercentage(0.5)).toBe('50.0%');
      expect(formatPercentage(0.756)).toBe('75.6%');
    });

    it('should handle whole numbers', () => {
      expect(formatPercentage(1)).toBe('100.0%');
      expect(formatPercentage(2)).toBe('200.0%');
    });

    it('should format zero correctly', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle negative percentages', () => {
      expect(formatPercentage(-0.25)).toBe('-25.0%');
      expect(formatPercentage(-0.5)).toBe('-50.0%');
    });

    it('should round to one decimal place', () => {
      expect(formatPercentage(0.12345)).toBe('12.3%');
      expect(formatPercentage(0.12355)).toBe('12.4%');
    });

    it('should handle very small percentages', () => {
      expect(formatPercentage(0.001)).toBe('0.1%');
      expect(formatPercentage(0.0001)).toBe('0.0%');
    });
  });

  describe('formatDate', () => {
    it('should format date strings correctly', () => {
      // Use regex to handle timezone differences
      expect(formatDate('2025-01-15')).toMatch(/January 1[45], 2025/);
      expect(formatDate('2025-12-25')).toMatch(/December 2[45], 2025/);
      expect(formatDate('2025-07-04')).toMatch(/July [34], 2025/);
    });

    it('should handle ISO date strings', () => {
      expect(formatDate('2025-01-15T10:30:00Z')).toMatch(/January 1[45], 2025/);
      expect(formatDate('2025-12-25T00:00:00.000Z')).toMatch(/December 2[45], 2025/);
    });

    it('should handle different date formats', () => {
      expect(formatDate('01/15/2025')).toMatch(/January 1[45], 2025/);
      expect(formatDate('2025/01/15')).toMatch(/January 1[45], 2025/);
    });

    it('should handle leap years', () => {
      expect(formatDate('2024-02-29')).toMatch(/February 2[89], 2024/);
    });

    it('should handle invalid dates gracefully', () => {
      // formatDate throws an error for invalid dates
      expect(() => formatDate('invalid-date')).toThrow(RangeError);
    });
  });

  describe('truncateText', () => {
    it('should not truncate text shorter than maxLength', () => {
      expect(truncateText('Short text', 20)).toBe('Short text');
      expect(truncateText('Hello', 10)).toBe('Hello');
    });

    it('should truncate text longer than maxLength', () => {
      expect(truncateText('This is a very long text that needs truncation', 20)).toBe('This is a very long ...');
      expect(truncateText('Lorem ipsum dolor sit amet', 10)).toBe('Lorem ipsu...');
    });

    it('should handle exact length', () => {
      expect(truncateText('Exact', 5)).toBe('Exact');
    });

    it('should handle empty strings', () => {
      expect(truncateText('', 10)).toBe('');
    });

    it('should handle very short maxLength', () => {
      expect(truncateText('Hello World', 1)).toBe('H...');
      expect(truncateText('Test', 0)).toBe('...');
    });

    it('should handle unicode characters correctly', () => {
      // JavaScript's substring counts UTF-16 code units, not grapheme clusters
      // Emoji like 👋 are 2 code units, 🚀 is also 2 code units
      expect(truncateText('Hello 👋 World', 8)).toBe('Hello 👋...');
      // When we truncate at position 3 of '🚀🚀🚀🚀🚀', we cut in the middle of the second emoji
      // This results in a broken character, which is the actual behavior
      const result = truncateText('🚀🚀🚀🚀🚀', 3);
      expect(result.endsWith('...')).toBe(true);
      expect(result.length).toBe(6); // 3 chars + '...'
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with thousands separators', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
      expect(formatNumber(1234567890)).toBe('1,234,567,890');
    });

    it('should handle small numbers without separators', () => {
      expect(formatNumber(0)).toBe('0');
      expect(formatNumber(100)).toBe('100');
      expect(formatNumber(999)).toBe('999');
    });

    it('should handle negative numbers', () => {
      expect(formatNumber(-1000)).toBe('-1,000');
      expect(formatNumber(-1000000)).toBe('-1,000,000');
    });

    it('should handle decimal numbers', () => {
      expect(formatNumber(1000.5)).toBe('1,000.5');
      expect(formatNumber(1234.567)).toBe('1,234.567');
    });

    it('should handle very large numbers', () => {
      expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe('9,007,199,254,740,991');
    });

    it('should handle zero correctly', () => {
      expect(formatNumber(0)).toBe('0');
      // JavaScript's -0 is formatted as '-0' by Intl.NumberFormat
      expect(formatNumber(-0)).toMatch(/^-?0$/);
    });
  });
});