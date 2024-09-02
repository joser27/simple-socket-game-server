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
let collisionTrees = [];
const maxCollisionTrees = 100;

// Socket.io connection handler
io.on('connection', (socket) => {
  const playerName = socket.handshake.query.playerName;

  // Check if playerName is provided and valid
  if (!playerName || playerName.trim() === '') {
    console.log('Invalid player name. Disconnecting socket:', socket.id);
    socket.disconnect();
    return;
  }

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

  // Send the current trees to the newly connected player
  socket.emit('currentTrees', collisionTrees);

  // Listen for a request for current players
  socket.on('requestCurrentPlayers', () => {
    socket.emit('currentPlayers', players);
  });
  socket.on('requestCurrentTrees', () => {
    socket.emit('currentTrees', collisionTrees);
  });

  // Server-side: Listen for player movement
  socket.on('playerMovement', (movementData) => {
    if (players[socket.id]) {
      players[socket.id].x = movementData.x;
      players[socket.id].y = movementData.y;
      players[socket.id].animation = movementData.animation;
      players[socket.id].flipX = movementData.flipX;
      players[socket.id].name = movementData.name;  // Ensure the player name is also included

      // Broadcast the movement and animation state to all other players
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  // Handle tree placement
  socket.on('placeTree', (treeInfo) => {
    if (collisionTrees.length < maxCollisionTrees) {
      collisionTrees.push(treeInfo);
      io.emit('placeTree', treeInfo); // Broadcast tree placement to all clients
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

// Function to check if a position is occupied by a player or a tree
function isPositionOccupied(x, y) {
  // Check if the position is occupied by a player
  for (const playerId in players) {
    const player = players[playerId];
    if (Math.abs(player.x - x) < 50 && Math.abs(player.y - y) < 50) {
      return true;
    }
  }

  // Check if the position is occupied by a tree
  for (const tree of collisionTrees) {
    if (Math.abs(tree.x - x) < 50 && Math.abs(tree.y - y) < 50) {
      return true;
    }
  }

  return false;
}

// Function to place a tree at a valid position
function placeTreeAtValidPosition() {
  if (collisionTrees.length >= maxCollisionTrees) {
    console.log('Max collision trees reached.');
    return; // Do not place more than the maximum number of trees
  }

  let x, y;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    x = Math.random() * 4096; 
    y = Math.random() * 4096; 
    attempts++;
    console.log(`Attempt ${attempts}: Trying to place tree at (${x}, ${y})`);
  } while (isPositionOccupied(x, y) && attempts < maxAttempts);

  if (attempts < maxAttempts) {
    const treeInfo = { x, y };
    collisionTrees.push(treeInfo);
    io.emit('placeTree', treeInfo); // Broadcast tree placement to all clients
    console.log('Tree placed at:', x, y);
  } else {
    console.log('Failed to place tree after max attempts.');
  }
}


// Schedule tree placement every 3 seconds
setInterval(placeTreeAtValidPosition, 3000);

// Start the server
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
