// Install required packages
// npm install express socket.io

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Store connected users
const connectedUsers = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // Add user to connectedUsers array
  connectedUsers.push(socket.id);

  // Check if there are at least two users connected
  if (connectedUsers.length >= 2) {
    // Get two random users
    const randomUsers = getRandomUsers();

    // Notify the selected users to start a video chat
    io.to(randomUsers[0]).emit('start-chat', randomUsers[1]);
    io.to(randomUsers[1]).emit('start-chat', randomUsers[0]);

    // Remove the selected users from the connectedUsers array
    connectedUsers.splice(connectedUsers.indexOf(randomUsers[0]), 1);
    connectedUsers.splice(connectedUsers.indexOf(randomUsers[1]), 1);
  }

  socket.on('disconnect', () => {
    console.log('User disconnected');
    // Remove disconnected user from the connectedUsers array
    connectedUsers.splice(connectedUsers.indexOf(socket.id), 1);
  });
});

// Helper function to get two random users
function getRandomUsers() {
  const index1 = Math.floor(Math.random() * connectedUsers.length);
  let index2 = Math.floor(Math.random() * connectedUsers.length);

  // Ensure the two users are different
  while (index2 === index1) {
    index2 = Math.floor(Math.random() * connectedUsers.length);
  }

  return [connectedUsers[index1], connectedUsers[index2]];
}

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
