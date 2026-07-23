// Entry point: loads env vars, connects to MongoDB, starts the HTTP server
// and attaches Socket.io for real-time chat.

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const { initChatSocket } = require('./sockets/chatSocket');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  },
});

initChatSocket(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`SkillSwap backend running on http://localhost:${PORT}`);
    console.log(`Socket.io ready for real-time chat`);
  });
});
