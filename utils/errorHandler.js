/**
 * Custom Error Classes and Error Handling Utilities
 */

/**
 * Base API Error Class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request Error
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Error
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Error
 */
class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found Error
 */
class NotFoundError extends APIError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
  }
}

/**
 * 409 Conflict Error
 */
class ConflictError extends APIError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * 422 Validation Error
 */
class ValidationError extends APIError {
  constructor(message = 'Validation failed', errors = []) {
    super(message, 422);
    this.errors = errors;
  }
}

/**
 * 429 Too Many Requests Error
 */
class RateLimitError extends APIError {
  constructor(message = 'Too many requests') {
    super(message, 429);
  }
}

/**
 * 500 Internal Server Error
 */
class InternalServerError extends APIError {
  constructor(message = 'Internal server error') {
    super(message, 500, false);
  }
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: router.get('/path', catchAsync(async (req, res) => { ... }))
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;
  error.status = err.status || 'error';

  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('Error Details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip
    });
  } else {
    console.error('Error:', error.message);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new BadRequestError(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new ConflictError(`${field} already exists`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    error = new ValidationError('Validation failed', errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new UnauthorizedError('Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new UnauthorizedError('Token expired');
  }

  // Send error response
  const response = {
    success: false,
    status: error.status,
    message: error.message
  };

  // Include errors array for validation errors
  if (error.errors) {
    response.errors = error.errors;
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(error.statusCode).json(response);
};

/**
 * Handle 404 errors for undefined routes
 */
const notFound = (req, res, next) => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

/**
 * Safe JSON parser with error handling
 */
const safeJsonParse = (jsonString, defaultValue = null) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('JSON parse error:', error.message);
    return defaultValue;
  }
};

/**
 * Validate required fields
 */
const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];
  
  for (const field of requiredFields) {
    if (!data[field]) {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      missingFields
    );
  }
};

/**
 * Create success response
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Create paginated response
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination
  });
};

module.exports = {
  // Error classes
  APIError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,

  // Middleware
  catchAsync,
  errorHandler,
  notFound,

  // Utilities
  safeJsonParse,
  validateRequiredFields,
  successResponse,
  paginatedResponse
};
