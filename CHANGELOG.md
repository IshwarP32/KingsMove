# Changelog

All notable changes to the KingsMove project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- ESLint and Prettier configuration for backend code quality
- Input validation middleware for user registration and login
- Request logging middleware for better debugging
- Global error handling middleware
- Rate limiting to prevent abuse (general, auth, and API limits)
- Environment variable validation on startup
- Health check endpoint (`/health`)
- Comprehensive API documentation (`API_DOCS.md`)
- Development setup guide (`CONTRIBUTING.md`)
- Docker Compose setup for easy local development
- Automated setup script (`setup.sh`)
- Enhanced .gitignore for better file exclusion

### Changed
- Frontend ESLint errors reduced from 16 to 2
- Frontend ESLint warnings reduced from 8 to 6
- Improved code consistency in React components
- Better error handling in frontend catch blocks
- Fixed React Hook dependency arrays for better performance

### Security
- Added rate limiting to prevent API abuse
- Added input sanitization to prevent XSS attacks
- Enhanced password validation requirements
- Added request logging for security monitoring

### Developer Experience
- Added backend linting and formatting tools
- Created development Docker environment
- Added environment variable validation
- Improved error messages and logging
- Created comprehensive API documentation

## [1.0.0] - 2024-XX-XX (Previous)

### Added
- Real-time PvP chess gameplay with Socket.IO
- JWT-based authentication with access/refresh tokens
- User account management (create, update, delete)
- Friend system (send/accept friend requests)
- Challenge system for friend matches
- Random matchmaking
- Profile management with avatar uploads
- MongoDB integration with Mongoose
- Cloudinary integration for image storage
- React frontend with TailwindCSS
- Express.js backend with proper routing