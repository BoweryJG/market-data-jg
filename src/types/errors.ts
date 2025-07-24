// Error type definitions for type-safe error handling

export class TypedError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    message: string,
    code?: string,
    status?: number,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TypedError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TypedError);
    }
  }
}

export class ValidationError extends TypedError {
  public readonly field?: string;
  public readonly value?: unknown;
  public readonly constraint?: string;

  constructor(
    message: string,
    field?: string,
    value?: unknown,
    constraint?: string
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.constraint = constraint;
  }
}

export class ApiError extends TypedError {
  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code || 'API_ERROR', status, details);
    this.name = 'ApiError';
  }
}

export class AuthError extends TypedError {
  constructor(
    message: string,
    code?: string,
    details?: Record<string, unknown>
  ) {
    super(message, code || 'AUTH_ERROR', 401, details);
    this.name = 'AuthError';
  }
}

export class NetworkError extends TypedError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'NETWORK_ERROR', 0, details);
    this.name = 'NetworkError';
  }
}

// Type guard functions
export function isTypedError(error: unknown): error is TypedError {
  return error instanceof TypedError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

// Error handling utility
export function handleUnknownError(error: unknown): TypedError {
  if (isTypedError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new TypedError(error.message, 'UNKNOWN_ERROR');
  }

  if (typeof error === 'string') {
    return new TypedError(error, 'UNKNOWN_ERROR');
  }

  return new TypedError('An unknown error occurred', 'UNKNOWN_ERROR');
}

// HTTP status code errors
export class BadRequestError extends ApiError {
  constructor(message: string = 'Bad Request', details?: Record<string, unknown>) {
    super(message, 400, 'BAD_REQUEST', details);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized', details?: Record<string, unknown>) {
    super(message, 401, 'UNAUTHORIZED', details);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Forbidden', details?: Record<string, unknown>) {
    super(message, 403, 'FORBIDDEN', details);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string = 'Not Found', details?: Record<string, unknown>) {
    super(message, 404, 'NOT_FOUND', details);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends ApiError {
  constructor(message: string = 'Conflict', details?: Record<string, unknown>) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class InternalServerError extends ApiError {
  constructor(message: string = 'Internal Server Error', details?: Record<string, unknown>) {
    super(message, 500, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
  }
}

export class ServiceUnavailableError extends ApiError {
  constructor(message: string = 'Service Unavailable', details?: Record<string, unknown>) {
    super(message, 503, 'SERVICE_UNAVAILABLE', details);
    this.name = 'ServiceUnavailableError';
  }
}

// Error factory function
export function createErrorFromStatus(
  status: number,
  message?: string,
  details?: Record<string, unknown>
): ApiError {
  switch (status) {
    case 400:
      return new BadRequestError(message, details);
    case 401:
      return new UnauthorizedError(message, details);
    case 403:
      return new ForbiddenError(message, details);
    case 404:
      return new NotFoundError(message, details);
    case 409:
      return new ConflictError(message, details);
    case 500:
      return new InternalServerError(message, details);
    case 503:
      return new ServiceUnavailableError(message, details);
    default:
      return new ApiError(message || 'Unknown API Error', status, undefined, details);
  }
}