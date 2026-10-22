const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const logger = require('../config/logger');

const notFound = (req, _res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, _next) => {
  const isKnown = error instanceof ApiError;
  const statusCode = isKnown ? error.statusCode : error.status || 500;

  if (!isKnown || statusCode >= 500) {
    logger.error(
      {
        err: error,
        method: req.method,
        url: req.originalUrl,
        userId: req.user?.id,
      },
      'request failed',
    );
  }

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && !env.isProduction
        ? error.message
        : isKnown
          ? error.message
          : 'Something went wrong on our side. Please try again.',
    ...(isKnown && error.details ? { details: error.details } : {}),
  });
};

module.exports = { notFound, errorHandler };
