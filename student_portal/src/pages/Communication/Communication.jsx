import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Send, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { chatService } from '../../services/api';
import { connectSocket, disconnectSocket } from '../../services/socket';

function getInitials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(ts) {
  const d    = new Date(ts);
  const now  = new Date();
  const yest = new Date(now);
  yest.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString())  return 'Today';
  if (d.toDateString() === yest.toDateString()) return 'Yesterday';
  return d.toLocaleDateString();
}

export default function Communication({ student }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);
  const [input, setInput]                 = useState('');
  const [search, setSearch]               = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [typing, setTyping]               = useState(false);
  const [onlineUsers, setOnlineUsers]     = useState(new Set());

  const messagesEndRef = useRef(null);
  const socketRef      = useRef(null);
  const selectedRef    = useRef(null);
  const typingTimer    = useRef(null);

  useEffect(() => { selectedRef.current = selected; }, [selected]);

  const markReadLocally = useCallback((senderId) => {
    setConversations(p => p.map(c =>
      c.userId?.toString() === senderId?.toString() ? { ...c, unreadCount: 0 } : c
    ));
  }, []);

  // Socket setup
  useEffect(() => {
    if (!student?._id) return;
    const socket = connectSocket();
    socketRef.current = socket;

    socket.on('online_users', ids => setOnlineUsers(new Set(ids)));
    socket.on('user_online',  ({ userId }) => setOnlineUsers(p => new Set([...p, userId])));
    socket.on('user_offline', ({ userId }) => setOnlineUsers(p => { const n = new Set(p); n.delete(userId); return n; }));

    socket.on('receive_message', msg => {
      const cur      = selectedRef.current;
      const senderId = msg.senderId?.toString();
      if (cur && senderId === cur.userId?.toString()) {
        setMessages(p => [...p, msg]);
        socket.emit('message_read', { senderId: msg.senderId, receiverId: student._id });
        chatService.markRead(msg.senderId, student._id).catch(() => {});
        setConversations(p => p.map(c =>
          c.userId?.toString() === senderId
            ? { ...c, lastMessage: msg.message, lastTime: msg.timestamp, unreadCount: 0 }
            : c
        ));
      } else {
        setConversations(p => p.map(c =>
          c.userId?.toString() === senderId
            ? { ...c, lastMessage: msg.message, lastTime: msg.timestamp, unreadCount: (c.unreadCount || 0) + 1 }
            : c
        ));
      }
    });

    socket.on('message_sent', ({ _id, tempId, timestamp }) => {
      setMessages(p => p.map(m => m._id === tempId ? { ...m, _id, timestamp } : m));
    });

    socket.on('user_typing', ({ senderId }) => {
      if (selectedRef.current?.userId?.toString() === senderId?.toString()) {
        setTyping(true);
        clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setTyping(false), 2000);
      }
    });

    socket.on('messages_read', () => {
      setMessages(p => p.map(m => ({ ...m, read: true })));
    });

    return () => {
      disconnectSocket();
      clearTimeout(typingTimer.current);
    };
  }, [student._id, markReadLocally]);

  // Load conversations and pre-seed assigned mentor
  useEffect(() => {
    if (!student?._id) return;
    chatService.getConversations(student._id)
      .then(res => {
        const convos = res.data || [];
        if (student.mentor?._id) {
          const mentorId = student.mentor._id.toString();
          const exists = convos.some(c => c.userId?.toString() === mentorId);
          if (!exists) {
            convos.unshift({
              userId: student.mentor._id,
              name: student.mentor.name,
              email: student.mentor.email,
              lastMessage: '',
              unreadCount: 0,
            });
          }
        }
        setConversations(convos);
      })
      .catch(console.error);
  }, [student?._id]);

  // Load messages when selected contact changes
  useEffect(() => {
    if (!selected?.userId || !student?._id) return;
    chatService.getMessages(student._id, selected.userId)
      .then(res => setMessages(res.data))
      .catch(() => setMessages([]));
    socketRef.current?.emit('message_read', { senderId: selected.userId, receiverId: student._id });
    chatService.markRead(selected.userId, student._id)
      .then(() => markReadLocally(selected.userId))
      .catch(() => markReadLocally(selected.userId));
  }, [selected?.userId, student._id, markReadLocally]);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (!search.trim()) { setSearchResults([]); return; }
      chatService.searchUsers(search).then(res => setSearchResults(res.data)).catch(console.error);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleSend = () => {
    if (!input.trim() || !selected || !student?._id) return;
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      _id: tempId, senderId: student._id, receiverId: selected.userId,
      message: input.trim(), timestamp: new Date().toISOString(), read: false,
    };
    setMessages(p => [...p, optimistic]);
    socketRef.current?.emit('send_message', {
      senderId: student._id, receiverId: selected.userId,
      message: input.trim(), tempId,
    });
    setConversations(p => {
      const exists = p.find(c => c.userId?.toString() === selected.userId?.toString());
      if (exists) return p.map(c =>
        c.userId?.toString() === selected.userId?.toString()
          ? { ...c, lastMessage: input.trim(), lastTime: new Date().toISOString() }
          : c
      );
      return [{ userId: selected.userId, name: selected.name, email: selected.email, lastMessage: input.trim(), lastTime: new Date().toISOString(), unreadCount: 0 }, ...p];
    });
    setInput('');
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); return; }
    if (selected && student?._id) {
      socketRef.current?.emit('typing', { senderId: student._id, receiverId: selected.userId });
    }
  };

  const handleSelectContact = contact => {
    setSelected(contact);
    setSearch('');
    setSearchResults([]);
  };

  const contactList = search
    ? searchResults.map(u => ({ userId: u._id, name: u.name, email: u.email, lastMessage: '', unreadCount: 0 }))
    : conversations;

  const grouped = messages.reduce((acc, msg) => {
    const d = formatDate(msg.timestamp);
    (acc[d] = acc[d] || []).push(msg);
    return acc;
  }, {});

  return (
    <div className="page-content pb-0">
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-[14px] border border-slate-200 overflow-hidden">

        {/* ── Contact list ── */}
        <div className="w-[280px] border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-[18px] border-b border-slate-200">
            <h3 className="text-[15px] font-bold text-slate-900 mb-2.5">Messages</h3>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-[7px]">
              <Search size={14} color="#94a3b8" />
              <input
                placeholder="Search people..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 border-none bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {contactList.length === 0 ? (
              <div className="py-6 px-4 text-center text-slate-400 text-[13px]">
                {search ? 'No users found' : 'No conversations yet'}
              </div>
            ) : (
              contactList.map(contact => (
                <div
                  key={contact.userId}
                  onClick={() => handleSelectContact(contact)}
                  className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-all border-b border-slate-50
                    ${selected?.userId?.toString() === contact.userId?.toString()
                      ? 'bg-indigo-600/[0.06] border-r-[3px] border-r-indigo-600'
                      : 'hover:bg-slate-50'
                    }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 relative">
                    {getInitials(contact.name)}
                    {onlineUsers.has(contact.userId?.toString()) && (
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-semibold text-slate-900 mb-0.5">{contact.name}</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                      {contact.lastMessage || contact.email}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {contact.lastTime && (
                      <span className="text-[10px] text-slate-400">{formatTime(contact.lastTime)}</span>
                    )}
                    {contact.unreadCount > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-[10px] min-w-[18px] text-center">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat window ── */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-[15px] font-bold text-white relative flex-shrink-0">
                {getInitials(selected.name)}
                {onlineUsers.has(selected.userId?.toString()) && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-bold text-slate-900">{selected.name}</h4>
                <p className="text-xs font-medium">
                  {typing
                    ? <span className="text-indigo-500">typing...</span>
                    : <span className={onlineUsers.has(selected.userId?.toString()) ? 'text-emerald-500' : 'text-slate-400'}>
                        {onlineUsers.has(selected.userId?.toString()) ? 'Online' : 'Offline'}
                      </span>
                  }
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {[{ icon: Phone, title: 'Voice call' }, { icon: Video, title: 'Video call' }, { icon: MoreVertical, title: 'More options' }].map(({ icon: Icon, title }) => (
                  <button key={title} title={title}
                    className="w-9 h-9 border border-slate-200 rounded-lg bg-white flex items-center justify-center cursor-pointer text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900">
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages — WhatsApp style: self on right, other on left */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1 bg-[#f0f2f5]">
              {Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center gap-4 py-1 my-2">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap bg-[#f0f2f5] px-2">{date}</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>
                  {msgs.map(msg => {
                    const isSelf = msg.senderId?.toString() === student._id?.toString();
                    return (
                      <div key={msg._id} className={`flex mb-1 ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[65%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
                          <div className={`px-3.5 py-2 text-sm leading-relaxed break-words
                            ${isSelf
                              ? 'bg-[#d9fdd3] text-slate-900 rounded-[10px] rounded-tr-[2px]'
                              : 'bg-white text-slate-900 rounded-[10px] rounded-tl-[2px] shadow-sm'
                            }`}>
                            {msg.message}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-[2px] flex items-center gap-1 px-1">
                            {formatTime(msg.timestamp)}
                            {isSelf && <span className="text-slate-400">{msg.read ? '✓✓' : '✓'}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {typing && (
                <div className="flex justify-start mb-1">
                  <div className="bg-white rounded-[10px] rounded-tl-[2px] shadow-sm px-3.5 py-2 text-slate-400 text-sm italic">
                    typing...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-slate-200 flex items-center gap-2.5 bg-white flex-shrink-0">
              <button className="w-9 h-9 border border-slate-200 rounded-lg bg-white flex items-center justify-center cursor-pointer text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900 flex-shrink-0">
                <Paperclip size={16} />
              </button>
              <textarea
                className="flex-1 border-[1.5px] border-slate-200 rounded-[10px] px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all resize-none max-h-[100px] focus:border-indigo-600"
                placeholder={`Message ${selected.name}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
              />
              <button
                onClick={handleSend}
                style={{ opacity: input.trim() ? 1 : 0.5 }}
                className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-500 text-white border-none rounded-[10px] flex items-center justify-center cursor-pointer transition-all hover:opacity-90 flex-shrink-0"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2.5 bg-[#f0f2f5]">
            <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center text-slate-400">
              <Search size={28} />
            </div>
            <p className="text-[15px] font-medium text-slate-500">Select someone to start chatting</p>
            <p className="text-[13px] text-slate-400">Your mentor is shown above — click to chat</p>
          </div>
        )}
      </div>
    </div>
  );
}
