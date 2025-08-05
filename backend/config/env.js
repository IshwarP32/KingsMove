/**
 * Environment variable validation
 */

const requiredEnvVars = [
  "MONGODB_URI",
  "ACCESS_TOKEN_SECRET", 
  "REFRESH_TOKEN_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET"
];

/**
 * Validates that all required environment variables are set
 * @throws {Error} If any required environment variable is missing
 */
const validateEnvironment = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      "Please check your .env file and ensure all required variables are set."
    );
  }
  
  console.log("✅ Environment variables validated successfully");
};

export { validateEnvironment };