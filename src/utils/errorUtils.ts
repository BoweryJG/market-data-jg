/**
 * Type guard to check if an error is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if an error has a message property
 */
export function hasErrorMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Safely get error message from unknown error
 */
export function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  if (hasErrorMessage(error)) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unknown error occurred';
}

/**
 * Type guard for axios errors
 */
export function isAxiosError(error: unknown): error is { response?: { data?: { message?: string } } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}