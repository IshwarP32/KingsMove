# KingsMove API Documentation

This document describes the REST API endpoints for the KingsMove chess application.

## Base URL
```
http://localhost:4000/api
```

## Authentication
The API uses JWT (JSON Web Tokens) for authentication with access and refresh tokens stored in HTTP-only cookies.

## User Endpoints

### POST /user/create
Creates a new user account.

**Request Body:**
```json
{
  "fullName": "string",
  "username": "string", 
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully"
}
```

### POST /user/login
Authenticates a user and returns tokens.

**Request Body:**
```json
{
  "accessfield": "string", // username or email
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "avatar": "string"
  }
}
```

### POST /user/info
Gets current user information (requires authentication).

**Response:**
```json
{
  "success": true,
  "content": {
    "id": "string",
    "username": "string", 
    "email": "string",
    "fullName": "string",
    "avatar": "string"
  }
}
```

### POST /user/logout
Logs out the current user (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /user/update
Updates user profile information (requires authentication).

**Request Body (multipart/form-data):**
- `fullName`: string (optional)
- `username`: string (optional)
- `image`: file (optional)

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

### POST /user/change-pass
Changes user password (requires authentication).

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

### POST /user/delete
Deletes user account (requires authentication).

**Request Body:**
```json
{
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

## Friends Endpoints

### POST /user/friendship/new
Sends a friend request (requires authentication).

**Request Body:**
```json
{
  "username": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friend request sent"
}
```

### POST /user/friendship/list
Gets user's friends list (requires authentication).

**Response:**
```json
{
  "success": true,
  "content": [
    {
      "id": "string",
      "username": "string",
      "avatar": "string",
      "status": "accepted|pending|blocked"
    }
  ]
}
```

### POST /user/friendship/status
Updates friendship status (requires authentication).

**Request Body:**
```json
{
  "friendshipId": "string",
  "status": "accepted|blocked|removed"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Friendship status updated"
}
```

## Challenge Endpoints

### POST /user/challenge/new
Creates a challenge to another user (requires authentication).

**Request Body:**
```json
{
  "challengedUserId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Challenge sent",
  "challengeId": "string"
}
```

### POST /user/challenge/list
Gets user's challenges (sent and received) (requires authentication).

**Response:**
```json
{
  "success": true,
  "content": {
    "sent": [
      {
        "id": "string",
        "challengedUser": {
          "username": "string",
          "avatar": "string"
        },
        "status": "pending|accepted|declined",
        "createdAt": "date"
      }
    ],
    "received": [
      {
        "id": "string", 
        "challenger": {
          "username": "string",
          "avatar": "string"
        },
        "status": "pending|accepted|declined",
        "createdAt": "date"
      }
    ]
  }
}
```

### POST /user/challenge/status
Updates challenge status (requires authentication).

**Request Body:**
```json
{
  "challengeId": "string",
  "status": "accepted|declined"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Challenge status updated",
  "gameId": "string" // only when accepted
}
```

## Arena/Game Endpoints

### POST /arena/queue/add
Adds user to matchmaking queue (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Added to queue"
}
```

### POST /arena/queue/remove
Removes user from matchmaking queue (requires authentication).

**Response:**
```json
{
  "success": true,
  "message": "Removed from queue"
}
```

### POST /arena/game/check
Checks if user has an active game (requires authentication).

**Response:**
```json
{
  "success": true,
  "content": {
    "gameId": "string|null"
  }
}
```

### POST /arena/game/load
Loads game data by ID (requires authentication).

**Request Body:**
```json
{
  "gameId": "string"
}
```

**Response:**
```json
{
  "success": true,
  "content": {
    "gameId": "string",
    "board": "array", // 8x8 chess board state
    "currentTurn": "w|b",
    "player": "w|b", // current user's color
    "status": "active|completed",
    "winner": "w|b|draw|null"
  }
}
```

### POST /arena/game/move
Makes a move in the game (requires authentication).

**Request Body:**
```json
{
  "gameId": "string",
  "from": [row, col],
  "to": [row, col]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Move made successfully",
  "gameState": {
    "board": "array",
    "currentTurn": "w|b",
    "status": "active|completed",
    "winner": "w|b|draw|null"
  }
}
```

## Socket Events

The application uses Socket.IO for real-time communication:

### Client to Server Events
- `joinGame`: Join a specific game room
- `makeMove`: Make a chess move
- `leaveGame`: Leave a game room

### Server to Client Events  
- `gameUpdate`: Game state has changed
- `moveUpdate`: New move was made
- `gameOver`: Game has ended
- `challengeRefresh`: New challenge received
- `matchFound`: Matchmaking found opponent

## Error Responses

All endpoints return error responses in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400`: Bad Request - Invalid input
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Access denied
- `404`: Not Found - Resource not found
- `500`: Internal Server Error - Server error