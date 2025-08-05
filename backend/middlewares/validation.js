/**
 * Basic input validation utilities
 */

/**
 * Validates email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates username format
 * @param {string} username - Username to validate
 * @returns {boolean} - True if valid username
 */
const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid password
 */
const isValidPassword = (password) => {
  return password && password.length >= 6;
};

/**
 * Sanitizes string input
 * @param {string} input - Input to sanitize
 * @returns {string} - Sanitized input
 */
const sanitizeString = (input) => {
  if (typeof input !== "string") return "";
  return input.trim().replace(/[<>]/g, "");
};

/**
 * Middleware to validate user registration data
 */
const validateUserRegistration = (req, res, next) => {
  const { fullName, username, email, password } = req.body;

  // Check required fields
  if (!fullName || !username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  // Validate email
  if (!isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }

  // Validate username
  if (!isValidUsername(username)) {
    return res.status(400).json({
      success: false,
      message: "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
    });
  }

  // Validate password
  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  // Sanitize inputs
  req.body.fullName = sanitizeString(fullName);
  req.body.username = sanitizeString(username);
  req.body.email = sanitizeString(email).toLowerCase();

  next();
};

/**
 * Middleware to validate login data
 */
const validateLogin = (req, res, next) => {
  const { accessfield, password } = req.body;

  if (!accessfield || !password) {
    return res.status(400).json({
      success: false,
      message: "Username/email and password are required"
    });
  }

  req.body.accessfield = sanitizeString(accessfield).toLowerCase();
  
  next();
};

export { 
  isValidEmail, 
  isValidUsername, 
  isValidPassword, 
  sanitizeString,
  validateUserRegistration,
  validateLogin 
};