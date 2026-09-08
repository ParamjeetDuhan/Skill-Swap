import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { fetchChats, setActiveChat, messageReceived } from '../features/chat/chatSlice';
import { connectSocket, getSocket } from '../api/socket';
import Spinner from '../components/Spinner';

export default function ChatsPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { chats, activeChat, status } = useSelector((state) => state.chat);
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    dispatch(fetchChats());
    const socket = connectSocket();

    if (socket) {
      socket.on('receive_message', (payload) => {
        dispatch(messageReceived(payload));
      });
      socket.on('notification', (n) => {
        if (n.type === 'new_message') {
          toast(`New message: ${n.preview}`);
        }
      });
    }

    return () => {
      const s = getSocket();
      if (s) {
        s.off('receive_message');
        s.off('notification');
      }
    };
  }, [dispatch]);

  useEffect(() => {
    if (activeChat) {
      const socket = connectSocket();
      socket?.emit('join_chat', { chatId: activeChat._id });
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    const socket = connectSocket();
    socket?.emit('send_message', { chatId: activeChat._id, text: text.trim() });
    setText('');
  };

  const otherParticipant = (chat) => chat.participants.find((p) => p._id !== user._id);

  if (status === 'loading' && chats.length === 0) return <Spinner label="Loading chats..." />;

  return (
    <div className="page chat-page">
      <h1>Chats</h1>
      <div className="chat-layout">
        <aside className="chat-sidebar">
          {chats.length === 0 && <p className="empty-state">No conversations yet. Message a match to start one.</p>}
          {chats.map((chat) => {
            const other = otherParticipant(chat);
            const lastMsg = chat.messages?.[chat.messages.length - 1];
            return (
              <button
                key={chat._id}
                className={activeChat?._id === chat._id ? 'chat-list-item active' : 'chat-list-item'}
                onClick={() => dispatch(setActiveChat(chat))}
              >
                <strong>{other?.name}</strong>
                <p>{lastMsg ? lastMsg.text.slice(0, 40) : 'No messages yet'}</p>
              </button>
            );
          })}
        </aside>

        <section className="chat-window">
          {!activeChat && <p className="empty-state">Select a conversation to start chatting.</p>}

          {activeChat && (
            <>
              <div className="chat-header">
                <strong>{otherParticipant(activeChat)?.name}</strong>
              </div>
              <div className="chat-messages">
                {activeChat.messages.map((m) => (
                  <div
                    key={m._id || m.timestamp}
                    className={
                      (m.sender === user._id || m.sender?._id === user._id)
                        ? 'chat-bubble mine'
                        : 'chat-bubble theirs'
                    }
                  >
                    <p>{m.text}</p>
                    <span className="chat-time">
                      {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form className="chat-input" onSubmit={handleSend}>
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <button type="submit" className="btn-primary">Send</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
