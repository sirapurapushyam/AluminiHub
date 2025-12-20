// Working chat socket.io logic
let io;
const userSocketMap = {}; // { userId: socketId }

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const socketHandler = (socket) => {
  console.log('A user connected:', socket.id);
  // Get userId from query (update frontend to send userId in query)
  const userId = socket.handshake.query.userId;
  console.log('Socket connection received. Socket ID:', socket.id, 'User ID:', userId);
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log('Registered user in userSocketMap:', userId, '->', socket.id);
  } else {
    console.log('No userId found in socket handshake query.');
  }
  console.log('Emitting getOnlineUsers:', Object.keys(userSocketMap));
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log('Removed user from userSocketMap:', userId);
    }
    console.log('Emitting getOnlineUsers after disconnect:', Object.keys(userSocketMap));
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
};

const initSocket = (socketioInstance) => {
  io = socketioInstance;
  io.on('connection', socketHandler);
};

const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

module.exports = { initSocket, getIo, getReceiverSocketId, userSocketMap };