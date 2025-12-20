require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5000' || "https://alumni-connect-backend-z8e1.onrender.com",
    methods: ['GET', 'POST']
  }
});

const { initSocket } = require('./src/socket');
initSocket(io);

app.set('io', io);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;