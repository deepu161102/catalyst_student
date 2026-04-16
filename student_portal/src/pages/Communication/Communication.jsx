import { useState, useRef, useEffect } from 'react';
import { Search, Phone, Video, MoreVertical, Send, Paperclip } from 'lucide-react';
import { chatContacts, chatMessages as initialMessages, currentStudent } from '../../data/mockData';

function getInitials(name) {
  return name.split(' ').map((n) => n[0]).join('');
}

export default function Communication() {
  const [selected, setSelected] = useState(chatContacts[0]);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput]       = useState('');
  const [search, setSearch]     = useState('');
  const messagesEndRef          = useRef(null);

  const filtered = chatContacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const currentMessages = selected ? (messages[selected.id] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSend = () => {
    if (!input.trim() || !selected) return;
    const newMsg = {
      id:   Date.now(),
      from: 'self',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
    };
    setMessages((prev) => ({
      ...prev,
      [selected.id]: [...(prev[selected.id] ?? []), newMsg],
    }));
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Group messages by date
  const grouped = currentMessages.reduce((acc, msg) => {
    const date = msg.date ?? 'Today';
    (acc[date] = acc[date] ?? []).push(msg);
    return acc;
  }, {});

  return (
    <div className="page-content pb-0">
      <div className="flex h-[calc(100vh-120px)] bg-white rounded-[14px] border border-slate-200 overflow-hidden">
        {/* ── Contact list ──────────────────────────────── */}
        <div className="w-[280px] border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="px-4 py-[18px] border-b border-slate-200">
            <h3 className="text-[15px] font-bold text-slate-900 mb-2.5">Messages</h3>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-[7px]">
              <Search size={14} color="#94a3b8" />
              <input
                placeholder="Search mentors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 border-none bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-6 px-4 text-center text-slate-400 text-[13px]">No contacts found</div>
            ) : (
              filtered.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelected(contact)}
                  className={`flex items-center gap-2.5 px-4 py-3 cursor-pointer transition-all border-b border-slate-50
                    ${selected?.id === contact.id
                      ? 'bg-indigo-600/[0.06] border-r-[3px] border-r-indigo-600'
                      : 'hover:bg-slate-50'
                    }`}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0 relative">
                    {getInitials(contact.name)}
                    {contact.online && (
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-[13px] font-semibold text-slate-900 mb-0.5">{contact.name}</div>
                    <div className="text-xs text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                      {contact.lastMessage}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-slate-400">{contact.lastTime}</span>
                    {contact.unread > 0 && (
                      <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-[2px] rounded-[10px] min-w-[18px] text-center">
                        {contact.unread}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ── Chat window ───────────────────────────────── */}
        {selected ? (
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-[15px] font-bold text-white relative">
                {getInitials(selected.name)}
                {selected.online && (
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white absolute bottom-0 right-0" />
                )}
              </div>
              <div>
                <h4 className="text-[15px] font-bold text-slate-900">{selected.name}</h4>
                <p className="text-xs text-emerald-500 font-medium">
                  {selected.online ? 'Online' : 'Offline'} · {selected.specialisation}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                {[{ icon: Phone, title: 'Voice call' }, { icon: Video, title: 'Video call' }, { icon: MoreVertical, title: 'More options' }].map(({ icon: Icon, title }) => (
                  <button
                    key={title}
                    title={title}
                    className="w-9 h-9 border border-slate-200 rounded-lg bg-white flex items-center justify-center cursor-pointer text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Icon size={15} />
                  </button>
                ))}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3 bg-[#fafafa]">
              {Object.entries(grouped).map(([date, msgs]) => (
                <div key={date}>
                  {/* Date divider */}
                  <div className="flex items-center gap-4 py-1 my-1">
                    <div className="flex-1 h-px bg-slate-200" />
                    <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">{date}</span>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  {msgs.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${msg.from === 'self' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className="w-7 h-7 bg-gradient-to-br from-indigo-600 to-violet-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0">
                        {msg.from === 'self'
                          ? getInitials(currentStudent.name)
                          : getInitials(selected.name)}
                      </div>
                      <div>
                        <div
                          className={`max-w-[60%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                            ${msg.from === 'self'
                              ? 'bg-gradient-to-br from-indigo-600 to-violet-500 text-white rounded-br-[4px]'
                              : 'bg-white text-slate-900 border border-slate-200 rounded-bl-[4px]'
                            }`}
                        >
                          {msg.text}
                        </div>
                        <div className={`text-[10px] text-slate-400 mt-[3px] ${msg.from === 'self' ? 'text-left' : ''}`}>
                          {msg.time}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="px-5 py-4 border-t border-slate-200 flex items-center gap-2.5 bg-white">
              <button className="w-9 h-9 border border-slate-200 rounded-lg bg-white flex items-center justify-center cursor-pointer text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900">
                <Paperclip size={16} />
              </button>
              <textarea
                className="flex-1 border-[1.5px] border-slate-200 rounded-[10px] px-3.5 py-2.5 text-sm text-slate-900 outline-none transition-all resize-none max-h-[100px] focus:border-indigo-600"
                placeholder={`Message ${selected.name}...`}
                value={input}
                onChange={(e) => setInput(e.target.value)}
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
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2.5">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
              <Search size={28} />
            </div>
            <p>Select a mentor to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
