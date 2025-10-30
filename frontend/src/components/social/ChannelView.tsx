import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import Composer from './Composer';
import useSocket from '@/lib/useSocket';

interface Message {
  id: string;
  userId: string;
  body: string;
  isBot: boolean;
  createdAt: string;
}

interface ChannelViewProps {
  channelId?: string;
  userId: string;
}

const ChannelView = ({ channelId, userId }: ChannelViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const socket = useSocket(userId);

  useEffect(() => {
    if (!channelId) return;

    fetchMessages();

    // Join channel
    if (socket) {
      socket.emit('join_channel', channelId);

      // Listen for new messages
      socket.on('message:new', (message: Message) => {
        if (message.channelId === channelId) {
          setMessages((prev) => [...prev, message]);
        }
      });

      return () => {
        socket.emit('leave_channel', channelId);
        socket.off('message:new');
      };
    }
  }, [channelId, socket]);

  const fetchMessages = async () => {
    if (!channelId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/chat/channels/${channelId}/messages`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (text: string) => {
    if (!channelId || !socket) return;

    socket.emit('message:create', {
      channelId,
      body: text,
    });
  };

  if (!channelId) {
    return (
      <Card className="glass-card p-12 text-center">
        <p className="text-gray-500">Select a channel to start chatting</p>
      </Card>
    );
  }

  return (
    <Card className="glass-card h-full flex flex-col">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500">No messages yet. Start the conversation!</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 rounded-2xl ${
                  msg.isBot
                    ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20'
                    : msg.userId === userId
                    ? 'bg-primary text-white ml-8'
                    : 'bg-white/70 mr-8'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">
                    {msg.isBot ? '🤖 Pixi' : msg.userId}
                  </span>
                  <span className="text-xs opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{msg.body}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Composer */}
      <div className="p-4 border-t border-gray-200/50">
        <Composer onSend={handleSend} disabled={!socket} />
      </div>
    </Card>
  );
};

export default ChannelView;

