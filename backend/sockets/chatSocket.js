// Socket.io handler for real-time one-on-one chat and notifications.
//
// Client flow:
//  1. Connect with `auth: { token: <accessToken> }`
//  2. Emit 'join_chat' with { chatId } to join a conversation room
//  3. Emit 'send_message' with { chatId, text } to send a message
//  4. Listen for 'receive_message' to get new messages in real time
//  5. Listen for 'notification' for generic notifications (new session request, etc.)

const jwt = require('jsonwebtoken');
const Chat = require('../models/Chat');

// Keeps track of userId -> socket.id so we can push notifications directly to a user
const onlineUsers = new Map();

function initChatSocket(io) {
  // Authenticate every socket connection using the JWT access token
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication token missing'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    onlineUsers.set(socket.userId, socket.id);
    console.log(`Socket connected: user ${socket.userId}`);

    socket.on('join_chat', ({ chatId }) => {
      socket.join(chatId);
    });

    socket.on('send_message', async ({ chatId, text }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return;
        if (!chat.participants.map(String).includes(socket.userId)) return;

        const message = { sender: socket.userId, text, timestamp: new Date() };
        chat.messages.push(message);
        chat.lastMessageAt = new Date();
        await chat.save();

        // Broadcast to everyone in the chat room (including sender, for confirmation)
        io.to(chatId).emit('receive_message', {
          chatId,
          message: chat.messages[chat.messages.length - 1],
        });

        // Send a notification to the other participant if they're online but not in the room
        const otherParticipant = chat.participants.find((p) => p.toString() !== socket.userId);
        const otherSocketId = onlineUsers.get(otherParticipant?.toString());
        if (otherSocketId) {
          io.to(otherSocketId).emit('notification', {
            type: 'new_message',
            chatId,
            preview: text.slice(0, 80),
          });
        }
      } catch (err) {
        console.error('send_message error:', err.message);
      }
    });

    socket.on('typing', ({ chatId }) => {
      socket.to(chatId).emit('typing', { chatId, userId: socket.userId });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(socket.userId);
      console.log(`Socket disconnected: user ${socket.userId}`);
    });
  });
}

module.exports = { initChatSocket, onlineUsers };
