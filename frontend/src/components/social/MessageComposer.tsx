import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  userId: string;
  userHandle: string;
  channel: { id: string, name: string };
  onToast: (t: any) => void;
}
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const MessageComposer: React.FC<Props> = ({ userId, channel, onToast }) => {
  const [body, setBody] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastSent = useRef(Date.now() - 2000);

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
  return (
    <form className="zw-composer shadow-md p-2 bg-white/90 rounded-2xl flex gap-2 animate-composerAppear" onSubmit={sendMessage}>
      <input
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="@pixi event schedule?"
        className="zw-composer-input"
        maxLength={500}
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
        ref={inputRef}
        onChange={e => setImageFile(e.target.files?.[0] || null)}
      />
      {imageFile && (
        <span className="zw-image-preview">{imageFile.name} <Button size="sm" type="button" onClick={() => setImageFile(null)}>x</Button></span>
      )}
      <Button size="sm" onClick={() => inputRef.current?.click()} type="button">📎</Button>
      <Button type="submit" disabled={pending || (!body && !imageFile)} gradient="yes">{pending ? "Sending…" : "Send"}</Button>
    </form>
  );
};
export default MessageComposer;
