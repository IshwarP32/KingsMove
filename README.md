# KingsMove ♟️  
**A PvP Live Chess Web Application**

KingsMove is a real-time, player-vs-player (PvP) web-based chess platform. It offers seamless matchmaking, friend challenges, user account management, and live gameplay—all crafted as a solo project.

---

## 🔧 Tech Stack

**Frontend:**
- React
- TailwindCSS
- Socket.io-client (for real-time gameplay)

**Backend:**
- Node.js
- Express
- Socket.IO
- MongoDB (via Mongoose)
- JWT Authentication (Access & Refresh Tokens)
- Cloudinary (for image storage)

---

## 🚀 Features

- 🔒 JWT-based Authentication (access & refresh tokens)
- 👤 Profile Management
  - Update user info
  - Reset password (with old password verification)
  - Delete account (with password verification)
- 🤝 Friend System
  - Send/accept friend requests via username
  - View friends list
- 🧠 Chess Gameplay
  - Challenge a friend to a match
  - Random matchmaking
  - Real-time game updates using Socket.IO

---

## 🖼️ Screenshots

### 🔐 Login & Create Account  
![Login Page](./screenshots/login.png)  
![Create Account Page](./screenshots/create.png)

### 🏠 Home Page  
![Home Page](./screenshots/home.png)

### 👥 Friends Page  
![Friends Page](./screenshots/friend.png)

### 🎯 Challenges Page  
![Challenges Page](./screenshots/challenge.png)

### ⚙️ Account Details  
![Account Details](./screenshots/profile.png)

### 🔑 Password Change & Account Deletion  
![Password Change](./screenshots/password.png)  
![Account Deletion](./screenshots/delete.png)

### ♟️ Find Game (Matchmaking)  
![Find Game Page](./screenshots/start.png)

### ⏳ Ongoing Game  
![Ongoing Game](./screenshots/game.png)

### ✅ Completed Game  
![Completed Game](./screenshots/end.png)

---

## 🛠️ Getting Started

### Prerequisites
- Node.js & npm
- MongoDB instance (local or cloud)
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone https://github.com/IshwarP32/KingsMove.git
cd KingsMove
```
### 2. Setup Environment Variables
➤ Frontend (KingsMove/frontend/.env)
```
VITE_BACKEND_URL = http://localhost:4000
SOCKET_URL = http://localhost:4001
```
➤ Backend (KingsMove/backend/.env)
```
MONGODB_URI=your_mongodb_connection_string

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRY=15m

REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRY=7d
```
### 3. Install dependancies
```bash
# Option 1: Use the automated setup script (recommended)
chmod +x setup.sh
./setup.sh

# Option 2: Manual installation
cd frontend
npm install

cd ../backend
npm install
```
### 4. Run developenedt servers in two separate terminals
```bash
cd frontend
npm run dev
```
```bash
cd backend
npm run dev
```

**Or use Docker Compose for easy setup:**
```bash
docker-compose -f docker-compose.dev.yml up
```

---

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm test              # Run tests
npm run test:coverage # Run with coverage
```

### Backend Tests
```bash
cd backend
npm test              # Run tests
npm run test:watch    # Run in watch mode
```

---

## 🔧 Development Tools

### Code Quality
```bash
# Frontend linting
cd frontend
npm run lint          # Check for errors

# Backend linting & formatting
cd backend
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix errors
npm run format        # Format code with Prettier
```

### Building
```bash
cd frontend
npm run build         # Build for production
npm run preview       # Preview production build
```

---

## 📚 Documentation

- **[API Documentation](./API_DOCS.md)** - Complete REST API reference
- **[Contributing Guide](./CONTRIBUTING.md)** - Development setup and guidelines
- **[Changelog](./CHANGELOG.md)** - Project changes and improvements

---

## 🛡️ Security Features

- JWT-based authentication with access/refresh tokens
- Rate limiting (5 auth attempts, 1000 API calls per 15 minutes)
- Input validation and sanitization
- Request logging for security monitoring
- Environment variable validation

---

## 🏗️ Architecture

### Frontend
- **React 19** with hooks and context for state management
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Socket.IO Client** for real-time communication
- **React Router** for navigation
- **Vitest** for testing

### Backend
- **Express.js** with middleware architecture
- **Socket.IO** for real-time game updates
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for image storage
- **Jest** for testing
---

🤝 Acknowledgements
This project was designed, developed, and maintained solely by me as a learning and passion project.
Feel free to contribute or raise issues!
