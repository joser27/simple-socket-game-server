const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

const app = express();
const port = 5000;

// Create an HTTP server
const server = http.createServer(app);

// Initialize a new instance of socket.io
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

app.use(cors(corsOptions));

// Serve the initial route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

let players = {};

// Socket.io connection handler
io.on('connection', (socket) => {

  const playerName = socket.handshake.query.playerName || 'No name';

  console.log('A user connected:', socket.id, 'with name:', playerName);

  // Add a new player to the players object
  players[socket.id] = {
    x: Math.floor(Math.random() * 400),
    y: Math.floor(Math.random() * 400),
    id: socket.id,
    name: playerName,
  };

  // Send the current players to the newly connected player
  socket.emit('currentPlayers', players);

  // Notify the newly connected player of their created player
  socket.emit('playerCreated', players[socket.id]);

  // Notify existing players about the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Listen for player movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
        players[socket.id].x = movementData.x;
        players[socket.id].y = movementData.y;

        // Broadcast the movement, including offsets, to all other players
        socket.broadcast.emit('playerMoved', players[socket.id]);
    }
});


  // Handle client disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    // Remove the player from our players object
    delete players[socket.id];

    // Notify all players to remove this player
    io.emit('playerDisconnected', socket.id);
  });
});


// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});