/**
 * Request logging middleware
 * Logs incoming requests with method, URL, and timestamp
 */
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`;
    console.log(logMessage);
  });
  next();
};

module.exports = loggingMiddleware;
