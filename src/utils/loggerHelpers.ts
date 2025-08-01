// Helper functions to ensure proper typing for logger
export function toLogData(data: unknown): Record<string, unknown> | undefined {
  if (data === null || data === undefined) {
    return undefined;
  }
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  
  // Wrap primitives and arrays in an object
  return { value: data };
}

// Helper for error objects
export function errorToLogData(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack,
    };
  }
  
  return toLogData(error) || { error: String(error) };
}