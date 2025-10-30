import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

type Channel = { id: string; name: string; description?: string; };

interface Props {
  userId: string;
  userHandle: string;
  selectedChannelId?: string;
  onSelect: (channel: Channel) => void;
  onToast: (t: any) => void;
}

const ChannelList: React.FC<Props> = ({
  userId, selectedChannelId, onSelect, onToast
}) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [reqOpen, setReqOpen] = useState(false);
  const [reqName, setReqName] = useState('');
  const [reqDesc, setReqDesc] = useState('');
  const [reqLoading, setReqLoading] = useState(false);
  const [unread, setUnread] = useState<{ [id: string]: number }>({});

  useEffect(() => {
    setLoading(true);
    fetch('/api/chat/channels')
      .then(r => r.json())
      .then(data => setChannels(Array.isArray(data) ? data : []))
      .catch(() => setChannels([]))
      .finally(() => setLoading(false));
  }, []);

  // Simulate unread badge demo: random badge for 1 channel
  useEffect(() => {
    if (channels.length > 0) {
      setUnread({ [channels[0].id]: 2 });
    }
  }, [channels.length]);

  async function requestCh() {
    if (!reqName.trim()) { onToast({ message: 'Channel name is required' }); return; }
    setReqLoading(true);
    try {
      await fetch('/api/chat/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: reqName, description: reqDesc, requesterId: userId })
      });
      setReqOpen(false);
      onToast({ message: 'Channel request sent!' });
      setReqName('');
      setReqDesc('');
    } catch {
      onToast({ message: 'Failed to request channel.' });
    }
    setReqLoading(false);
  }

  return (
    <div className="zw-channel-list">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gradient">Channels</h3>
        <Button variant="outline" size="sm" onClick={() => setReqOpen(o => !o)}>+ New</Button>
      </div>
      {loading
        ? <div className="text-muted py-4">Loading…</div>
        : <ul className="zw-channel-items">
            {channels.map(ch => (
              <li key={ch.id} className="relative">
                <button
                  className={`w-full text-left zw-list-btn transition-all duration-200 ${selectedChannelId === ch.id ? 'zw-list-btn--active' : ''}`}
                  onClick={() => onSelect(ch)}
                  tabIndex={0}
                  aria-current={selectedChannelId === ch.id}
                >#{ch.name}
                  {unread[ch.id] && <span className="zw-unread-badge animate-bounce">{unread[ch.id]}</span>}
                  <span className="text-xs opacity-70 block truncate">{ch.description || ''}</span>
                </button>
              </li>
            ))}
          </ul>}
      {reqOpen && (
        <div className="zw-request-widget rounded-lg p-2 mt-3 bg-white/90 shadow-inner animate-fadeIn">
          <input
            className="input my-2" placeholder="Name" maxLength={50}
            value={reqName} onChange={e => setReqName(e.target.value)}
          />
          <input
            className="input mb-2" placeholder="Description?" maxLength={120}
            value={reqDesc} onChange={e => setReqDesc(e.target.value)}
          />
          <Button disabled={reqLoading} className="w-full rounded-full" onClick={requestCh}>
            {reqLoading ? "Sending..." : "Submit"}
          </Button>
        </div>
      )}
    </div>
  );
};
export default ChannelList;

