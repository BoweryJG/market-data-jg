import { describe, it, expect } from 'vitest';
import { isError, hasErrorMessage, getErrorMessage, isAxiosError } from './errorUtils';

describe('errorUtils', () => {
  describe('isError', () => {
    it('should return true for Error instances', () => {
      expect(isError(new Error('test error'))).toBe(true);
      expect(isError(new TypeError('type error'))).toBe(true);
      expect(isError(new RangeError('range error'))).toBe(true);
    });

    it('should return false for non-Error values', () => {
      expect(isError('string error')).toBe(false);
      expect(isError({ message: 'object error' })).toBe(false);
      expect(isError(null)).toBe(false);
      expect(isError(undefined)).toBe(false);
      expect(isError(123)).toBe(false);
      expect(isError(true)).toBe(false);
    });
  });

  describe('hasErrorMessage', () => {
    it('should return true for objects with message property', () => {
      expect(hasErrorMessage({ message: 'error message' })).toBe(true);
      expect(hasErrorMessage({ message: 'test', other: 'prop' })).toBe(true);
    });

    it('should return false for objects without message property', () => {
      expect(hasErrorMessage({ error: 'no message prop' })).toBe(false);
      expect(hasErrorMessage({})).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(hasErrorMessage('string')).toBe(false);
      expect(hasErrorMessage(123)).toBe(false);
      expect(hasErrorMessage(null)).toBe(false);
      expect(hasErrorMessage(undefined)).toBe(false);
      expect(hasErrorMessage(true)).toBe(false);
    });

    it('should return false for objects with non-string message', () => {
      expect(hasErrorMessage({ message: 123 })).toBe(false);
      expect(hasErrorMessage({ message: null })).toBe(false);
      expect(hasErrorMessage({ message: { nested: 'object' } })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should extract message from Error instances', () => {
      expect(getErrorMessage(new Error('test error'))).toBe('test error');
      expect(getErrorMessage(new TypeError('type error'))).toBe('type error');
    });

    it('should extract message from objects with message property', () => {
      expect(getErrorMessage({ message: 'object error' })).toBe('object error');
    });

    it('should return string errors as-is', () => {
      expect(getErrorMessage('string error')).toBe('string error');
    });

    it('should return default message for unknown error types', () => {
      expect(getErrorMessage(null)).toBe('An unknown error occurred');
      expect(getErrorMessage(undefined)).toBe('An unknown error occurred');
      expect(getErrorMessage(123)).toBe('An unknown error occurred');
      expect(getErrorMessage(true)).toBe('An unknown error occurred');
      expect(getErrorMessage({})).toBe('An unknown error occurred');
      expect(getErrorMessage({ error: 'no message' })).toBe('An unknown error occurred');
    });

    it('should handle complex error scenarios', () => {
      const complexError = {
        message: 'Complex error message',
        code: 'ERR_001',
        stack: 'Error stack trace'
      };
      expect(getErrorMessage(complexError)).toBe('Complex error message');
    });
  });

  describe('isAxiosError', () => {
    it('should return true for objects with response property', () => {
      expect(isAxiosError({ response: {} })).toBe(true);
      expect(isAxiosError({ response: { data: {} } })).toBe(true);
      expect(isAxiosError({ 
        response: { 
          data: { 
            message: 'API error' 
          } 
        } 
      })).toBe(true);
    });

    it('should return false for objects without response property', () => {
      expect(isAxiosError({ message: 'error' })).toBe(false);
      expect(isAxiosError({})).toBe(false);
      expect(isAxiosError(new Error('test'))).toBe(false);
    });

    it('should return false for non-objects', () => {
      expect(isAxiosError('string')).toBe(false);
      expect(isAxiosError(123)).toBe(false);
      expect(isAxiosError(null)).toBe(false);
      expect(isAxiosError(undefined)).toBe(false);
      expect(isAxiosError(true)).toBe(false);
    });

    it('should handle axios-like error structures', () => {
      const axiosError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: {
            message: 'Resource not found',
            error: 'NOT_FOUND'
          }
        },
        request: {},
        config: {},
        message: 'Request failed with status code 404'
      };
      expect(isAxiosError(axiosError)).toBe(true);
    });
  });
});