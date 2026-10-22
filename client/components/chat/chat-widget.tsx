'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { io, type Socket } from 'socket.io-client';
import { MessageCircle, Send, X } from 'lucide-react';
import { api, SOCKET_URL } from '@/lib/api';
import { getToken } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import type { ChatMessage } from '@/types';
import { cn, formatRelativeTime } from '@/lib/utils';

const CONVERSATION_ID = 'support';

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [connected, setConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      autoConnect: true,
      transports: ['websocket', 'polling'],
      auth: { token: getToken() },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('chat:join', { conversationId: CONVERSATION_ID });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('chat:message', ({ message }: { message: ChatMessage }) => {
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
    });

    socket.on('chat:typing', () => setTyping(true));
    socket.on('chat:read', () => setTyping(false));

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    api.chat
      .history(CONVERSATION_ID)
      .then(({ messages: history }) => setMessages(history))
      .catch(() => undefined);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, typing]);

  const send = useCallback(async () => {
    const content = draft.trim();
    if (!content) return;

    setDraft('');

    const socket = socketRef.current;
    if (socket?.connected) {
      socket.emit('chat:message', { conversationId: CONVERSATION_ID, content });
      return;
    }

    try {
      const { message } = await api.chat.send({ conversationId: CONVERSATION_ID, content });
      setMessages((current) =>
        current.some((item) => item.id === message.id) ? current : [...current, message],
      );
    } catch {
      setDraft(content);
    }
  }, [draft]);

  return (
    <>
      <motion.button
        onClick={() => setOpen((value) => !value)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open live chat"
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-full bg-indigo-600 text-white shadow-glow"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageCircle className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="fixed bottom-24 right-4 z-50 flex h-[28rem] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-card sm:right-6"
          >
            <header className="flex items-center justify-between bg-indigo-600 px-5 py-4 text-white">
              <div>
                <p className="text-sm font-semibold">Aurora Support</p>
                <p className="flex items-center gap-1.5 text-xs text-indigo-100">
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      connected ? 'bg-emerald-300' : 'bg-amber-300',
                    )}
                  />
                  {connected ? 'Online now' : 'Reconnecting…'}
                </p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto bg-ink-50/60 px-4 py-4">
              {messages.length === 0 && (
                <div className="rounded-2xl bg-white p-4 text-sm text-ink-500 shadow-soft">
                  Hi{user ? ` ${user.name.split(' ')[0]}` : ''}! Ask us anything about stock,
                  delivery or warranty — we usually reply within a few minutes.
                </div>
              )}

              {messages.map((message) => {
                const mine = message.sender === 'USER';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-soft',
                        mine
                          ? 'rounded-br-md bg-indigo-600 text-white'
                          : 'rounded-bl-md bg-white text-ink-800',
                      )}
                    >
                      <p>{message.content}</p>
                      <p
                        className={cn(
                          'mt-1 text-[10px]',
                          mine ? 'text-indigo-200' : 'text-ink-400',
                        )}
                      >
                        {formatRelativeTime(message.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                );
              })}

              {typing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-soft">
                    {[0, 1, 2].map((index) => (
                      <motion.span
                        key={index}
                        className="h-1.5 w-1.5 rounded-full bg-ink-400"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-ink-100 bg-white px-4 py-3"
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Type your message…"
                className="h-11 flex-1 rounded-full border border-ink-200 px-4 text-sm outline-none transition-shadow focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                aria-label="Send message"
                className="grid h-11 w-11 place-items-center rounded-full bg-indigo-600 text-white"
              >
                <Send className="h-4 w-4" />
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default ChatWidget;
