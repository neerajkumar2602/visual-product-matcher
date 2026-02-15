import winston from 'winston';

/**
 * Custom log format with timestamp, level, component, and message
 */
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Console format for development (more readable)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, component, ...meta }) => {
    const componentStr = component ? `[${component}]` : '';
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `${timestamp} ${level} ${componentStr} ${message} ${metaStr}`;
  })
);

/**
 * Create Winston logger instance
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'visual-product-matcher' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat
    }),
    // Write error logs to file
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Write all logs to combined file
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ]
});

/**
 * Create a child logger with component context
 * @param {string} component - Component name (e.g., 'ImageProcessor', 'ProductDatabase')
 * @returns {winston.Logger} Child logger with component context
 */
export const createLogger = (component) => {
  return logger.child({ component });
};

/**
 * Log error with context
 * @param {string} component - Component name
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export const logError = (component, message, error, context = {}) => {
  logger.error(message, {
    component,
    error: error.message,
    stack: error.stack,
    ...context
  });
};

/**
 * Log performance metrics
 * @param {string} component - Component name
 * @param {string} operation - Operation name
 * @param {number} duration - Duration in milliseconds
 * @param {Object} metadata - Additional metadata
 */
export const logPerformance = (component, operation, duration, metadata = {}) => {
  logger.info('Performance metric', {
    component,
    operation,
    duration,
    unit: 'ms',
    ...metadata
  });
};

/**
 * Express middleware for request logging
 */
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = generateRequestId();
  
  // Attach request ID to request object
  req.requestId = requestId;
  
  // Log incoming request
  logger.info('Incoming request', {
    component: 'API',
    requestId,
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    logger.info('Request completed', {
      component: 'API',
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      unit: 'ms'
    });
  });
  
  next();
};

/**
 * Generate unique request ID
 */
function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default logger;
