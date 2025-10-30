import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, BarChart3, Send, HelpCircle } from 'lucide-react';

interface Props {
  userId: string;
  userHandle: string;
  channel: { id: string, name: string };
  onToast: (t: any) => void;
}

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

const MessageComposer: React.FC<Props> = ({ userId, userHandle, channel, onToast }) => {
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSent = useRef(Date.now() - 2000);

  // Generate avatar based on user ID
  const getAvatarUrl = (userId: string): string => {
    const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
  };

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (pending) return;
    if (!body && !imageFile) return;
    if ((Date.now() - lastSent.current) < 2000) {
      onToast({ message: "You're sending too fast!" }); return;
    }
    setPending(true);
    try {
      let imgMeta = null;
      if (imageFile) {
        if (!allowedTypes.includes(imageFile.type) || imageFile.size > 5e6) {
          onToast({ message: 'Invalid file (type/size).' }); setPending(false); return;
        }
        const form = new FormData();
        form.append('image', imageFile);
        const imgResp = await fetch(`/api/chat/channels/${channel.id}/images`, { method: 'POST', body: form });
        imgMeta = await imgResp.json();
      }
      // Pixi bot stub: If @pixi in front, call pixi API route if present (else simulate locally)
      let isPixiBot = /^\s*@pixi/i.test(body);
      if (isPixiBot) {
        let pixiReply = '';
        try {
          const resp = await fetch('/api/chat/pixi', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ q: body })
          });
          const data = await resp.json();
          pixiReply = data?.reply || '';
        } catch {
          pixiReply = 'Pixi can help you with campus info (stub).';
        }
        // Post bot message to channel messages
        await fetch(`/api/chat/channels/${channel.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: 'pixi-bot',
            body: pixiReply,
            isBot: true,
            imageUrl: undefined
          })
        });
      }
      await fetch(`/api/chat/channels/${channel.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({
          userId, body, mentions: [], attachments: [],
          imageUrl: imgMeta?.url || undefined
        })
      });
      setBody('');
      setImageFile(null);
      lastSent.current = Date.now();
    } catch { onToast({ message: "Send failed." }); }
    setPending(false);
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as any);
    }
  };

  return (
    <div className="flex gap-3 items-end">
      {/* User Avatar */}
      <div className="flex-shrink-0 hidden sm:block">
        <img
          src={getAvatarUrl(userId)}
          alt={userHandle}
          className="w-10 h-10 rounded-full"
        />
      </div>

      {/* Username (mobile) */}
      <div className="flex-shrink-0 sm:hidden">
        <span className="text-sm text-gray-600 font-medium">@{userHandle}</span>
      </div>

      {/* Composer */}
      <div className="flex-1 bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Message in this channel... (Use @username to mention, @pixi for bot)"
          className="w-full px-4 py-3 resize-none focus:outline-none focus:ring-0 border-0"
          rows={1}
          maxLength={500}
          style={{ minHeight: '48px', maxHeight: '120px' }}
        />
        
        {/* Uploaded File Preview */}
        {imageFile && (
          <div className="px-4 pb-3 flex items-center gap-2 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-700 flex-1 truncate">{imageFile.name}</span>
            <button
              type="button"
              onClick={() => setImageFile(null)}
              className="text-red-600 hover:text-red-700 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ImageIcon className="w-4 h-4" />
              <span className="text-sm font-medium">Image</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => onToast({ message: 'Poll creation coming soon!' })}
            >
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-medium">Poll</span>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={() => onToast({ message: 'Help guide coming soon!' })}
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
            <button
              type="submit"
              onClick={sendMessage}
              disabled={pending || (!body && !imageFile)}
              className="p-2 text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => setImageFile(e.target.files?.[0] || null)}
      />
    </div>
  );
};

export default MessageComposer;
