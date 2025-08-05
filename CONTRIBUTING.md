# Contributing to KingsMove

Thank you for your interest in contributing to KingsMove! This document provides guidelines for contributing to the project.

## Development Setup

### Prerequisites
- Node.js (v16+)
- npm
- MongoDB
- Cloudinary account (for image uploads)

### Environment Variables

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```
VITE_BACKEND_URL=http://localhost:4000
SOCKET_URL=http://localhost:4001
```

**Backend (.env)**
```
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
PORT=4000
```

### Installation

```bash
# Install dependencies
cd frontend && npm install
cd ../backend && npm install
```

### Running the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Code Quality

### Linting and Formatting

**Frontend:**
```bash
cd frontend
npm run lint          # Check for errors
npm run lint --fix     # Auto-fix errors
```

**Backend:**
```bash
cd backend
npm run lint           # Check for errors
npm run lint:fix       # Auto-fix errors
npm run format         # Format code with Prettier
```

### Code Style Guidelines

- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow existing code patterns
- Keep functions small and focused
- Use async/await instead of promises where possible

## Commit Guidelines

- Use clear, descriptive commit messages
- Include the component being changed (e.g., "frontend:", "backend:", "docs:")
- Keep commits focused on a single change

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test your changes thoroughly
5. Lint and format your code
6. Commit your changes with clear messages
7. Push to your fork and submit a pull request

## Testing

Currently, the project is setting up testing infrastructure. When contributing:
- Manually test your changes
- Ensure existing functionality isn't broken
- Test both happy path and error scenarios

## Architecture Overview

### Frontend (React + Vite)
- **Pages**: Route components in `src/pages/`
- **Components**: Reusable UI components in `src/components/`
- **Context**: State management with React Context in `context/`
- **Socket**: Real-time communication in `src/Socket.js`

### Backend (Express + Socket.IO)
- **Routes**: API endpoints in `routes/`
- **Controllers**: Business logic in `controller/`
- **Models**: Database schemas in `models/`
- **Middlewares**: Auth and validation in `middlewares/`
- **Config**: Database and external service configs in `config/`

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.