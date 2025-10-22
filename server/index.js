const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const GameManager = require('./gameManager');
const DatabaseManager = require('./databaseManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? true : "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Initialize managers
const gameManager = new GameManager();
const dbManager = new DatabaseManager();

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join lobby
  socket.on('join-lobby', async (data) => {
    try {
      const { roomCode, playerName } = data;
      const result = await gameManager.joinLobby(socket, roomCode, playerName);
      socket.emit('lobby-joined', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Create new lobby
  socket.on('create-lobby', async (data) => {
    try {
      const { playerName, settings } = data;
      const result = await gameManager.createLobby(socket, playerName, settings);
      socket.emit('lobby-created', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Submit word for drawing
  socket.on('submit-word', async (data) => {
    try {
      const { word } = data;
      const result = await gameManager.submitWord(socket, word);
      socket.emit('word-submitted', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Start game
  socket.on('start-game', async () => {
    try {
      const result = await gameManager.startGame(socket);
      io.to(result.roomCode).emit('game-started', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Submit drawing
  socket.on('submit-drawing', async (data) => {
    try {
      const { drawingData } = data;
      const result = await gameManager.submitDrawing(socket, drawingData);
      io.to(result.roomCode).emit('drawing-submitted', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Vote on drawings
  socket.on('vote-drawing', async (data) => {
    try {
      const { drawingId, vote } = data;
      const result = await gameManager.voteDrawing(socket, drawingId, vote);
      io.to(result.roomCode).emit('vote-submitted', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Chat message
  socket.on('chat-message', async (data) => {
    try {
      const { message } = data;
      const result = await gameManager.sendChatMessage(socket, message);
      io.to(result.roomCode).emit('chat-message', result);
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    gameManager.handleDisconnect(socket);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
