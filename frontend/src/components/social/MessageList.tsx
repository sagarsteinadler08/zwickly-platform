import React, { useState, useEffect, useRef } from 'react';
import PollView from './PollView';
import ImageMessage from './ImageMessage';
import { useSocket } from '@/lib/useSocket';
import { Bot } from 'lucide-react';

interface Message {
  id: string;
  userId: string;
  channelId: string;
  body: string;
  createdAt: string;
  imageUrl?: string;
  isBot?: boolean;
  reactions?: { [emoji: string]: number };
}

type Channel = { id: string; name: string };

interface Props {
  userId: string;
  userHandle: string;
  channel: Channel;
  onToast: (t: any) => void;
}

// Generate avatar based on user ID
const getAvatarUrl = (userId: string): string => {
  const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

const MessageList: React.FC<Props> = ({ userId, userHandle, channel, onToast }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const { socket } = useSocket(userId, socketHandler);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Handle emoji reactions
  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      // Optimistically update UI
      setMessages(curr => curr.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          reactions[emoji] = (reactions[emoji] || 0) + 1;
          return { ...msg, reactions };
        }
        return msg;
      }));

      // TODO: Send to backend
      // await fetch(`/api/chat/messages/${messageId}/react`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ emoji, userId })
      // });
      
      onToast({ message: `Reacted with ${emoji}`, type: 'success' });
    } catch (error) {
      console.error('Failed to react:', error);
    }
  };

  function socketHandler(evt: any) {
    if (evt.type === 'message:new' && evt.channelId === channel.id) {
      setMessages(curr => curr.some(m => m.id === evt.message.id) ? curr : [...curr, evt.message]);
    }
    if (evt.type === 'poll:updated' && evt.channelId === channel.id) {
      setPolls(curr => {
        const i = curr.findIndex((p: any) => p.id === evt.poll.id);
        if (i > -1) { curr[i] = evt.poll; return [...curr]; }
        return [...curr, evt.poll];
      });
    }
  }

  useEffect(() => {
    fetch(`/api/chat/channels/${channel.id}/messages?limit=100`).then(r => r.json()).then(setMessages);
    fetch(`/api/chat/channels/${channel.id}/polls`).then(r => r.json()).then(setPolls);
    fetch(`/api/chat/channels/${channel.id}/images`).then(r => r.json()).then(setImages);
  }, [channel.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, polls, images]);

  return (
    <div className="space-y-4 max-w-4xl mx-auto w-full">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className="flex gap-3 animate-messageAppear"
          style={{ animationDelay: `${idx * 10}ms` }}
        >
          {/* Avatar */}
          <div className="flex-shrink-0">
            {msg.isBot ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B5CFA] to-[#48E0E4] flex items-center justify-center shadow-lg shadow-purple-500/40">
                <Bot className="w-6 h-6 text-white" />
              </div>
            ) : (
              <img
                src={getAvatarUrl(msg.userId)}
                alt={msg.userId}
                className="w-10 h-10 rounded-full"
              />
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-slate-800 dark:text-white">
                {msg.isBot ? "Pixi Bot" : msg.userId}
              </span>
              {msg.isBot && (
                <span className="bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
                  Bot
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-gray-500">
                {new Date(msg.createdAt).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </span>
            </div>
            {/* Message body */}
            <div className={`${msg.isBot ? 'bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-lg p-3' : ''}`}>
              <div className="text-slate-700 dark:text-gray-200 break-words whitespace-pre-wrap">{msg.body}</div>
              
              {/* Image if present - show ALONG with text */}
              {msg.imageUrl && (
                <div className="mt-3">
                  <img 
                    src={msg.imageUrl} 
                    alt="Announcement attachment" 
                    className="max-w-lg w-full rounded-lg border border-slate-300 dark:border-slate-600 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => window.open(msg.imageUrl, '_blank')}
                  />
                </div>
              )}
            </div>

            {/* Emoji Reactions */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm border border-slate-300 dark:border-slate-600"
                onClick={() => handleReaction(msg.id, '👍')}
                title="Like"
              >
                <span className="text-base">👍</span>
                {msg.reactions?.['👍'] ? (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{msg.reactions['👍']}</span>
                ) : null}
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm border border-slate-300 dark:border-slate-600"
                onClick={() => handleReaction(msg.id, '❤️')}
                title="Love"
              >
                <span className="text-base">❤️</span>
                {msg.reactions?.['❤️'] ? (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{msg.reactions['❤️']}</span>
                ) : null}
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm border border-slate-300 dark:border-slate-600"
                onClick={() => handleReaction(msg.id, '🎉')}
                title="Celebrate"
              >
                <span className="text-base">🎉</span>
                {msg.reactions?.['🎉'] ? (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{msg.reactions['🎉']}</span>
                ) : null}
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm border border-slate-300 dark:border-slate-600"
                onClick={() => handleReaction(msg.id, '🔥')}
                title="Fire"
              >
                <span className="text-base">🔥</span>
                {msg.reactions?.['🔥'] ? (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{msg.reactions['🔥']}</span>
                ) : null}
              </button>
              <button
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-sm border border-slate-300 dark:border-slate-600"
                onClick={() => handleReaction(msg.id, '😂')}
                title="Funny"
              >
                <span className="text-base">😂</span>
                {msg.reactions?.['😂'] ? (
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{msg.reactions['😂']}</span>
                ) : null}
              </button>
            </div>
          </div>
        </div>
      ))}

      {polls.map(poll => (
        <div key={poll.id} className="max-w-4xl mx-auto w-full">
          <PollView poll={poll} channelId={channel.id} userId={userId} />
        </div>
      ))}

      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
