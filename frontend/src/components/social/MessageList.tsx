import React, { useState, useEffect, useRef } from 'react';
import PollView from './PollView';
import ImageMessage from './ImageMessage';
import { useSocket } from '@/lib/useSocket';

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
    <div className="zw-message-list">
      {messages.map((msg, idx) => (
        <div
          key={msg.id}
          className={`zw-message-row rounded-xl shadow-sm px-3 py-2 my-2 animate-messageAppear
            ${msg.userId === userId ? 'zw-message-self' : ''}
            ${msg.isBot ? 'zw-message-bot' : ''}`
          }
          style={{ animationDelay: `${idx * 10}ms` }}>
          <div className="zw-message-meta flex gap-2 items-center">
            <span className="font-bold">{msg.isBot ? "Pixi Bot" : msg.userId}</span>
            <span className="zw-message-date">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}</span>
          </div>
          {msg.imageUrl
            ? <ImageMessage imageUrl={msg.imageUrl} />
            : <div className="zw-message-body">{msg.body}</div>
          }
        </div>
      ))}
      {polls.map(poll => <PollView key={poll.id} poll={poll} channelId={channel.id} userId={userId} />)}
      <div ref={bottomRef} />
    </div>
  );
};
export default MessageList;
