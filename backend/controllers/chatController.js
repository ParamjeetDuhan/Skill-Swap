// Chat controller — REST endpoints to fetch/create conversations and message
// history. Real-time delivery of new messages happens via Socket.io (see
// sockets/chatSocket.js); these REST routes cover history + fallback sending.

const Chat = require('../models/Chat');

// @route GET /api/chats
// List all conversations for the logged-in user (most recent first).
exports.getMyChats = async (req, res, next) => {
  try {
    const chats = await Chat.find({ participants: req.userId })
      .populate('participants', 'name profilePic')
      .sort({ lastMessageAt: -1 });

    res.json({ count: chats.length, chats });
  } catch (err) {
    next(err);
  }
};

// @route GET /api/chats/with/:otherUserId
// Get (or create) the conversation between the logged-in user and otherUserId.
exports.getOrCreateChat = async (req, res, next) => {
  try {
    const { otherUserId } = req.params;

    let chat = await Chat.findOne({
      participants: { $all: [req.userId, otherUserId], $size: 2 },
    }).populate('participants', 'name profilePic');

    if (!chat) {
      chat = await Chat.create({ participants: [req.userId, otherUserId], messages: [] });
      chat = await chat.populate('participants', 'name profilePic');
    }

    res.json({ chat });
  } catch (err) {
    next(err);
  }
};

// @route POST /api/chats/:chatId/messages
// Fallback REST send (in case a client isn't connected to the socket).
exports.sendMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) return res.status(404).json({ message: 'Chat not found' });

    if (!chat.participants.map(String).includes(req.userId)) {
      return res.status(403).json({ message: 'Not a participant of this chat' });
    }

    const message = { sender: req.userId, text, timestamp: new Date() };
    chat.messages.push(message);
    chat.lastMessageAt = new Date();
    await chat.save();

    res.status(201).json({ message: 'Message sent', chat });
  } catch (err) {
    next(err);
  }
};
