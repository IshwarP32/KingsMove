/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  console.error(`Error ${err.status || 500}: ${err.message}`);
  console.error(err.stack);

  const isDevelopment = process.env.NODE_ENV === "development";

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(isDevelopment && { stack: err.stack })
  });
};

/**
 * 404 Not Found handler
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

export { errorHandler, notFoundHandler };