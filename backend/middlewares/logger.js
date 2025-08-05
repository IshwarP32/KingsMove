/**
 * Request logging middleware
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {Function} next - Express next function
 */
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const userAgent = req.get("User-Agent") || "";
  
  console.log(`[${timestamp}] ${method} ${url} - ${userAgent}`);
  
  next();
};

export { requestLogger };