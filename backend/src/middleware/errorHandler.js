const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Authentication token has expired';
    error = { message, statusCode: 401 };
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    const message = 'File size too large. Maximum allowed size is 5MB';
    error = { message, statusCode: 400 };
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    const message = 'Too many files uploaded';
    error = { message, statusCode: 400 };
  }

  // Login specific errors
  if (err.code === 'LOGIN_FAILED') {
    const message = 'Invalid email or password';
    error = { message, statusCode: 401 };
  }

  if (err.code === 'ACCOUNT_NOT_APPROVED') {
    const message = 'Your account is pending approval from college admin';
    error = { message, statusCode: 403, code: 'ACCOUNT_NOT_APPROVED' };
  }

  if (err.code === 'ACCOUNT_REJECTED') {
    const message = 'Your account has been rejected';
    error = { message, statusCode: 403, code: 'ACCOUNT_REJECTED' };
  }

  // Network/Connection errors
  if (err.code === 'ECONNREFUSED') {
    const message = 'Database connection failed';
    error = { message, statusCode: 500 };
  }

  // Send error response
  const response = {
    success: false,
    error: error.message || 'Server Error',
    ...(error.code && { code: error.code }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  res.status(error.statusCode || 500).json(response);
};

module.exports = errorHandler;