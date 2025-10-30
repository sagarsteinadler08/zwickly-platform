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
              <span className="font-semibold text-white">
                {msg.isBot ? "Pixi Bot" : msg.userId}
              </span>
              {msg.isBot && (
                <span className="bg-gradient-to-r from-[#7B5CFA] to-[#48E0E4] text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
                  Bot
                </span>
              )}
              <span className="text-xs text-gray-500">
                {new Date(msg.createdAt).toLocaleString([], { 
                  month: 'short', 
                  day: 'numeric', 
                  hour: 'numeric', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
            <div className={`${msg.isBot ? 'bg-purple-500/10 border border-purple-500/30 rounded-lg p-3' : ''}`}>
              {msg.imageUrl ? (
                <ImageMessage imageUrl={msg.imageUrl} />
              ) : (
                <div className="text-gray-200 break-words">{msg.body}</div>
              )}
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
