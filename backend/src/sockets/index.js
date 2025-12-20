const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.firstName} connected`);
    
    // Join user rooms
    socket.join(socket.user.collegeCode);
    socket.join(`user_${socket.userId}`);

    // Handle messages
    socket.on('send-message', async (data) => {
      // Simple message broadcasting
      socket.to(`user_${data.receiverId}`).emit('new-message', {
        ...data,
        sender: socket.user
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.firstName}`);
    });
  });
};